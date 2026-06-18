package com.phucnguyen.agriai.module.ai.service;

import com.phucnguyen.agriai.module.diagnose.dto.DiseaseContextDTO;
import com.phucnguyen.agriai.module.diagnose.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.module.diagnose.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.module.diagnose.dto.TreatmentDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;
import com.phucnguyen.agriai.module.diagnose.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.module.diagnose.entity.TreatmentPlan;
import com.phucnguyen.agriai.module.ai.port.GuidancePort;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import dev.langchain4j.model.chat.request.ResponseFormat;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AIService implements GuidancePort {

    private final GoogleAiGeminiChatModel chatModel;
    private final GoogleAiGeminiChatModel recommendModel;
    private final long cooldownMs;

    // Lightweight circuit breaker: skip Gemini when unavailable
    private final AtomicLong recommendUnavailableUntil = new AtomicLong(0);

    // Singleton ObjectMapper for parsing AI JSON responses
    private static final ObjectMapper AI_MAPPER = JsonMapper.builder()
            .enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES)
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();

    public AIService(
            @Value("${gemini.api.key:}") String apiKey,
            @Value("${gemini.model.name:gemini-2.0-flash}") String modelName,
            @Value("${gemini.recommend.temperature:0.1}") double recommendTemperature,
            @Value("${gemini.recommend.timeout-seconds:20}") int recommendTimeoutSeconds,
            @Value("${gemini.recommend.max-output-tokens:2048}") int recommendMaxTokens,
            @Value("${gemini.recommend.cooldown-seconds:30}") int cooldownSeconds) {
        this.cooldownMs = cooldownSeconds * 1000L;
        if (apiKey == null || apiKey.isBlank()) {
            this.chatModel = null;
            this.recommendModel = null;
        } else {
            this.chatModel = GoogleAiGeminiChatModel.builder()
                    .apiKey(apiKey)
                    .modelName(modelName)
                    .temperature(0.7)
                    .build();
            this.recommendModel = GoogleAiGeminiChatModel.builder()
                    .apiKey(apiKey)
                    .modelName(modelName)
                    .temperature(recommendTemperature)
                    .timeout(Duration.ofSeconds(recommendTimeoutSeconds))
                    .maxOutputTokens(recommendMaxTokens)
                    .responseFormat(ResponseFormat.JSON)
                    .build();
        }
    }

    // ── Records for batch recommend ─────────────────────────────────────────
    public record RecommendResult(Integer recommendedPlanId, String reasoning) {}
    public record BatchRecommendItem(Integer diseaseId, Integer recommendedPlanId, String reasoning) {}
    public record BatchRecommendResponse(List<BatchRecommendItem> items) {}

    // ── Guidance (unchanged, uses chatModel) ────────────────────────────────
    @Override
    public String generateGuidance(DiagnoseResponse response) {
        if (shouldSkipAiGuidance(response)) {
            log.warn("[AI_GUIDANCE_FALLBACK] reason=NO_RECOMMENDED_TREATMENT");
            return fallbackNoRecommendedTreatmentGuidance();
        }
        if (chatModel == null) {
            return fallbackGuidance(response);
        }
        long start = System.currentTimeMillis();
        try {
            String prompt = buildPrompt(response);
            int promptBytes = prompt.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;
            String guidance = chatModel.chat(prompt);
            int responseBytes = guidance != null
                    ? guidance.getBytes(java.nio.charset.StandardCharsets.UTF_8).length
                    : 0;
            log.info("[AI_GUIDANCE] diagnosisType={}, recommendedCount={}, latencyMs={}, "
                            + "promptBytes={}, responseBytes={}",
                    response != null ? response.getDiagnosisType() : null,
                    getRecommendedTreatments(response).size(),
                    System.currentTimeMillis() - start,
                    promptBytes,
                    responseBytes);
            return guidance;
        } catch (Exception e) {
            log.error("[AI_GUIDANCE_FALLBACK] reason=CALL_FAILED, latencyMs={}, error={}",
                    System.currentTimeMillis() - start, e.getMessage());
            return fallbackGuidance(response);
        }
    }

    // ── Legacy sequential recommend (uses recommendModel) ───────────────────
    public RecommendResult recommendTreatment(String diseaseName, String severity,
            WeatherDTO weather, List<TreatmentPlan> candidatePlans) {
        if (recommendModel == null || candidatePlans == null || candidatePlans.isEmpty()) {
            return null;
        }

        // Cooldown check
        if (System.currentTimeMillis() < recommendUnavailableUntil.get()) {
            log.warn("[AI_RECOMMEND_LEGACY] Cooldown active, skipping Gemini");
            return null;
        }

        long start = System.currentTimeMillis();
        try {
            StringBuilder sb = new StringBuilder();
            sb.append("[VAI TRÒ]\n");
            sb.append("Bạn là chuyên gia Nông nghiệp. Dựa vào thông tin bệnh, thời tiết và danh sách các phác đồ ứng viên, hãy chọn ra 1 phác đồ TỐT NHẤT.\n\n");

            sb.append("[YÊU CẦU ĐẦU RA]\n");
            sb.append("Chỉ trả về ĐÚNG MỘT chuỗi JSON hợp lệ với định dạng sau (không markdown, không bọc trong ```json):\n");
            sb.append("{\"recommendedPlanId\": <ID_PHAC_DO_DUOC_CHON>, \"reasoning\": \"<GIẢI THÍCH NGẮN GỌN BẰNG TIẾNG VIỆT>\"}\n\n");

            sb.append("[THÔNG TIN BỆNH]\n");
            sb.append("- Tên bệnh: ").append(diseaseName).append("\n");
            sb.append("- Mức độ: ").append(severity != null ? severity : "Chưa xác định").append("\n\n");

            appendWeatherContext(sb, weather);
            appendCandidatePlans(sb, candidatePlans);

            String response = recommendModel.chat(sb.toString());
            log.debug("[AI_RECOMMEND_LEGACY] Raw response length={}", response != null ? response.length() : 0);

            String cleaned = cleanJsonResponse(response);
            RecommendResult result = AI_MAPPER.readValue(cleaned, RecommendResult.class);
            recommendUnavailableUntil.set(0); // Reset cooldown on success
            log.info("[AI_RECOMMEND_LEGACY] planId={}, latencyMs={}", result.recommendedPlanId(),
                    System.currentTimeMillis() - start);
            return result;
        } catch (Exception e) {
            if (isTimeoutError(e)) {
                activateCooldown("TIMEOUT", e);
            } else if (isServerOrRateLimitError(e)) {
                activateCooldown("SERVER_ERROR", e);
            } else {
                log.warn("[AI_RECOMMEND_LEGACY] Parse/other error: {} - {}", e.getClass().getSimpleName(),
                        e.getMessage());
            }
            return null;
        }
    }

    // ── Batch recommend (uses recommendModel) ───────────────────────────────
    public Map<Integer, RecommendResult> recommendTreatmentsBatch(
            List<DiseaseContextDTO> diseases, WeatherDTO weather,
            Map<Integer, List<TreatmentPlan>> plansByDisease) {
        if (recommendModel == null || diseases == null || diseases.isEmpty()) {
            return Map.of();
        }

        // Cooldown check
        if (System.currentTimeMillis() < recommendUnavailableUntil.get()) {
            log.warn("[AI_RECOMMEND_TOTAL_FALLBACK] Cooldown active, skipping Gemini batch. "
                    + "diseaseCount={}", diseases.size());
            return Map.of();
        }

        long start = System.currentTimeMillis();
        String prompt = buildBatchPrompt(diseases, weather, plansByDisease);
        int promptBytes = prompt.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;

        try {
            String response = recommendModel.chat(prompt);
            int responseBytes = response != null ? response.getBytes(java.nio.charset.StandardCharsets.UTF_8).length : 0;
            long latencyMs = System.currentTimeMillis() - start;

            List<BatchRecommendItem> items = parseBatchResponse(response);
            recommendUnavailableUntil.set(0); // Reset cooldown on success

            Map<Integer, RecommendResult> resultMap = new HashMap<>();
            for (BatchRecommendItem item : items) {
                if (item.diseaseId() != null && item.recommendedPlanId() != null) {
                    resultMap.put(item.diseaseId(),
                            new RecommendResult(item.recommendedPlanId(), item.reasoning()));
                }
            }

            log.info("[AI_RECOMMEND_BATCH] diseaseCount={}, parsedCount={}, latencyMs={}, "
                    + "promptBytes={}, responseBytes={}",
                    diseases.size(), resultMap.size(), latencyMs, promptBytes, responseBytes);
            return resultMap;
        } catch (Exception e) {
            long latencyMs = System.currentTimeMillis() - start;
            if (isTimeoutError(e)) {
                activateCooldown("TIMEOUT", e);
                log.error("[AI_RECOMMEND_TOTAL_FALLBACK] reason=TIMEOUT, diseaseCount={}, "
                        + "latencyMs={}, promptBytes={}",
                        diseases.size(), latencyMs, promptBytes);
            } else if (isServerOrRateLimitError(e)) {
                activateCooldown("SERVER_ERROR", e);
                log.error("[AI_RECOMMEND_TOTAL_FALLBACK] reason=SERVER_ERROR, diseaseCount={}, "
                        + "latencyMs={}, promptBytes={}",
                        diseases.size(), latencyMs, promptBytes);
            } else {
                log.error("[AI_RECOMMEND_TOTAL_FALLBACK] reason=PARSE_FAIL, diseaseCount={}, "
                        + "latencyMs={}, promptBytes={}, error={}",
                        diseases.size(), latencyMs, promptBytes, e.getMessage());
            }
            return Map.of();
        }
    }

    // ── Batch prompt builder ────────────────────────────────────────────────
    private String buildBatchPrompt(List<DiseaseContextDTO> diseases, WeatherDTO weather,
            Map<Integer, List<TreatmentPlan>> plansByDisease) {
        StringBuilder sb = new StringBuilder();

        sb.append("[ROLE]\n");
        sb.append("You are an agricultural plant protection expert.\n\n");

        sb.append("[TASK]\n");
        sb.append("Given the detected diseases, current weather, and candidate treatment plans below, ");
        sb.append("select the BEST treatment plan for EACH disease.\n\n");

        sb.append("[OUTPUT FORMAT]\n");
        sb.append("Return ONLY a valid JSON object. No markdown. No extra text.\n");
        sb.append("Format: {\"items\":[{\"diseaseId\":<ID>,\"recommendedPlanId\":<PLAN_ID>,");
        sb.append("\"reasoning\":\"<one short sentence, max 25 words>\"}]}\n");
        sb.append("Each disease MUST have exactly ONE recommendedPlanId from its allowed candidates.\n\n");

        appendWeatherContext(sb, weather);

        sb.append("[DISEASES AND CANDIDATES]\n");
        for (DiseaseContextDTO d : diseases) {
            List<TreatmentPlan> plans = plansByDisease.get(d.diseaseId());
            if (plans == null || plans.isEmpty()) {
                continue;
            }

            List<Integer> allowedIds = plans.stream().map(TreatmentPlan::getId).toList();
            sb.append("\nDisease ID: ").append(d.diseaseId())
                    .append(" - ").append(d.diseaseName()).append("\n");
            sb.append("Severity: ").append(d.severity() != null ? d.severity() : "Unknown").append("\n");
            sb.append("Allowed planIds: ").append(allowedIds).append("\n");
            sb.append("Candidates:\n");

            for (TreatmentPlan p : plans) {
                sb.append("- planId: ").append(p.getId());
                if (p.getDrug() != null) {
                    sb.append(", drug: ").append(p.getDrug().getDrugName());
                    if (p.getDrug().getIngredients() != null && !p.getDrug().getIngredients().isEmpty()) {
                        sb.append(", ingredients: ").append(p.getDrug().getIngredients().stream()
                                .filter(di -> di.getIngredient() != null)
                                .map(di -> di.getIngredient().getIngredientName())
                                .collect(Collectors.joining(", ")));
                    }
                }
                if (p.getDosageValueMin() != null) {
                    sb.append(", dosage: ").append(p.getDosageValueMin());
                    if (p.getDosageValueMax() != null) {
                        sb.append("-").append(p.getDosageValueMax());
                    }
                    sb.append(" ").append(p.getDosageUnit());
                }
                if (p.getApplicationMethod() != null) {
                    sb.append(", method: ").append(p.getApplicationMethod());
                }
                sb.append("\n");
            }
        }

        return sb.toString();
    }

    // ── Parse batch response with double-layer safety net ───────────────────
    // Tries wrapper object first, then raw array
    List<BatchRecommendItem> parseBatchResponse(String response) throws Exception {
        String cleaned = cleanJsonResponse(response);

        // Try 1: Parse as wrapper object {"items": [...]}
        try {
            BatchRecommendResponse wrapper = AI_MAPPER.readValue(cleaned, BatchRecommendResponse.class);
            if (wrapper.items() != null && !wrapper.items().isEmpty()) {
                return wrapper.items();
            }
        } catch (Exception ignored) {
            // Fall through to try raw array
        }

        // Try 2: Parse as raw array [...]
        try {
            return AI_MAPPER.readValue(cleaned, new TypeReference<List<BatchRecommendItem>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse batch response as wrapper or array", e);
        }
    }

    // ── Shared helpers ──────────────────────────────────────────────────────
    private void appendWeatherContext(StringBuilder sb, WeatherDTO weather) {
        if (weather != null) {
            sb.append("[CURRENT WEATHER]\n");
            if (weather.getTemperature() != null) {
                sb.append("- Temperature: ").append(weather.getTemperature()).append("°C\n");
            }
            if (weather.getHumidity() != null) {
                sb.append("- Humidity: ").append(weather.getHumidity()).append("%\n");
            }
            if (weather.getRainfall() != null) {
                sb.append("- Rainfall: ").append(weather.getRainfall()).append("mm\n");
            }
            sb.append("\n");
        }
    }

    private void appendCandidatePlans(StringBuilder sb, List<TreatmentPlan> candidatePlans) {
        sb.append("[DANH SÁCH PHÁC ĐỒ ỨNG VIÊN]\n");
        for (TreatmentPlan p : candidatePlans) {
            sb.append("- Phác đồ ID: ").append(p.getId()).append("\n");
            if (p.getDrug() != null) {
                sb.append("  + Tên thuốc: ").append(p.getDrug().getDrugName()).append("\n");
                if (p.getDrug().getIngredients() != null) {
                    sb.append("  + Hoạt chất: ").append(p.getDrug().getIngredients().stream()
                            .filter(di -> di.getIngredient() != null)
                            .map(di -> di.getIngredient().getIngredientName())
                            .collect(Collectors.joining(", "))).append("\n");
                }
            }
            if (p.getDosageValueMin() != null) {
                sb.append("  + Liều lượng: ").append(p.getDosageValueMin())
                        .append(" - ")
                        .append(p.getDosageValueMax() != null ? p.getDosageValueMax() : p.getDosageValueMin())
                        .append(" ").append(p.getDosageUnit()).append("\n");
            }
            if (p.getApplicationMethod() != null) {
                sb.append("  + Cách dùng: ").append(p.getApplicationMethod()).append("\n");
            }
        }
    }

    // Clean markdown fences and extract JSON from LLM response
    String cleanJsonResponse(String response) {
        if (response == null || response.isBlank()) {
            return "{}";
        }
        String cleaned = response.trim();

        // Strip markdown code fences
        int jsonBlockStart = cleaned.indexOf("```json");
        if (jsonBlockStart >= 0) {
            cleaned = cleaned.substring(jsonBlockStart + 7);
            int jsonBlockEnd = cleaned.indexOf("```");
            if (jsonBlockEnd >= 0) {
                cleaned = cleaned.substring(0, jsonBlockEnd);
            }
        } else if (cleaned.contains("```")) {
            cleaned = cleaned.replace("```", "");
        }

        cleaned = cleaned.trim();

        // Find outermost JSON structure (object or array)
        int braceStart = cleaned.indexOf('{');
        int bracketStart = cleaned.indexOf('[');
        int start;
        int end;

        if (braceStart >= 0 && (bracketStart < 0 || braceStart <= bracketStart)) {
            start = braceStart;
            end = cleaned.lastIndexOf('}');
        } else if (bracketStart >= 0) {
            start = bracketStart;
            end = cleaned.lastIndexOf(']');
        } else {
            return cleaned;
        }

        if (end > start) {
            cleaned = cleaned.substring(start, end + 1);
        }

        return cleaned.trim();
    }

    private void activateCooldown(String reason, Exception e) {
        recommendUnavailableUntil.set(System.currentTimeMillis() + cooldownMs);
        log.error("[AI_RECOMMEND_TOTAL_FALLBACK] Cooldown activated. reason={}, error={} - {}",
                reason, e.getClass().getSimpleName(), e.getMessage());
    }

    private boolean isServerOrRateLimitError(Exception e) {
        String msg = e.getMessage();
        if (msg == null) {
            return false;
        }
        String lower = msg.toLowerCase();
        return lower.contains("429") || lower.contains("500") || lower.contains("502")
                || lower.contains("503") || lower.contains("rate")
                || lower.contains("quota") || lower.contains("unavailable");
    }

    private boolean isTimeoutError(Exception e) {
        String msg = e.getMessage();
        if (msg != null && (msg.toLowerCase().contains("timeout") || msg.toLowerCase().contains("time out"))) {
            return true;
        }
        Throwable cause = e.getCause();
        while (cause != null) {
            if (cause instanceof java.net.SocketTimeoutException || cause instanceof java.util.concurrent.TimeoutException) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }

    // Expose cooldown for testing
    AtomicLong getRecommendUnavailableUntil() {
        return recommendUnavailableUntil;
    }

    // ── Guidance prompt builders (unchanged) ────────────────────────────────

    private boolean shouldSkipAiGuidance(DiagnoseResponse response) {
        return isDiseaseDetected(response) && getRecommendedTreatments(response).isEmpty();
    }

    private boolean isDiseaseDetected(DiagnoseResponse response) {
        if (response == null) {
            return false;
        }
        if ("DISEASE_DETECTED".equals(response.getDiagnosisType())) {
            return true;
        }
        return !Boolean.TRUE.equals(response.getIsHealthy())
                && !"HEALTHY".equals(response.getDiagnosisType())
                && !"UNKNOWN".equals(response.getDiagnosisType())
                && response.getDiseases() != null
                && !response.getDiseases().isEmpty();
    }

    List<TreatmentDTO> getRecommendedTreatments(DiagnoseResponse response) {
        if (response == null || response.getTreatments() == null) {
            return List.of();
        }
        return response.getTreatments().stream()
                .filter(treatment -> Boolean.TRUE.equals(treatment.getRecommended()))
                .toList();
    }

    private String fallbackNoRecommendedTreatmentGuidance() {
        return "Hệ thống chưa chọn được phác đồ phù hợp từ danh sách hiện có. "
                + "Không nên tự ý phun thuốc khi chưa có khuyến nghị rõ ràng; "
                + "hãy xem danh sách phác đồ tham khảo hoặc hỏi chuyên gia nông nghiệp trước khi xử lý.";
    }

    private String fallbackGuidance(DiagnoseResponse response) {
        if ("HEALTHY".equals(response.getDiagnosisType()) || Boolean.TRUE.equals(response.getIsHealthy())) {
            return "Cây của bạn đang trong tình trạng khỏe mạnh. Tiếp tục chăm sóc như hiện tại, bón phân cân đối và theo dõi ruộng vườn thường xuyên để phòng ngừa sâu bệnh.";
        }
        if ("UNKNOWN".equals(response.getDiagnosisType())) {
            return "Hệ thống chưa thể xác định rõ tình trạng hoặc loại bệnh trên cây qua hình ảnh này. Vui lòng chụp lại ảnh cận cảnh vết bệnh, sắc nét dưới ánh sáng tự nhiên đầy đủ và thử chẩn đoán lại. Không nên tự ý phun thuốc khi chưa rõ nguyên nhân.";
        }
        if (response.getDiseases() == null || response.getDiseases().isEmpty()) {
            return "Cây của bạn đang trong tình trạng khỏe mạnh. Tiếp tục chăm sóc như hiện tại, bón phân cân đối và theo dõi ruộng vườn thường xuyên để phòng ngừa sâu bệnh.";
        }
        return "Vui lòng thực hiện theo phác đồ điều trị đề xuất. "
                + "Kiểm tra lại sau 3-5 ngày. Nếu bệnh không giảm, hãy chẩn đoán lại.";
    }

    private String buildPrompt(DiagnoseResponse response) {
        if ("HEALTHY".equals(response.getDiagnosisType()) || Boolean.TRUE.equals(response.getIsHealthy())) {
            return buildHealthyPrompt(response);
        }
        if ("UNKNOWN".equals(response.getDiagnosisType())) {
            return buildUnknownPrompt(response);
        }
        return buildDiseaseDetectedPrompt(response);
    }

    private String buildHealthyPrompt(DiagnoseResponse response) {
        StringBuilder sb = new StringBuilder();
        sb.append("[VAI TRÒ]\n");
        sb.append("Bạn là chuyên gia nông nghiệp bảo vệ thực vật. Hãy cung cấp lời khuyên chăm sóc và giữ gìn sức khỏe cây trồng cho nông dân.\n\n");

        sb.append("[NHIỆM VỤ]\n");
        sb.append("Cây lúa hiện tại được chẩn đoán là KHỎE MẠNH (không có dấu hiệu sâu bệnh hại). Hãy đưa ra hướng dẫn chăm sóc phòng ngừa chủ động phù hợp.\n\n");

        sb.append("[YÊU CẦU ĐẦU RA]\n");
        sb.append("- NGÔN NGỮ: Dùng tiếng Việt có dấu đầy đủ, chuẩn xác.\n");
        sb.append("- PHONG CÁCH: Đơn giản, gần gũi, nông dân dễ hiểu, mang tính động viên.\n");
        sb.append("- ĐỘ DÀI: Viết ngắn gọn, súc tích (khoảng 3-4 câu), không dùng markdown.\n");
        sb.append("- NỘI DUNG: Chúc mừng nông dân, nhắc nhở giữ đồng ruộng thông thoáng, dọn cỏ dại sạch sẽ, bón phân cân đối (tránh bón thừa đạm) và theo dõi định kỳ để phòng ngừa sâu bệnh từ sớm. Nhắc nhở KHÔNG sử dụng các loại thuốc bảo vệ thực vật hóa học khi cây đang khỏe mạnh.\n\n");

        if (response.getWeather() != null) {
            sb.append("=== THỜI TIẾT HIỆN TẠI ===\n");
            var w = response.getWeather();
            if (w.getTemperature() != null)
                sb.append("Nhiệt độ: ").append(w.getTemperature()).append("°C\n");
            if (w.getHumidity() != null)
                sb.append("Độ ẩm: ").append(w.getHumidity()).append("%\n");
            if (w.getRainfall() != null)
                sb.append("Lượng mưa: ").append(w.getRainfall()).append("mm\n");
        }
        return sb.toString();
    }

    private String buildUnknownPrompt(DiagnoseResponse response) {
        StringBuilder sb = new StringBuilder();
        sb.append("[VAI TRÒ]\n");
        sb.append("Bạn là chuyên gia nông nghiệp bảo vệ thực vật. Hãy phản hồi thân thiện và hướng dẫn nông dân khi hệ thống không thể xác định được bệnh cụ thể từ ảnh chụp.\n\n");

        sb.append("[NHIỆM VỤ]\n");
        sb.append("Hệ thống hiện tại KHÔNG XÁC ĐỊNH ĐƯỢC bệnh hoặc tình trạng cây trồng qua hình ảnh được tải lên. Hãy hướng dẫn nông dân cách chụp ảnh tốt hơn để chẩn đoán lại và các bước kiểm tra thực tế.\n\n");

        sb.append("[YÊU CẦU ĐẦU RA]\n");
        sb.append("- NGÔN NGỮ: Dùng tiếng Việt có dấu đầy đủ, chuẩn xác.\n");
        sb.append("- PHONG CÁCH: Lịch sự, ân cần, hướng dẫn chi tiết nhưng dễ hiểu.\n");
        sb.append("- ĐỘ DÀI: Viết ngắn gọn, súc tích (khoảng 3-4 câu), không dùng markdown.\n");
        sb.append("- NỘI DUNG: Giải thích rằng hình ảnh tải lên chưa đủ rõ nét hoặc góc chụp chưa bao quát được vết bệnh để hệ thống nhận diện chính xác. Hướng dẫn nông dân chụp lại ảnh cận cảnh vết bệnh, rõ nét dưới ánh sáng tự nhiên đầy đủ, kiểm tra thêm các bộ phận khác của cây (thân, lá, rễ) xem có triệu chứng bất thường không, và khuyên theo dõi sát sao ruộng vườn. Nhấn mạnh KHÔNG tự ý mua và phun thuốc hóa học khi chưa rõ nguyên nhân gây bệnh.\n\n");

        return sb.toString();
    }

    String buildDiseaseDetectedPrompt(DiagnoseResponse response) {
        StringBuilder sb = new StringBuilder();

        sb.append("[VAI TRÒ]\n");
        sb.append(
                "Bạn là chuyên gia BVTV. Hãy cung cấp lời khuyên ngắn gọn bằng tiếng việt có dấu, súc tích cho nông dân.\n\n");

        sb.append("[NHIỆM VỤ]\n");
        sb.append(
                "Dựa trên dữ liệu chẩn đoán bên dưới, tạo hướng dẫn điều trị phù hợp với đúng 1 trong 3 trường hợp sau:\n");
        sb.append("- Trường hợp 1: Chỉ 1 bệnh → viết phác đồ đơn, hướng dẫn dùng thuốc bình thường.\n");
        sb.append(
                "- Trường hợp 2: Nhiều bệnh, không xung đột → gộp tất cả thuốc vào 1 phác đồ, ghi rõ lịch phun chung.\n");
        sb.append(
                "- Trường hợp 3: Nhiều bệnh, có xung đột → tách thành nhiều đợt phun riêng, ghi rõ số ngày cách nhau giữa các đợt.\n\n");

        sb.append("[YÊU CẦU ĐẦU RA]\n");
        sb.append("- NGÔN NGỮ: Dùng tiếng Việt có dấu đầy đủ, chuẩn xác.\n");
        sb.append("- PHONG CÁCH: Đơn giản, nông dân dễ hiểu, không dùng thuật ngữ kỹ thuật phức tạp.\n");
        sb.append("- ĐỘ DÀI: Viết ngắn gọn, súc tích (khoảng 5-7 câu), không dùng markdown.\n");
        sb.append(
                "- Mỗi loại thuốc phải ghi đủ: tên thuốc, liều lượng, lượng nước pha, cách dùng, thời điểm phun, tần suất.\n");
        sb.append("- Nếu có xung đột: giải thích lý do KHÔNG được phun chung và hướng dẫn lịch tách đợt cụ thể.\n");
        sb.append("- Nếu có cảnh báo thời tiết: nhắc nhở rõ ràng trước khi hướng dẫn phun.\n");
        sb.append("- Chỉ hướng dẫn theo các thuốc/phác đồ đã liệt kê ở mục THUỐC ĐỀ XUẤT; không tự đề xuất thuốc khác.\n");
        sb.append("- Kết thúc bằng 1 câu lưu ý an toàn cho người phun.\n\n");

        // Diseases
        sb.append("=== BỆNH PHÁT HIỆN ===\n");
        List<DiseaseResultDTO> diseases = response.getDiseases();
        if (diseases != null) {
            for (DiseaseResultDTO d : diseases) {
                sb.append("- ").append(d.getDiseaseName());
                if (d.getConfidence() != null) {
                    sb.append(" (Độ tin cậy: ").append(Math.round(d.getConfidence() * 100)).append("%)");
                }
                if (d.getSeverity() != null) {
                    sb.append(" [Mức độ: ").append(d.getSeverity()).append("]");
                }
                sb.append("\n");
            }
        }

        // Treatments
        List<TreatmentDTO> treatments = getRecommendedTreatments(response);
        if (!treatments.isEmpty()) {
            sb.append("\n=== THUỐC ĐỀ XUẤT ===\n");
            for (TreatmentDTO t : treatments) {
                sb.append("- ").append(t.getDrugName() != null ? t.getDrugName() : "Phác đồ điều trị");

                if (t.getDisplayDosage() != null) {
                    sb.append(" | Liều: ").append(t.getDisplayDosage());
                }
                if (t.getDisplayWaterVolume() != null) {
                    sb.append(" | Nước: ").append(t.getDisplayWaterVolume());
                }
                if (t.getApplicationMethod() != null) {
                    sb.append(" | Cách dùng: ").append(t.getApplicationMethod());
                }
                if (t.getSprayInterval() != null) {
                    sb.append(" | Tần suất: ").append(t.getSprayInterval());
                }
                sb.append("\n");
            }
        }

        // Interaction warnings
        List<InteractionWarningDTO> interactions = response.getInteractionWarnings();
        if (interactions != null && !interactions.isEmpty()) {
            sb.append("\n=== XUNG ĐỘT THUỐC ===\n");
            for (InteractionWarningDTO w : interactions) {
                sb.append("- ").append(w.getIngredientAName()).append(" + ").append(w.getIngredientBName());
                sb.append(": ").append(w.getWarningMessage());
                if (Boolean.TRUE.equals(w.getBlocksMixing())) {
                    sb.append(" [KHÔNG ĐƯỢC PHA CHUNG]");
                }
                sb.append("\n");
            }
        }

        // Weather alerts
        List<WeatherAlertDTO> weatherAlerts = response.getWeatherAlerts();
        if (weatherAlerts != null && !weatherAlerts.isEmpty()) {
            List<WeatherAlertDTO> violated = weatherAlerts.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getViolated()))
                    .collect(Collectors.toList());
            if (!violated.isEmpty()) {
                sb.append("\n=== CẢNH BÁO THỜI TIẾT ===\n");
                for (WeatherAlertDTO a : violated) {
                    sb.append("- ").append(a.getWeatherFactor());
                    sb.append(" hiện tại: ").append(a.getActualValue());
                    if (a.getUnit() != null)
                        sb.append(a.getUnit());
                    if (a.getRecommendationNote() != null) {
                        sb.append(" → ").append(a.getRecommendationNote());
                    }
                    sb.append("\n");
                }
            }
        }

        // Weather context
        if (response.getWeather() != null) {
            sb.append("\n=== THỜI TIẾT HIỆN TẠI ===\n");
            var w = response.getWeather();
            if (w.getTemperature() != null)
                sb.append("Nhiệt độ: ").append(w.getTemperature()).append("°C\n");
            if (w.getHumidity() != null)
                sb.append("Độ ẩm: ").append(w.getHumidity()).append("%\n");
            if (w.getRainfall() != null)
                sb.append("Lượng mưa: ").append(w.getRainfall()).append("mm\n");
        }

        return sb.toString();
    }
}
