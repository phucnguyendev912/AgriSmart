package com.phucnguyen.agriai.module.ai.service;
import com.phucnguyen.agriai.module.ai.service.AIService;

import com.phucnguyen.agriai.module.diagnose.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.module.diagnose.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.module.diagnose.dto.TreatmentDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;
import com.phucnguyen.agriai.module.diagnose.dto.response.DiagnoseResponse;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LLMServiceTest {

    @Test
    @DisplayName("TC1: No API key → fallback guidance for healthy plant")
    void generateGuidance_noApiKey_healthyPlant() {
        AIService service = new AIService("", "gemini-2.0-flash", 0.1, 20, 2048, 30);

        DiagnoseResponse response = DiagnoseResponse.builder()
                .diseases(List.of())
                .isHealthy(true)
                .build();

        String guidance = service.generateGuidance(response);
        assertNotNull(guidance);
        assertFalse(guidance.isBlank());
        assertTrue(guidance.contains("khỏe mạnh"));
    }

    @Test
    @DisplayName("TC2: No API key → fallback guidance for diseased plant")
    void generateGuidance_noApiKey_diseasedPlant() {
        AIService service = new AIService(null, "gemini-2.0-flash", 0.1, 20, 2048, 30);

        DiagnoseResponse response = DiagnoseResponse.builder()
                .diseases(List.of(
                        DiseaseResultDTO.builder()
                                .diseaseName("Dao on")
                                .confidence(0.92)
                                .severity("NANG")
                                .build()))
                .treatments(List.of(
                        TreatmentDTO.builder()
                                .drugName("Filia 525SE")
                                .displayDosage("25ml/binh")
                                .build()))
                .build();

        String guidance = service.generateGuidance(response);
        assertNotNull(guidance);
        assertFalse(guidance.isBlank());
        assertTrue(guidance.contains("phác đồ"));
    }

    @Test
    @DisplayName("TC3: Null API key creates service without crash")
    void constructor_nullApiKey_doesNotCrash() {
        assertDoesNotThrow(() -> new AIService(null, null, 0.1, 20, 2048, 30));
    }

    @Test
    @DisplayName("TC4: Empty API key creates service without crash")
    void constructor_emptyApiKey_doesNotCrash() {
        assertDoesNotThrow(() -> new AIService("", "", 0.1, 20, 2048, 30));
    }

    @Test
    @DisplayName("TC5: Blank API key triggers fallback")
    void generateGuidance_blankApiKey_fallback() {
        AIService service = new AIService("   ", "gemini-2.0-flash", 0.1, 20, 2048, 30);

        DiagnoseResponse response = DiagnoseResponse.builder()
                .diseases(List.of(
                        DiseaseResultDTO.builder().diseaseName("Kho van").build()))
                .interactionWarnings(List.of(
                        InteractionWarningDTO.builder()
                                .ingredientAName("A").ingredientBName("B")
                                .warningMessage("Conflict").blocksMixing(true)
                                .build()))
                .weatherAlerts(List.of(
                        WeatherAlertDTO.builder()
                                .weatherFactor("TEMPERATURE").actualValue(35.0)
                                .violated(true).unit("°C")
                                .recommendationNote("Qua nong")
                                .build()))
                .weather(WeatherDTO.builder().temperature(35.0).humidity(80.0).build())
                .build();

        String guidance = service.generateGuidance(response);
        assertNotNull(guidance);
    }

    @Test
    @DisplayName("TC6: No API key → fallback guidance for unknown state")
    void generateGuidance_noApiKey_unknownState() {
        AIService service = new AIService("", "gemini-2.0-flash", 0.1, 20, 2048, 30);

        DiagnoseResponse response = DiagnoseResponse.builder()
                .diseases(List.of())
                .isHealthy(false)
                .diagnosisType("UNKNOWN")
                .build();

        String guidance = service.generateGuidance(response);
        assertNotNull(guidance);
        assertFalse(guidance.isBlank());
        assertTrue(guidance.contains("chụp lại") || guidance.contains("thử lại") || guidance.contains("chưa thể xác định"));
    }
}

