package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LLMServiceTest {

    @Test
    @DisplayName("TC1: No API key → fallback guidance for healthy plant")
    void generateGuidance_noApiKey_healthyPlant() {
        LLMService service = new LLMService("", "gemini-2.0-flash");

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
        LLMService service = new LLMService(null, "gemini-2.0-flash");

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
                                .dosage("25ml/binh")
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
        assertDoesNotThrow(() -> new LLMService(null, null));
    }

    @Test
    @DisplayName("TC4: Empty API key creates service without crash")
    void constructor_emptyApiKey_doesNotCrash() {
        assertDoesNotThrow(() -> new LLMService("", ""));
    }

    @Test
    @DisplayName("TC5: Blank API key triggers fallback")
    void generateGuidance_blankApiKey_fallback() {
        LLMService service = new LLMService("   ", "gemini-2.0-flash");

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
}
