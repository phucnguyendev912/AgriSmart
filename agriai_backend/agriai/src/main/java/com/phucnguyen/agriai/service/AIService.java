package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.port.GuidancePort;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.dto.WeatherDTO;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AIService implements GuidancePort {

    private final GoogleAiGeminiChatModel chatModel;

    public AIService(
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

    // generate guidance for farmer
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

    // fallback guidance
    private String fallbackGuidance(DiagnoseResponse response) {
        if (response.getDiseases() == null || response.getDiseases().isEmpty()) {
            return "Cây của bạn đang trong tình trạng khỏe mạnh. Tiếp tục chăm sóc như hiện tại.";
        }
        return "Vui lòng thực hiện theo phác đồ điều trị đề xuất. "
                + "Kiểm tra lại sau 3-5 ngày. Nếu bệnh không giảm, hãy chẩn đoán lại.";
    }

    // build prompt for LLM
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

    public record RecommendResult(Integer recommendedPlanId, String reasoning) {}

    public RecommendResult recommendTreatment(String diseaseName, String severity, WeatherDTO weather, List<TreatmentPlan> candidatePlans) {
        if (chatModel == null || candidatePlans == null || candidatePlans.isEmpty()) {
            return null; // Fallback to ranking logic
        }
        
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

            if (weather != null) {
                sb.append("[THỜI TIẾT HIỆN TẠI]\n");
                if (weather.getTemperature() != null) sb.append("- Nhiệt độ: ").append(weather.getTemperature()).append("°C\n");
                if (weather.getHumidity() != null) sb.append("- Độ ẩm: ").append(weather.getHumidity()).append("%\n");
                if (weather.getRainfall() != null) sb.append("- Lượng mưa: ").append(weather.getRainfall()).append("mm\n");
                sb.append("\n");
            }

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
                    sb.append("  + Liều lượng: ").append(p.getDosageValueMin()).append(" - ").append(p.getDosageValueMax() != null ? p.getDosageValueMax() : p.getDosageValueMin()).append(" ").append(p.getDosageUnit()).append("\n");
                }
                if (p.getApplicationMethod() != null) sb.append("  + Cách dùng: ").append(p.getApplicationMethod()).append("\n");
            }

            String response = chatModel.chat(sb.toString());
            System.out.println("[AI-Recommend] Raw AI response: " + response);
            
            // Trích xuất JSON từ response (xử lý cả markdown block lẫn text thừa)
            String cleaned = response.trim();
            // Xử lý markdown code block
            int jsonBlockStart = cleaned.indexOf("```json");
            if (jsonBlockStart >= 0) {
                cleaned = cleaned.substring(jsonBlockStart + 7);
                int jsonBlockEnd = cleaned.indexOf("```");
                if (jsonBlockEnd >= 0) {
                    cleaned = cleaned.substring(0, jsonBlockEnd);
                }
            } else if (cleaned.indexOf("```") >= 0) {
                cleaned = cleaned.replaceAll("```", "");
            }
            
            // Tìm JSON object trong chuỗi
            int braceStart = cleaned.indexOf("{");
            int braceEnd = cleaned.lastIndexOf("}");
            if (braceStart >= 0 && braceEnd > braceStart) {
                cleaned = cleaned.substring(braceStart, braceEnd + 1);
            }
            cleaned = cleaned.trim();
            System.out.println("[AI-Recommend] Cleaned JSON: " + cleaned);

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            RecommendResult result = mapper.readValue(cleaned, RecommendResult.class);
            System.out.println("[AI-Recommend] Parsed result: planId=" + result.recommendedPlanId() + ", reason=" + result.reasoning());
            return result;
        } catch (Exception e) {
            System.err.println("[AI-Recommend] FAILED: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return null; // Fallback
        }
    }
}
