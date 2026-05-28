package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.ChatMessage;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    Page<ChatMessage> findByChatSessionIdAndChatSessionIsDeleteFalseOrderByCreatedAtAsc(Integer chatSessionId,
            Pageable pageable);

    List<ChatMessage> findByChatSessionIdAndChatSessionIsDeleteFalseOrderByCreatedAtDesc(
            Integer chatSessionId, Pageable pageable);
}
