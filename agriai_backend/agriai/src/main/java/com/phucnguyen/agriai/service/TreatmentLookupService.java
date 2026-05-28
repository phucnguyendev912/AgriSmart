package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.repository.TreatmentPlanRepository;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TreatmentLookupService {

    private final TreatmentPlanRepository treatmentPlanRepository;

    public List<TreatmentPlan> findByDisease(Disease disease) {
        if (disease == null || disease.getId() == null) {
            return List.of();
        }
        return findByDiseaseId(disease.getId());
    }

    public List<TreatmentPlan> findByDiseaseId(Integer diseaseId) {
        if (diseaseId == null) {
            return List.of();
        }
        return treatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse(diseaseId).stream()
                .sorted(Comparator.comparing(TreatmentPlan::getIsRequired, Comparator.nullsLast(Boolean::compareTo))
                        .reversed())
                .toList();
    }

    public Map<Integer, List<TreatmentPlan>> findByDiseaseIds(List<Integer> diseaseIds) {
        if (diseaseIds == null || diseaseIds.isEmpty()) {
            return Map.of();
        }

        List<TreatmentPlan> allPlans = treatmentPlanRepository
                .findByDiseaseIdInAndIsDeleteFalse(diseaseIds);

        // Group plans by disease ID using a LinkedHashMap to preserve query order.
        return allPlans.stream()
                .filter(plan -> plan.getDisease() != null)
                .collect(Collectors.groupingBy(
                        plan -> plan.getDisease().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));
    }
}
