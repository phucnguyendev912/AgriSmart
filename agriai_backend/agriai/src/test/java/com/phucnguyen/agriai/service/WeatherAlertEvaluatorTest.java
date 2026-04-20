package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.entity.TreatmentWeatherCondition;
import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.enums.WeatherFactor;
import com.phucnguyen.agriai.repository.TreatmentWeatherConditionRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeatherAlertEvaluatorTest {

    @Mock
    private TreatmentWeatherConditionRepository weatherConditionRepository;

    private WeatherAlertEvaluator evaluator;
    private TreatmentPlan plan;

    @BeforeEach
    void setUp() {
        evaluator = new WeatherAlertEvaluator(weatherConditionRepository);
        plan = TreatmentPlan.builder().id(1).treatmentName("Phun Filia").build();
    }

    @Test
    @DisplayName("Null weather → empty result")
    void buildWeatherAlerts_nullWeather_empty() {
        Map<Integer, List<WeatherAlertDTO>> result = evaluator.buildWeatherAlerts(List.of(plan), null);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("BETWEEN: value inside range → not violated")
    void buildWeatherAlerts_betweenOperator_insideRange_notViolated() {
        TreatmentWeatherCondition cond = buildCondition(WeatherFactor.TEMPERATURE, Operator.BETWEEN, "20", "30", false);
        when(weatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse(anyList())).thenReturn(List.of(cond));

        WeatherDTO weather = WeatherDTO.builder().temperature(25.0).build();
        Map<Integer, List<WeatherAlertDTO>> result = evaluator.buildWeatherAlerts(List.of(plan), weather);

        assertFalse(result.get(1).get(0).getViolated());
    }

    @Test
    @DisplayName("BETWEEN: value outside range → violated")
    void buildWeatherAlerts_betweenOperator_outsideRange_violated() {
        TreatmentWeatherCondition cond = buildCondition(WeatherFactor.TEMPERATURE, Operator.BETWEEN, "20", "30", true);
        when(weatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse(anyList())).thenReturn(List.of(cond));

        WeatherDTO weather = WeatherDTO.builder().temperature(35.0).build();
        Map<Integer, List<WeatherAlertDTO>> result = evaluator.buildWeatherAlerts(List.of(plan), weather);

        WeatherAlertDTO alert = result.get(1).get(0);
        assertTrue(alert.getViolated());
        assertTrue(alert.getRequired());
        assertEquals(35.0, alert.getActualValue());
    }

    @Test
    @DisplayName("GREATER_THAN: actual <= threshold → violated")
    void buildWeatherAlerts_greaterThan_actualBelowThreshold_violated() {
        TreatmentWeatherCondition cond = buildCondition(WeatherFactor.HUMIDITY, Operator.GREATER_THAN, "60", null,
                false);
        when(weatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse(anyList())).thenReturn(List.of(cond));

        WeatherDTO weather = WeatherDTO.builder().humidity(50.0).build();
        Map<Integer, List<WeatherAlertDTO>> result = evaluator.buildWeatherAlerts(List.of(plan), weather);

        assertTrue(result.get(1).get(0).getViolated());
    }

    @Test
    @DisplayName("LESS_THAN: actual >= threshold → violated")
    void buildWeatherAlerts_lessThan_actualAboveThreshold_violated() {
        TreatmentWeatherCondition cond = buildCondition(WeatherFactor.RAINFALL, Operator.LESS_THAN, "5", null, true);
        when(weatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse(anyList())).thenReturn(List.of(cond));

        WeatherDTO weather = WeatherDTO.builder().rainfall(10.0).build();
        Map<Integer, List<WeatherAlertDTO>> result = evaluator.buildWeatherAlerts(List.of(plan), weather);

        assertTrue(result.get(1).get(0).getViolated());
    }

    @Test
    @DisplayName("EQUALS: exact match → not violated")
    void buildWeatherAlerts_equals_exactMatch_notViolated() {
        TreatmentWeatherCondition cond = buildCondition(WeatherFactor.TEMPERATURE, Operator.EQUALS, "25", null, false);
        when(weatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse(anyList())).thenReturn(List.of(cond));

        WeatherDTO weather = WeatherDTO.builder().temperature(25.0).build();
        Map<Integer, List<WeatherAlertDTO>> result = evaluator.buildWeatherAlerts(List.of(plan), weather);

        assertFalse(result.get(1).get(0).getViolated());
    }

    @Test
    @DisplayName("Alert maps unit, factor name, and plan name correctly")
    void buildWeatherAlerts_mapsFields() {
        TreatmentWeatherCondition cond = TreatmentWeatherCondition.builder()
                .id(99).treatmentplan(plan)
                .weatherFactor(WeatherFactor.HUMIDITY)
                .operator(Operator.BETWEEN)
                .minValue(new BigDecimal("60")).maxValue(new BigDecimal("90"))
                .unit("%").isRequired(false)
                .recommendationNote("Ghi chu")
                .build();
        when(weatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse(anyList())).thenReturn(List.of(cond));

        WeatherDTO weather = WeatherDTO.builder().humidity(70.0).build();
        WeatherAlertDTO alert = evaluator.buildWeatherAlerts(List.of(plan), weather).get(1).get(0);

        assertEquals("%", alert.getUnit());
        assertEquals("HUMIDITY", alert.getWeatherFactor());
        assertEquals("Phun Filia", alert.getTreatmentName());
        assertEquals("Ghi chu", alert.getRecommendationNote());
        assertEquals(60.0, alert.getMinValue());
        assertEquals(90.0, alert.getMaxValue());
    }

    private TreatmentWeatherCondition buildCondition(
            WeatherFactor factor, Operator op, String min, String max, boolean required) {
        return TreatmentWeatherCondition.builder()
                .id(99).treatmentplan(plan)
                .weatherFactor(factor).operator(op)
                .minValue(min != null ? new BigDecimal(min) : null)
                .maxValue(max != null ? new BigDecimal(max) : null)
                .isRequired(required).unit("unit")
                .build();
    }
}
