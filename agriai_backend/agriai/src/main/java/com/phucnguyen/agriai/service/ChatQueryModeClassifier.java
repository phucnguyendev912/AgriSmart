package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.enums.ChatQueryMode;
import java.util.List;
import org.springframework.stereotype.Service;

// Rule-based classifier to distinguish between knowledge queries and specific diagnosis cases.
// It uses fast string matching instead of LLM calls for speed and predictability.
@Service
public class ChatQueryModeClassifier {

    // Triggers that suggest the user is asking a general knowledge or theory question.
    private static final List<String> KNOWLEDGE_TRIGGERS = List.of(
            "là gì", "triệu chứng", "nguyên nhân", "dấu hiệu", "đặc điểm",
            "phân biệt", "thông tin", "như nào", "như thế nào", "là bệnh gì",
            "có nghĩa", "giải thích", "so sánh", "khác nhau", "tại sao");

    // Triggers that suggest the user is describing their own field, crop, or specific situation.
    private static final List<String> DIAGNOSIS_TRIGGERS = List.of(
            "lúa tôi", "ruộng tôi", "cây tôi", "lúa nhà tôi", "ruộng nhà tôi",
            "lúa em", "ruộng em", "cây em",
            "bị sao", "không biết bệnh gì", "có vết", "xuất hiện", "đang bị",
            "mới thấy", "phát hiện", "lá tôi", "bẹ tôi");

    public ChatQueryMode classify(String userQuery) {
        String lower = userQuery.toLowerCase();

        boolean hasDiagnosisTrigger = DIAGNOSIS_TRIGGERS.stream().anyMatch(lower::contains);
        boolean hasKnowledgeTrigger = KNOWLEDGE_TRIGGERS.stream().anyMatch(lower::contains);

        // Knowledge triggers take priority if both types of triggers are matched.
        if (hasKnowledgeTrigger) {
            return ChatQueryMode.KNOWLEDGE_QUERY;
        }
        if (hasDiagnosisTrigger) {
            return ChatQueryMode.DIAGNOSIS_CASE;
        }

        // Default to knowledge query to avoid asking unnecessary follow-up questions.
        return ChatQueryMode.KNOWLEDGE_QUERY;
    }
}
