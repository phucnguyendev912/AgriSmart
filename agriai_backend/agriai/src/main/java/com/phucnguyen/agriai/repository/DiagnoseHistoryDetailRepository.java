package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiagnoseHistoryDetail;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DiagnoseHistoryDetailRepository extends JpaRepository<DiagnoseHistoryDetail, Integer> {
    List<DiagnoseHistoryDetail> findByDiagnoseHistoryIdAndIsDeleteFalse(Integer diagnoseHistoryId);

    // --- Admin Dashboard Queries ---

    @Query("SELECT COUNT(d) FROM DiagnoseHistoryDetail d WHERE d.isDelete = false")
    long countTotalDiagnoses();

    @Query("SELECT AVG(d.confidenceScore) FROM DiagnoseHistoryDetail d WHERE d.isDelete = false")
    Double averageConfidence();

    @Query("""
            SELECT d.disease.diseaseName, COUNT(d), AVG(d.confidenceScore)
            FROM DiagnoseHistoryDetail d
            WHERE d.isDelete = false
            GROUP BY d.disease.diseaseName
            ORDER BY COUNT(d) DESC
            """)
    List<Object[]> countByDisease(Pageable pageable);
}

