package com.phucnguyen.agriai.enums;

import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.function.Predicate;

public enum ScoringCriteria {

        DRUG_ACTIVE(4, "Thuoc da duoc xac minh",
                        plan -> plan.getDrug() != null && Boolean.TRUE.equals(plan.getDrug().getIsActive())),

        DRUG_HAS_INGREDIENT(3, "Co du lieu hoat chat",
                        plan -> plan.getDrug() != null
                                        && plan.getDrug().getIngredients() != null
                                        && plan.getDrug().getIngredients().stream()
                                                        .anyMatch(drugIngredient -> drugIngredient
                                                                        .getIngredient() != null
                                                                        && !Boolean.TRUE.equals(
                                                                                        drugIngredient.getIsDelete())
                                                                        && !Boolean.TRUE.equals(drugIngredient
                                                                                        .getIngredient()
                                                                                        .getIsDelete()))),

        DISPLAY_DOSAGE(2, "Co huong dan lieu luong",
                        plan -> plan.getDosageValueMin() != null),

        HAS_SCHEDULE(1, null,
                        plan -> (plan.getApplicationTime() != null && !plan.getApplicationTime().isBlank())
                                        || (plan.getSprayInterval() != null && !plan.getSprayInterval().isBlank())),

        IS_REQUIRED(1, "Phac do uu tien",
                        plan -> Boolean.TRUE.equals(plan.getIsRequired()));

        public final int point;
        public final String reason;
        private final Predicate<TreatmentPlan> predicate;

        ScoringCriteria(int point, String reason, Predicate<TreatmentPlan> predicate) {
                this.point = point;
                this.reason = reason;
                this.predicate = predicate;
        }

        public boolean matches(TreatmentPlan plan) {
                return predicate.test(plan);
        }
}
