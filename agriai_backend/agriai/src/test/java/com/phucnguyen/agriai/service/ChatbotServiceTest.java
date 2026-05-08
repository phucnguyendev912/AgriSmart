package com.phucnguyen.agriai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.phucnguyen.agriai.dto.request.SendChatMessageRequest;
import com.phucnguyen.agriai.dto.response.ChatResponse;
import com.phucnguyen.agriai.entity.ChatMessage;
import com.phucnguyen.agriai.entity.ChatSession;
import com.phucnguyen.agriai.enums.ChatQueryMode;
import com.phucnguyen.agriai.enums.SkillDefinition;
import com.phucnguyen.agriai.enums.SenderType;
import com.phucnguyen.agriai.service.IntentClassifier.Confidence;
import com.phucnguyen.agriai.service.IntentClassifier.IntentResult;
import com.phucnguyen.agriai.service.IntentClassifier.Source;
import dev.langchain4j.model.chat.ChatLanguageModel;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ChatbotServiceTest {

    @Mock
    private IntentClassifier intentClassifier;
    @Mock
    private ChatQueryModeClassifier queryModeClassifier;
    @Mock
    private MultiSkillChainResolver chainResolver;
    @Mock
    private SkillContextBuilder contextBuilder;
    @Mock
    private ChatSessionService chatSessionService;
    @Mock
    private ChatMessageService chatMessageService;
    @Mock
    private ChatLanguageModel chatModel;  // fixed: was OpenAiChatModel

    private ChatbotService chatbotService;
    private ChatbotService chatbotServiceNoLLM;

    @BeforeEach
    void setUp() {
        chatbotService = new ChatbotService(
                intentClassifier, queryModeClassifier, chainResolver, contextBuilder,
                chatSessionService, chatMessageService, chatModel);
        chatbotServiceNoLLM = new ChatbotService(
                intentClassifier, queryModeClassifier, chainResolver, contextBuilder,
                chatSessionService, chatMessageService, null);
    }

    // --- Guest chat tests ---

    @Test
    @DisplayName("chatAsGuest should return AI response with skill pipeline")
    void chatAsGuestReturnsSkillBasedResponse() {
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("Lúa bị đạo ôn").build();

        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.DIAGNOSIS_CASE);
        when(chainResolver.resolve(eq(SkillDefinition.DISEASE), anyString()))
                .thenReturn(List.of(SkillDefinition.DISEASE));
        when(contextBuilder.buildContext(eq(SkillDefinition.DISEASE), anyString()))
                .thenReturn("Đạo ôn: vết hình thoi...");
        when(chatModel.chat(anyString())).thenReturn("Lúa bạn bị đạo ôn, nên phun thuốc...");

        ChatResponse response = chatbotService.chatAsGuest(request);

        assertEquals(SenderType.AI, response.getSenderType());
        assertEquals("Lúa bạn bị đạo ôn, nên phun thuốc...", response.getMessageContent());
    }

    @Test
    @DisplayName("chatAsGuest without LLM should return config error")
    void chatAsGuestNoLLMReturnsError() {
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("Lúa bị đạo ôn").build();

        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(chainResolver.resolve(any(), anyString()))
                .thenReturn(List.of(SkillDefinition.DISEASE));
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("context");

        ChatResponse response = chatbotServiceNoLLM.chatAsGuest(request);
        assertTrue(response.getMessageContent().contains("chưa được cấu hình"));
    }

    // --- Session chat tests ---

    @Test
    @DisplayName("chatForSession should persist messages and return response")
    void chatForSessionPersistsMessages() {
        String email = "farmer@example.com";
        Integer sessionId = 11;
        ChatSession session = ChatSession.builder().id(sessionId).build();
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("Đạo ôn phun thuốc gì").build();

        when(chatSessionService.getSessionOrThrow(email, sessionId)).thenReturn(session);
        when(chatMessageService.saveUserMessage(eq(session), anyString()))
                .thenReturn(ChatMessage.builder().id(1).messageContent("Đạo ôn phun thuốc gì")
                        .createdAt(LocalDateTime.now()).build());
        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(chainResolver.resolve(any(), anyString()))
                .thenReturn(List.of(SkillDefinition.DISEASE, SkillDefinition.TREATMENT));
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("skill context");
        when(chatModel.chat(anyString())).thenReturn("AI answer");
        when(chatMessageService.saveAiMessage(eq(session), anyString()))
                .thenReturn(ChatMessage.builder().id(2).messageContent("AI answer")
                        .createdAt(LocalDateTime.now()).build());

        ChatResponse response = chatbotService.chatForSession(email, sessionId, request);

        assertEquals(sessionId, response.getSessionId());
        assertEquals(2, response.getMessageId());
        verify(chatMessageService).saveUserMessage(eq(session), anyString());
        verify(chatMessageService).saveAiMessage(eq(session), anyString());
        verify(chatSessionService, times(2)).updateLastMessage(eq(session), anyString(), any());
    }

    // --- Mode injection tests ---

    @Test
    @DisplayName("Prompt should contain KNOWLEDGE_QUERY for symptom knowledge questions")
    void promptContainsKnowledgeQueryModeForSymptomQuestion() {
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("Bệnh đốm nâu có triệu chứng như nào?").build();

        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(chainResolver.resolve(any(), anyString()))
                .thenReturn(List.of(SkillDefinition.DISEASE));
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("context");

        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        when(chatModel.chat(promptCaptor.capture())).thenReturn("answer");

        chatbotService.chatAsGuest(request);

        String capturedPrompt = promptCaptor.getValue();
        assertTrue(capturedPrompt.contains("KNOWLEDGE_QUERY"),
                "Prompt should contain KNOWLEDGE_QUERY mode block");
    }

    @Test
    @DisplayName("Prompt should contain DIAGNOSIS_CASE for real field queries")
    void promptContainsDiagnosisCaseModeForFieldQuery() {
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("Lúa tôi có đốm nâu trên lá").build();

        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.DIAGNOSIS_CASE);
        when(chainResolver.resolve(any(), anyString()))
                .thenReturn(List.of(SkillDefinition.DISEASE));
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("context");

        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        when(chatModel.chat(promptCaptor.capture())).thenReturn("Bạn có thể cho biết vết...");

        chatbotService.chatAsGuest(request);

        String capturedPrompt = promptCaptor.getValue();
        assertTrue(capturedPrompt.contains("DIAGNOSIS_CASE"),
                "Prompt should contain DIAGNOSIS_CASE mode block");
    }

    // --- Pipeline integration tests ---

    @Test
    @DisplayName("Should chain 2 skills and combine context")
    void shouldChainTwoSkills() {
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("Bệnh đạo ôn phun thuốc gì").build();

        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.HIGH, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(chainResolver.resolve(eq(SkillDefinition.DISEASE), anyString()))
                .thenReturn(List.of(SkillDefinition.DISEASE, SkillDefinition.TREATMENT));
        when(contextBuilder.buildContext(eq(SkillDefinition.DISEASE), anyString()))
                .thenReturn("disease context");
        when(contextBuilder.buildContext(eq(SkillDefinition.TREATMENT), anyString()))
                .thenReturn("treatment context");
        when(chatModel.chat(anyString())).thenReturn("combined answer");

        ChatResponse response = chatbotService.chatAsGuest(request);

        assertEquals("combined answer", response.getMessageContent());
        verify(contextBuilder).buildContext(eq(SkillDefinition.DISEASE), anyString());
        verify(contextBuilder).buildContext(eq(SkillDefinition.TREATMENT), anyString());
    }

    @Test
    @DisplayName("Should handle LLM exception gracefully")
    void handleLLMException() {
        SendChatMessageRequest request = SendChatMessageRequest.builder()
                .messageContent("test").build();

        when(intentClassifier.classify(anyString()))
                .thenReturn(new IntentResult(SkillDefinition.DISEASE, Confidence.LOW, Source.KEYWORD));
        when(queryModeClassifier.classify(anyString())).thenReturn(ChatQueryMode.KNOWLEDGE_QUERY);
        when(chainResolver.resolve(any(), anyString()))
                .thenReturn(List.of(SkillDefinition.DISEASE));
        when(contextBuilder.buildContext(any(), anyString())).thenReturn("ctx");
        when(chatModel.chat(anyString())).thenThrow(new RuntimeException("API error"));

        ChatResponse response = chatbotService.chatAsGuest(request);
        assertTrue(response.getMessageContent().contains("gián đoạn"));
    }
}
