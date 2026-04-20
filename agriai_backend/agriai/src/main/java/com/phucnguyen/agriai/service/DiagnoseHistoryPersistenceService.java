package com.phucnguyen.agriai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.dto.DiagnosisDetailSnapshotDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.DiagnoseHistory;
import com.phucnguyen.agriai.entity.DiagnoseHistoryDetail;
import com.phucnguyen.agriai.enums.SeverityLevel;
import com.phucnguyen.agriai.enums.Status;
import com.phucnguyen.agriai.repository.DiagnoseHistoryDetailRepository;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Chịu trách nhiệm lưu kết quả chẩn đoán vào database.
 */
@Service
@Transactional
public class DiagnoseHistoryPersistenceService {

    private final DiagnoseHistoryRepository diagnoseHistoryRepository;
    private final DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository;
    private final DiagnoseResponseBuilder diagnoseResponseBuilder;
    private final ObjectMapper objectMapper;

    public DiagnoseHistoryPersistenceService(
            DiagnoseHistoryRepository diagnoseHistoryRepository,
            DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository,
            DiagnoseResponseBuilder diagnoseResponseBuilder,
            ObjectMapper objectMapper) {
        this.diagnoseHistoryRepository = diagnoseHistoryRepository;
        this.diagnoseHistoryDetailRepository = diagnoseHistoryDetailRepository;
        this.diagnoseResponseBuilder = diagnoseResponseBuilder;
        this.objectMapper = objectMapper;
    }

    // update history
    public void updateHistory(DiagnoseHistory history, String imageUrl, WeatherDTO weather, Status status) {
        history.setOriginalImageUrl(imageUrl);
        history.setWeatherData(writeJson(weather));
        history.setStatus(status);
        diagnoseHistoryRepository.save(history);
    }

    // save details
    public void saveDetails(
            DiagnoseHistory history,
            com.phucnguyen.agriai.dto.response.DiagnoseResponse response,
            DiagnosisAnalysis analysis) {

        if (analysis.detectedDiseases().isEmpty()) {
            DiagnoseHistoryDetail detail = DiagnoseHistoryDetail.builder()
                    .diagnoseHistory(history)
                    .riskWarning(firstWarning(response.getWarnings()))
                    .treatmentData(writeJson(DiagnosisDetailSnapshotDTO.builder()
                            .diagnosisType(response.getDiagnosisType())
                            .treatments(response.getTreatments())
                            .sprayPrograms(response.getSprayPrograms())
                            .interactionWarnings(response.getInteractionWarnings())
                            .weatherAlerts(response.getWeatherAlerts())
                            .warnings(response.getWarnings())
                            .build()))
                    .cultivationData(response.getUserGuidance())
                    .build();
            diagnoseHistoryDetailRepository.save(detail);
            return;
        }
        // save details
        List<DiagnoseHistoryDetail> details = analysis.detectedDiseases().stream()
                .<DiagnoseHistoryDetail>map(match -> {
                    // get related treatments
                    List<TreatmentDTO> relatedTreatments = response.getTreatments().stream()
                            .filter(treatment -> Objects.equals(treatment.getDiseaseId(), match.disease().getId()))
                            .toList();
                    // get related spray programs
                    List<TreatmentProgramDTO> relatedPrograms = response.getSprayPrograms().stream()
                            .filter(program -> program.getTreatments().stream()
                                    .anyMatch(treatment -> Objects.equals(treatment.getDiseaseId(),
                                            match.disease().getId())))
                            .toList();

                    return DiagnoseHistoryDetail.builder()
                            .diagnoseHistory(history)
                            .disease(match.disease())
                            .confidenceScore(match.visionResult().getConfidence() != null
                                    ? BigDecimal.valueOf(match.visionResult().getConfidence())
                                    : null)
                            .severity(parseSeverity(diagnoseResponseBuilder.resolveSeverity(match)))
                            .riskWarning(firstWarning(response.getWarnings()))
                            .treatmentData(writeJson(DiagnosisDetailSnapshotDTO.builder()
                                    .diagnosisType(response.getDiagnosisType())
                                    .treatments(relatedTreatments)
                                    .sprayPrograms(relatedPrograms)
                                    .interactionWarnings(response.getInteractionWarnings())
                                    .weatherAlerts(response.getWeatherAlerts())
                                    .warnings(response.getWarnings())
                                    .build()))
                            .cultivationData(response.getUserGuidance())
                            .build();
                }).toList();
        // save details
        diagnoseHistoryDetailRepository.saveAll(details);
    }

    private String writeJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            return null;
        }
    }

    private SeverityLevel parseSeverity(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
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
