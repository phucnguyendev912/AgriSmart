package com.phucnguyen.agriai.module.ai.service;
import com.phucnguyen.agriai.module.diagnose.entity.Ingredient;
import com.phucnguyen.agriai.module.ai.service.AIService;

import com.phucnguyen.agriai.module.diagnose.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.module.diagnose.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.module.diagnose.dto.TreatmentDTO;
import com.phucnguyen.agriai.module.diagnose.dto.response.DiagnoseResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class AIServiceTest {

    private AIService aiService;

    @BeforeEach
    void setUp() {
        // Initialize with dummy values
        aiService = new AIService("dummy-key", "gemini-1.5-flash", 0.1, 20, 2048, 30);
    }

    @Test
    void parseBatchResponse_withWrapperObject() throws Exception {
        String json = "```json\n" +
                "{\n" +
                "  \"items\": [\n" +
                "    {\"diseaseId\": 1, \"recommendedPlanId\": 10, \"reasoning\": \"Best plan\"},\n" +
                "    {\"diseaseId\": 2, \"recommendedPlanId\": 20, \"reasoning\": \"Good plan\"}\n" +
                "  ]\n" +
                "}\n" +
                "```";

        List<AIService.BatchRecommendItem> items = aiService.parseBatchResponse(json);

        assertEquals(2, items.size());
        assertEquals(1, items.get(0).diseaseId());
        assertEquals(10, items.get(0).recommendedPlanId());
        assertEquals("Best plan", items.get(0).reasoning());
        
        assertEquals(2, items.get(1).diseaseId());
        assertEquals(20, items.get(1).recommendedPlanId());
        assertEquals("Good plan", items.get(1).reasoning());
    }

    @Test
    void parseBatchResponse_withRawArray() throws Exception {
        String json = "[\n" +
                "  {\"diseaseId\": 1, \"recommendedPlanId\": 10, \"reasoning\": \"Reason A\"},\n" +
                "  {\"diseaseId\": 3, \"recommendedPlanId\": 30, \"reasoning\": \"Reason B\"}\n" +
                "]";

        List<AIService.BatchRecommendItem> items = aiService.parseBatchResponse(json);

        assertEquals(2, items.size());
        assertEquals(1, items.get(0).diseaseId());
        assertEquals(10, items.get(0).recommendedPlanId());
        
        assertEquals(3, items.get(1).diseaseId());
        assertEquals(30, items.get(1).recommendedPlanId());
    }

    @Test
    void parseBatchResponse_withMarkdownArray() throws Exception {
        String json = "```\n[\n" +
                "  {\"diseaseId\": 5, \"recommendedPlanId\": 50, \"reasoning\": \"Reason C\"}\n" +
                "]\n```";

        List<AIService.BatchRecommendItem> items = aiService.parseBatchResponse(json);

        assertEquals(1, items.size());
        assertEquals(5, items.get(0).diseaseId());
        assertEquals(50, items.get(0).recommendedPlanId());
    }

    @Test
    void cleanJsonResponse_handlesMessyOutput() {
        String input = "Here is the result:\n```json\n{\"recommendedPlanId\": 12}\n```\nHope it helps!";
        String cleaned = aiService.cleanJsonResponse(input);
        assertEquals("{\"recommendedPlanId\": 12}", cleaned);
    }

    @Test
    void buildDiseaseDetectedPrompt_onlyIncludesRecommendedTreatments() {
        DiagnoseResponse response = diseasedResponse(List.of(
                TreatmentDTO.builder()
                        .drugName("RecommendedDrug")
                        .displayDosage("10 ml")
                        .displayWaterVolume("16 lit")
                        .applicationMethod("Phun la")
                        .recommended(true)
                        .build(),
                TreatmentDTO.builder()
                        .drugName("CandidateDrug")
                        .displayDosage("20 ml")
                        .recommended(false)
                        .build()));

        String prompt = aiService.buildDiseaseDetectedPrompt(response);

        assertTrue(prompt.contains("RecommendedDrug"));
        assertFalse(prompt.contains("CandidateDrug"));
        assertTrue(prompt.contains("không tự đề xuất thuốc khác"));
    }

    @Test
    void generateGuidance_noRecommendedTreatment_returnsSafeFallback() {
        DiagnoseResponse response = diseasedResponse(List.of(
                TreatmentDTO.builder()
                        .drugName("CandidateDrug")
                        .recommended(false)
                        .build()));

        String guidance = aiService.generateGuidance(response);

        assertTrue(guidance.contains("chưa chọn được phác đồ"));
        assertTrue(guidance.contains("Không nên tự ý phun thuốc"));
    }

    @Test
    void buildDiseaseDetectedPrompt_keepsInteractionWarningsWithRecommendedTreatment() {
        DiagnoseResponse response = diseasedResponse(List.of(
                TreatmentDTO.builder()
                        .drugName("RecommendedDrug")
                        .recommended(true)
                        .build()));
        response.setInteractionWarnings(List.of(
                InteractionWarningDTO.builder()
                        .ingredientAName("Ingredient A")
                        .ingredientBName("Ingredient B")
                        .warningMessage("Khong pha chung")
                        .blocksMixing(true)
                        .build()));

        String prompt = aiService.buildDiseaseDetectedPrompt(response);

        assertTrue(prompt.contains("Ingredient A + Ingredient B"));
        assertTrue(prompt.contains("Khong pha chung"));
        assertTrue(prompt.contains("RecommendedDrug"));
    }

    private DiagnoseResponse diseasedResponse(List<TreatmentDTO> treatments) {
        return DiagnoseResponse.builder()
                .diagnosisType("DISEASE_DETECTED")
                .isHealthy(false)
                .diseases(List.of(
                        DiseaseResultDTO.builder()
                                .diseaseId(1)
                                .diseaseName("Dao on")
                                .confidence(0.86)
                                .severity("NANG")
                                .build()))
                .treatments(treatments)
                .interactionWarnings(List.of())
                .weatherAlerts(List.of())
                .build();
    }
}
