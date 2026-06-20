package com.phucnguyen.agriai.module.diagnose.service;
import com.phucnguyen.agriai.module.ai.service.AIService;

import com.phucnguyen.agriai.module.diagnose.dto.TreatmentDTO;
import com.phucnguyen.agriai.module.diagnose.entity.TreatmentPlan;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Comparator;
import com.phucnguyen.agriai.module.diagnose.dto.DiseaseContextDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.phucnguyen.agriai.module.diagnose.mapper.TreatmentMapper;

@Service
public class TreatmentRankingService {

    private final TreatmentMapper treatmentMapper;
    private final AIService aiService;
    private final boolean batchEnabled;
    private final int maxDiseases;

    public TreatmentRankingService(
            TreatmentMapper treatmentMapper,
            AIService aiService,
            @Value("${gemini.recommend.batch.enabled:true}") boolean batchEnabled,
            @Value("${gemini.recommend.max-diseases:5}") int maxDiseases) {
        this.treatmentMapper = treatmentMapper;
        this.aiService = aiService;
        this.batchEnabled = batchEnabled;
        this.maxDiseases = maxDiseases;
    }

    public List<TreatmentDTO> rankPlans(Map<Integer, List<TreatmentPlan>> plansByDisease,
            List<DiseaseContextDTO> diseases, WeatherDTO weather) {
        
        List<TreatmentDTO> finalResults = new ArrayList<>();
        // Kiểm tra nếu batchEnabled = false thì chạy sequential path
        if (!batchEnabled) {
            for (Map.Entry<Integer, List<TreatmentPlan>> entry : plansByDisease.entrySet()) {
                if (entry.getValue().isEmpty()) continue;
                Integer diseaseId = entry.getKey();
                List<TreatmentPlan> plans = entry.getValue();
                // tìm diseaseContextDTO từ diseaseId nếu không tìm được thì tạo mới
                DiseaseContextDTO context = diseases.stream()
                    // lọc theo id bệnh khớp với id đang xử lý
                        .filter(d -> d.diseaseId().equals(diseaseId))
                        .findFirst() // lấy đối tượng đầu tiên trả về
                        .orElse(new DiseaseContextDTO(diseaseId, "Chưa rõ", "Chưa rõ", null));
                // Gọi function legacy xử lý từng bệnh một
                finalResults.addAll(processDiseasePlansLegacy(plans, context, weather));
            }
            return finalResults;
        }

        // xử lý batch
        // Sắp xếp các bệnh theo độ tin cậy giảm dần
        List<DiseaseContextDTO> sortedDiseases = diseases.stream()
                // Lọc các bệnh có trong plansByDisease
                .filter(d -> plansByDisease.containsKey(d.diseaseId()) && !plansByDisease.get(d.diseaseId()).isEmpty())
                // Sắp xếp theo confidence giảm dần
                .sorted(Comparator.comparing(
                        (DiseaseContextDTO d) -> d.confidence() != null ? d.confidence() : 0.0)
                        .reversed())
                .toList();

        // Select Top N
        List<DiseaseContextDTO> topDiseases = sortedDiseases.stream()
                .limit(maxDiseases)
                .toList();

        // Call Batch AI
        Map<Integer, AIService.RecommendResult> batchResults = Map.of();
        if (!topDiseases.isEmpty()) {
            batchResults = aiService.recommendTreatmentsBatch(topDiseases, weather, plansByDisease);
        }

        // Process all valid diseases in the snapshot
        for (DiseaseContextDTO d : sortedDiseases) {
            Integer diseaseId = d.diseaseId();
            List<TreatmentPlan> plans = plansByDisease.get(diseaseId);
            
            Integer recommendedPlanId = null;
            String recommendationReason = null;

            // Only Top N diseases can have a recommendation
            if (batchResults.containsKey(diseaseId)) {
                AIService.RecommendResult result = batchResults.get(diseaseId);
                if (result != null && result.recommendedPlanId() != null) {
                    // Validate planId
                    boolean isValidId = plans.stream().anyMatch(p -> p.getId().equals(result.recommendedPlanId()));
                    if (isValidId) {
                        recommendedPlanId = result.recommendedPlanId();
                        recommendationReason = result.reasoning() != null ? result.reasoning() : "AI khuyên dùng";
                    }
                }
            }

            final Integer finalRecommendedId = recommendedPlanId;
            final String finalReason = recommendationReason;

            List<TreatmentDTO> dtos = plans.stream().map(plan -> {
                TreatmentDTO dto = treatmentMapper.toDTO(plan);
                boolean isRecommended = plan.getId().equals(finalRecommendedId);
                dto.setRecommended(isRecommended);
                dto.setRecommendationReason(isRecommended ? finalReason : null);
                return dto;
            }).toList();

            finalResults.addAll(dtos);
        }

        return finalResults;
    }

    // Legacy sequential path
    private List<TreatmentDTO> processDiseasePlansLegacy(List<TreatmentPlan> plans, DiseaseContextDTO context,
            WeatherDTO weather) {
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

        // No default plan fallback anymore as requested: "Không dùng default plan fallback để gắn khuyến nghị giả"

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
