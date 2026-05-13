package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseWeatherRiskDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.DiseaseWeatherCondition;
import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.enums.WeatherFactor;
import com.phucnguyen.agriai.repository.DiseaseWeatherConditionRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DiseaseWeatherRiskEvaluatorTest {

    private final DiseaseWeatherConditionRepository repository = mock(DiseaseWeatherConditionRepository.class);
    private final DiseaseWeatherRiskEvaluator evaluator = new DiseaseWeatherRiskEvaluator(repository);

    @Test
    void evaluateAll_returnsRiskWhenAnyConditionInGroupMatches() {
        Disease disease = Disease.builder()
                .id(5)
                .diseaseCode("BLAST")
                .diseaseName("Dao on")
                .build();
        List<DiseaseWeatherCondition> conditions = List.of(
                condition(disease, "BLAST_HIGH_1", WeatherFactor.TEMPERATURE, Operator.BETWEEN, "20", "28"),
                condition(disease, "BLAST_HIGH_1", WeatherFactor.HUMIDITY, Operator.GREATER_THAN, "90", null));

        when(repository.findByIsActiveTrueAndIsDeleteFalse()).thenReturn(conditions);

        List<DiseaseWeatherRiskDTO> result = evaluator.evaluateAll(
                WeatherDTO.builder().temperature(25.0).humidity(70.0).rainfall(0.0).build());

        assertEquals(1, result.size());
        assertEquals(5, result.get(0).getDiseaseId());
        assertEquals("Dao on", result.get(0).getDiseaseName());
        assertEquals(1, result.get(0).getMatchedConditions().size());
    }

    @Test
    void evaluateAll_returnsEmptyWhenNoConditionInGroupMatches() {
        Disease disease = Disease.builder().id(5).diseaseName("Dao on").build();
        List<DiseaseWeatherCondition> conditions = List.of(
                condition(disease, "BLAST_HIGH_1", WeatherFactor.TEMPERATURE, Operator.BETWEEN, "20", "28"),
                condition(disease, "BLAST_HIGH_1", WeatherFactor.HUMIDITY, Operator.GREATER_THAN, "90", null));

        when(repository.findByIsActiveTrueAndIsDeleteFalse()).thenReturn(conditions);

        List<DiseaseWeatherRiskDTO> result = evaluator.evaluateAll(
                WeatherDTO.builder().temperature(30.0).humidity(70.0).rainfall(0.0).build());

        assertTrue(result.isEmpty());
    }

    @Test
    void evaluateAll_deduplicatesSameDiseaseWhenMultipleGroupsMatch() {
        Disease disease = Disease.builder()
                .id(6)
                .diseaseCode("LEAF_SCALD")
                .diseaseName("Chay bia la")
                .build();
        List<DiseaseWeatherCondition> conditions = List.of(
                condition(disease, "LEAF_SCALD_MEDIUM_1", WeatherFactor.TEMPERATURE, Operator.BETWEEN, "24", "31"),
                condition(disease, "LEAF_SCALD_HIGH_1", WeatherFactor.HUMIDITY, Operator.GREATER_THAN, "80", null));

        when(repository.findByIsActiveTrueAndIsDeleteFalse()).thenReturn(conditions);

        List<DiseaseWeatherRiskDTO> result = evaluator.evaluateAll(
                WeatherDTO.builder().temperature(26.0).humidity(85.0).rainfall(0.0).build());

        assertEquals(1, result.size());
        assertEquals(6, result.get(0).getDiseaseId());
        assertEquals("LEAF_SCALD_HIGH_1", result.get(0).getConditionGroup());
    }

    private DiseaseWeatherCondition condition(
            Disease disease,
            String group,
            WeatherFactor factor,
            Operator operator,
            String min,
            String max) {
        return DiseaseWeatherCondition.builder()
                .disease(disease)
                .conditionGroup(group)
                .weatherFactor(factor)
                .operator(operator)
                .minValue(min != null ? new BigDecimal(min) : null)
                .maxValue(max != null ? new BigDecimal(max) : null)
                .unit("")
                .recommendationNote("Theo doi dong ruong")
                .isActive(true)
                .build();
    }
}
