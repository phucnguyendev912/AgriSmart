package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentPlanRepository extends JpaRepository<TreatmentPlan, Integer> {
    List<TreatmentPlan> findByDiseaseIdAndIsDeleteFalse(Integer diseaseId);
}
