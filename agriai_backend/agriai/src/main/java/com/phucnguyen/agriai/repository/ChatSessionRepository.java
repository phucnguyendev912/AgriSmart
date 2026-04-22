package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.ChatSession;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Integer> {
    // get all sessions of a user, sorted by last message time and creation time
    Page<ChatSession> findByUserIdAndIsDeleteFalseOrderByLastMessageAtDescCreatedAtDesc(Integer userId,
            Pageable pageable);

    // get a session by id and user id
    Optional<ChatSession> findByIdAndUserIdAndIsDeleteFalse(Integer id, Integer userId);
}
