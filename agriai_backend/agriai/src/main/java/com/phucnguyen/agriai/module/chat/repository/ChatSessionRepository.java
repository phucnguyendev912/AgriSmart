package com.phucnguyen.agriai.module.chat.repository;

import com.phucnguyen.agriai.module.chat.entity.ChatSession;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ChatSessionRepository extends JpaRepository<ChatSession, Integer> {
    Page<ChatSession> findByUserIdAndIsDeleteFalseOrderByLastMessageAtDescCreatedAtDesc(Integer userId,
            Pageable pageable);

    Optional<ChatSession> findByIdAndUserIdAndIsDeleteFalse(Integer id, Integer userId);
}
