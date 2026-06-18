package com.phucnguyen.agriai.module.chat.service;

import com.phucnguyen.agriai.module.chat.dto.request.CreateChatSessionRequest;
import com.phucnguyen.agriai.module.chat.dto.response.ChatSessionResponse;
import com.phucnguyen.agriai.module.chat.dto.response.SoftDeleteChatSessionResponse;
import com.phucnguyen.agriai.module.chat.entity.ChatSession;
import com.phucnguyen.agriai.module.user.entity.User;
import com.phucnguyen.agriai.infrastructure.exception.AppException;
import com.phucnguyen.agriai.module.chat.repository.ChatSessionRepository;
import com.phucnguyen.agriai.module.user.repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Handles session creation, retrieval, soft deleting, and automatic title generation.
@Service
@Transactional
public class ChatSessionService {

    private static final String DEFAULT_TITLE = "Phiên tư vấn mới";

    private static final int MAX_GENERATED_TITLE_LENGTH = 60;

    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;

    public ChatSessionService(ChatSessionRepository chatSessionRepository, UserRepository userRepository) {
        this.chatSessionRepository = chatSessionRepository;
        this.userRepository = userRepository;
    }

    public ChatSessionResponse createSession(String email, CreateChatSessionRequest request) {
        User user = getUserByEmail(email);
        ChatSession session = ChatSession.builder()
                .user(user)
                .sessionTitle(resolveTitle(request))
                .build();
        ChatSession saved = chatSessionRepository.save(session);
        return ChatSessionResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<ChatSessionResponse> getSessions(String email, Pageable pageable) {
        User user = getUserByEmail(email);
        return chatSessionRepository
                .findByUserIdAndIsDeleteFalseOrderByLastMessageAtDescCreatedAtDesc(user.getId(), pageable)
                .map(ChatSessionResponse::fromEntity);
    }

    // Finds a session by its ID and the owner's email, or throws an exception if not found or deleted.
    @Transactional(readOnly = true)
    public ChatSession getSessionOrThrow(String email, Integer sessionId) {
        User user = getUserByEmail(email);
        return getSessionByUser(user.getId(), sessionId);
    }

    // Soft deletes a chat session by setting the delete flag and deletion timestamp.
    public SoftDeleteChatSessionResponse softDeleteSession(String email, Integer sessionId) {
        ChatSession session = getSessionOrThrow(email, sessionId);
        session.setIsDelete(true);
        session.setDeletedAt(LocalDateTime.now());
        ChatSession saved = chatSessionRepository.save(session);
        return SoftDeleteChatSessionResponse.builder()
                .id(saved.getId())
                .isDelete(saved.getIsDelete())
                .deletedAt(saved.getDeletedAt())
                .build();
    }

    public ChatSession updateLastMessage(ChatSession session, String lastMessage, LocalDateTime timestamp) {
        session.setLastMessage(lastMessage);
        session.setLastMessageAt(timestamp);
        return chatSessionRepository.save(session);
    }

    // Automatically updates the session title using the first message, if the title is still the default.
    public ChatSession updateTitleFromFirstMessage(ChatSession session, String firstMessage) {
        if (!DEFAULT_TITLE.equals(session.getSessionTitle())) {
            return session; // custom title already set — do not overwrite
        }
        session.setSessionTitle(generateTitle(firstMessage));
        return chatSessionRepository.save(session);
    }


    // Helper method to retrieve user profile by email or throw unauthorized/not found error.
    private User getUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Nguoi dung chua dang nhap.");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay nguoi dung."));
    }

    // Helper method to retrieve a non-deleted session by user ID and session ID.
    private ChatSession getSessionByUser(Integer userId, Integer sessionId) {
        return chatSessionRepository.findByIdAndUserIdAndIsDeleteFalse(sessionId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay phien chat."));
    }

    // Resolves the session title, defaulting to a standard placeholder if empty.
    private String resolveTitle(CreateChatSessionRequest request) {
        if (request == null || request.getSessionTitle() == null || request.getSessionTitle().isBlank()) {
            return DEFAULT_TITLE;
        }
        return request.getSessionTitle().trim();
    }

    // Generates a short title from the first message without calling the AI model.
    // Truncates long messages gracefully at a word boundary to avoid cut-off words.
    private String generateTitle(String message) {
        if (message == null || message.isBlank()) {
            return DEFAULT_TITLE;
        }

        String normalized = message.trim().replaceAll("\\s+", " ");
        if (normalized.length() <= MAX_GENERATED_TITLE_LENGTH) {
            return normalized;
        }

        int cutIndex = normalized.lastIndexOf(' ', MAX_GENERATED_TITLE_LENGTH - 3);
        if (cutIndex < 20) {
            cutIndex = MAX_GENERATED_TITLE_LENGTH - 3;
        }
        return normalized.substring(0, cutIndex).trim() + "...";
    }
}
