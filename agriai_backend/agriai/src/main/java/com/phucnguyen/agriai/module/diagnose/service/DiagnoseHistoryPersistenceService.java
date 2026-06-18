package com.phucnguyen.agriai.module.diagnose.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.module.diagnose.dto.DiagnosisDetailSnapshotDTO;
import com.phucnguyen.agriai.module.diagnose.dto.TreatmentDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;
import com.phucnguyen.agriai.module.diagnose.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.module.diagnose.entity.DiagnoseHistory;
import com.phucnguyen.agriai.module.diagnose.entity.DiagnoseHistoryDetail;
import com.phucnguyen.agriai.module.diagnose.entity.DiagnoseTreatmentRecommendation;
import com.phucnguyen.agriai.module.diagnose.entity.TreatmentPlan;
import com.phucnguyen.agriai.module.diagnose.enums.SeverityLevel;
import com.phucnguyen.agriai.module.user.enums.Status;
import com.phucnguyen.agriai.module.diagnose.repository.DiagnoseHistoryDetailRepository;
import com.phucnguyen.agriai.module.diagnose.repository.DiagnoseHistoryRepository;
import com.phucnguyen.agriai.module.diagnose.repository.DiagnoseTreatmentRecommendationRepository;
import com.phucnguyen.agriai.module.diagnose.repository.TreatmentPlanRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.phucnguyen.agriai.module.diagnose.dto.request.DiagnoseRequest;

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

    // Service handling persistence of diagnosis history, details, and treatment recommendations

    // Create and save diagnosis history record along with details
    public DiagnoseHistory saveCompletedHistory(
            DiagnosisValidationService.DiagnosisContext context,
            DiagnoseRequest request,
            String imageUrl, 
            WeatherDTO weather, 
            DiagnoseResponse response,
            DiagnoseService.DiagnosisAnalysis analysis) {
            
        DiagnoseHistory history = DiagnoseHistory.builder()
                .user(context.user())
                .cropType(context.cropType())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .originalImageUrl(imageUrl)
                .weatherData(writeJson(weather))
                .status(Status.COMPLETED)
                .build();
                
        history = diagnoseHistoryRepository.save(history);
        saveDetails(history, response, analysis);
        return history;
    }
    

    // Save diagnosis details and recommendations for each detected disease
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
        List<DiagnoseHistoryDetail> details = new ArrayList<>();
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
            details.add(detail);
        }

        // Batch save all details
        List<DiagnoseHistoryDetail> savedDetails = diagnoseHistoryDetailRepository.saveAll(details);

        // Batch save all recommendations
        List<DiagnoseTreatmentRecommendation> allRecommendations = new ArrayList<>();
        for (int i = 0; i < savedDetails.size(); i++) {
            DiagnoseHistoryDetail savedDetail = savedDetails.get(i);
            Integer diseaseId = analysis.detectedDiseases().get(i).disease().getId();
            buildTreatmentRecommendations(savedDetail, diseaseId, response.getTreatments(), allRecommendations);
        }

        if (!allRecommendations.isEmpty()) {
            recommendationRepository.saveAll(allRecommendations);
        }
    }

    // Build treatment recommendations for batch saving
    private void buildTreatmentRecommendations(
            DiagnoseHistoryDetail detail,
            Integer diseaseId,
            List<TreatmentDTO> allTreatments,
            List<DiagnoseTreatmentRecommendation> outputList) {
        if (allTreatments == null || allTreatments.isEmpty()) {
            return;
        }

        List<TreatmentDTO> relatedTreatments = allTreatments.stream()
                .filter(t -> Objects.equals(t.getDiseaseId(), diseaseId))
                .toList();

        for (TreatmentDTO treatment : relatedTreatments) {
            if (treatment.getTreatmentPlanId() == null)
                continue;

            TreatmentPlan planRef = treatmentPlanRepository
                    .getReferenceById(treatment.getTreatmentPlanId());

            outputList.add(DiagnoseTreatmentRecommendation.builder()
                    .diagnoseHistoryDetail(detail)
                    .treatmentPlan(planRef)
                    .rankScore(Boolean.TRUE.equals(treatment.getRecommended()) ? 1 : 0)
                    .build());
        }
    }

    // Serialize an object to JSON string
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

    // Build a snapshot of the diagnosis response for audit/history
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

    // Parse severity string to SeverityLevel enum
    private SeverityLevel parseSeverity(String value) {
        if (value == null || value.isBlank())
            return null;
        try {
            return SeverityLevel.valueOf(value);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    // Get the first warning from the warnings list
    private String firstWarning(List<String> warnings) {
        return warnings != null && !warnings.isEmpty() ? warnings.get(0) : null;
    }
}
