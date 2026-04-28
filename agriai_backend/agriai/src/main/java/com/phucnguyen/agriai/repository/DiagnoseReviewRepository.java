package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiagnoseReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository truy vấn bảng DiagnoseReview.
 */
@Repository
public interface DiagnoseReviewRepository extends JpaRepository<DiagnoseReview, Integer> {

    Optional<DiagnoseReview> findByHistoryId(Integer historyId);

    boolean existsByHistoryId(Integer historyId);

    // get all review
    List<DiagnoseReview> findAllByOrderByCreatedAtDesc();
}
