package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.enums.SkillDefinition;
import dev.langchain4j.model.chat.ChatLanguageModel;
import java.util.List;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

// Service to classify user agricultural queries into specific skills.
// It prioritizes fast keyword matching first, falling back to LLM classification if needed.
@Service
public class IntentClassifier {

    private final SkillRegistry skillRegistry;
    @Nullable
    private final ChatLanguageModel chatModel;

    private static final String CLASSIFICATION_PROMPT = """
            Phân loại câu hỏi nông nghiệp sau vào đúng 1 trong 4 loại:
            - disease (nhận diện bệnh, triệu chứng)
            - treatment (thuốc, phác đồ điều trị)
            - conflict (xung đột thuốc, pha trộn)
            - cultivation (kỹ thuật canh tác, phân bón, nước)

            Trả lời CHỈ 1 từ duy nhất (disease/treatment/conflict/cultivation).

            Câu hỏi: %s
            """;

    // Search order priority: CONFLICT (most specific) -> TREATMENT -> CULTIVATION -> DISEASE (broadest).
    private static final SkillDefinition[] PRIORITY_ORDER = {
            SkillDefinition.CONFLICT,
            SkillDefinition.TREATMENT,
            SkillDefinition.CULTIVATION,
            SkillDefinition.DISEASE
    };

    public IntentClassifier(SkillRegistry skillRegistry, @Nullable ChatLanguageModel chatModel) {
        this.skillRegistry = skillRegistry;
        this.chatModel = chatModel;
    }

    // Classifies the user query into an IntentResult.
    public IntentResult classify(String userQuery) {
        // Try keyword matching first to save tokens and improve response time.
        IntentResult keywordResult = classifyByKeyword(userQuery);
        if (keywordResult.confidence() == Confidence.HIGH) {
            return keywordResult;
        }

        // Fall back to LLM classification if the keywords are ambiguous.
        IntentResult llmResult = classifyByLLM(userQuery);
        if (llmResult != null) {
            return llmResult;
        }

        // Ultimate fallback to the keyword result if the LLM classification fails.
        return keywordResult;
    }

    // Scores each skill based on keyword matches and returns the highest scoring match.
    IntentResult classifyByKeyword(String userQuery) {
        String queryLower = userQuery.toLowerCase();

        SkillDefinition bestSkill = SkillDefinition.DISEASE;
        int bestScore = 0;
        int secondBestScore = 0;

        for (SkillDefinition skill : PRIORITY_ORDER) {
            List<String> keywords = skillRegistry.getSkillKeywords(skill);
            int score = 0;
            for (String keyword : keywords) {
                if (queryLower.contains(keyword.toLowerCase())) {
                    score++;
                }
            }
            if (score > bestScore) {
                secondBestScore = bestScore;
                bestScore = score;
                bestSkill = skill;
            } else if (score > secondBestScore) {
                secondBestScore = score;
            }
        }

        // Determine classification confidence based on the score gap.
        Confidence confidence;
        if (bestScore == 0) {
            confidence = Confidence.LOW;
        } else if (bestScore - secondBestScore >= 2) {
            confidence = Confidence.HIGH;
        } else {
            confidence = Confidence.MEDIUM;
        }

        return new IntentResult(bestSkill, confidence, Source.KEYWORD);
    }

    // Sends the query to the LLM for classification.
    IntentResult classifyByLLM(String userQuery) {
        if (chatModel == null) {
            return null;
        }
        try {
            String response = chatModel.chat(
                    CLASSIFICATION_PROMPT.formatted(userQuery)).trim().toLowerCase();
            SkillDefinition skill = parseSkillFromLLM(response);
            return new IntentResult(skill, Confidence.HIGH, Source.LLM);
        } catch (Exception e) {
            return null;
        }
    }

    private SkillDefinition parseSkillFromLLM(String response) {
        if (response.contains("treatment"))
            return SkillDefinition.TREATMENT;
        if (response.contains("conflict"))
            return SkillDefinition.CONFLICT;
        if (response.contains("cultivation"))
            return SkillDefinition.CULTIVATION;
        return SkillDefinition.DISEASE;
    }

    // Representation of the intent classification outcome.
    public record IntentResult(SkillDefinition primarySkill, Confidence confidence, Source source) {
    }

    public enum Confidence {
        HIGH, MEDIUM, LOW
    }

    public enum Source {
        KEYWORD, LLM
    }
}
