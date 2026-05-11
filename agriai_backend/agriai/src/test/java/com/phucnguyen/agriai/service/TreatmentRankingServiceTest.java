package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.Drug;
import com.phucnguyen.agriai.entity.DrugIngredient;
import com.phucnguyen.agriai.entity.Ingredient;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.phucnguyen.agriai.mapper.TreatmentMapper;

class TreatmentRankingServiceTest {

    private final TreatmentRankingService service = new TreatmentRankingService(new TreatmentMapper());

    @Test
    void rankPlans_prefersPlanWithDrugIngredient() {
        Disease disease = Disease.builder().id(1).diseaseName("Dao on").build();
        TreatmentPlan planWithoutIngredient = TreatmentPlan.builder()
                .id(1)
                .disease(disease)
                .drug(Drug.builder().id(1).drugName("Drug A").build())
                .build();
        TreatmentPlan planWithIngredient = TreatmentPlan.builder()
                .id(2)
                .disease(disease)
                .drug(Drug.builder()
                        .id(2)
                        .drugName("Drug B")
                        .ingredients(List.of(DrugIngredient.builder()
                                .id(10)
                                .ingredient(Ingredient.builder().id(20).ingredientName("Tricyclazole").build())
                                .build()))
                        .build())
                .build();

        List<TreatmentDTO> result = service.rankPlans(Map.of(1, List.of(planWithoutIngredient, planWithIngredient)));

        assertEquals(2, result.size());
        assertEquals(2, result.get(0).getTreatmentPlanId());
        assertTrue(result.get(0).getRecommended());
        assertEquals(1, result.get(0).getRank());
        assertEquals(2, result.get(1).getRank());
    }

    @Test
    void rankPlans_usesLowerIdAsTieBreaker() {
        Disease disease = Disease.builder().id(1).diseaseName("Dao on").build();
        TreatmentPlan higherId = TreatmentPlan.builder().id(2).disease(disease).build();
        TreatmentPlan lowerId = TreatmentPlan.builder().id(1).disease(disease).build();

        List<TreatmentDTO> result = service.rankPlans(Map.of(1, List.of(higherId, lowerId)));

        assertEquals(1, result.get(0).getTreatmentPlanId());
        assertTrue(result.get(0).getRecommended());
    }
}
