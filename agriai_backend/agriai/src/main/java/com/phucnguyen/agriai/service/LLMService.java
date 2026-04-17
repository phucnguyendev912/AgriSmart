package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import org.springframework.stereotype.Service;

/**
 * Service gọi LLM (GPT / Gemini) để sinh hướng dẫn dễ hiểu cho nông dân.
 * Hiện tại là mock, sau này tích hợp LangChain4J.
 */
@Service
public class LLMService {

    /**
     * Sinh hướng dẫn từ kết quả chẩn đoán bệnh.
     *
     * @param diagnoseResponse kết quả chẩn đoán
     * @return hướng dẫn dạng text cho nông dân
     */
    public String generateGuidance(DiagnoseResponse diagnoseResponse) {
        // TODO: Tích hợp LangChain4J / OpenAI API để sinh hướng dẫn dễ hiểu
        if (diagnoseResponse.getDiseases() == null || diagnoseResponse.getDiseases().isEmpty()) {
            return "Cây của bạn đang trong tình trạng khỏe mạnh. Tiếp tục chăm sóc như hiện tại.";
        }
        return "Vui lòng thực hiện theo phác đồ điều trị đề xuất. "
                + "Kiểm tra lại sau 3-5 ngày. Nếu bệnh không giảm, hãy chẩn đoán lại.";
    }
}
