package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.repository.TreatmentPlanRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TreatmentLookupService {

    private final TreatmentPlanRepository treatmentPlanRepository;
    // get treatment plan by disease
    public List<TreatmentPlan> findByDisease(Disease disease) {
        if (disease == null || disease.getId() == null) {
            return List.of();
        }
        return findByDiseaseId(disease.getId());
    }

    // get treatment plan by disease id
    public List<TreatmentPlan> findByDiseaseId(Integer diseaseId) {
        if (diseaseId == null) {
            return List.of();
        }
        return treatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse(diseaseId).stream()
                .sorted(Comparator.comparing(TreatmentPlan::getIsRequired, Comparator.nullsLast(Boolean::compareTo))
                        .reversed())
                .toList();
    }
}
