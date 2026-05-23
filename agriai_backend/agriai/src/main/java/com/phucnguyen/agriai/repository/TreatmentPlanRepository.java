package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentPlanRepository extends JpaRepository<TreatmentPlan, Integer> {

    List<TreatmentPlan> findByDiseaseIdAndIsDeleteFalse(Integer diseaseId);

    // Fetch plans by disease IDs with eager loading of disease and drug to avoid N+1 queries
    @EntityGraph(attributePaths = {"disease", "drug", "drug.ingredients", "drug.ingredients.ingredient"})
    List<TreatmentPlan> findByDiseaseIdInAndIsDeleteFalse(List<Integer> diseaseIds);
}
