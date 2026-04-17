package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiagnoseHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiagnoseHistoryRepository extends JpaRepository<DiagnoseHistory, Integer> {
    List<DiagnoseHistory> findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc(Integer userId);
}
