package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentPlanRepository extends JpaRepository<TreatmentPlan, Integer> {

    List<TreatmentPlan> findByDiseaseIdAndIsDeleteFalse(Integer diseaseId);

    // Fetch plans by disease IDs with eager loading of disease and drug to avoid N+1 queries
    @EntityGraph(attributePaths = {"disease", "drug", "drug.ingredients", "drug.ingredients.ingredient"})
    List<TreatmentPlan> findByDiseaseIdInAndIsDeleteFalse(List<Integer> diseaseIds);

    @EntityGraph(attributePaths = {"disease", "disease.cropType", "drug"})
    @Query("""
            SELECT tp FROM TreatmentPlan tp
            WHERE tp.isDelete = false
              AND (:treatmentName IS NULL OR LOWER(tp.treatmentName) LIKE :treatmentName)
              AND (:cropTypeId IS NULL OR tp.disease.cropType.id = :cropTypeId)
            """)
    Page<TreatmentPlan> findAllByFilter(
            @Param("treatmentName") String treatmentName,
            @Param("cropTypeId") Integer cropTypeId,
            Pageable pageable);

    long countByIsDeleteFalse();

    boolean existsByDrugIdAndIsDeleteFalse(Integer drugId);
}

