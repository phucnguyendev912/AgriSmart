package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentPlanRepository extends JpaRepository<TreatmentPlan, Integer> {

    List<TreatmentPlan> findByDiseaseIdAndIsDeleteFalse(Integer diseaseId);

    // Lấy plans theo nhiều diseaseIds, kèm eager-fetch disease + drug (tránh N+1)
    @EntityGraph(attributePaths = {"disease", "drug", "drug.ingredients", "drug.ingredients.ingredient"})
    List<TreatmentPlan> findByDiseaseIdInAndIsDeleteFalse(List<Integer> diseaseIds);
}
