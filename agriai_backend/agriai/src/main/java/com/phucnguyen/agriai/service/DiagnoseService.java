package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseContextDTO;
import com.phucnguyen.agriai.dto.VisionResultDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.entity.DiagnoseHistory;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.enums.Status;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.port.GuidancePort;
import com.phucnguyen.agriai.port.ImageStoragePort;
import com.phucnguyen.agriai.port.VisionDetectionPort;
import com.phucnguyen.agriai.port.WeatherPort;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
import com.phucnguyen.agriai.mapper.DiseaseMapper;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service coordinating the crop diagnosis pipeline using vision analysis, weather data, and rule engine
@Slf4j
@Service
@Transactional(noRollbackFor = AppException.class)
@RequiredArgsConstructor
public class DiagnoseService {

    private static final double MIN_CONFIDENCE = 0.4d;
    private static final Set<String> HEALTHY_LABELS = Set.of("healthy", "khoe", "cay_khoe", "khoe_manh");
    private static final String SYSTEM_ERROR_MESSAGE = "Có lỗi xảy ra, vui lòng thử lại sau";

    private final DiagnoseHistoryRepository diagnoseHistoryRepository;
    private final DiagnosisValidationService diagnosisValidationService;
    private final ImageStoragePort imageStoragePort;
    private final VisionDetectionPort visionDetectionPort;
    private final WeatherPort weatherPort;
    private final RuleEngineService ruleEngineService;
    private final GuidancePort guidancePort;
    private final DiseaseMapper diseaseMapper;
    private final DiagnoseResponseBuilder diagnoseResponseBuilder;
    private final DiagnoseHistoryPersistenceService historyPersistenceService;
    private final GeocodingService geocodingService;

    // Main entry point to diagnose a crop image and return treatment guidelines
    public DiagnoseResponse diagnose(String email, DiagnoseRequest request) {
        DiagnosisValidationService.DiagnosisContext context = diagnosisValidationService.validate(email, request);
        DiagnoseHistory history = createPendingHistoryIfAuthenticated(context, request);

        try {
            String imageUrl = imageStoragePort.upload(request.getImage());

            CompletableFuture<List<VisionResultDTO>> visionFuture = CompletableFuture.supplyAsync(
                    () -> visionDetectionPort.detect(imageUrl));
            CompletableFuture<WeatherDTO> weatherFuture = CompletableFuture.supplyAsync(
                    () -> fetchWeatherSafely(request));

            List<VisionResultDTO> visionResults = visionFuture.join();
            WeatherDTO weather = weatherFuture.join();
            DiagnosisAnalysis analysis = analyzeVisionResults(visionResults);

            RuleEngineService.RuleEngineResult ruleResult = analysis.detectedDiseases().isEmpty()
                    ? RuleEngineService.RuleEngineResult.empty()
                    : ruleEngineService.process(
                            analysis.detectedDiseases().stream()
                                    .map(match -> new DiseaseContextDTO(
                                            match.disease().getId(),
                                            match.disease().getDiseaseName(),
                                            match.visionResult() != null ? match.visionResult().getSeverity() : null))
                                    .toList(),
                            weather);

            DiagnoseResponse response = diagnoseResponseBuilder.buildResponse(
                    history != null ? history.getId() : null,
                    imageUrl,
                    weather,
                    request.hasGps(),
                    analysis,
                    ruleResult);
            response.setUserGuidance(guidancePort.generateGuidance(response));

            if (history != null) {
                historyPersistenceService.updateHistory(history, imageUrl, weather, Status.COMPLETED);
                historyPersistenceService.saveDetails(history, response, analysis);
                runGeocodingInBackground(context, request);
            }

            return response;
        } catch (Exception exception) {
            markHistoryFailed(history);
            log.error("Lỗi khi chẩn đoán (ID: {}): {}",
                    history != null ? history.getId() : null,
                    exception.getMessage(),
                    exception);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, SYSTEM_ERROR_MESSAGE);
        }
    }

    // Save a pending history record if the user is authenticated
    private DiagnoseHistory createPendingHistoryIfAuthenticated(
            DiagnosisValidationService.DiagnosisContext context,
            DiagnoseRequest request) {
        if (context.user() == null) {
            return null;
        }

        return diagnoseHistoryRepository.save(DiagnoseHistory.builder()
                .user(context.user())
                .cropType(context.cropType())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(Status.PENDING)
                .build());
    }

    // Fetch current weather data based on GPS coordinates safely
    private WeatherDTO fetchWeatherSafely(DiagnoseRequest request) {
        if (!request.hasGps()) {
            return null;
        }

        try {
            return weatherPort.getCurrentWeather(request.getLatitude(), request.getLongitude());
        } catch (Exception exception) {
            log.warn("Không lấy được dữ liệu thời tiết: {}", exception.getMessage());
            return null;
        }
    }

    // Run reverse geocoding asynchronously in the background
    private void runGeocodingInBackground(
            DiagnosisValidationService.DiagnosisContext context,
            DiagnoseRequest request) {
        if (!request.hasGps()) {
            return;
        }

        CompletableFuture.runAsync(() -> {
            try {
                geocodingService.processGeocoding(
                        context.user(),
                        request.getLatitude(),
                        request.getLongitude());
            } catch (Exception exception) {
                log.error("Geocoding thất bại: {}", exception.getMessage());
            }
        });
    }

    // Mark the diagnosis history status as FAILED in database
    private void markHistoryFailed(DiagnoseHistory history) {
        if (history == null) {
            return;
        }

        history.setStatus(Status.FAILED);
        diagnoseHistoryRepository.save(history);
    }

    // Filter and group raw AI vision results to identify valid diseases
    private DiagnosisAnalysis analyzeVisionResults(List<VisionResultDTO> visionResults) {
        List<VisionResultDTO> safeResults = visionResults != null ? visionResults : List.of();
        boolean containsHealthyLabel = safeResults.stream()
                .map(VisionResultDTO::getLabel)
                .filter(Objects::nonNull)
                .map(this::normalizeLabel)
                .anyMatch(HEALTHY_LABELS::contains);

        Map<String, VisionResultDTO> groupedResults = diseaseMapper.groupByMaxConfidence(safeResults.stream()
                .filter(result -> result.getLabel() != null)
                .filter(result -> !HEALTHY_LABELS.contains(normalizeLabel(result.getLabel())))
                .filter(result -> result.getConfidence() != null && result.getConfidence() >= MIN_CONFIDENCE)
                .toList());

        List<DetectedDiseaseMatch> detectedDiseases = groupedResults.values().stream()
                .map(this::toDetectedDiseaseMatch)
                .filter(Objects::nonNull)
                .toList();

        boolean healthy = containsHealthyLabel && detectedDiseases.isEmpty();
        return new DiagnosisAnalysis(healthy, detectedDiseases.isEmpty(), detectedDiseases);
    }

    // Map a vision prediction result to a database Disease entity match
    private DetectedDiseaseMatch toDetectedDiseaseMatch(VisionResultDTO result) {
        Optional<Disease> diseaseOptional = diseaseMapper.findDisease(result.getLabel());
        if (diseaseOptional.isEmpty()) {
            return null;
        }
        return new DetectedDiseaseMatch(diseaseOptional.get(), result);
    }

    // Normalize label string to lowercase and replace spaces with underscores
    private String normalizeLabel(String label) {
        return label.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
    }

    record DetectedDiseaseMatch(Disease disease, VisionResultDTO visionResult) {
    }

    record DiagnosisAnalysis(boolean isHealthy, boolean isUnknown, List<DetectedDiseaseMatch> detectedDiseases) {
    }
}
