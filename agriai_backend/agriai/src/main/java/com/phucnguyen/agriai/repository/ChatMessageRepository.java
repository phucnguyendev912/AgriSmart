package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    // get all messages in a chat session
    Page<ChatMessage> findByChatSessionIdAndChatSessionIsDeleteFalseOrderByCreatedAtAsc(Integer chatSessionId,
            Pageable pageable);
}
