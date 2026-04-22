package com.phucnguyen.agriai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.phucnguyen.agriai.dto.response.ChatMessageResponse;
import com.phucnguyen.agriai.entity.ChatMessage;
import com.phucnguyen.agriai.entity.ChatSession;
import com.phucnguyen.agriai.enums.SenderType;
import com.phucnguyen.agriai.repository.ChatMessageRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class ChatMessageServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;
    @Mock
    private ChatSessionService chatSessionService;

    private ChatMessageService chatMessageService;
    private ChatSession session;

    @BeforeEach
    void setUp() {
        chatMessageService = new ChatMessageService(chatMessageRepository, chatSessionService);
        session = ChatSession.builder().id(7).sessionTitle("Phiên").build();
    }

    @Test
    void getMessages_returnsAscendingMessages() {
        ChatMessage message = ChatMessage.builder()
                .id(1)
                .chatSession(session)
                .senderType(SenderType.USER)
                .messageContent("Xin chào")
                .build();
        when(chatSessionService.getSessionOrThrow("farmer@example.com", 7)).thenReturn(session);
        when(chatMessageRepository.findByChatSessionIdAndChatSessionIsDeleteFalseOrderByCreatedAtAsc(eq(7),
                any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(message)));

        Page<ChatMessageResponse> page = chatMessageService.getMessages("farmer@example.com", 7, PageRequest.of(0, 20));

        assertEquals(1, page.getContent().size());
        assertEquals(SenderType.USER, page.getContent().get(0).getSenderType());
    }

    @Test
    void saveUserMessage_setsUserSender() {
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ChatMessage message = chatMessageService.saveUserMessage(session, "Tôi cần tư vấn");

        assertEquals(SenderType.USER, message.getSenderType());
        assertEquals("Tôi cần tư vấn", message.getMessageContent());
    }
}
