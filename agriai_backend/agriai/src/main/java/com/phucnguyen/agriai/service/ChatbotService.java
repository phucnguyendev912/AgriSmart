package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.request.SendChatMessageRequest;
import com.phucnguyen.agriai.dto.response.ChatResponse;
import com.phucnguyen.agriai.entity.ChatMessage;
import com.phucnguyen.agriai.entity.ChatSession;
import com.phucnguyen.agriai.enums.ChatQueryMode;
import com.phucnguyen.agriai.enums.SkillDefinition;
import com.phucnguyen.agriai.enums.SenderType;
import com.phucnguyen.agriai.service.IntentClassifier.IntentResult;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final IntentClassifier intentClassifier;
    private final ChatQueryModeClassifier queryModeClassifier;
    private final MultiSkillChainResolver chainResolver;
    private final SkillContextBuilder contextBuilder;
    private final ChatSessionService chatSessionService;
    private final ChatMessageService chatMessageService;
    @Nullable
    private final ChatLanguageModel chatModel;

    @Autowired
    @Lazy
    private ChatbotService self; // self-proxy: ensures @Transactional is applied via Spring AOP

    @Value("${agriai.chatbot.history-size:6}")
    private int historySize;

    // disease names aligned with SKILL.md knowledge base — used for follow-up
    // enrichment
    private static final List<String> DISEASE_KEYWORDS = List.of(
            "đạo ôn", "khô vằn", "bạc lá", "lem lép hạt", "vàng lùn",
            "lùn xoắn lá", "sọc vi khuẩn", "đốm nâu", "cháy bìa lá", "tungro");

    // queries shorter than this (chars) are treated as follow-up without disease
    // subject
    private static final int SHORT_QUERY_THRESHOLD = 25;

    // handle chat for session — multi-turn with conversation history
    // DB connection is NOT held during the AI call (expensive network call).
    // Steps: (1) read+save in TX → (2) call AI with no TX → (3) save AI reply in TX
    public ChatResponse chatForSession(String email, Integer sessionId, SendChatMessageRequest request) {
        String userText = request.getMessageContent().trim();

        // TX 1: load history + save user message → commit → release connection
        SessionContext ctx = self.loadHistoryAndSaveUser(email, sessionId, userText);

        // AI call — no DB connection held here
        String answer = buildContextAndGenerateWithHistory(userText, ctx.history(), request.getSelectedSkill());

        // TX 2: save AI reply → commit → release connection
        ChatMessage aiMessage = self.saveAiResponse(ctx.session(), answer);

        return ChatResponse.builder()
                .sessionId(ctx.session().getId())
                .messageId(aiMessage.getId())
                .senderType(SenderType.AI)
                .messageContent(answer)
                .createdAt(aiMessage.getCreatedAt())
                .build();
    }

    /** TX 1 — read history + persist user message, then release connection. */
    @Transactional
    protected SessionContext loadHistoryAndSaveUser(String email, Integer sessionId, String userText) {
        ChatSession session = chatSessionService.getSessionOrThrow(email, sessionId);
        List<ChatMessage> history = chatMessageService.getRecentMessages(session, historySize);
        ChatMessage userMessage = chatMessageService.saveUserMessage(session, userText);
        if (history.isEmpty()) {
            chatSessionService.updateTitleFromFirstMessage(session, userText);
        }
        chatSessionService.updateLastMessage(session, userMessage.getMessageContent(), userMessage.getCreatedAt());
        return new SessionContext(session, history);
    }

    /** TX 2 — persist AI reply, then release connection. */
    @Transactional
    protected ChatMessage saveAiResponse(ChatSession session, String answer) {
        ChatMessage aiMessage = chatMessageService.saveAiMessage(session, answer);
        chatSessionService.updateLastMessage(session, aiMessage.getMessageContent(), aiMessage.getCreatedAt());
        return aiMessage;
    }

    /** Lightweight value holder — no need for a full DTO. */
    protected record SessionContext(ChatSession session, List<ChatMessage> history) {
    }

    // guest pipeline: single-turn — classify → chain → build context → generate
    private String buildContextAndGenerate(String userText) {
        IntentResult intent = intentClassifier.classify(userText);
        ChatQueryMode mode = queryModeClassifier.classify(userText);
        List<SkillDefinition> skills = chainResolver.resolve(intent.primarySkill(), userText);

        String skillContext = skills.stream()
                .map(skill -> contextBuilder.buildContext(skill, userText))
                .collect(Collectors.joining("\n\n===\n\n"));

        return generateAnswer(buildSingleTurnPrompt(userText, skillContext, intent, mode));
    }

    // session pipeline: multi-turn — resolve skill → enrich if follow-up → generate
    private String buildContextAndGenerateWithHistory(
            String userText, List<ChatMessage> history, @Nullable SkillDefinition selectedSkill) {
        IntentResult intent = intentClassifier.classify(userText);
        ChatQueryMode mode = queryModeClassifier.classify(userText);
        SkillDefinition resolvedSkill = resolveSkill(intent, selectedSkill);

        // TREATMENT/CONFLICT follow-up: enrich short/disease-less queries with subject
        // from history
        if (needsSubjectEnrichment(resolvedSkill, userText)) {
            Optional<String> subject = extractSubjectFromHistory(history);
            if (subject.isEmpty()) {
                // no subject found — ask instead of calling LLM with empty context
                return "Bạn muốn điều trị bệnh nào? Vui lòng cho biết tên bệnh hoặc triệu chứng chính.";
            }
            String enrichedQuery = subject.get() + " " + userText;
            String skillContext = contextBuilder.buildContext(resolvedSkill, enrichedQuery);
            IntentResult resolvedIntent = new IntentResult(resolvedSkill, intent.confidence(), intent.source());
            return generateAnswerMultiTurn(buildSystemPrompt(skillContext, resolvedIntent, mode), history, userText);
        }

        // standard path — build context with original query
        String skillContext = contextBuilder.buildContext(resolvedSkill, userText);
        IntentResult resolvedIntent = new IntentResult(resolvedSkill, intent.confidence(), intent.source());
        return generateAnswerMultiTurn(buildSystemPrompt(skillContext, resolvedIntent, mode), history, userText);
    }

    // HIGH confidence intent always wins; otherwise defer to dropdown hint;
    // fallback to intent
    private SkillDefinition resolveSkill(IntentResult intent, @Nullable SkillDefinition selectedSkill) {
        if (intent.confidence() == IntentClassifier.Confidence.HIGH) {
            return intent.primarySkill();
        }
        return selectedSkill != null ? selectedSkill : intent.primarySkill();
    }

    // true when the resolved skill needs a disease subject that is absent from the
    // query
    private boolean needsSubjectEnrichment(SkillDefinition skill, String userText) {
        if (skill != SkillDefinition.TREATMENT && skill != SkillDefinition.CONFLICT) {
            return false;
        }
        String lower = userText.toLowerCase();
        boolean isShortQuery = userText.trim().length() < SHORT_QUERY_THRESHOLD;
        boolean lacksDiseaseName = DISEASE_KEYWORDS.stream().noneMatch(lower::contains);
        return isShortQuery || lacksDiseaseName;
    }

    // scan USER messages newest-first to find the most recently mentioned disease
    private Optional<String> extractSubjectFromHistory(List<ChatMessage> history) {
        List<ChatMessage> reversed = new ArrayList<>(history);
        Collections.reverse(reversed);
        for (ChatMessage msg : reversed) {
            if (msg.getSenderType() != SenderType.USER) {
                continue;
            }
            String content = msg.getMessageContent().toLowerCase();
            for (String disease : DISEASE_KEYWORDS) {
                if (content.contains(disease)) {
                    return Optional.of(disease);
                }
            }
        }
        return Optional.empty();
    }

    // build system prompt (without the user question — it's a separate message in
    // multi-turn)
    private String buildSystemPrompt(String skillContext, IntentResult intent, ChatQueryMode mode) {
        String modeBlock = buildModeBlock(mode);
        return """
                Bạn là một chuyên gia nông nghiệp thông minh, thân thiện và am hiểu rộng.
                Hãy trả lời ngắn gọn, rõ ràng, dễ hiểu như đang nói chuyện trực tiếp với người nông dân.

                NGUYÊN TẮC BẮT BUỘC — VI PHẠM LÀ SAI:
                1. CHỈ trả lời câu hỏi về nông nghiệp. Nếu hỏi chủ đề khác, từ chối lịch sự.
                2. TUYỆT ĐỐI KHÔNG dùng: dấu sao *, dấu thăng #, dấu gạch dưới _, dấu backtick `. Ví dụ sai: **NEWBEM**, *lưu ý*, ## Tiêu đề. Ví dụ đúng: NEWBEM, lưu ý, Tiêu đề.
                3. Câu trả lời TỐI ĐA 5 câu liên tục HOẶC tối đa 3 ý đánh số (1. 2. 3.). Không dài hơn.
                4. Mỗi ý đánh số chỉ 1-2 câu, không giải thích dài dòng.
                5. Không dùng "Dựa trên dữ liệu...", "Kết luận:", "Chào bác" ở mỗi câu.
                6. Nếu có nhiều lựa chọn thuốc, chỉ liệt kê tên và liều — không cần mô tả thêm.

                %s

                [KIẾN THỨC CHUYÊN MÔN — Lĩnh vực: %s]
                %s
                """
                .formatted(modeBlock, intent.primarySkill().getSkillName(), skillContext);
    }

    // build single-turn prompt for guest chat (includes question at the end)
    private String buildSingleTurnPrompt(String question, String skillContext, IntentResult intent,
            ChatQueryMode mode) {
        return buildSystemPrompt(skillContext, intent, mode) + "\nCâu hỏi: " + question;
    }

    // build the mode instruction block injected into the prompt
    private String buildModeBlock(ChatQueryMode mode) {
        return switch (mode) {
            case KNOWLEDGE_QUERY -> """
                    CHẾ ĐỘ CÂU HỎI: KNOWLEDGE_QUERY
                    QUY TẮC: Trả lời trực tiếp từ kiến thức trong phần KIẾN THỨC CHUYÊN MÔN. \
                    Không hỏi ngược người dùng trừ khi họ chủ động yêu cầu chẩn đoán ruộng thực tế.""";
            case DIAGNOSIS_CASE -> """
                    CHẾ ĐỘ CÂU HỎI: DIAGNOSIS_CASE
                    QUY TẮC: Nếu thiếu thông tin bộ phận cây hoặc mô tả vết bệnh, hỏi TỐI ĐA 2 câu ngắn để làm rõ. \
                    Không kết luận chắc chắn khi thiếu thông tin.""";
        };
    }

    // generate answer single-turn — for guest chat
    private String generateAnswer(String prompt) {
        if (chatModel == null) {
            return "Hệ thống AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
        }
        try {
            String answer = chatModel.chat(prompt);
            if (answer == null || answer.isBlank()) {
                return "Mình đang gặp sự cố khi xử lý câu hỏi này. Bạn vui lòng thử lại sau nhé.";
            }
            return stripMarkdown(answer.trim());
        } catch (Exception ex) {
            return "Mình đang gặp một chút gián đoạn khi kết nối với hệ thống AI. Bạn vui lòng thử lại sau ít phút nhé.";
        }
    }

    // generate answer multi-turn — for session chat
    private String generateAnswerMultiTurn(String systemPrompt, List<ChatMessage> history, String userText) {
        if (chatModel == null) {
            return "Hệ thống AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
        }
        try {
            List<dev.langchain4j.data.message.ChatMessage> messages = new ArrayList<>();
            messages.add(SystemMessage.from(systemPrompt));

            for (ChatMessage msg : history) {
                if (msg.getSenderType() == SenderType.USER) {
                    messages.add(UserMessage.from(msg.getMessageContent()));
                } else {
                    messages.add(AiMessage.from(msg.getMessageContent()));
                }
            }

            // current user message — append at the end
            messages.add(UserMessage.from(userText));

            String answer = chatModel.chat(messages).aiMessage().text();
            if (answer == null || answer.isBlank()) {
                return "Mình đang gặp sự cố khi xử lý câu hỏi này. Bạn vui lòng thử lại sau nhé.";
            }
            return stripMarkdown(answer.trim());
        } catch (Exception ex) {
            return "Mình đang gặp một chút gián đoạn khi kết nối với hệ thống AI. Bạn vui lòng thử lại sau ít phút nhé.";
        }
    }

    // strip residual markdown symbols the LLM may still output
    private String stripMarkdown(String text) {
        return text
                .replaceAll("\\*\\*(.+?)\\*\\*", "$1") // **bold** → bold
                .replaceAll("\\*(.+?)\\*", "$1") // *italic* → italic
                .replaceAll("__(.+?)__", "$1") // __bold__ → bold
                .replaceAll("_(.*?)_", "$1") // _italic_ → italic
                .replaceAll("#{1,6}\\s*", "") // ## heading → heading
                .replaceAll("`(.+?)`", "$1") // `code` → code
                .trim();
    }

}
