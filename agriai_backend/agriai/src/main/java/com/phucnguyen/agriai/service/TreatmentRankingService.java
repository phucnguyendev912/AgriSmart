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

@Service
@RequiredArgsConstructor
public class TreatmentRankingService {

    private final TreatmentMapper treatmentMapper;
    private final AIService aiService;

    // Hiển thị tất cả phác đồ, gửi toàn bộ cho AI chọn phác đồ tốt nhất
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

    // Gửi tất cả phác đồ cho AI, AI tự chọn recommended
    private List<TreatmentDTO> processDiseasePlans(List<TreatmentPlan> plans, DiseaseContextDTO context, WeatherDTO weather) {
        // Gửi toàn bộ phác đồ cho AI đánh giá
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

        // Fallback: nếu AI lỗi, chọn phác đồ đầu tiên
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
