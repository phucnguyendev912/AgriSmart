package com.phucnguyen.agriai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.dto.*;
import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.entity.*;
import com.phucnguyen.agriai.enums.SeverityLevel;
import com.phucnguyen.agriai.enums.Status;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.port.GuidancePort;
import com.phucnguyen.agriai.port.ImageStoragePort;
import com.phucnguyen.agriai.port.VisionDetectionPort;
import com.phucnguyen.agriai.port.WeatherPort;
import com.phucnguyen.agriai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Orchestrator chính cho luồng Chẩn đoán bệnh cây trồng.
 * Điều phối: Validate → Upload → VisionAI + Weather (song song) → RuleEngine →
 * Lưu DB → Trả kết quả.
 */
@Service
@Transactional
public class DiagnoseService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CropTypeRepository cropTypeRepository;
    @Autowired
    private AIModelRepository aiModelRepository;

    @Autowired
    private DiagnoseHistoryRepository diagnoseHistoryRepository;
    @Autowired
    private DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository;
    @Autowired
    private AttachmentRepository attachmentRepository;
    @Autowired
    private ImageStoragePort cloudinaryService;
    @Autowired
    private VisionDetectionPort visionAIService;
    @Autowired
    private WeatherPort weatherApiService;
    @Autowired
    private RuleEngineService ruleEngineService;
    @Autowired
    private GuidancePort llmService;
    @Autowired
    private DiseaseMapper diseaseMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final double MIN_CONFIDENCE = 0.4; // Ngưỡng tối thiểu 40%
    private static final Set<String> HEALTHY_LABELS = Set.of("healthy", "khoe", "cay_khoe", "khoe_manh");

    /**
     * Luồng chẩn đoán bệnh chính.
     */
    public DiagnoseResponse diagnose(String email, DiagnoseRequest request) {
        // ====== BƯỚC 1: Validate input ======
        validateInput(request);

        User user = null;
        if (email != null) {
            user = userRepository.findByEmail(email).orElse(null);
        }

        CropType cropType = cropTypeRepository.findById(request.getCropTypeId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay loai cay trong."));
        if (Boolean.TRUE.equals(cropType.getIsDelete())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Loai cay trong nay da bi xoa.");
        }

        // Tìm AI model (optional - YOLO API đã load model sẵn)
        String modelFilePath = aiModelRepository
                .findFirstByCropTypeIdAndIsActiveTrueAndIsDeleteFalse(cropType.getId())
                .or(() -> aiModelRepository.findFirstByIsActiveTrueAndIsDeleteFalseOrderByIdAsc())
                .map(AIModel::getModelFilePath)
                .orElse("default"); // YOLO FastAPI tự quản lý model

        // ====== BƯỚC 2: Upload ảnh lên Cloudinary ======
        String imageUrl;
        try {
            imageUrl = cloudinaryService.upload(request.getImage());
        } catch (Exception e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Loi khi tai anh len: " + e.getMessage());
        }

        // Lưu Attachment
        saveAttachment(request.getImage(), imageUrl);

        // ====== BƯỚC 3: Gọi song song Vision AI + Weather API ======
        CompletableFuture<List<VisionResultDTO>> visionFuture = CompletableFuture
                .supplyAsync(() -> visionAIService.detect(imageUrl, modelFilePath));
        CompletableFuture<WeatherDTO> weatherFuture = CompletableFuture
                .supplyAsync(() -> weatherApiService.getCurrentWeather(request.getLatitude(), request.getLongitude()));

        List<VisionResultDTO> visionResults;
        WeatherDTO weather;
        try {
            visionResults = visionFuture.join();
            weather = weatherFuture.join();
        } catch (Exception e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Loi khi goi AI hoac Weather API: " + e.getMessage());
        }

        // ====== BƯỚC 4: Phân tích kết quả Vision AI ======
        boolean isHealthy = visionResults.stream()
                .anyMatch(r -> HEALTHY_LABELS.contains(r.getLabel().toLowerCase()));

        // Lọc kết quả có confidence >= ngưỡng tối thiểu
        List<VisionResultDTO> significantResults = visionResults.stream()
                .filter(r -> !HEALTHY_LABELS.contains(r.getLabel().toLowerCase()))
                .filter(r -> r.getConfidence() != null && r.getConfidence() >= MIN_CONFIDENCE)
                .collect(Collectors.toList());

        // ====== BƯỚC 5: Group by label → lấy MAX confidence ======
        Map<String, VisionResultDTO> groupedResults = diseaseMapper.groupByMaxConfidence(significantResults);

        List<DiseaseResultDTO> diseaseResults = new ArrayList<>();
        List<Integer> diseaseIds = new ArrayList<>();

        for (VisionResultDTO vr : groupedResults.values()) {
            Optional<Disease> diseaseOpt = diseaseMapper.findDisease(vr.getLabel());
            if (diseaseOpt.isPresent()) {
                Disease disease = diseaseOpt.get();
                diseaseIds.add(disease.getId());

                String displayName = disease.getDiseaseNameEn() + " (" + disease.getDiseaseName() + ")";

                diseaseResults.add(DiseaseResultDTO.builder()
                        .diseaseName(displayName)
                        .confidence(vr.getConfidence())
                        .severity(vr.getSeverity() != null ? vr.getSeverity()
                                : (disease.getSeverityLevel() != null
                                        ? disease.getSeverityLevel().name()
                                        : null))
                        .boxX(vr.getX()).boxY(vr.getY())
                        .boxWidth(vr.getWidth()).boxHeight(vr.getHeight())
                        .build());
            } else {
                // FALLBACK: hiển thị raw label nếu DB thiếu
                diseaseResults.add(DiseaseResultDTO.builder()
                        .diseaseName(vr.getLabel().replace("_", " "))
                        .confidence(vr.getConfidence())
                        .severity(vr.getSeverity() != null ? vr.getSeverity() : "TRUNG_BINH")
                        .boxX(vr.getX()).boxY(vr.getY())
                        .boxWidth(vr.getWidth()).boxHeight(vr.getHeight())
                        .build());
            }
        }

        // ====== BƯỚC 6: Rule Engine (chỉ khi có bệnh) ======
        List<TreatmentDTO> treatments = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        List<String> cultivationMeasures = new ArrayList<>();

        System.out.println("====== DEBUG RULE ENGINE ======");
        System.out.println("DiseaseIDs mapped: " + diseaseIds);

        if (!diseaseIds.isEmpty()) {
            RuleEngineService.RuleEngineResult ruleResult = ruleEngineService.process(diseaseIds, weather);
            treatments = ruleResult.treatments();
            warnings = ruleResult.warnings();
            System.out.println("Treatments fetched length: " + treatments.size());
            treatments.forEach(t -> System.out.println(" -> " + t.getTreatmentName()));
        } else {
            System.out.println("No Disease IDs mapped, skipping Rule Engine processing.");
        }
        System.out.println("===============================");

        // ====== BƯỚC 7: Build response ======
        DiagnoseResponse response = DiagnoseResponse.builder()
                .originalImageUrl(imageUrl)
                .weather(weather)
                .diseases(diseaseResults)
                .treatments(treatments)
                .warnings(warnings)
                .cultivationMeasures(cultivationMeasures)
                .isHealthy(isHealthy)
                .build();

        // ====== BƯỚC 8: Sinh hướng dẫn từ LLM ======
        String guidance = llmService.generateGuidance(response);
        response.setUserGuidance(guidance);

        // ====== BƯỚC 9: Lưu vào Database ======
        Status status = isHealthy || diseaseResults.isEmpty() ? Status.COMPLETED : Status.COMPLETED;
        saveDiagnoseHistory(user, cropType, imageUrl, weather,
                status, diseaseResults, treatments, warnings, guidance);

        return response;
    }

    // ====== PRIVATE HELPER METHODS ======

    private void validateInput(DiagnoseRequest request) {
        if (request.getImage() == null || request.getImage().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Anh chan doan la bat buoc.");
        }
        String contentType = request.getImage().getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Dinh dang anh khong hop le.");
        }
        if (request.getCropTypeId() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "cropTypeId la bat buoc.");
        }
    }

    private void saveAttachment(MultipartFile file, String imageUrl) {
        Attachment attachment = Attachment.builder()
                .fileName(file.getOriginalFilename())
                .fileUrl(imageUrl)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .category("diagnosis")
                .build();
        attachmentRepository.save(attachment);
    }

    private void saveDiagnoseHistory(User user, CropType cropType, String imageUrl,
            WeatherDTO weather, Status status,
            List<DiseaseResultDTO> diseases,
            List<TreatmentDTO> treatments,
            List<String> warnings, String guidance) {
        String weatherJson = null;
        try {
            if (weather != null) {
                weatherJson = objectMapper.writeValueAsString(weather);
            }
        } catch (Exception e) {
            // Ignore JSON error
        }

        DiagnoseHistory history = DiagnoseHistory.builder()
                .user(user)
                .cropType(cropType)
                .originalImageUrl(imageUrl)
                .weatherData(weatherJson)
                .status(status)
                .build();
        diagnoseHistoryRepository.save(history);

        // Lưu detail cho mỗi bệnh
        if (diseases.isEmpty()) {
            // Cây khỏe / không xác định → vẫn tạo 1 bản ghi detail
            DiagnoseHistoryDetail detail = DiagnoseHistoryDetail.builder()
                    .diagnoseHistory(history)
                    .cultivationData(guidance)
                    .build();
            diagnoseHistoryDetailRepository.save(detail);
        } else {
            for (int i = 0; i < diseases.size(); i++) {
                DiseaseResultDTO dr = diseases.get(i);
                String treatmentJson = null;
                try {
                    if (i < treatments.size()) {
                        treatmentJson = objectMapper.writeValueAsString(treatments.get(i));
                    }
                } catch (Exception e) {
                    // Ignore
                }

                // Tìm disease entity để liên kết
                Disease diseaseEntity = diseaseMapper.findDisease(dr.getDiseaseName()).orElse(null);

                SeverityLevel severity = null;
                try {
                    if (dr.getSeverity() != null) {
                        severity = SeverityLevel.valueOf(dr.getSeverity());
                    }
                } catch (IllegalArgumentException e) {
                    // Severity string không khớp enum → bỏ qua
                }

                DiagnoseHistoryDetail detail = DiagnoseHistoryDetail.builder()
                        .diagnoseHistory(history)
                        .disease(diseaseEntity)
                        .confidenceScore(dr.getConfidence() != null
                                ? BigDecimal.valueOf(dr.getConfidence() / 100.0)
                                : null)
                        .severity(severity)
                        .riskWarning(String.join("; ", warnings))
                        .treatmentData(treatmentJson)
                        .cultivationData(guidance)
                        .build();
                diagnoseHistoryDetailRepository.save(detail);
            }
        }
    }

    // ====== HISTORY API METHODS ======

    @Transactional(readOnly = true)
    public List<DiagnoseResponse> getHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay nguoi dung."));

        List<DiagnoseHistory> histories = diagnoseHistoryRepository
                .findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc(user.getId());

        return histories.stream().map(h -> DiagnoseResponse.builder()
                .originalImageUrl(h.getOriginalImageUrl())
                .weather(parseWeatherJson(h.getWeatherData()))
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DiagnoseResponse getDetail(Integer id) {
        DiagnoseHistory history = diagnoseHistoryRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay lich su chan doan."));

        List<DiagnoseHistoryDetail> details = diagnoseHistoryDetailRepository
                .findByDiagnoseHistoryIdAndIsDeleteFalse(id);

        List<DiseaseResultDTO> diseaseResults = details.stream()
                .filter(d -> d.getDisease() != null)
                .map(d -> DiseaseResultDTO.builder()
                        .diseaseName(d.getDisease().getDiseaseName())
                        .confidence(d.getConfidenceScore() != null
                                ? d.getConfidenceScore().doubleValue() * 100
                                : null)
                        .severity(d.getSeverity() != null ? d.getSeverity().name() : null)
                        .build())
                .collect(Collectors.toList());

        List<TreatmentDTO> treatments = details.stream()
                .filter(d -> d.getTreatmentData() != null)
                .map(d -> {
                    try {
                        return objectMapper.readValue(d.getTreatmentData(), TreatmentDTO.class);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<String> warnings = details.stream()
                .filter(d -> d.getRiskWarning() != null && !d.getRiskWarning().isBlank())
                .map(DiagnoseHistoryDetail::getRiskWarning)
                .distinct()
                .collect(Collectors.toList());

        String guidance = details.stream()
                .filter(d -> d.getCultivationData() != null)
                .map(DiagnoseHistoryDetail::getCultivationData)
                .findFirst().orElse(null);

        return DiagnoseResponse.builder()
                .originalImageUrl(history.getOriginalImageUrl())
                .weather(parseWeatherJson(history.getWeatherData()))
                .diseases(diseaseResults)
                .treatments(treatments)
                .warnings(warnings)
                .userGuidance(guidance)
                .build();
    }

    private WeatherDTO parseWeatherJson(String json) {
        if (json == null || json.isBlank())
            return null;
        try {
            return objectMapper.readValue(json, WeatherDTO.class);
        } catch (Exception e) {
            return null;
        }
    }
}
