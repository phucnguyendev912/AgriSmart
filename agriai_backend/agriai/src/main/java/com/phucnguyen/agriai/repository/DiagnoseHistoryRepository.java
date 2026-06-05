package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiagnoseHistory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiagnoseHistoryRepository extends JpaRepository<DiagnoseHistory, Integer> {
    Page<DiagnoseHistory> findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    Page<DiagnoseHistory> findByUserIdAndIsDeleteFalseAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(
            Integer userId, LocalDateTime fromDate, Pageable pageable);

    Page<DiagnoseHistory> findByUserIdAndIsDeleteFalseAndCreatedAtLessThanOrderByCreatedAtDesc(
            Integer userId, LocalDateTime toDate, Pageable pageable);

    Page<DiagnoseHistory> findByUserIdAndIsDeleteFalseAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
            Integer userId, LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);

    Optional<DiagnoseHistory> findByIdAndUserIdAndIsDeleteFalse(Integer id, Integer userId);


    @Query("SELECT COUNT(h) FROM DiagnoseHistory h WHERE h.isDelete = false AND h.createdAt >= :from")
    long countInPeriod(@Param("from") LocalDateTime from);

    @Query("""
            SELECT FUNCTION('DATE', h.createdAt), COUNT(h)
            FROM DiagnoseHistory h
            WHERE h.isDelete = false AND h.createdAt >= :from
            GROUP BY FUNCTION('DATE', h.createdAt)
            ORDER BY FUNCTION('DATE', h.createdAt)
            """)
    List<Object[]> countByDateInPeriod(@Param("from") LocalDateTime from);

    @Query("""
            SELECT h.cropType.cropName, COUNT(h)
            FROM DiagnoseHistory h
            WHERE h.isDelete = false
            GROUP BY h.cropType.cropName
            ORDER BY COUNT(h) DESC
            """)
    List<Object[]> countByCropType();

    @Query("""
            SELECT h FROM DiagnoseHistory h
            WHERE h.isDelete = false
            ORDER BY h.createdAt DESC
            """)
    List<DiagnoseHistory> findLatest(Pageable pageable);
}
