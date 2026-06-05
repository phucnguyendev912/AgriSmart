package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.ChatMessage;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    // get all messages in a chat session (paginated, ASC for display)
    Page<ChatMessage> findByChatSessionIdAndChatSessionIsDeleteFalseOrderByCreatedAtAsc(Integer chatSessionId,
            Pageable pageable);

    // get N most recent messages for LLM history (DESC — caller must reverse to ASC)
    List<ChatMessage> findByChatSessionIdAndChatSessionIsDeleteFalseOrderByCreatedAtDesc(
            Integer chatSessionId, Pageable pageable);
}
