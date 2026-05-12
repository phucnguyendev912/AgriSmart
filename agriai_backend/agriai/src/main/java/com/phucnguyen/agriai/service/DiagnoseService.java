package com.phucnguyen.agriai.service;

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
import com.phucnguyen.agriai.dto.DiseaseContextDTO;
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
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(noRollbackFor = AppException.class)
@RequiredArgsConstructor
public class DiagnoseService {

    private static final double MIN_CONFIDENCE = 0.4d;
    private static final Set<String> HEALTHY_LABELS = Set.of("healthy", "khoe", "cay_khoe", "khoe_manh");

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
        // validate request
        DiagnosisValidationService.DiagnosisContext context = diagnosisValidationService.validate(email, request);
        // save history
        DiagnoseHistory history = diagnoseHistoryRepository.save(DiagnoseHistory.builder()
                .user(context.user())
                .cropType(context.cropType())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(Status.PENDING)
                .build());
        try {
            String imageUrl = imageStoragePort.upload(request.getImage());

            CompletableFuture<List<VisionResultDTO>> visionFuture = CompletableFuture.supplyAsync(
                    () -> visionDetectionPort.detect(imageUrl));
            CompletableFuture<WeatherDTO> weatherFuture = CompletableFuture.supplyAsync(
                    () -> request.hasGps()
                            ? weatherPort.getCurrentWeather(request.getLatitude(), request.getLongitude())
                            : null);
            // wait for both futures to complete
            List<VisionResultDTO> visionResults = visionFuture.join();
            WeatherDTO weather = weatherFuture.join();
            // analyze vision results
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

            DiagnoseResponse response = diagnoseResponseBuilder.buildResponse(history.getId(), imageUrl, weather,
                    request.hasGps(),
                    analysis, ruleResult);
            response.setUserGuidance(guidancePort.generateGuidance(response));

            historyPersistenceService.updateHistory(history, imageUrl, weather, Status.COMPLETED);
            historyPersistenceService.saveDetails(history, response, analysis);

            if (request.hasGps()) {
                CompletableFuture.runAsync(() -> {
                    try {
                        geocodingService.processGeocoding(
                                context.user(),
                                request.getLatitude(),
                                request.getLongitude());
                    } catch (Exception e) {
                        log.error("Geocoding thất bại: {}", e.getMessage());
                    }
                });
            }

            return response;

        } catch (Exception exception) {
            log.error("Lỗi khi chẩn đoán (ID: {}): {}", history.getId(), exception.getMessage(), exception);
            history.setStatus(Status.FAILED);
            diagnoseHistoryRepository.save(history);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lỗi khi chẩn đoán bệnh cây trồng: " + exception.getMessage());
        }
    }

    // analyze vision results
    private DiagnosisAnalysis analyzeVisionResults(List<VisionResultDTO> visionResults) {
        // handle null vision results
        List<VisionResultDTO> safeResults = visionResults != null ? visionResults : List.of();
        // check if contains healthy label
        boolean containsHealthyLabel = safeResults.stream()
                .map(VisionResultDTO::getLabel)
                .filter(Objects::nonNull)
                .map(this::normalizeLabel)
                .anyMatch(HEALTHY_LABELS::contains);
        // group by max confidence
        Map<String, VisionResultDTO> groupedResults = diseaseMapper.groupByMaxConfidence(safeResults.stream()
                .filter(result -> result.getLabel() != null)
                .filter(result -> !HEALTHY_LABELS.contains(normalizeLabel(result.getLabel())))
                .filter(result -> result.getConfidence() != null && result.getConfidence() >= MIN_CONFIDENCE)
                .toList());
        // convert to detected diseases
        List<DetectedDiseaseMatch> detectedDiseases = groupedResults.values().stream()
                .map(this::toDetectedDiseaseMatch)
                .filter(Objects::nonNull)
                .toList();
        // check if healthy
        boolean healthy = containsHealthyLabel && detectedDiseases.isEmpty();
        return new DiagnosisAnalysis(healthy, detectedDiseases.isEmpty(), detectedDiseases);
    }

    // convert vision result to detected disease match
    private DetectedDiseaseMatch toDetectedDiseaseMatch(VisionResultDTO result) {
        // find disease by label
        Optional<Disease> diseaseOptional = diseaseMapper.findDisease(result.getLabel());
        if (diseaseOptional.isEmpty()) {
            return null;
        }
        return new DetectedDiseaseMatch(diseaseOptional.get(), result);
    }

    private String normalizeLabel(String label) {
        return label.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
    }

    // Package-private inner records — used by DiagnoseResponseBuilder and DiagnoseHistoryPersistenceService
    record DetectedDiseaseMatch(Disease disease, VisionResultDTO visionResult) {}

    record DiagnosisAnalysis(boolean isHealthy, boolean isUnknown, List<DetectedDiseaseMatch> detectedDiseases) {}
}
