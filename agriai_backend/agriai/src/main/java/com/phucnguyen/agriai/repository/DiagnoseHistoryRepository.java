package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiagnoseHistory;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiagnoseHistoryRepository extends JpaRepository<DiagnoseHistory, Integer> {
    // get all diagnose history by user id and is delete false order by created at
    // desc
    Page<DiagnoseHistory> findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    // get diagnose history by id and user id and is delete false
    Optional<DiagnoseHistory> findByIdAndUserIdAndIsDeleteFalse(Integer id, Integer userId);
}
