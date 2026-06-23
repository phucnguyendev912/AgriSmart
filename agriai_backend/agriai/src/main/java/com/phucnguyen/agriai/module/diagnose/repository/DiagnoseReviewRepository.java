package com.phucnguyen.agriai.module.diagnose.repository;

import com.phucnguyen.agriai.module.diagnose.entity.DiagnoseReview;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface DiagnoseReviewRepository extends JpaRepository<DiagnoseReview, Integer> {

        Optional<DiagnoseReview> findByHistoryId(Integer historyId);

        boolean existsByHistoryId(Integer historyId);

        @Query("SELECT r.history.id FROM DiagnoseReview r WHERE r.history.id IN :historyIds AND (r.isDelete = false OR r.isDelete IS NULL)")
        Set<Integer> findReviewedHistoryIds(@Param("historyIds") Collection<Integer> historyIds);

        List<DiagnoseReview> findAllByOrderByCreatedAtDesc();

        @Query("SELECT r FROM DiagnoseReview r WHERE (r.isDelete = false OR r.isDelete IS NULL)")
        Page<DiagnoseReview> findAllNotDeleted(Pageable pageable);

        @Query("SELECT COUNT(r) FROM DiagnoseReview r WHERE r.isDelete = false")
        long countTotalReviews();

        @Query("SELECT COUNT(r) FROM DiagnoseReview r WHERE r.isDelete = false AND r.accurate = true")
        long countAccurateReviews();

        @Query("SELECT AVG(r.rating) FROM DiagnoseReview r WHERE r.isDelete = false AND r.rating IS NOT NULL")
        Double averageRating();

        @Query("""
                        SELECT FUNCTION('DATE', r.createdAt), r.accurate, COUNT(r)
                        FROM DiagnoseReview r
                        WHERE r.isDelete = false AND r.createdAt >= :from
                        GROUP BY FUNCTION('DATE', r.createdAt), r.accurate
                        ORDER BY FUNCTION('DATE', r.createdAt)
                        """)
        List<Object[]> accuracyTrendByDate(@Param("from") LocalDateTime from);

        @Query("""
                        SELECT r FROM DiagnoseReview r
                        WHERE r.isDelete = false
                        ORDER BY r.createdAt DESC
                        """)
        List<DiagnoseReview> findLatest(Pageable pageable);
}
