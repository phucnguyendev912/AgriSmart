package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.request.SendChatMessageRequest;
import com.phucnguyen.agriai.dto.response.ChatResponse;
import com.phucnguyen.agriai.entity.ChatMessage;
import com.phucnguyen.agriai.entity.ChatSession;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.enums.SenderType;
import dev.langchain4j.model.openai.OpenAiChatModel;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Xử lý toàn bộ luồng hội thoại của chatbot. Xem chi tiết:
 * docs/chatbot/CHATBOT_ARCHITECTURE.md
 */
@Service
@Transactional
public class ChatbotService {

    private final DiseaseLookupService diseaseLookupService;
    private final TreatmentLookupService treatmentLookupService;
    private final DrugInteractionChecker drugInteractionChecker;
    private final ChatSessionService chatSessionService;
    private final ChatMessageService chatMessageService;
    private final OpenAiChatModel chatModel;

    public ChatbotService(
            DiseaseLookupService diseaseLookupService,
            TreatmentLookupService treatmentLookupService,
            DrugInteractionChecker drugInteractionChecker,
            ChatSessionService chatSessionService,
            ChatMessageService chatMessageService,
            @Nullable OpenAiChatModel chatModel) {
        this.diseaseLookupService = diseaseLookupService;
        this.treatmentLookupService = treatmentLookupService;
        this.drugInteractionChecker = drugInteractionChecker;
        this.chatSessionService = chatSessionService;
        this.chatMessageService = chatMessageService;
        this.chatModel = chatModel;
    }

    /** Xử lý tin nhắn ở chế độ khách (không lưu lịch sử). */
    public ChatResponse chatAsGuest(SendChatMessageRequest request) {
        String answer = buildContextAndGenerate(request.getMessageContent().trim());
        return ChatResponse.builder()
                .senderType(SenderType.AI)
                .messageContent(answer)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Xử lý tin nhắn trong phiên đã đăng nhập: lưu câu hỏi → gọi AI → lưu trả lời.
     */
    public ChatResponse chatForSession(String email, Integer sessionId, SendChatMessageRequest request) {
        ChatSession session = chatSessionService.getSessionOrThrow(email, sessionId);
        String userText = request.getMessageContent().trim();

        ChatMessage userMessage = chatMessageService.saveUserMessage(session, userText);
        chatSessionService.updateLastMessage(session, userMessage.getMessageContent(), userMessage.getCreatedAt());

        String answer = buildContextAndGenerate(userText);

        ChatMessage aiMessage = chatMessageService.saveAiMessage(session, answer);
        chatSessionService.updateLastMessage(session, aiMessage.getMessageContent(), aiMessage.getCreatedAt());

        return ChatResponse.builder()
                .sessionId(session.getId())
                .messageId(aiMessage.getId())
                .senderType(SenderType.AI)
                .messageContent(answer)
                .createdAt(aiMessage.getCreatedAt())
                .build();
    }

    /** Tra cứu DB (bệnh, phác đồ, xung đột) rồi build prompt và gọi AI. */
    private String buildContextAndGenerate(String userText) {
        Optional<Disease> diseaseOpt = diseaseLookupService.resolveExplicitDisease(userText, null);

        String dbContext = "";
        if (diseaseOpt.isPresent()) {
            Disease disease = diseaseOpt.get();
            List<TreatmentPlan> plans = treatmentLookupService.findByDisease(disease);
            List<InteractionWarningDTO> warnings = drugInteractionChecker.buildInteractionWarnings(plans);
            dbContext = buildDbContextText(disease, plans, warnings);
        }

        return generateAnswer(buildPrompt(userText, dbContext));
    }

    /**
     * Chuyển dữ liệu Entity (bệnh, phác đồ, xung đột) thành đoạn text ngữ cảnh cho
     * AI.
     */
    private String buildDbContextText(Disease disease, List<TreatmentPlan> plans,
            List<InteractionWarningDTO> warnings) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n[DỮ LIỆU HỆ THỐNG - ưu tiên sử dụng để trả lời chính xác]\n");
        sb.append("Bệnh: ").append(disease.getDiseaseName());
        if (disease.getDescription() != null && !disease.getDescription().isBlank()) {
            sb.append(" — ").append(disease.getDescription());
        }
        sb.append("\n");

        if (!plans.isEmpty()) {
            String planText = plans.stream()
                    .map(p -> {
                        String name = p.getDrugName() != null ? p.getDrugName() : p.getTreatmentName();
                        return Boolean.TRUE.equals(p.getIsRequired()) ? name + " (bắt buộc)" : name;
                    })
                    .collect(Collectors.joining(", "));
            sb.append("Phác đồ điều trị: ").append(planText).append("\n");
        }

        if (!warnings.isEmpty()) {
            sb.append("Cảnh báo xung đột thuốc:\n");
            warnings.forEach(w -> {
                if (w.getWarningMessage() != null) {
                    sb.append("  - ").append(w.getWarningMessage()).append("\n");
                } else {
                    sb.append("  - ").append(w.getIngredientAName())
                            .append(" xung đột với ").append(w.getIngredientBName()).append("\n");
                }
            });
        }
        return sb.toString();
    }

    /**
     * Ghép ngữ cảnh DB (nếu có) và câu hỏi người dùng thành prompt hoàn chỉnh gửi
     * AI.
     */
    private String buildPrompt(String question, String dbContext) {
        return """
                Bạn là một chuyên gia nông nghiệp thông minh, thân thiện và am hiểu rộng.
                Hãy trả lời tự nhiên như đang trò chuyện trực tiếp với người nông dân.

                NGUYÊN TẮC TRẢ LỜI:
                1. Nếu có dữ liệu hệ thống bên dưới, ưu tiên dùng để trả lời chính xác.
                2. Nếu dữ liệu hệ thống không đủ hoặc không có, dùng kiến thức nông nghiệp và kiến thức chung của bạn để trả lời đầy đủ, không từ chối.
                3. Không bắt đầu bằng: "Dựa trên dữ liệu...", "Theo thông tin tôi có...", "Kết luận:".
                4. Giọng văn hỗ trợ, rõ ràng, tập trung vào giải pháp thực tế.
                5. TUYỆT ĐỐI KHÔNG dùng dấu sao (*), dấu thăng (#) hay bất kỳ ký tự markdown nào. Chỉ dùng văn bản thuần túy.
                %s
                Câu hỏi: %s
                """
                .formatted(dbContext.isBlank() ? "" : dbContext, question);
    }

    /**
     * Gọi DeepSeek API và trả về câu trả lời. Có fallback khi AI lỗi hoặc chưa cấu
     * hình.
     */
    private String generateAnswer(String prompt) {
        if (chatModel == null) {
            return "Hệ thống AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
        }
        try {
            String answer = chatModel.generate(prompt);
            if (answer == null || answer.isBlank()) {
                return "Mình đang gặp sự cố khi xử lý câu hỏi này. Bạn vui lòng thử lại sau nhé.";
            }
            return answer.trim();
        } catch (Exception ex) {
            return "Mình đang gặp một chút gián đoạn khi kết nối với hệ thống AI. Bạn vui lòng thử lại sau ít phút nhé.";
        }
    }
}
