package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.phucnguyen.agriai.mapper.TreatmentMapper;
import com.phucnguyen.agriai.dto.DiseaseContextDTO;

class TreatmentRankingServiceTest {

    private final AIService aiService = mock(AIService.class);
    private final TreatmentMapper treatmentMapper = new TreatmentMapper();

    @Test
    void rankPlans_batchEnabled_callsBatchAndAssignsRecommendation() {
        TreatmentRankingService service = new TreatmentRankingService(treatmentMapper, aiService, true, 2);

        Disease disease1 = Disease.builder().id(1).diseaseName("Dao on").build();
        Disease disease2 = Disease.builder().id(2).diseaseName("Sau cuon la").build();
        TreatmentPlan plan1 = TreatmentPlan.builder().id(10).disease(disease1).build();
        TreatmentPlan plan2 = TreatmentPlan.builder().id(20).disease(disease2).build();

        List<DiseaseContextDTO> diseases = List.of(
                new DiseaseContextDTO(1, "Dao on", null, 0.9),
                new DiseaseContextDTO(2, "Sau cuon la", null, 0.8)
        );

        Map<Integer, List<TreatmentPlan>> plansByDisease = Map.of(
                1, List.of(plan1),
                2, List.of(plan2)
        );

        when(aiService.recommendTreatmentsBatch(anyList(), any(), anyMap())).thenReturn(Map.of(
                1, new AIService.RecommendResult(10, "Test reason 1"),
                2, new AIService.RecommendResult(20, "Test reason 2")
        ));

        List<TreatmentDTO> result = service.rankPlans(plansByDisease, diseases, null);

        assertEquals(2, result.size());
        
        TreatmentDTO dto1 = result.stream().filter(d -> d.getTreatmentPlanId() == 10).findFirst().get();
        assertTrue(dto1.getRecommended());
        assertEquals("Test reason 1", dto1.getRecommendationReason());

        TreatmentDTO dto2 = result.stream().filter(d -> d.getTreatmentPlanId() == 20).findFirst().get();
        assertTrue(dto2.getRecommended());
        assertEquals("Test reason 2", dto2.getRecommendationReason());
        
        verify(aiService, times(1)).recommendTreatmentsBatch(anyList(), any(), anyMap());
        verify(aiService, never()).recommendTreatment(anyString(), anyString(), any(), anyList());
    }

    @Test
    void rankPlans_batchEnabled_topNFiltering() {
        // maxDiseases = 2, but we have 3 diseases
        TreatmentRankingService service = new TreatmentRankingService(treatmentMapper, aiService, true, 2);

        TreatmentPlan plan1 = TreatmentPlan.builder().id(10).build();
        TreatmentPlan plan2 = TreatmentPlan.builder().id(20).build();
        TreatmentPlan plan3 = TreatmentPlan.builder().id(30).build();

        // 3 has highest confidence, then 1, then 2.
        // So Top 2 will be disease 3 and 1. Disease 2 will be ignored.
        List<DiseaseContextDTO> diseases = List.of(
                new DiseaseContextDTO(1, "D1", null, 0.8),
                new DiseaseContextDTO(2, "D2", null, 0.5), // Ignored by AI
                new DiseaseContextDTO(3, "D3", null, 0.9)
        );

        Map<Integer, List<TreatmentPlan>> plansByDisease = Map.of(
                1, List.of(plan1),
                2, List.of(plan2),
                3, List.of(plan3)
        );

        // AI only recommends for 1 and 3
        when(aiService.recommendTreatmentsBatch(anyList(), any(), anyMap())).thenReturn(Map.of(
                1, new AIService.RecommendResult(10, "R1"),
                3, new AIService.RecommendResult(30, "R3")
        ));

        List<TreatmentDTO> result = service.rankPlans(plansByDisease, diseases, null);

        assertEquals(3, result.size());
        
        TreatmentDTO dto1 = result.stream().filter(d -> d.getTreatmentPlanId() == 10).findFirst().get();
        assertTrue(dto1.getRecommended());

        TreatmentDTO dto2 = result.stream().filter(d -> d.getTreatmentPlanId() == 20).findFirst().get();
        assertFalse(dto2.getRecommended()); // Not recommended because it's out of Top 2

        TreatmentDTO dto3 = result.stream().filter(d -> d.getTreatmentPlanId() == 30).findFirst().get();
        assertTrue(dto3.getRecommended());
    }

    @Test
    void rankPlans_batchDisabled_usesLegacySequential() {
        TreatmentRankingService service = new TreatmentRankingService(treatmentMapper, aiService, false, 5);

        Disease disease1 = Disease.builder().id(1).diseaseName("Dao on").build();
        TreatmentPlan plan1 = TreatmentPlan.builder().id(10).disease(disease1).build();

        List<DiseaseContextDTO> diseases = List.of(
                new DiseaseContextDTO(1, "Dao on", null, 0.9)
        );
        Map<Integer, List<TreatmentPlan>> plansByDisease = Map.of(
                1, List.of(plan1)
        );

        when(aiService.recommendTreatment(anyString(), any(), any(), anyList()))
                .thenReturn(new AIService.RecommendResult(10, "Legacy reason"));

        List<TreatmentDTO> result = service.rankPlans(plansByDisease, diseases, null);

        assertEquals(1, result.size());
        assertTrue(result.get(0).getRecommended());
        assertEquals("Legacy reason", result.get(0).getRecommendationReason());

        verify(aiService, never()).recommendTreatmentsBatch(anyList(), any(), anyMap());
        verify(aiService, times(1)).recommendTreatment(anyString(), any(), any(), anyList());
    }

    @Test
    void rankPlans_noFakeFallback_whenAiReturnsNull() {
        TreatmentRankingService service = new TreatmentRankingService(treatmentMapper, aiService, true, 5);

        TreatmentPlan plan1 = TreatmentPlan.builder().id(10).build();
        TreatmentPlan plan2 = TreatmentPlan.builder().id(11).build();

        List<DiseaseContextDTO> diseases = List.of(
                new DiseaseContextDTO(1, "D1", null, 0.9)
        );
        Map<Integer, List<TreatmentPlan>> plansByDisease = Map.of(
                1, List.of(plan1, plan2)
        );

        // AI returns empty map (meaning failure/timeout/fallback)
        when(aiService.recommendTreatmentsBatch(anyList(), any(), anyMap())).thenReturn(Map.of());

        List<TreatmentDTO> result = service.rankPlans(plansByDisease, diseases, null);

        assertEquals(2, result.size());
        assertFalse(result.get(0).getRecommended());
        assertFalse(result.get(1).getRecommended());
    }

    @Test
    void rankPlans_invalidPlanId_doesNotRecommend() {
        TreatmentRankingService service = new TreatmentRankingService(treatmentMapper, aiService, true, 5);

        TreatmentPlan plan1 = TreatmentPlan.builder().id(10).build();

        List<DiseaseContextDTO> diseases = List.of(
                new DiseaseContextDTO(1, "D1", null, 0.9)
        );
        Map<Integer, List<TreatmentPlan>> plansByDisease = Map.of(
                1, List.of(plan1)
        );

        // AI returns planId=99 which is not in the list (only 10 is)
        when(aiService.recommendTreatmentsBatch(anyList(), any(), anyMap())).thenReturn(Map.of(
                1, new AIService.RecommendResult(99, "Wrong plan ID")
        ));

        List<TreatmentDTO> result = service.rankPlans(plansByDisease, diseases, null);

        assertEquals(1, result.size());
        assertFalse(result.get(0).getRecommended());
    }
}
