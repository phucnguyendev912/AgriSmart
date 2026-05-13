package com.phucnguyen.agriai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.dto.DiagnosisDetailSnapshotDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.entity.DiagnoseHistory;
import com.phucnguyen.agriai.entity.DiagnoseHistoryDetail;
import com.phucnguyen.agriai.entity.DiagnoseTreatmentRecommendation;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.enums.SeverityLevel;
import com.phucnguyen.agriai.enums.Status;
import com.phucnguyen.agriai.repository.DiagnoseHistoryDetailRepository;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
import com.phucnguyen.agriai.repository.DiagnoseTreatmentRecommendationRepository;
import com.phucnguyen.agriai.repository.TreatmentPlanRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class DiagnoseHistoryPersistenceService {

    private final DiagnoseHistoryRepository diagnoseHistoryRepository;
    private final DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository;
    private final DiagnoseTreatmentRecommendationRepository recommendationRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final DiagnoseResponseBuilder diagnoseResponseBuilder;
    private final ObjectMapper objectMapper;

    public void updateHistory(DiagnoseHistory history, String imageUrl, WeatherDTO weather, Status status) {
        history.setOriginalImageUrl(imageUrl);
        history.setWeatherData(writeJson(weather));
        history.setStatus(status);
        diagnoseHistoryRepository.save(history);
    }

    public void saveDetails(
            DiagnoseHistory history,
            DiagnoseResponse response,
            DiagnoseService.DiagnosisAnalysis analysis) {

        // No disease detected
        if (analysis.detectedDiseases().isEmpty()) {
            DiagnoseHistoryDetail detail = DiagnoseHistoryDetail.builder()
                    .diagnoseHistory(history)
                    .riskWarning(firstWarning(response.getWarnings()))
                    .treatmentData(writeJson(buildSnapshot(response, null)))
                    .cultivationData(response.getUserGuidance())
                    .build();
            diagnoseHistoryDetailRepository.save(detail);
            return;
        }

        // Save detail per disease + treatment recommendations
        for (DiagnoseService.DetectedDiseaseMatch match : analysis.detectedDiseases()) {
            DiagnoseHistoryDetail detail = DiagnoseHistoryDetail.builder()
                    .diagnoseHistory(history)
                    .disease(match.disease())
                    .confidenceScore(match.visionResult().getConfidence() != null
                            ? BigDecimal.valueOf(match.visionResult().getConfidence())
                            : null)
                    .severity(parseSeverity(diagnoseResponseBuilder.resolveSeverity(match)))
                    .riskWarning(firstWarning(response.getWarnings()))
                    .treatmentData(writeJson(buildSnapshot(response, match.disease().getId())))
                    .cultivationData(response.getUserGuidance())
                    .build();
            diagnoseHistoryDetailRepository.save(detail);

            // Save treatment recommendations for this disease
            saveTreatmentRecommendations(detail, match.disease().getId(), response.getTreatments());
        }
    }

    // Lưu từng treatment recommendation vào bảng relational
    private void saveTreatmentRecommendations(
            DiagnoseHistoryDetail detail,
            Integer diseaseId,
            List<TreatmentDTO> allTreatments) {
        if (allTreatments == null || allTreatments.isEmpty()) {
            return;
        }

        List<TreatmentDTO> relatedTreatments = allTreatments.stream()
                .filter(t -> Objects.equals(t.getDiseaseId(), diseaseId))
                .toList();

        if (relatedTreatments.isEmpty())
            return;

        List<DiagnoseTreatmentRecommendation> recommendations = new ArrayList<>();

        for (TreatmentDTO treatment : relatedTreatments) {
            if (treatment.getTreatmentPlanId() == null)
                continue;

            TreatmentPlan planRef = treatmentPlanRepository
                    .getReferenceById(treatment.getTreatmentPlanId());

            recommendations.add(DiagnoseTreatmentRecommendation.builder()
                    .diagnoseHistoryDetail(detail)
                    .treatmentPlan(planRef)
                    .rankScore(Boolean.TRUE.equals(treatment.getRecommended()) ? 1 : 0)
                    .build());
        }

        if (!recommendations.isEmpty()) {
            recommendationRepository.saveAll(recommendations);
        }
    }

    private String writeJson(Object value) {
        if (value == null)
            return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            log.warn("Failed to write JSON: {}", exception.getMessage());
            return null;
        }
    }

    private DiagnosisDetailSnapshotDTO buildSnapshot(DiagnoseResponse response, Integer diseaseId) {
        List<TreatmentDTO> treatments = response.getTreatments() != null
                ? response.getTreatments().stream()
                        .filter(treatment -> diseaseId == null || Objects.equals(treatment.getDiseaseId(), diseaseId))
                        .toList()
                : List.of();

        return DiagnosisDetailSnapshotDTO.builder()
                .diagnosisType(response.getDiagnosisType())
                .treatments(treatments)
                .sprayPrograms(response.getSprayPrograms())
                .interactionWarnings(response.getInteractionWarnings())
                .weatherAlerts(response.getWeatherAlerts())
                .diseaseWeatherRisks(response.getDiseaseWeatherRisks())
                .warnings(response.getWarnings())
                .build();
    }

    private SeverityLevel parseSeverity(String value) {
        if (value == null || value.isBlank())
            return null;
        try {
            return SeverityLevel.valueOf(value);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private String firstWarning(List<String> warnings) {
        return warnings != null && !warnings.isEmpty() ? warnings.get(0) : null;
    }
}
