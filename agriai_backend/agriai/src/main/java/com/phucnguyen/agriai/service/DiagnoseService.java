package com.phucnguyen.agriai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.dto.DiagnosisDetailSnapshotDTO;
import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.dto.VisionResultDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.entity.DiagnoseHistory;
import com.phucnguyen.agriai.entity.DiagnoseHistoryDetail;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.enums.SeverityLevel;
import com.phucnguyen.agriai.enums.Status;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.port.GuidancePort;
import com.phucnguyen.agriai.port.VisionDetectionPort;
import com.phucnguyen.agriai.port.WeatherPort;
import com.phucnguyen.agriai.repository.DiagnoseHistoryDetailRepository;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DiagnoseService {

    private static final double MIN_CONFIDENCE = 0.4d;
    private static final Set<String> HEALTHY_LABELS = Set.of("healthy", "khoe", "cay_khoe", "khoe_manh");

    private final DiagnoseHistoryRepository diagnoseHistoryRepository;
    private final DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository;
    private final DiagnosisValidationService diagnosisValidationService;
    private final DiagnosisAttachmentService diagnosisAttachmentService;
    private final VisionDetectionPort visionDetectionPort;
    private final WeatherPort weatherPort;
    private final RuleEngineService ruleEngineService;
    private final GuidancePort guidancePort;
    private final DiseaseMapper diseaseMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DiagnoseService(
            DiagnoseHistoryRepository diagnoseHistoryRepository,
            DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository,
            DiagnosisValidationService diagnosisValidationService,
            DiagnosisAttachmentService diagnosisAttachmentService,
            VisionDetectionPort visionDetectionPort,
            WeatherPort weatherPort,
            RuleEngineService ruleEngineService,
            GuidancePort guidancePort,
            DiseaseMapper diseaseMapper) {
        this.diagnoseHistoryRepository = diagnoseHistoryRepository;
        this.diagnoseHistoryDetailRepository = diagnoseHistoryDetailRepository;
        this.diagnosisValidationService = diagnosisValidationService;
        this.diagnosisAttachmentService = diagnosisAttachmentService;
        this.visionDetectionPort = visionDetectionPort;
        this.weatherPort = weatherPort;
        this.ruleEngineService = ruleEngineService;
        this.guidancePort = guidancePort;
        this.diseaseMapper = diseaseMapper;
    }

    public DiagnoseResponse diagnose(String email, DiagnoseRequest request) {
        DiagnosisValidationService.DiagnosisContext context = diagnosisValidationService.validate(email, request);
        // Lưu lịch sử chẩn đoán
        DiagnoseHistory history = diagnoseHistoryRepository.save(DiagnoseHistory.builder()
                .user(context.user())
                .cropType(context.cropType())
                .status(Status.PENDING)
                .build());

        try {
            // Lưu ảnh và lấy URL
            String imageUrl = diagnosisAttachmentService.uploadAndSave(request.getImage(), history.getId());

            CompletableFuture<List<VisionResultDTO>> visionFuture = CompletableFuture.supplyAsync(
                    () -> visionDetectionPort.detect(imageUrl,
                            context.aiModel() != null ? context.aiModel().getModelFilePath() : null));
            CompletableFuture<WeatherDTO> weatherFuture = CompletableFuture.supplyAsync(
                    () -> request.hasGps()
                            ? weatherPort.getCurrentWeather(request.getLatitude(), request.getLongitude())
                            : null);
            // Chờ kết quả từ 2 luồng
            List<VisionResultDTO> visionResults = visionFuture.join();
            WeatherDTO weather = weatherFuture.join();
            // Phân tích kết quả từ AI
            DiagnosisAnalysis analysis = analyzeVisionResults(visionResults);
            // Xử lý logic nghiệp vụ
            RuleEngineService.RuleEngineResult ruleResult = analysis.detectedDiseases().isEmpty()
                    ? RuleEngineService.RuleEngineResult.empty()
                    : ruleEngineService.process(
                            analysis.detectedDiseases().stream()
                                    .map(match -> match.disease().getId())
                                    .toList(),
                            weather);
            // Xây dựng response
            DiagnoseResponse response = buildResponse(imageUrl, weather, request.hasGps(), analysis, ruleResult);
            // Tạo hướng dẫn sử dụng
            String guidance = guidancePort.generateGuidance(response);
            response.setUserGuidance(guidance);
            // Cập nhật lịch sử chẩn đoán
            updateHistory(history, imageUrl, weather, Status.COMPLETED);
            saveDetails(history, response, analysis);
            return response;
        } catch (RuntimeException exception) {
            exception.printStackTrace();
            history.setStatus(Status.FAILED);
            diagnoseHistoryRepository.save(history);
            throw exception;
        } catch (Exception exception) {
            exception.printStackTrace();
            history.setStatus(Status.FAILED);
            diagnoseHistoryRepository.save(history);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Loi khi chan doan benh cay trong.");
        }
    }

    private DiagnoseResponse buildResponse(
            String imageUrl,
            WeatherDTO weather,
            boolean gpsUsed,
            DiagnosisAnalysis analysis,
            RuleEngineService.RuleEngineResult ruleResult) {
        String diagnosisType = analysis.isHealthy()
                ? "HEALTHY"
                : analysis.detectedDiseases().isEmpty() ? "UNKNOWN" : "DISEASE_DETECTED";

        List<DiseaseResultDTO> diseaseResults = analysis.detectedDiseases().stream()
                .map(this::toDiseaseResult)
                .toList();

        return DiagnoseResponse.builder()
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

    // Phân tích kết quả từ Vision API
    private DiagnosisAnalysis analyzeVisionResults(List<VisionResultDTO> visionResults) {
        List<VisionResultDTO> safeResults = visionResults != null ? visionResults : List.of();
        boolean containsHealthyLabel = safeResults.stream()
                .map(VisionResultDTO::getLabel)
                .filter(Objects::nonNull)
                .map(this::normalizeLabel)
                .anyMatch(HEALTHY_LABELS::contains);
        // Gộp các kết quả có cùng nhãn và lấy kết quả có confidence cao nhất
        Map<String, VisionResultDTO> groupedResults = diseaseMapper.groupByMaxConfidence(safeResults.stream()
                .filter(result -> result.getLabel() != null)
                .filter(result -> !HEALTHY_LABELS.contains(normalizeLabel(result.getLabel())))
                .filter(result -> result.getConfidence() != null && result.getConfidence() >= MIN_CONFIDENCE)
                .toList());
        // Tạo danh sách các bệnh được phát hiện
        List<DetectedDiseaseMatch> detectedDiseases = groupedResults.values().stream()
                .map(this::toDetectedDiseaseMatch)
                .filter(Objects::nonNull)
                .toList();
        // Kiểm tra xem có bệnh nào được phát hiện không
        boolean healthy = containsHealthyLabel && detectedDiseases.isEmpty();
        return new DiagnosisAnalysis(healthy, detectedDiseases.isEmpty(), detectedDiseases);
    }

    // Chuyển đổi VisionResultDTO sang DetectedDiseaseMatch
    private DetectedDiseaseMatch toDetectedDiseaseMatch(VisionResultDTO result) {
        Optional<Disease> diseaseOptional = diseaseMapper.findDisease(result.getLabel());
        if (diseaseOptional.isEmpty()) {
            return null;
        }
        return new DetectedDiseaseMatch(diseaseOptional.get(), result);
    }

    // Chuyển đổi DetectedDiseaseMatch sang DiseaseResultDTO
    private DiseaseResultDTO toDiseaseResult(DetectedDiseaseMatch match) {
        String diseaseName = match.disease().getDiseaseNameEn() != null && !match.disease().getDiseaseNameEn().isBlank()
                ? match.disease().getDiseaseNameEn() + " (" + match.disease().getDiseaseName() + ")"
                : match.disease().getDiseaseName();

        return DiseaseResultDTO.builder()
                .diseaseId(match.disease().getId())
                .diseaseCode(match.disease().getDiseaseCode())
                .diseaseName(diseaseName)
                .confidence(match.visionResult().getConfidence())
                .severity(resolveSeverity(match))
                .build();
    }

    private String resolveSeverity(DetectedDiseaseMatch match) {
        if (match.visionResult().getSeverity() != null && !match.visionResult().getSeverity().isBlank()) {
            return match.visionResult().getSeverity();
        }
        SeverityLevel severity = match.disease().getSeverityLevel();
        return severity != null ? severity.name() : null;
    }

    private void updateHistory(DiagnoseHistory history, String imageUrl, WeatherDTO weather, Status status) {
        history.setOriginalImageUrl(imageUrl);
        history.setWeatherData(writeJson(weather));
        history.setStatus(status);
        diagnoseHistoryRepository.save(history);
    }

    private void saveDetails(DiagnoseHistory history, DiagnoseResponse response, DiagnosisAnalysis analysis) {
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

        for (DetectedDiseaseMatch match : analysis.detectedDiseases()) {
            List<TreatmentDTO> relatedTreatments = response.getTreatments().stream()
                    .filter(treatment -> Objects.equals(treatment.getDiseaseId(), match.disease().getId()))
                    .toList();
            List<TreatmentProgramDTO> relatedPrograms = response.getSprayPrograms().stream()
                    .filter(program -> program.getTreatments().stream()
                            .anyMatch(treatment -> Objects.equals(treatment.getDiseaseId(), match.disease().getId())))
                    .toList();

            DiagnoseHistoryDetail detail = DiagnoseHistoryDetail.builder()
                    .diagnoseHistory(history)
                    .disease(match.disease())
                    .confidenceScore(match.visionResult().getConfidence() != null
                            ? BigDecimal.valueOf(match.visionResult().getConfidence())
                            : null)
                    .severity(parseSeverity(resolveSeverity(match)))
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
            diagnoseHistoryDetailRepository.save(detail);
        }
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

    private String normalizeLabel(String label) {
        return label.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
    }

    private record DiagnosisAnalysis(
            boolean isHealthy,
            boolean isUnknown,
            List<DetectedDiseaseMatch> detectedDiseases) {
    }

    private record DetectedDiseaseMatch(Disease disease, VisionResultDTO visionResult) {
    }
}
