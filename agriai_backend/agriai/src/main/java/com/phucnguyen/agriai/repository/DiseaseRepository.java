package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.Disease;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiseaseRepository extends JpaRepository<Disease, Integer> {
    // Find by diseaseCode (case insensitive)
    Optional<Disease> findByDiseaseCodeIgnoreCaseAndIsDeleteFalse(String diseaseCode);

    // Find by diseaseNameEn (case insensitive)
    Optional<Disease> findByDiseaseNameEnIgnoreCaseAndIsDeleteFalse(String diseaseNameEn);

    // Find by diseaseName (case insensitive)
    Optional<Disease> findByDiseaseNameIgnoreCaseAndIsDeleteFalse(String diseaseName);

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
