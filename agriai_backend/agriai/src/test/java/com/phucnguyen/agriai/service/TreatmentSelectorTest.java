package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.Ingredient;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TreatmentSelectorTest {

    private TreatmentSelector selector;
    private Disease disease;
    private Ingredient ingredient;

    @BeforeEach
    void setUp() {
        selector = new TreatmentSelector();
        disease = Disease.builder().id(1).diseaseName("Dao on").build();
        ingredient = Ingredient.builder().id(1).ingredientName("Tricyclazole").build();
    }

    @Test
    @DisplayName("Null/empty list returns null")
    void selectPrimaryPlan_emptyList_returnsNull() {
        assertNull(selector.selectPrimaryPlan(List.of()));
    }

    @Test
    @DisplayName("isRequired=true beats non-required with lower ID")
    void selectPrimaryPlan_prefersRequired() {
        TreatmentPlan required = TreatmentPlan.builder().id(99).disease(disease)
                .isRequired(true).ingredient(ingredient).treatmentName("Required").build();
        TreatmentPlan optional = TreatmentPlan.builder().id(1).disease(disease)
                .isRequired(false).ingredient(ingredient).treatmentName("Optional").build();

        TreatmentPlan result = selector.selectPrimaryPlan(List.of(optional, required));

        assertEquals("Required", result.getTreatmentName());
    }

    @Test
    @DisplayName("Plan with ingredient beats plan without ingredient")
    void selectPrimaryPlan_prefersWithIngredient() {
        TreatmentPlan withIngredient = TreatmentPlan.builder().id(2).disease(disease)
                .ingredient(ingredient).treatmentName("Has ingredient").build();
        TreatmentPlan noIngredient = TreatmentPlan.builder().id(1).disease(disease)
                .treatmentName("No ingredient").build();

        TreatmentPlan result = selector.selectPrimaryPlan(List.of(noIngredient, withIngredient));

        assertEquals("Has ingredient", result.getTreatmentName());
    }

    @Test
    @DisplayName("Tie-breaker: lower ID wins")
    void selectPrimaryPlan_tieBreaker_lowerIdWins() {
        TreatmentPlan plan1 = TreatmentPlan.builder().id(5).disease(disease)
                .ingredient(ingredient).treatmentName("Plan C").build();
        TreatmentPlan plan2 = TreatmentPlan.builder().id(2).disease(disease)
                .ingredient(ingredient).treatmentName("Plan B").build();

        TreatmentPlan result = selector.selectPrimaryPlan(List.of(plan1, plan2));

        assertEquals("Plan B", result.getTreatmentName());
    }

    @Test
    @DisplayName("Single plan is always returned")
    void selectPrimaryPlan_singlePlan_returnsThat() {
        TreatmentPlan plan = TreatmentPlan.builder().id(1).disease(disease).treatmentName("Only").build();

        assertEquals("Only", selector.selectPrimaryPlan(List.of(plan)).getTreatmentName());
    }
}
