package com.phucnguyen.agriai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.phucnguyen.agriai.dto.request.CreateChatSessionRequest;
import com.phucnguyen.agriai.dto.response.ChatSessionResponse;
import com.phucnguyen.agriai.dto.response.SoftDeleteChatSessionResponse;
import com.phucnguyen.agriai.entity.ChatSession;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.ChatSessionRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class ChatSessionServiceTest {

    @Mock
    private ChatSessionRepository chatSessionRepository;
    @Mock
    private UserRepository userRepository;

    private ChatSessionService chatSessionService;
    private User user;

    @BeforeEach
    void setUp() {
        chatSessionService = new ChatSessionService(chatSessionRepository, userRepository);
        user = User.builder().id(1).email("farmer@example.com").build();
    }

    @Test
    void createSession_usesProvidedTitle() {
        when(userRepository.findByEmail("farmer@example.com")).thenReturn(Optional.of(user));
        when(chatSessionRepository.save(any(ChatSession.class))).thenAnswer(invocation -> {
            ChatSession session = invocation.getArgument(0);
            session.setId(10);
            return session;
        });

        ChatSessionResponse response = chatSessionService.createSession("farmer@example.com",
                CreateChatSessionRequest.builder().sessionTitle("Mùa vụ 1").build());

        assertEquals("Mùa vụ 1", response.getSessionTitle());
        ArgumentCaptor<ChatSession> captor = ArgumentCaptor.forClass(ChatSession.class);
        verify(chatSessionRepository).save(captor.capture());
        assertEquals(user, captor.getValue().getUser());
    }

    @Test
    void createSession_defaultsTitleWhenBlank() {
        when(userRepository.findByEmail("farmer@example.com")).thenReturn(Optional.of(user));
        when(chatSessionRepository.save(any(ChatSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ChatSessionResponse response = chatSessionService.createSession("farmer@example.com",
                CreateChatSessionRequest.builder().sessionTitle(" ").build());

        assertEquals("Phiên tư vấn mới", response.getSessionTitle());
    }

    @Test
    void getSessions_returnsOwnedSessions() {
        when(userRepository.findByEmail("farmer@example.com")).thenReturn(Optional.of(user));
        ChatSession session = ChatSession.builder().id(2).user(user).sessionTitle("Phiên").build();
        when(chatSessionRepository.findByUserIdAndIsDeleteFalseOrderByLastMessageAtDescCreatedAtDesc(eq(1),
                any(PageRequest.class))).thenReturn(new PageImpl<>(java.util.List.of(session)));

        Page<ChatSessionResponse> page = chatSessionService.getSessions("farmer@example.com", PageRequest.of(0, 10));

        assertEquals(1, page.getTotalElements());
        assertEquals("Phiên", page.getContent().get(0).getSessionTitle());
    }

    @Test
    void softDeleteSession_marksDeleted() {
        ChatSession session = ChatSession.builder().id(99).user(user).sessionTitle("Phiên").build();
        when(userRepository.findByEmail("farmer@example.com")).thenReturn(Optional.of(user));
        when(chatSessionRepository.findByIdAndUserIdAndIsDeleteFalse(99, 1)).thenReturn(Optional.of(session));
        when(chatSessionRepository.save(any(ChatSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SoftDeleteChatSessionResponse response = chatSessionService.softDeleteSession("farmer@example.com", 99);

        assertTrue(response.getIsDelete());
        assertNotNull(response.getDeletedAt());
    }

    @Test
    void getSessionOrThrow_rejectsForeignSession() {
        when(userRepository.findByEmail("farmer@example.com")).thenReturn(Optional.of(user));
        when(chatSessionRepository.findByIdAndUserIdAndIsDeleteFalse(5, 1)).thenReturn(Optional.empty());

        assertThrows(AppException.class, () -> chatSessionService.getSessionOrThrow("farmer@example.com", 5));
    }
}
