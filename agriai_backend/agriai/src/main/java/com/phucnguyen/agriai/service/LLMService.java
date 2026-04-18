package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.port.GuidancePort;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service gọi Google Gemini API qua LangChain4J để sinh hướng dẫn
 * canh tác tự nhiên cho nông dân dựa trên kết quả chẩn đoán.
 */
@Service
public class LLMService implements GuidancePort {

    private final GoogleAiGeminiChatModel chatModel;

    public LLMService(
            @Value("${gemini.api.key:}") String apiKey,
            @Value("${gemini.model.name:gemini-2.0-flash}") String modelName) {
        if (apiKey == null || apiKey.isBlank()) {
            this.chatModel = null;
        } else {
            this.chatModel = GoogleAiGeminiChatModel.builder()
                    .apiKey(apiKey)
                    .modelName(modelName)
                    .temperature(0.7)
                    .build();
        }
    }

    @Override
    public String generateGuidance(DiagnoseResponse response) {
        if (chatModel == null) {
            return fallbackGuidance(response);
        }
        try {
            String prompt = buildPrompt(response);
            return chatModel.chat(prompt);
        } catch (Exception e) {
            System.err.println("LLM call failed: " + e.getMessage());
            return fallbackGuidance(response);
        }
    }

    private String fallbackGuidance(DiagnoseResponse response) {
        if (response.getDiseases() == null || response.getDiseases().isEmpty()) {
            return "Cây của bạn đang trong tình trạng khỏe mạnh. Tiếp tục chăm sóc như hiện tại.";
        }
        return "Vui lòng thực hiện theo phác đồ điều trị đề xuất. "
                + "Kiểm tra lại sau 3-5 ngày. Nếu bệnh không giảm, hãy chẩn đoán lại.";
    }

    private String buildPrompt(DiagnoseResponse response) {
        StringBuilder sb = new StringBuilder();

        // ========== SYSTEM ROLE & TASK ==========
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

        // ========== YÊU CẦU ĐẦU RA ==========
        sb.append("[YÊU CẦU ĐẦU RA]\n");
        sb.append("- NGÔN NGỮ: Dùng tiếng Việt có dấu đầy đủ, chuẩn xác.\n");
        sb.append("- PHONG CÁCH: Đơn giản, nông dân dễ hiểu, không dùng thuật ngữ kỹ thuật phức tạp.\n");
        sb.append("- ĐỘ DÀI: Viết ngắn gọn, súc tích (khoảng 5-7 câu), không dùng markdown.\n");
        sb.append(
                "- Mỗi loại thuốc phải ghi đủ: tên thuốc, liều lượng, lượng nước pha, cách dùng, thời điểm phun, tần suất.\n");
        sb.append("- Nếu có xung đột: giải thích lý do KHÔNG được phun chung và hướng dẫn lịch tách đợt cụ thể.\n");
        sb.append("- Nếu có cảnh báo thời tiết: nhắc nhở rõ ràng trước khi hướng dẫn phun.\n");
        sb.append("- Kết thúc bằng 1 câu lưu ý an toàn cho người phun.\n\n");

        // Diseases
        sb.append("=== BỆNH PHÁT HIỆN ===\n");
        List<DiseaseResultDTO> diseases = response.getDiseases();
        if (diseases == null || diseases.isEmpty()) {
            sb.append("Không phát hiện bệnh. Cây khỏe mạnh.\n");
        } else {
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
        List<TreatmentDTO> treatments = response.getTreatments();
        if (treatments != null && !treatments.isEmpty()) {
            sb.append("\n=== THUỐC ĐỀ XUẤT ===\n");
            for (TreatmentDTO t : treatments) {
                sb.append("- ").append(t.getDrugName() != null ? t.getDrugName() : t.getTreatmentName());
                if (t.getIngredientName() != null) {
                    sb.append(" (Hoạt chất: ").append(t.getIngredientName()).append(")");
                }
                if (t.getDosage() != null) {
                    sb.append(" | Liều: ").append(t.getDosage());
                }
                if (t.getApplicationMethod() != null) {
                    sb.append(" | Cách dùng: ").append(t.getApplicationMethod());
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
