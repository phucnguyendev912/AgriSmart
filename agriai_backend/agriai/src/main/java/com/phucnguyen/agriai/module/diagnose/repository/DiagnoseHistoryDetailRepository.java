package com.phucnguyen.agriai.module.diagnose.repository;

import com.phucnguyen.agriai.module.diagnose.entity.DiagnoseHistoryDetail;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface DiagnoseHistoryDetailRepository extends JpaRepository<DiagnoseHistoryDetail, Integer> {
    List<DiagnoseHistoryDetail> findByDiagnoseHistoryIdAndIsDeleteFalse(Integer diagnoseHistoryId);

    @Query("SELECT d FROM DiagnoseHistoryDetail d LEFT JOIN FETCH d.disease WHERE d.diagnoseHistory.id IN :diagnoseHistoryIds AND d.isDelete = false")
    List<DiagnoseHistoryDetail> findByDiagnoseHistoryIdInAndIsDeleteFalse(@Param("diagnoseHistoryIds") Collection<Integer> diagnoseHistoryIds);


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

