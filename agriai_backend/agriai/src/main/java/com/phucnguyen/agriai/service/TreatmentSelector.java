package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Chịu trách nhiệm chọn phác đồ điều trị ưu tiên nhất cho một loại bệnh.
 * Thứ tự ưu tiên: Bắt buộc (isRequired=true) → Có chứa hoạt chất → ID nhỏ hơn.
 */
@Component
public class TreatmentSelector {

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
