package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.enums.ChatQueryMode;
import java.util.List;
import org.springframework.stereotype.Service;

// rule-based classifier: KNOWLEDGE_QUERY vs DIAGNOSIS_CASE
// no LLM call — pure string matching for speed and predictability
@Service
public class ChatQueryModeClassifier {

    // triggers that indicate the user is asking a knowledge/theory question
    private static final List<String> KNOWLEDGE_TRIGGERS = List.of(
            "là gì", "triệu chứng", "nguyên nhân", "dấu hiệu", "đặc điểm",
            "phân biệt", "thông tin", "như nào", "như thế nào", "là bệnh gì",
            "có nghĩa", "giải thích", "so sánh", "khác nhau", "tại sao");

    // triggers that indicate the user is describing their own real field/crop
    private static final List<String> DIAGNOSIS_TRIGGERS = List.of(
            "lúa tôi", "ruộng tôi", "cây tôi", "lúa nhà tôi", "ruộng nhà tôi",
            "lúa em", "ruộng em", "cây em",
            "bị sao", "không biết bệnh gì", "có vết", "xuất hiện", "đang bị",
            "mới thấy", "phát hiện", "lá tôi", "bẹ tôi");

    // classify the user query into KNOWLEDGE_QUERY or DIAGNOSIS_CASE
    public ChatQueryMode classify(String userQuery) {
        String lower = userQuery.toLowerCase();

        boolean hasDiagnosisTrigger = DIAGNOSIS_TRIGGERS.stream().anyMatch(lower::contains);
        boolean hasKnowledgeTrigger = KNOWLEDGE_TRIGGERS.stream().anyMatch(lower::contains);

        // knowledge trigger takes priority over diagnosis if both matched
        if (hasKnowledgeTrigger) {
            return ChatQueryMode.KNOWLEDGE_QUERY;
        }
        if (hasDiagnosisTrigger) {
            return ChatQueryMode.DIAGNOSIS_CASE;
        }

        // default: treat as knowledge query (safer — avoids unnecessary
        // back-questioning)
        return ChatQueryMode.KNOWLEDGE_QUERY;
    }
}
