package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class TreatmentSelector {

    // select primary plan
    public TreatmentPlan selectPrimaryPlan(List<TreatmentPlan> plans) {
        return plans.stream()
                .sorted(Comparator
                        .comparing((TreatmentPlan plan) -> Boolean.TRUE.equals(plan.getIsRequired())).reversed()
                        .thenComparing(plan -> plan.getIngredient() != null, Comparator.reverseOrder())
                        .thenComparing(TreatmentPlan::getId))
                .findFirst()
                .orElse(null);
    }
}
