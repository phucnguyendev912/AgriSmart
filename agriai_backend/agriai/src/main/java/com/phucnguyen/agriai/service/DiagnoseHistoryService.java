package com.phucnguyen.agriai.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.dto.DiagnosisDetailSnapshotDTO;
import com.phucnguyen.agriai.entity.DiagnoseHistory;
import com.phucnguyen.agriai.entity.DiagnoseHistoryDetail;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.DiagnoseHistoryDetailRepository;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
import com.phucnguyen.agriai.repository.DiagnoseReviewRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Objects;
import java.util.stream.Collectors;
import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.DiseaseWeatherRiskDTO;
import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.entity.DiagnoseTreatmentRecommendation;
import com.phucnguyen.agriai.repository.DiagnoseTreatmentRecommendationRepository;
import java.util.Comparator;

@Service
@Transactional
public class DiagnoseHistoryService {
    @Autowired
    private DiagnoseHistoryRepository diagnoseHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository;

    @Autowired
    private DiagnoseReviewRepository diagnoseReviewRepository;

    @Autowired
    private DiagnoseTreatmentRecommendationRepository recommendationRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // get diagnose history by user email
    public Page<com.phucnguyen.agriai.dto.response.DiagnoseHistoryResponse> getHistory(String email,
            Pageable pageable) {
        Integer userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay nguoi dung."))
                .getId();

        return diagnoseHistoryRepository.findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc(userId, pageable)
                .map(history -> {
                    List<DiagnoseHistoryDetail> details = diagnoseHistoryDetailRepository
                            .findByDiagnoseHistoryIdAndIsDeleteFalse(history.getId());
                    String diseaseName = null;
                    Double confidence = null;
                    String severity = null;
                    String diagnosisType = null;

                    if (details != null && !details.isEmpty()) {
                        DiagnoseHistoryDetail topDetail = details.get(0);
                        DiagnosisDetailSnapshotDTO snapshot = parseSnapshot(topDetail.getTreatmentData());
                        if (snapshot != null) {
                            diagnosisType = snapshot.getDiagnosisType();
                        }

                        if (topDetail.getDisease() != null) {
                            diseaseName = topDetail.getDisease().getDiseaseName();
                            confidence = topDetail.getConfidenceScore() != null
                                    ? topDetail.getConfidenceScore().doubleValue()
                                    : null;
                            severity = topDetail.getSeverity() != null ? topDetail.getSeverity().name() : null;
                        } else {
                            if ("HEALTHY".equals(diagnosisType)) {
                                diseaseName = "Cây khỏe mạnh";
                            } else {
                                diseaseName = "Không xác định";
                            }
                        }
                    }

                    boolean isReviewed = diagnoseReviewRepository.existsByHistoryId(history.getId());

                    return com.phucnguyen.agriai.dto.response.DiagnoseHistoryResponse.builder()
                            .id(history.getId())
                            .createdAt(history.getCreatedAt())
                            .originalImageUrl(history.getOriginalImageUrl())
                            .cropName(history.getCropType() != null ? history.getCropType().getCropName() : null)
                            .diseaseName(diseaseName)
                            .confidence(confidence)
                            .severity(severity)
                            .status(history.getStatus() != null ? history.getStatus().name() : null)
                            .diagnosisType(diagnosisType)
                            .latitude(history.getLatitude())
                            .longitude(history.getLongitude())
                            .isReviewed(isReviewed)
                            .build();
                });
    }

