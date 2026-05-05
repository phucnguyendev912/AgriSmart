package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.enums.SeverityLevel;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Xây dựng DiagnoseResponse từ kết quả phân tích Vision và Rule Engine.
 * Không tương tác với database.
 */
@Component
public class DiagnoseResponseBuilder {

        public DiagnoseResponse buildResponse(
                        Integer historyId,
                        String imageUrl,
                        WeatherDTO weather,
                        boolean gpsUsed,
                        DiagnoseService.DiagnosisAnalysis analysis,
                        RuleEngineService.RuleEngineResult ruleResult) {

                String diagnosisType = analysis.isHealthy()
                                ? "HEALTHY"
                                : analysis.detectedDiseases().isEmpty() ? "UNKNOWN" : "DISEASE_DETECTED";
                // convert detected diseases to disease results
                List<DiseaseResultDTO> diseaseResults = analysis.detectedDiseases().stream()
                                .map(this::toDiseaseResult)
                                .toList();

                return DiagnoseResponse.builder()
                                .id(historyId)
                                .originalImageUrl(imageUrl)
                                .weather(weather)
                                .gpsUsed(gpsUsed)
                                .diseases(diseaseResults)
                                .warnings(ruleResult.warnings())
                                .treatments(ruleResult.treatments())
                                .sprayPrograms(ruleResult.sprayPrograms())
                                .interactionWarnings(ruleResult.interactionWarnings())
                                .weatherAlerts(ruleResult.weatherAlerts())
                                .isHealthy(analysis.isHealthy())
                                .diagnosisType(diagnosisType)
                                .build();
        }

        DiseaseResultDTO toDiseaseResult(DiagnoseService.DetectedDiseaseMatch match) {
                String diseaseName = match.disease().getDiseaseNameEn() != null
                                && !match.disease().getDiseaseNameEn().isBlank()
                                                ? match.disease().getDiseaseNameEn() + " ("
                                                                + match.disease().getDiseaseName() + ")"
                                                : match.disease().getDiseaseName();

                return DiseaseResultDTO.builder()
                                .diseaseId(match.disease().getId())
                                .diseaseCode(match.disease().getDiseaseCode())
                                .diseaseName(diseaseName)
                                .confidence(match.visionResult().getConfidence())
                                .severity(resolveSeverity(match))
                                .build();
        }

        // resolve severity based on confidence
        String resolveSeverity(DiagnoseService.DetectedDiseaseMatch match) {
                Double confidence = match.visionResult().getConfidence();
                if (confidence != null) {
                        if (confidence > 0.75) {
                                return SeverityLevel.NANG.name();
                        } else if (confidence > 0.60) {
                                return SeverityLevel.TRUNG_BINH.name();
                        } else {
                                return SeverityLevel.NHE.name();
                        }
                }

                // Fallback nếu không có confidence
                if (match.visionResult().getSeverity() != null && !match.visionResult().getSeverity().isBlank()) {
                        return match.visionResult().getSeverity();
                }
                SeverityLevel severity = match.disease().getSeverityLevel();
                return severity != null ? severity.name() : null;
        }
}
