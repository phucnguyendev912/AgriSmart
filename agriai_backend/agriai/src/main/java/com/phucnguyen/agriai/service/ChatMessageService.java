package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.response.ChatMessageResponse;
import com.phucnguyen.agriai.entity.ChatMessage;
import com.phucnguyen.agriai.entity.ChatSession;
import com.phucnguyen.agriai.enums.SenderType;
import com.phucnguyen.agriai.repository.ChatMessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionService chatSessionService;

    // constructor
    public ChatMessageService(ChatMessageRepository chatMessageRepository, ChatSessionService chatSessionService) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatSessionService = chatSessionService;
    }

    // get all messages in a chat session
    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getMessages(String email, Integer sessionId, Pageable pageable) {
        ChatSession session = chatSessionService.getSessionOrThrow(email, sessionId);
        return chatMessageRepository.findByChatSessionIdAndChatSessionIsDeleteFalseOrderByCreatedAtAsc(session.getId(),
                pageable).map(ChatMessageResponse::fromEntity);
    }

    // save user message
    public ChatMessage saveUserMessage(ChatSession session, String content) {
        return saveMessage(session, SenderType.USER, content);
    }

    // save AI message
    public ChatMessage saveAiMessage(ChatSession session, String content) {
        return saveMessage(session, SenderType.AI, content);
    }

    // save message
    private ChatMessage saveMessage(ChatSession session, SenderType senderType, String content) {
        ChatMessage message = ChatMessage.builder()
                .chatSession(session)
                .senderType(senderType)
                .messageContent(content)
                .build();
        return chatMessageRepository.save(message);
    }
}
