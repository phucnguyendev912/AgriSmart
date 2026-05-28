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
import com.phucnguyen.agriai.mapper.DiseaseMapper;
import com.phucnguyen.agriai.port.GuidancePort;
import com.phucnguyen.agriai.port.ImageStoragePort;
import com.phucnguyen.agriai.port.VisionDetectionPort;
import com.phucnguyen.agriai.port.WeatherPort;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
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

@Slf4j
@Service
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

    public DiagnoseResponse diagnose(String email, DiagnoseRequest request) {
        DiagnosisValidationService.DiagnosisContext context = diagnosisValidationService.validate(email, request);
        boolean isAuthenticated = context.user() != null;

        long startTotal = System.currentTimeMillis();
        long stepStart;

        try {
            stepStart = System.currentTimeMillis();
            String imageUrl = imageStoragePort.upload(request.getImage());
            log.info("TIME_TRACK: upload() took {} ms", (System.currentTimeMillis() - stepStart));

            stepStart = System.currentTimeMillis();
            CompletableFuture<List<VisionResultDTO>> visionFuture = CompletableFuture.supplyAsync(
                    () -> visionDetectionPort.detect(imageUrl));
            CompletableFuture<WeatherDTO> weatherFuture = CompletableFuture.supplyAsync(
                    () -> fetchWeatherSafely(request));

            List<VisionResultDTO> visionResults = visionFuture.join();
            WeatherDTO weather = weatherFuture.join();
            log.info("TIME_TRACK: vision + weather (parallel) took {} ms", (System.currentTimeMillis() - stepStart));

            DiagnosisAnalysis analysis = analyzeVisionResults(visionResults);

            stepStart = System.currentTimeMillis();
            RuleEngineService.RuleEngineResult ruleResult = analysis.detectedDiseases().isEmpty()
                    ? RuleEngineService.RuleEngineResult.empty()
                    : ruleEngineService.process(toDiseaseContexts(analysis), weather);
            log.info("TIME_TRACK: ruleEngineService() took {} ms", (System.currentTimeMillis() - stepStart));

            stepStart = System.currentTimeMillis();
            DiagnoseResponse response = diagnoseResponseBuilder.buildResponse(
                    null,
                    imageUrl,
                    weather,
                    request.hasGps(),
                    analysis,
                    ruleResult);
            response.setUserGuidance(guidancePort.generateGuidance(response));
            log.info("TIME_TRACK: buildResponse & guidance() took {} ms", (System.currentTimeMillis() - stepStart));

            if (isAuthenticated) {
                stepStart = System.currentTimeMillis();
                DiagnoseHistory history = historyPersistenceService.saveCompletedHistory(
                        context, request, imageUrl, weather, response, analysis);
                log.info("TIME_TRACK: saveCompletedHistory (DB WRITES) took {} ms",
                        (System.currentTimeMillis() - stepStart));
                response.setId(history.getId());
                runGeocodingInBackground(context, request);
            }

            log.info("TIME_TRACK: TOTAL DIAGNOSE TOOK {} ms", (System.currentTimeMillis() - startTotal));
            return response;
        } catch (Exception exception) {
            log.error("Lỗi khi chẩn đoán: {}", exception.getMessage(), exception);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, SYSTEM_ERROR_MESSAGE);
        }
    }

    private List<DiseaseContextDTO> toDiseaseContexts(DiagnosisAnalysis analysis) {
        return analysis.detectedDiseases().stream()
                .map(match -> new DiseaseContextDTO(
                        match.disease().getId(),
                        match.disease().getDiseaseName(),
                        match.visionResult() != null ? match.visionResult().getSeverity() : null,
                        match.visionResult() != null ? match.visionResult().getConfidence() : null))
                .toList();
    }

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

    private void markHistoryFailed(DiagnoseHistory history) {
        if (history == null) {
            return;
        }

        history.setStatus(Status.FAILED);
        diagnoseHistoryRepository.save(history);
    }

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

    private String normalizeLabel(String label) {
        return label.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
    }

    record DetectedDiseaseMatch(Disease disease, VisionResultDTO visionResult) {
    }

    record DiagnosisAnalysis(boolean isHealthy, boolean isUnknown, List<DetectedDiseaseMatch> detectedDiseases) {
    }
}
