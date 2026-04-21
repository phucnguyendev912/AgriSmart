package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.entity.TreatmentWeatherCondition;
import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.enums.WeatherFactor;
import com.phucnguyen.agriai.repository.TreatmentWeatherConditionRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

// checking weather condition
@Component
public class WeatherAlertEvaluator {

    private final TreatmentWeatherConditionRepository weatherConditionRepository;

    public WeatherAlertEvaluator(TreatmentWeatherConditionRepository weatherConditionRepository) {
        this.weatherConditionRepository = weatherConditionRepository;
    }

    public Map<Integer, List<WeatherAlertDTO>> buildWeatherAlerts(List<TreatmentPlan> plans, WeatherDTO weather) {
        if (weather == null || plans.isEmpty()) {
            return Map.of();
        }
        List<Integer> planIds = plans.stream().map(TreatmentPlan::getId).toList();
        List<TreatmentWeatherCondition> conditions = weatherConditionRepository
                .findByTreatmentplanIdInAndIsDeleteFalse(planIds);

        Map<Integer, List<WeatherAlertDTO>> alertsByPlan = new LinkedHashMap<>();
        for (TreatmentWeatherCondition condition : conditions) {
            Double actualValue = getWeatherValue(weather, condition.getWeatherFactor());
            if (actualValue == null) {
                continue;
            }
            boolean violated = isConditionViolated(condition, actualValue);
            WeatherAlertDTO alert = WeatherAlertDTO.builder()
                    .treatmentPlanId(condition.getTreatmentplan().getId())
                    .treatmentName(condition.getTreatmentplan().getTreatmentName())
                    .weatherFactor(condition.getWeatherFactor() != null ? condition.getWeatherFactor().name() : null)
                    .operator(condition.getOperator() != null ? condition.getOperator().name() : null)
                    .actualValue(actualValue)
                    .minValue(toDouble(condition.getMinValue()))
                    .maxValue(toDouble(condition.getMaxValue()))
                    .required(Boolean.TRUE.equals(condition.getIsRequired()))
                    .violated(violated)
                    .recommendationNote(condition.getRecommendationNote())
                    .unit(condition.getUnit())
                    .build();

            alertsByPlan.computeIfAbsent(condition.getTreatmentplan().getId(), ignored -> new ArrayList<>())
                    .add(alert);
        }
        return alertsByPlan;
    }

    private Double getWeatherValue(WeatherDTO weather, WeatherFactor factor) {
        if (weather == null || factor == null) {
            return null;
        }
        return switch (factor) {
            case TEMPERATURE -> weather.getTemperature();
            case HUMIDITY -> weather.getHumidity();
            case RAINFALL -> weather.getRainfall();
            case WIND_SPEED -> null;
        };
    }

    private boolean isConditionViolated(TreatmentWeatherCondition condition, Double actualValue) {
        BigDecimal actual = BigDecimal.valueOf(actualValue);
        Operator operator = condition.getOperator();
        if (operator == null) {
            return false;
        }
        BigDecimal threshold = condition.getMinValue() != null ? condition.getMinValue() : condition.getMaxValue();
        return switch (operator) {
            case GREATER_THAN -> threshold != null && actual.compareTo(threshold) <= 0;
            case LESS_THAN -> threshold != null && actual.compareTo(threshold) >= 0;
            case BETWEEN -> (condition.getMinValue() != null && actual.compareTo(condition.getMinValue()) < 0)
                    || (condition.getMaxValue() != null && actual.compareTo(condition.getMaxValue()) > 0);
            case EQUALS -> threshold != null && actual.compareTo(threshold) != 0;
        };
    }

    private Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }
}
