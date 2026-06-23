package com.phucnguyen.agriai.module.diagnose.repository;

import com.phucnguyen.agriai.module.diagnose.entity.Disease;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DiseaseRepository extends JpaRepository<Disease, Integer> {
    Optional<Disease> findByDiseaseCodeIgnoreCaseAndIsDeleteFalse(String diseaseCode);

    Optional<Disease> findByDiseaseNameEnIgnoreCaseAndIsDeleteFalse(String diseaseNameEn);

    Optional<Disease> findByDiseaseNameIgnoreCaseAndIsDeleteFalse(String diseaseName);

    Optional<Disease> findByDiseaseCodeIgnoreCaseAndCropTypeIdAndIsDeleteFalse(String diseaseCode, Integer cropTypeId);

    Optional<Disease> findByDiseaseNameEnIgnoreCaseAndCropTypeIdAndIsDeleteFalse(String diseaseNameEn, Integer cropTypeId);

    Optional<Disease> findByDiseaseNameIgnoreCaseAndCropTypeIdAndIsDeleteFalse(String diseaseName, Integer cropTypeId);

    List<Disease> findByCropTypeIdAndIsDeleteFalse(Integer cropTypeId);

    @Query("""
            SELECT d FROM Disease d
            WHERE d.isDelete = false
              AND (:cropTypeId IS NULL OR d.cropType.id = :cropTypeId)
            """)
    Page<Disease> findAllByFilter(
            @Param("cropTypeId") Integer cropTypeId,
            Pageable pageable);

    @Query("SELECT COUNT(d) FROM Disease d WHERE d.isDelete = false")
    long countTotalDiseases();
}
