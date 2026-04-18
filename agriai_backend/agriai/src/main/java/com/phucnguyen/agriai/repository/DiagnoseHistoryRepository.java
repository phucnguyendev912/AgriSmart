package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiagnoseHistory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiagnoseHistoryRepository extends JpaRepository<DiagnoseHistory, Integer> {
    Page<DiagnoseHistory> findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    
    Optional<DiagnoseHistory> findByIdAndUserIdAndIsDeleteFalse(Integer id, Integer userId);
}
