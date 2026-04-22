package com.phucnguyen.agriai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.phucnguyen.agriai.dto.request.SendChatMessageRequest;
import com.phucnguyen.agriai.dto.response.ChatResponse;
import com.phucnguyen.agriai.entity.ChatMessage;
import com.phucnguyen.agriai.entity.ChatSession;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.enums.SenderType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ChatbotServiceTest {

        @Mock
        private DiseaseLookupService diseaseLookupService;
        @Mock
        private TreatmentLookupService treatmentLookupService;
        @Mock
        private DrugInteractionChecker drugInteractionChecker;
        @Mock
        private ChatSessionService chatSessionService;
        @Mock
        private ChatMessageService chatMessageService;

        private ChatbotService chatbotService;

        @BeforeEach
        void setUp() {
                // Khởi tạo ChatbotService với các mock mới, chatModel để null
                chatbotService = new ChatbotService(
                                diseaseLookupService,
                                treatmentLookupService,
                                drugInteractionChecker,
                                chatSessionService,
                                chatMessageService,
                                null);
        }

        @Test
        void chatAsGuest_returnsResponseWithAiMessage() {
                SendChatMessageRequest request = SendChatMessageRequest.builder().messageContent("Lúa bị đạo ôn")
                                .build();
                // Giả lập không tìm thấy bệnh để xem AI trả về message mặc định (vì chatModel
                // null)
                when(diseaseLookupService.resolveExplicitDisease(anyString(), any())).thenReturn(Optional.empty());

                ChatResponse response = chatbotService.chatAsGuest(request);

                assertEquals(SenderType.AI, response.getSenderType());
                assertTrue(response.getMessageContent().contains("chưa được cấu hình"));
        }

        @Test
        void chatForSession_persistsMessagesAndReturnsResponse() {
                String email = "farmer@example.com";
                Integer sessionId = 11;
                ChatSession session = ChatSession.builder().id(sessionId).build();
                SendChatMessageRequest request = SendChatMessageRequest.builder().messageContent("Đạo ôn").build();

                when(chatSessionService.getSessionOrThrow(email, sessionId)).thenReturn(session);
                when(chatMessageService.saveUserMessage(eq(session), anyString()))
                                .thenReturn(ChatMessage.builder().id(1).messageContent("Đạo ôn")
                                                .createdAt(LocalDateTime.now()).build());
                when(diseaseLookupService.resolveExplicitDisease(anyString(), any())).thenReturn(Optional.empty());
                when(chatMessageService.saveAiMessage(eq(session), anyString()))
                                .thenReturn(ChatMessage.builder().id(2).messageContent("Error msg")
                                                .createdAt(LocalDateTime.now()).build());

                ChatResponse response = chatbotService.chatForSession(email, sessionId, request);

                assertEquals(sessionId, response.getSessionId());
                assertEquals(2, response.getMessageId());
                verify(chatMessageService).saveUserMessage(eq(session), anyString());
                verify(chatMessageService).saveAiMessage(eq(session), anyString());
                verify(chatSessionService, times(2)).updateLastMessage(eq(session), anyString(), any());
        }
}