    private DiagnosisDetailSnapshotDTO parseSnapshot(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, DiagnosisDetailSnapshotDTO.class);
        } catch (Exception exception) {
            return null;
        }
    }

    @Transactional(readOnly = true)
    public DiagnoseResponse getDetail(String email, Integer id) {
        if (email == null || email.isBlank()) {
            throw new AppException(HttpStatus.NOT_FOUND, "Khong tim thay lich su chan doan.");
        }
        Integer userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay lich su chan doan."))
                .getId();

        DiagnoseHistory history = diagnoseHistoryRepository.findByIdAndUserIdAndIsDeleteFalse(id, userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay lich su chan doan."));
        List<DiagnoseHistoryDetail> details = diagnoseHistoryDetailRepository
                .findByDiagnoseHistoryIdAndIsDeleteFalse(id);

        List<DiseaseResultDTO> diseases = new ArrayList<>();
        List<TreatmentDTO> treatments = new ArrayList<>();
        List<TreatmentProgramDTO> sprayPrograms = new ArrayList<>();
        List<InteractionWarningDTO> interactionWarnings = new ArrayList<>();
        List<WeatherAlertDTO> weatherAlerts = new ArrayList<>();
        List<DiseaseWeatherRiskDTO> diseaseWeatherRisks = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        String guidance = null;
        String diagnosisType = null;

        for (DiagnoseHistoryDetail detail : details) {
            if (detail.getDisease() != null) {
                diseases.add(DiseaseResultDTO.builder()
                        .diseaseId(detail.getDisease().getId())
                        .diseaseCode(detail.getDisease().getDiseaseCode())
                        .diseaseName(detail.getDisease().getDiseaseName())
                        .confidence(
                                detail.getConfidenceScore() != null ? detail.getConfidenceScore().doubleValue() : null)
                        .severity(detail.getSeverity() != null ? detail.getSeverity().name() : null)
                        .build());
            }

            DiagnosisDetailSnapshotDTO snapshot = parseSnapshot(detail.getTreatmentData());
            if (snapshot != null) {
                diagnosisType = diagnosisType != null ? diagnosisType : snapshot.getDiagnosisType();
                if (snapshot.getTreatments() != null) {
                    treatments.addAll(snapshot.getTreatments());
                }
                if (snapshot.getSprayPrograms() != null) {
                    sprayPrograms.addAll(snapshot.getSprayPrograms());
                }
                if (snapshot.getInteractionWarnings() != null) {
                    interactionWarnings.addAll(snapshot.getInteractionWarnings());
                }
                if (snapshot.getWeatherAlerts() != null) {
                    weatherAlerts.addAll(snapshot.getWeatherAlerts());
                }
                if (snapshot.getDiseaseWeatherRisks() != null) {
                    diseaseWeatherRisks.addAll(snapshot.getDiseaseWeatherRisks());
                }
                if (snapshot.getWarnings() != null) {
                    warnings.addAll(snapshot.getWarnings());
                }
            }

            if (guidance == null && detail.getCultivationData() != null) {
                guidance = detail.getCultivationData();
            }
            if (detail.getRiskWarning() != null && !detail.getRiskWarning().isBlank()) {
                warnings.add(detail.getRiskWarning());
            }
        }

        if (treatments.isEmpty()) {
            treatments.addAll(loadTreatmentsFromRecommendations(details));
        }

        List<String> distinctWarnings = warnings.stream().filter(Objects::nonNull).distinct().toList();
        List<TreatmentProgramDTO> distinctPrograms = sprayPrograms.stream()
                .collect(Collectors.toMap(TreatmentProgramDTO::getProgramCode, program -> program,
                        (left, right) -> left, LinkedHashMap::new))
                .values().stream().toList();
        List<InteractionWarningDTO> distinctInteractionWarnings = interactionWarnings.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(this::interactionWarningKey, warning -> warning,
                        (left, right) -> left, LinkedHashMap::new))
                .values().stream().toList();
        List<WeatherAlertDTO> distinctWeatherAlerts = weatherAlerts.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(this::weatherAlertKey, alert -> alert,
                        (left, right) -> left, LinkedHashMap::new))
                .values().stream().toList();
        List<DiseaseWeatherRiskDTO> distinctDiseaseWeatherRisks = diseaseWeatherRisks.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(this::diseaseWeatherRiskKey, risk -> risk,
                        (left, right) -> left, LinkedHashMap::new))
                .values().stream().toList();

        return DiagnoseResponse.builder()
                .originalImageUrl(history.getOriginalImageUrl())
                .weather(parseWeatherJson(history.getWeatherData()))
                .diseases(diseases)
                .treatments(treatments)
                .sprayPrograms(distinctPrograms)
                .interactionWarnings(distinctInteractionWarnings)
                .weatherAlerts(distinctWeatherAlerts)
                .diseaseWeatherRisks(distinctDiseaseWeatherRisks)
                .warnings(distinctWarnings)
                .userGuidance(guidance)
                .diagnosisType(diagnosisType)
                .isHealthy("HEALTHY".equals(diagnosisType))
                .build();
    }

    private WeatherDTO parseWeatherJson(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, WeatherDTO.class);
        } catch (Exception exception) {
            return null;
        }
    }

    private String interactionWarningKey(InteractionWarningDTO warning) {
        String ingredientA = String.valueOf(warning.getIngredientAId());
        String ingredientB = String.valueOf(warning.getIngredientBId());
        if (ingredientA.compareTo(ingredientB) > 0) {
            String temp = ingredientA;
            ingredientA = ingredientB;
            ingredientB = temp;
        }
        return ingredientA + ":"
                + ingredientB + ":"
                + String.valueOf(warning.getActionRule());
    }

    private String weatherAlertKey(WeatherAlertDTO alert) {
        return String.valueOf(alert.getTreatmentPlanId()) + ":"
                + String.valueOf(alert.getWeatherFactor()) + ":"
                + String.valueOf(alert.getOperator());
    }

    private String diseaseWeatherRiskKey(DiseaseWeatherRiskDTO risk) {
        return String.valueOf(risk.getDiseaseId()) + ":"
                + String.valueOf(risk.getConditionGroup());
    }

    private List<TreatmentDTO> loadTreatmentsFromRecommendations(List<DiagnoseHistoryDetail> details) {
        List<Integer> detailIds = details.stream()
                .map(DiagnoseHistoryDetail::getId)
                .filter(Objects::nonNull)
                .toList();
        if (detailIds.isEmpty()) {
            return List.of();
        }

        return recommendationRepository.findByDiagnoseHistoryDetailIdInAndIsDeleteFalse(detailIds).stream()
                .sorted(Comparator.comparing(
                        DiagnoseTreatmentRecommendation::getRankScore,
                        Comparator.nullsLast(Integer::compareTo)))
                .map(this::toTreatmentFromRecommendation)
                .filter(Objects::nonNull)
                .toList();
    }

    private TreatmentDTO toTreatmentFromRecommendation(DiagnoseTreatmentRecommendation recommendation) {
        if (recommendation.getTreatmentPlan() == null) {
            return null;
        }
        TreatmentDTO dto = TreatmentDTO.fromEntity(recommendation.getTreatmentPlan());
        dto.setRank(recommendation.getRankScore());
        dto.setRecommended(recommendation.getRankScore() != null && recommendation.getRankScore() == 1);
        return dto;
    }
}
