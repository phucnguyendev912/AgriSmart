package com.phucnguyen.agriai.module.chat.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.phucnguyen.agriai.module.chat.dto.request.SendChatMessageRequest;
import com.phucnguyen.agriai.module.chat.dto.response.ChatResponse;
import com.phucnguyen.agriai.module.chat.entity.ChatMessage;
import com.phucnguyen.agriai.module.chat.entity.ChatSession;
import com.phucnguyen.agriai.module.chat.enums.ChatQueryMode;
import com.phucnguyen.agriai.module.chat.enums.SkillDefinition;
import com.phucnguyen.agriai.module.chat.enums.SenderType;
import com.phucnguyen.agriai.module.chat.service.IntentClassifier.Confidence;
import com.phucnguyen.agriai.module.chat.service.IntentClassifier.IntentResult;
import com.phucnguyen.agriai.module.chat.service.IntentClassifier.Source;
import dev.langchain4j.model.chat.ChatLanguageModel;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ChatbotServiceTest {

    @Mock private IntentClassifier intentClassifier;
    @Mock private ChatQueryModeClassifier queryModeClassifier;
    @Mock private MultiSkillChainResolver chainResolver;
    @Mock private SkillContextBuilder contextBuilder;
    @Mock private ChatSessionService chatSessionService;
    @Mock private ChatMessageService chatMessageService;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatLanguageModel chatModel;

    private ChatbotService chatbotService;

    @BeforeEach
    void setUp() throws Exception {
        chatbotService = new ChatbotService(
                intentClassifier, queryModeClassifier, chainResolver, contextBuilder,
                chatSessionService, chatMessageService, chatModel);
        // inject self-reference: normally done by Spring @Autowired @Lazy
        Field selfField = ChatbotService.class.getDeclaredField("self");
        selfField.setAccessible(true);
        selfField.set(chatbotService, chatbotService);
    }

    // --- helpers ---

    private ChatSession sessionOf(int id) {
        return ChatSession.builder().id(id).sessionTitle("Phiên tư vấn mới").build();
    }

    private void givenSessionExists(ChatSession session) {
        when(chatSessionService.getSessionOrThrow(anyString(), anyInt())).thenReturn(session);
        when(chatMessageService.saveUserMessage(eq(session), anyString(), any()))
                .thenReturn(ChatMessage.builder().id(1).messageContent("msg")
                        .senderType(SenderType.USER).createdAt(LocalDateTime.now()).build());
        when(chatMessageService.saveAiMessage(eq(session), anyString()))
                .thenReturn(ChatMessage.builder().id(2).messageContent("ai reply")
                        .senderType(SenderType.AI).createdAt(LocalDateTime.now()).build());
    }

    private void givenLLMResponds(String text) {
        when(chatModel.chat(anyList()).aiMessage().text()).thenReturn(text);
    }

    // --- chatForSession: core pipeline ---

    @Test
    @DisplayName("chatForSession should persist user and AI messages and return response")
    void chatForSession_persistsMessages() {
        int sessionId = 11;
        ChatSession session = sessionOf(sessionId);
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("Đạo ôn phun thuốc gì").build();

        givenSessionExists(session);
        when(chatMessageService.getRecentMessages(eq(session), anyInt()))
                .thenReturn(Collections.emptyList());
        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("skill context");
        givenLLMResponds("AI answer");

        ChatResponse response = chatbotService.chatForSession("farmer@example.com", sessionId, request);

        assertEquals(sessionId, response.getSessionId());
        assertEquals(2, response.getMessageId());
        verify(chatMessageService).saveUserMessage(eq(session), anyString(), any());
        verify(chatMessageService).saveAiMessage(eq(session), anyString());
        verify(chatSessionService, times(2)).updateLastMessage(eq(session), anyString(), any());
    }

    @Test
    @DisplayName("chatForSession without LLM should return config error message")
    void chatForSession_noLLM_returnsError() throws Exception {
        ChatbotService noLlmService = new ChatbotService(
                intentClassifier, queryModeClassifier, chainResolver, contextBuilder,
                chatSessionService, chatMessageService, null);
        Field selfField = ChatbotService.class.getDeclaredField("self");
        selfField.setAccessible(true);
        selfField.set(noLlmService, noLlmService);

        int sessionId = 1;
        ChatSession session = sessionOf(sessionId);
        givenSessionExists(session);
        when(chatMessageService.getRecentMessages(eq(session), anyInt()))
                .thenReturn(Collections.emptyList());
        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("ctx");

        ChatResponse response = noLlmService.chatForSession("u@e.com", sessionId,
                SendChatMessageRequest.builder().messageContent("test").build());

        assertTrue(response.getMessageContent().contains("chưa được cấu hình"));
    }

    // --- resolveSkill ---

    @Test
    @DisplayName("HIGH confidence intent overrides selectedSkill from dropdown")
    void resolveSkill_highConfidenceOverridesDropdown() {
        ChatSession session = sessionOf(1);
        // user selected CULTIVATION but intent classifier is HIGH confidence DISEASE
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("Đạo ôn triệu chứng gì")
                .selectedSkill(SkillDefinition.CULTIVATION)
                .build();

        givenSessionExists(session);
        when(chatMessageService.getRecentMessages(eq(session), anyInt()))
                .thenReturn(Collections.emptyList());
        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("ctx");
        givenLLMResponds("answer");

        chatbotService.chatForSession("u@e.com", 1, request);

        // DISEASE (intent) should win, not CULTIVATION (dropdown)
        verify(contextBuilder).buildContext(eq(SkillDefinition.DISEASE), anyString());
        verify(contextBuilder, never()).buildContext(eq(SkillDefinition.CULTIVATION), anyString());
    }

    @Test
    @DisplayName("LOW confidence defers to selectedSkill from dropdown")
    void resolveSkill_lowConfidenceDeferesToDropdown() {
        ChatSession session = sessionOf(2);
        // history contains "đạo ôn" so enrichment won't be needed for TREATMENT
        ChatMessage histMsg = ChatMessage.builder()
                .messageContent("bệnh đạo ôn triệu chứng").senderType(SenderType.USER)
                .createdAt(LocalDateTime.now()).build();
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("thuốc trị đạo ôn loại nào tốt")
                .selectedSkill(SkillDefinition.TREATMENT)
                .build();

        givenSessionExists(session);
        when(chatMessageService.getRecentMessages(eq(session), anyInt()))
                .thenReturn(List.of(histMsg));
        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.LOW, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("ctx");
        givenLLMResponds("answer");

        chatbotService.chatForSession("u@e.com", 2, request);

        // LOW confidence + selectedSkill TREATMENT → TREATMENT should win
        verify(contextBuilder).buildContext(eq(SkillDefinition.TREATMENT), anyString());
    }

    // --- Follow-up subject enrichment ---

    @Test
    @DisplayName("TREATMENT follow-up without history should return clarification (no LLM call)")
    void followUp_noHistory_returnsClarification() {
        ChatSession session = sessionOf(3);
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("cách trị?")  // short, no disease name
                .selectedSkill(SkillDefinition.TREATMENT)
                .build();

        givenSessionExists(session);
        when(chatMessageService.getRecentMessages(eq(session), anyInt()))
                .thenReturn(Collections.emptyList());
        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.TREATMENT, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);

        ChatResponse response = chatbotService.chatForSession("u@e.com", 3, request);

        assertTrue(response.getMessageContent().contains("bệnh nào"),
                "Should ask for clarification when no subject found in history");
        verify(chatModel, never()).chat(anyList()); // no LLM call
    }

    @Test
    @DisplayName("TREATMENT follow-up enriches query from history disease subject")
    void followUp_withHistory_enrichesQuery() {
        ChatSession session = sessionOf(4);
        ChatMessage histMsg = ChatMessage.builder()
                .messageContent("bệnh đốm nâu trên lá lúa").senderType(SenderType.USER)
                .createdAt(LocalDateTime.now()).build();
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("cách trị?")  // short, no disease name
                .selectedSkill(SkillDefinition.TREATMENT)
                .build();

        givenSessionExists(session);
        when(chatMessageService.getRecentMessages(eq(session), anyInt()))
                .thenReturn(List.of(histMsg));
        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.TREATMENT, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("ctx");
        givenLLMResponds("treatment answer");

        chatbotService.chatForSession("u@e.com", 4, request);

        // contextBuilder should be called with enriched query containing "đốm nâu"
        verify(contextBuilder).buildContext(eq(SkillDefinition.TREATMENT),
                argThat(q -> q.contains("đốm nâu")));
    }

    @Test
    @DisplayName("LLM exception should return graceful error message")
    void handleLLMException_returnsGracefulMessage() {
        ChatSession session = sessionOf(5);
        givenSessionExists(session);
        when(chatMessageService.getRecentMessages(eq(session), anyInt()))
                .thenReturn(Collections.emptyList());
        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("ctx");
        when(chatModel.chat(anyList())).thenThrow(new RuntimeException("API error"));

        ChatResponse response = chatbotService.chatForSession("u@e.com", 5,
                SendChatMessageRequest.builder().messageContent("test").build());

        assertTrue(response.getMessageContent().contains("gián đoạn"));
    }
}
