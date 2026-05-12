package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiagnoseTreatmentRecommendation;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiagnoseTreatmentRecommendationRepository
        extends JpaRepository<DiagnoseTreatmentRecommendation, Integer> {

    @EntityGraph(attributePaths = {
            "diagnoseHistoryDetail",
            "treatmentPlan",
            "treatmentPlan.disease",
            "treatmentPlan.drug",
            "treatmentPlan.drug.ingredients",
            "treatmentPlan.drug.ingredients.ingredient"
    })
    List<DiagnoseTreatmentRecommendation> findByDiagnoseHistoryDetailIdInAndIsDeleteFalse(
            List<Integer> detailIds);
}
