package com.phucnguyen.agriai.module.diagnose.service;
import com.phucnguyen.agriai.module.chat.service.RuleEngineService;
import com.phucnguyen.agriai.module.area.service.GeocodingService;
import com.phucnguyen.agriai.module.diagnose.dto.DiseaseContextDTO;
import com.phucnguyen.agriai.module.ai.dto.VisionResultDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;
import com.phucnguyen.agriai.module.diagnose.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.module.diagnose.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.module.diagnose.entity.DiagnoseHistory;
import com.phucnguyen.agriai.module.diagnose.entity.Disease;
import com.phucnguyen.agriai.infrastructure.exception.AppException;
import com.phucnguyen.agriai.module.diagnose.mapper.DiseaseMapper;
import com.phucnguyen.agriai.module.ai.port.GuidancePort;
import com.phucnguyen.agriai.module.attachment.port.ImageStoragePort;
import com.phucnguyen.agriai.module.ai.port.VisionDetectionPort;
import com.phucnguyen.agriai.module.weather.port.WeatherPort;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiagnoseService {

    private static final double MIN_CONFIDENCE = 0.4d;
    private static final Set<String> HEALTHY_LABELS = Set.of("healthy", "khoe", "cay_khoe", "khoe_manh");
    private static final String SYSTEM_ERROR_MESSAGE = "Có lỗi xảy ra, vui lòng thử lại sau";

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
    @Qualifier("ioExecutor")
    private final Executor ioExecutor;

    public DiagnoseResponse diagnose(String email, DiagnoseRequest request) {
        // Gọi validate để kiểm tra request gửi về có hợp lệ không và trả về context
        // chứa dữ liệu
        DiagnosisValidationService.DiagnosisContext context = diagnosisValidationService.validate(email, request);
        // Kiểm tra xem user có đăng nhập không dựa vào context trả về
        boolean isAuthenticated = context.user() != null;

        try {
            // upload ảnh lên cloudinary và lấy url của ảnh
            String imageUrl = imageStoragePort.upload(request.getImage());
            // gọi model để dự đoán bệnh dựa vào url ảnh
            CompletableFuture<List<VisionResultDTO>> visionFuture = CompletableFuture.supplyAsync(
                    () -> visionDetectionPort.detect(imageUrl), ioExecutor);
            // gọi api thời tiết dựa vào gps
            CompletableFuture<WeatherDTO> weatherFuture = CompletableFuture.supplyAsync(
                    () -> fetchWeatherSafely(request), ioExecutor);
            // lấy kết quả vision và thời tiết
            List<VisionResultDTO> visionResults = visionFuture.join();
            WeatherDTO weather = weatherFuture.join();
            // phân tích kết quả vision
            DiagnosisAnalysis analysis = analyzeVisionResults(visionResults);
            // xử lý nghiệp vụ dựa trên kết quả vision và thời tiết
            RuleEngineService.RuleEngineResult ruleResult = analysis.detectedDiseases().isEmpty()
                    ? RuleEngineService.RuleEngineResult.empty()
                    : ruleEngineService.process(toDiseaseContexts(analysis), weather);
            // build response
            DiagnoseResponse response = diagnoseResponseBuilder.buildResponse(
                    null,
                    imageUrl,
                    weather,
                    request.hasGps(),
                    analysis,
                    ruleResult);
            response.setUserGuidance(guidancePort.generateGuidance(response));
            // Nếu đã đăng nhập thì lưu lịch sử và chạy để lấy địa chỉ nền
            if (isAuthenticated) {
                DiagnoseHistory history = historyPersistenceService.saveCompletedHistory(
                        context, request, imageUrl, weather, response, analysis);
                response.setId(history.getId());
                runGeocodingInBackground(context, request);
            }

            return response;
        } catch (Exception exception) {
            log.error("Error occurred during diagnosis for user {}: {}", email, exception.getMessage(), exception);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, SYSTEM_ERROR_MESSAGE);
        }
    }

    // chuyển đổi DiseaseContextDTO từ DiagnosisAnalysis
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
            log.error("Failed to fetch weather for coordinates {}, {}", request.getLatitude(), request.getLongitude(),
                    exception);
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
                log.error("Failed to run geocoding in background for user {}", context.user().getId(), exception);
            }
        }, ioExecutor);
    }

    // phân tích kết quả vision và trả về DiagnosisAnalysis
    private DiagnosisAnalysis analyzeVisionResults(List<VisionResultDTO> visionResults) {
        // xử lý list vision kết quả trả về từ model
        List<VisionResultDTO> safeResults = visionResults != null ? visionResults : List.of();
        // kiểm tra xem có kết quả nào là cây khỏe không
        boolean containsHealthyLabel = safeResults.stream()
                .map(VisionResultDTO::getLabel)
                .filter(Objects::nonNull)
                .map(this::normalizeLabel)
                .anyMatch(HEALTHY_LABELS::contains);
        // group kết quả theo disease id và lấy confidence cao nhất
        Map<String, VisionResultDTO> groupedResults = diseaseMapper.groupByMaxConfidence(safeResults.stream()
                .filter(result -> result.getLabel() != null)
                .filter(result -> !HEALTHY_LABELS.contains(normalizeLabel(result.getLabel())))
                .filter(result -> result.getConfidence() != null && result.getConfidence() >= MIN_CONFIDENCE)
                .toList());
        // chuyển đổi sang list DetectedDiseaseMatch
        List<DetectedDiseaseMatch> detectedDiseases = groupedResults.values().stream()
                .map(this::toDetectedDiseaseMatch)
                .flatMap(Optional::stream)
                .toList();
        // kiểm tra xem có cây khỏe không
        boolean healthy = containsHealthyLabel && detectedDiseases.isEmpty();
        return new DiagnosisAnalysis(healthy, detectedDiseases.isEmpty(), detectedDiseases);
    }

    private Optional<DetectedDiseaseMatch> toDetectedDiseaseMatch(VisionResultDTO result) {
        return diseaseMapper.findDisease(result.getLabel())
                .map(disease -> new DetectedDiseaseMatch(disease, result));
    }

    private String normalizeLabel(String label) {
        return label.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
    }

    // return a object with disease and visionResult
    record DetectedDiseaseMatch(Disease disease, VisionResultDTO visionResult) {
    }

    // return a object with isHealthy and isUnknown and detectedDiseases
    record DiagnosisAnalysis(boolean isHealthy, boolean isUnknown, List<DetectedDiseaseMatch> detectedDiseases) {
    }
}
