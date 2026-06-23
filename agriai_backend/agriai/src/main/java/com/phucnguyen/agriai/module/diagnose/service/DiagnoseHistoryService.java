package com.phucnguyen.agriai.module.diagnose.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.module.diagnose.dto.DiagnosisDetailSnapshotDTO;
import com.phucnguyen.agriai.module.diagnose.entity.DiagnoseHistory;
import com.phucnguyen.agriai.module.diagnose.entity.DiagnoseHistoryDetail;
import com.phucnguyen.agriai.infrastructure.exception.AppException;
import com.phucnguyen.agriai.module.diagnose.repository.DiagnoseHistoryDetailRepository;
import com.phucnguyen.agriai.module.diagnose.repository.DiagnoseHistoryRepository;
import com.phucnguyen.agriai.module.diagnose.repository.DiagnoseReviewRepository;
import com.phucnguyen.agriai.module.user.repository.UserRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Objects;
import java.util.stream.Collectors;
import com.phucnguyen.agriai.module.diagnose.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.module.weather.dto.DiseaseWeatherRiskDTO;
import com.phucnguyen.agriai.module.diagnose.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.module.diagnose.dto.TreatmentDTO;
import com.phucnguyen.agriai.module.diagnose.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;
import com.phucnguyen.agriai.module.diagnose.dto.response.DiagnoseHistoryResponse;
import com.phucnguyen.agriai.module.diagnose.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.module.diagnose.entity.DiagnoseTreatmentRecommendation;
import com.phucnguyen.agriai.module.diagnose.repository.DiagnoseTreatmentRecommendationRepository;
import com.phucnguyen.agriai.module.diagnose.mapper.TreatmentMapper;
import java.util.Comparator;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class DiagnoseHistoryService {

    private final DiagnoseHistoryRepository diagnoseHistoryRepository;

    private final UserRepository userRepository;

    private final DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository;

    private final DiagnoseReviewRepository diagnoseReviewRepository;

    private final DiagnoseTreatmentRecommendationRepository recommendationRepository;

    private final TreatmentMapper treatmentMapper;

    private final ObjectMapper objectMapper;

    // Get diagnosis history page with pagination and optional date filters
    public Page<com.phucnguyen.agriai.module.diagnose.dto.response.DiagnoseHistoryResponse> getHistory(String email,
            Pageable pageable, LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Ngày bắt đầu không được lớn hơn ngày kết thúc.");
        }

        Integer userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng."))
                .getId();

        Page<DiagnoseHistory> historyPage = findHistoryPage(userId, pageable, fromDate, toDate);
        List<DiagnoseHistory> histories = historyPage.getContent();
        if (histories.isEmpty()) {
            return historyPage.map(h -> mapToHistoryResponse(h, List.of(), false));
        }

        List<Integer> historyIds = histories.stream()
                .map(DiagnoseHistory::getId)
                .collect(Collectors.toList());

        List<DiagnoseHistoryDetail> allDetails = diagnoseHistoryDetailRepository
                .findByDiagnoseHistoryIdInAndIsDeleteFalse(historyIds);

        Map<Integer, List<DiagnoseHistoryDetail>> detailsMap = allDetails.stream()
                .collect(Collectors.groupingBy(detail -> detail.getDiagnoseHistory().getId()));

        Set<Integer> reviewedHistoryIds = diagnoseReviewRepository.findReviewedHistoryIds(historyIds);

        return historyPage.map(history -> {
            List<DiagnoseHistoryDetail> details = detailsMap.getOrDefault(history.getId(), List.of());
            boolean isReviewed = reviewedHistoryIds.contains(history.getId());
            return mapToHistoryResponse(history, details, isReviewed);
        });
    }

    private DiagnoseHistoryResponse mapToHistoryResponse(
            DiagnoseHistory history, List<DiagnoseHistoryDetail> details, boolean isReviewed) {
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

        return DiagnoseHistoryResponse.builder()
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
    }

    // Find database history entries with date range filters
    private Page<DiagnoseHistory> findHistoryPage(Integer userId, Pageable pageable, LocalDate fromDate,
            LocalDate toDate) {
        LocalDateTime startDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime endDateTime = toDate != null ? toDate.plusDays(1).atStartOfDay() : null;

        if (startDateTime != null && endDateTime != null) {
            return diagnoseHistoryRepository
                    .findByUserIdAndIsDeleteFalseAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
                            userId, startDateTime, endDateTime, pageable);
        }
        if (startDateTime != null) {
            return diagnoseHistoryRepository
                    .findByUserIdAndIsDeleteFalseAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(
                            userId, startDateTime, pageable);
        }
        if (endDateTime != null) {
            return diagnoseHistoryRepository
                    .findByUserIdAndIsDeleteFalseAndCreatedAtLessThanOrderByCreatedAtDesc(
                            userId, endDateTime, pageable);
        }

        return diagnoseHistoryRepository.findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc(userId, pageable);
    }

    // Parse diagnosis history details snapshot from stored JSON string
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

    // Get detailed diagnosis response details by history ID
    @Transactional(readOnly = true)
    public DiagnoseResponse getDetail(String email, Integer id) {
        if (email == null || email.isBlank()) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch sử chẩn đoán.");
        }
        Integer userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch sử chẩn đoán."))
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
                        .diseaseNameEn(detail.getDisease().getDiseaseNameEn())
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
                .filter(program -> program.getProgramCode() != null)
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
                .id(history.getId())
                .originalImageUrl(history.getOriginalImageUrl())
                .weather(parseWeatherJson(history.getWeatherData()))
                .diseases(diseases)
                .treatments(treatments)
                .sprayPrograms(distinctPrograms)
                .interactionWarnings(distinctInteractionWarnings)
                .hasInteractionWarning(!distinctInteractionWarnings.isEmpty())
                .weatherAlerts(distinctWeatherAlerts)
                .diseaseWeatherRisks(distinctDiseaseWeatherRisks)
                .warnings(distinctWarnings)
                .userGuidance(guidance)
                .diagnosisType(diagnosisType)
                .isHealthy("HEALTHY".equals(diagnosisType))
                .build();
    }

    // Parse weather details from database JSON string
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

    // Create unique key for deduplicating drug interaction warnings
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

    // Create unique key for deduplicating weather alerts
    private String weatherAlertKey(WeatherAlertDTO alert) {
        return String.valueOf(alert.getTreatmentPlanId()) + ":"
                + String.valueOf(alert.getWeatherFactor()) + ":"
                + String.valueOf(alert.getOperator());
    }

    // Create unique key for deduplicating weather risk assessments
    private String diseaseWeatherRiskKey(DiseaseWeatherRiskDTO risk) {
        return String.valueOf(risk.getDiseaseId()) + ":"
                + String.valueOf(risk.getConditionGroup());
    }

    // Load recommendations from database for the given details
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

    // Map recommendation record to TreatmentDTO
    private TreatmentDTO toTreatmentFromRecommendation(DiagnoseTreatmentRecommendation recommendation) {
        if (recommendation.getTreatmentPlan() == null) {
            return null;
        }
        TreatmentDTO dto = treatmentMapper.toDTO(recommendation.getTreatmentPlan());
        dto.setRank(recommendation.getRankScore());
        dto.setRecommended(recommendation.getRankScore() != null && recommendation.getRankScore() == 1);
        return dto;
    }
}
