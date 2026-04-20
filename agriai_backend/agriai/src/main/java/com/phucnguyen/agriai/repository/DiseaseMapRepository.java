package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.dto.MapMarkerResponse;
import com.phucnguyen.agriai.entity.DiagnoseHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DiseaseMapRepository extends JpaRepository<DiagnoseHistory, Integer> {

  @Query("""
      SELECT new com.phucnguyen.agriai.dto.MapMarkerResponse(
          det.id,
          h.id,
          h.latitude,
          h.longitude,
          d.id,
          d.diseaseName,
          h.createdAt,
          ai.province
      )
      FROM DiagnoseHistory h
      JOIN DiagnoseHistoryDetail det ON det.diagnoseHistory = h
      JOIN det.disease d
      LEFT JOIN h.areaInfor ai
      WHERE h.latitude IS NOT NULL
        AND h.longitude IS NOT NULL
        AND h.createdAt >= :since
        AND (:diseaseId IS NULL OR d.id = :diseaseId)
        AND (h.isDelete IS NULL OR h.isDelete = false)
      ORDER BY h.createdAt DESC
      """)
  List<MapMarkerResponse> findMarkers(
      @Param("since") LocalDateTime since,
      @Param("diseaseId") Integer diseaseId);
}
