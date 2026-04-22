package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.repository.TreatmentPlanRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TreatmentLookupService {

    private final TreatmentPlanRepository treatmentPlanRepository;

    public TreatmentLookupService(TreatmentPlanRepository treatmentPlanRepository) {
        this.treatmentPlanRepository = treatmentPlanRepository;
    }

    public List<TreatmentPlan> findByDisease(Disease disease) {
        if (disease == null || disease.getId() == null) {
            return List.of();
        }
        return treatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse(disease.getId()).stream()
                .sorted(Comparator.comparing(TreatmentPlan::getIsRequired, Comparator.nullsLast(Boolean::compareTo))
                        .reversed())
                .toList();
    }
}
