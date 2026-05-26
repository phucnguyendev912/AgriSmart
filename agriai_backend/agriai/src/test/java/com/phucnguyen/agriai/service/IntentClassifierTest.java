package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.enums.SkillDefinition;
import com.phucnguyen.agriai.service.IntentClassifier.Confidence;
import com.phucnguyen.agriai.service.IntentClassifier.IntentResult;
import com.phucnguyen.agriai.service.IntentClassifier.Source;
import dev.langchain4j.model.openai.OpenAiChatModel;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IntentClassifierTest {

    @Mock
    private OpenAiChatModel chatModel;

    @Mock
    private SkillRegistry skillRegistry;

    private IntentClassifier classifier;
    private IntentClassifier classifierNoLLM;

    @BeforeEach
    void setUp() {
        // mock keywords from SKILL.md files
        lenient().when(skillRegistry.getSkillKeywords(SkillDefinition.DISEASE)).thenReturn(List.of(
                "bệnh", "lá vàng", "đốm", "vết", "nấm", "thối", "rầy",
                "lùn", "khô", "cháy", "bạc lá", "đạo ôn", "triệu chứng",
                "lúa bị", "hình thoi", "vằn"));
        lenient().when(skillRegistry.getSkillKeywords(SkillDefinition.TREATMENT)).thenReturn(List.of(
                "thuốc", "phun", "điều trị", "phác đồ", "liều",
                "trị bệnh", "phun thuốc", "dùng thuốc", "tên thuốc"));
        lenient().when(skillRegistry.getSkillKeywords(SkillDefinition.CONFLICT)).thenReturn(List.of(
                "trộn", "pha chung", "xung đột", "phối hợp", "pha thuốc",
                "trộn chung", "kết hợp thuốc", "tương thích"));
        lenient().when(skillRegistry.getSkillKeywords(SkillDefinition.CULTIVATION)).thenReturn(List.of(
                "bón phân", "sạ", "canh tác", "IPM", "AWD",
                "quản lý nước", "phân bón", "giống lúa", "3 giảm", "thu hoạch"));

        classifier = new IntentClassifier(skillRegistry, chatModel);
        classifierNoLLM = new IntentClassifier(skillRegistry, null);
    }

    // --- Keyword classification tests ---

    @Test
    @DisplayName("Should classify disease query by keyword")
    void classifyDiseaseByKeyword() {
        IntentResult result = classifier.classifyByKeyword("Lúa tôi lá bị vàng, có đốm hình thoi");
        assertEquals(SkillDefinition.DISEASE, result.primarySkill());
        assertEquals(Source.KEYWORD, result.source());
    }

    @Test
    @DisplayName("Should classify treatment query by keyword")
    void classifyTreatmentByKeyword() {
        IntentResult result = classifier.classifyByKeyword("Bệnh đạo ôn phun thuốc gì, liều bao nhiêu");
        assertEquals(SkillDefinition.TREATMENT, result.primarySkill());
    }

    @Test
    @DisplayName("Should classify conflict query by keyword")
    void classifyConflictByKeyword() {
        IntentResult result = classifier.classifyByKeyword("BONNY 4SL có pha chung AVISO được không, có xung đột không, tương thích không");
        assertEquals(SkillDefinition.CONFLICT, result.primarySkill());
    }

    @Test
    @DisplayName("Should classify cultivation query by keyword")
    void classifyCultivationByKeyword() {
        IntentResult result = classifier.classifyByKeyword("Cách bón phân vụ hè thu, quản lý nước, giống lúa nào tốt");
        assertEquals(SkillDefinition.CULTIVATION, result.primarySkill());
    }

    @Test
    @DisplayName("Should return HIGH confidence when clear keyword match")
    void highConfidenceForClearMatch() {
        IntentResult result = classifier.classifyByKeyword("lúa bị bệnh có đốm vết hình thoi trên lá cháy khô");
        assertEquals(Confidence.HIGH, result.confidence());
    }

    @Test
    @DisplayName("Should return LOW confidence for unrelated query")
    void lowConfidenceForUnrelated() {
        IntentResult result = classifier.classifyByKeyword("xin chào hôm nay thời tiết đẹp");
        assertEquals(Confidence.LOW, result.confidence());
    }

    @Test
    @DisplayName("Should default to DISEASE when no keywords match")
    void defaultToDiseaseWhenNoMatch() {
        IntentResult result = classifier.classifyByKeyword("abc xyz 123");
        assertEquals(SkillDefinition.DISEASE, result.primarySkill());
        assertEquals(Confidence.LOW, result.confidence());
    }

    // --- LLM fallback tests ---

    @Test
    @DisplayName("Should use LLM when keyword result is ambiguous")
    void useLLMWhenAmbiguous() {
        when(chatModel.chat(anyString())).thenReturn("treatment");
        IntentResult result = classifier.classify("bệnh này dùng thuốc gì");
        assertEquals(Source.LLM, result.source());
        assertEquals(SkillDefinition.TREATMENT, result.primarySkill());
    }

    @Test
    @DisplayName("LLM fallback should parse 'conflict' response")
    void llmParsesConflictResponse() {
        when(chatModel.chat(anyString())).thenReturn("conflict");
        IntentResult result = classifier.classifyByLLM("hai thuốc này có pha được không");
        assertNotNull(result);
        assertEquals(SkillDefinition.CONFLICT, result.primarySkill());
    }

    @Test
    @DisplayName("Should handle LLM exception gracefully")
    void handleLLMException() {
        when(chatModel.chat(anyString())).thenThrow(new RuntimeException("API error"));
        IntentResult result = classifier.classifyByLLM("test query");
        assertNull(result);
    }

    @Test
    @DisplayName("Should work without LLM (null model)")
    void workWithoutLLM() {
        IntentResult result = classifierNoLLM.classify("lúa bị bệnh đạo ôn");
        assertNotNull(result);
        assertEquals(SkillDefinition.DISEASE, result.primarySkill());
        assertEquals(Source.KEYWORD, result.source());
    }

    // --- Full classify flow tests ---

    @Test
    @DisplayName("Full classify: clear keyword → skip LLM")
    void fullClassifyClearKeywordSkipsLLM() {
        IntentResult result = classifier.classify("lúa bị bệnh đốm nâu trên lá, vết tròn cháy khô");
        assertEquals(Source.KEYWORD, result.source());
        assertEquals(SkillDefinition.DISEASE, result.primarySkill());
    }

    @Test
    @DisplayName("Full classify: no keyword match + no LLM → default DISEASE")
    void fullClassifyNoMatchDefaultsDisease() {
        IntentResult result = classifierNoLLM.classify("xin chào");
        assertEquals(SkillDefinition.DISEASE, result.primarySkill());
    }
}
