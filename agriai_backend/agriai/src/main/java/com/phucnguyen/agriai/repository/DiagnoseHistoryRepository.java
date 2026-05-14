package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiagnoseHistory;
import java.time.LocalDateTime;
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

    Page<DiagnoseHistory> findByUserIdAndIsDeleteFalseAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(
            Integer userId, LocalDateTime fromDate, Pageable pageable);

    Page<DiagnoseHistory> findByUserIdAndIsDeleteFalseAndCreatedAtLessThanOrderByCreatedAtDesc(
            Integer userId, LocalDateTime toDate, Pageable pageable);

    Page<DiagnoseHistory> findByUserIdAndIsDeleteFalseAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
            Integer userId, LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);

    // get diagnose history by id and user id and is delete false
    Optional<DiagnoseHistory> findByIdAndUserIdAndIsDeleteFalse(Integer id, Integer userId);
}
