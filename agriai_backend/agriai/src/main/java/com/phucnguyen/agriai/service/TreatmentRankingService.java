package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.List;
import java.util.Map;
import com.phucnguyen.agriai.dto.DiseaseContextDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.phucnguyen.agriai.mapper.TreatmentMapper;

// Service to rank and select the best treatment plans using AI evaluations.
@Service
@RequiredArgsConstructor
public class TreatmentRankingService {

    private final TreatmentMapper treatmentMapper;
    private final AIService aiService;

    // Ranks treatment plans for each disease context using AI evaluations.
    public List<TreatmentDTO> rankPlans(Map<Integer, List<TreatmentPlan>> plansByDisease, List<DiseaseContextDTO> diseases, WeatherDTO weather) {
        return plansByDisease.entrySet().stream()
                .filter(entry -> !entry.getValue().isEmpty())
                .flatMap(entry -> {
                    Integer diseaseId = entry.getKey();
                    List<TreatmentPlan> plans = entry.getValue();
                    DiseaseContextDTO context = diseases.stream()
                            .filter(d -> d.diseaseId().equals(diseaseId))
                            .findFirst()
                            .orElse(new DiseaseContextDTO(diseaseId, "Chưa rõ", "Chưa rõ"));
                    return processDiseasePlans(plans, context, weather).stream();
                })
                .toList();
    }

    // Submits the treatment options to the AI model to select the recommended option.
    private List<TreatmentDTO> processDiseasePlans(List<TreatmentPlan> plans, DiseaseContextDTO context, WeatherDTO weather) {
        AIService.RecommendResult aiResult = aiService.recommendTreatment(
                context.diseaseName(), context.severity(), weather, plans);

        Integer recommendedPlanId = null;
        String recommendationReason = null;

        if (aiResult != null && aiResult.recommendedPlanId() != null) {
            boolean isValidId = plans.stream().anyMatch(p -> p.getId().equals(aiResult.recommendedPlanId()));
            if (isValidId) {
                recommendedPlanId = aiResult.recommendedPlanId();
                recommendationReason = aiResult.reasoning() != null ? aiResult.reasoning() : "AI khuyên dùng";
            }
        }

        // Fallback: if the AI selection fails or is invalid, select the first available plan.
        if (recommendedPlanId == null && !plans.isEmpty()) {
            recommendedPlanId = plans.get(0).getId();
            recommendationReason = "Phác đồ phù hợp nhất";
        }

        final Integer finalRecommendedId = recommendedPlanId;
        final String finalReason = recommendationReason;

        return plans.stream()
                .map(plan -> {
                    TreatmentDTO dto = treatmentMapper.toDTO(plan);
                    boolean isRecommended = plan.getId().equals(finalRecommendedId);
                    dto.setRecommended(isRecommended);
                    dto.setRecommendationReason(isRecommended ? finalReason : null);
                    return dto;
                })
                .toList();
     }
}
