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
    void evaluateAll_returnsRiskWhenAllConditionsInGroupMatch() {
        Disease disease = Disease.builder()
                .id(5)
                .diseaseCode("BLAST")
                .diseaseName("Dao on")
                .build();
        List<DiseaseWeatherCondition> conditions = List.of(
                condition(disease, WeatherFactor.TEMPERATURE, Operator.BETWEEN, "20", "28"),
                condition(disease, WeatherFactor.HUMIDITY, Operator.GREATER_THAN, "90", null));

        when(repository.findByIsActiveTrueAndIsDeleteFalse()).thenReturn(conditions);

        List<DiseaseWeatherRiskDTO> result = evaluator.evaluateAll(
                WeatherDTO.builder().temperature(25.0).humidity(91.0).rainfall(0.0).build());

        assertEquals(1, result.size());
        assertEquals(5, result.get(0).getDiseaseId());
        assertEquals("Dao on", result.get(0).getDiseaseName());
        assertEquals(2, result.get(0).getMatchedConditions().size());
    }

    @Test
    void evaluateAll_returnsEmptyWhenAnyConditionInGroupDoesNotMatch() {
        Disease disease = Disease.builder().id(5).diseaseName("Dao on").build();
        List<DiseaseWeatherCondition> conditions = List.of(
                condition(disease, WeatherFactor.TEMPERATURE, Operator.BETWEEN, "20", "28"),
                condition(disease, WeatherFactor.HUMIDITY, Operator.GREATER_THAN, "90", null));

        when(repository.findByIsActiveTrueAndIsDeleteFalse()).thenReturn(conditions);

        List<DiseaseWeatherRiskDTO> result = evaluator.evaluateAll(
                WeatherDTO.builder().temperature(25.0).humidity(70.0).rainfall(0.0).build());

        assertTrue(result.isEmpty());
    }

    private DiseaseWeatherCondition condition(
            Disease disease,
            WeatherFactor factor,
            Operator operator,
            String min,
            String max) {
        return DiseaseWeatherCondition.builder()
                .disease(disease)
                .conditionGroup("GROUP_1")
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
