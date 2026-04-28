package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.request.CreateChatSessionRequest;
import com.phucnguyen.agriai.dto.response.ChatSessionResponse;
import com.phucnguyen.agriai.dto.response.SoftDeleteChatSessionResponse;
import com.phucnguyen.agriai.entity.ChatSession;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.ChatSessionRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ChatSessionService {

    private static final String DEFAULT_TITLE = "Phiên tư vấn mới";

    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;

    // constructor
    public ChatSessionService(ChatSessionRepository chatSessionRepository, UserRepository userRepository) {
        this.chatSessionRepository = chatSessionRepository;
        this.userRepository = userRepository;
    }

    // create session
    public ChatSessionResponse createSession(String email, CreateChatSessionRequest request) {
        User user = getUserByEmail(email);
        ChatSession session = ChatSession.builder()
                .user(user)
                .sessionTitle(resolveTitle(request))
                .build();
        ChatSession saved = chatSessionRepository.save(session);
        return ChatSessionResponse.fromEntity(saved);
    }

    // get all sessions of a user
    @Transactional(readOnly = true)
    public Page<ChatSessionResponse> getSessions(String email, Pageable pageable) {
        User user = getUserByEmail(email);
        return chatSessionRepository
                .findByUserIdAndIsDeleteFalseOrderByLastMessageAtDescCreatedAtDesc(user.getId(), pageable)
                .map(ChatSessionResponse::fromEntity);
    }

    // get a session by id and user id
    @Transactional(readOnly = true)
    public ChatSession getSessionOrThrow(String email, Integer sessionId) {
        User user = getUserByEmail(email);
        return getSessionByUser(user.getId(), sessionId);
    }

    // soft delete session
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

    // update last message
    public ChatSession updateLastMessage(ChatSession session, String lastMessage, LocalDateTime timestamp) {
        session.setLastMessage(lastMessage);
        session.setLastMessageAt(timestamp);
        return chatSessionRepository.save(session);
    }

    // get user by email
    private User getUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Nguoi dung chua dang nhap.");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay nguoi dung."));
    }

    // get a session by id and user id
    private ChatSession getSessionByUser(Integer userId, Integer sessionId) {
        return chatSessionRepository.findByIdAndUserIdAndIsDeleteFalse(sessionId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay phien chat."));
    }

    // resolve title to default title if null or blank
    private String resolveTitle(CreateChatSessionRequest request) {
        if (request == null || request.getSessionTitle() == null || request.getSessionTitle().isBlank()) {
            return DEFAULT_TITLE;
        }
        return request.getSessionTitle().trim();
    }
}
