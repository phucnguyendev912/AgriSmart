package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseWeatherRiskDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.DiseaseWeatherCondition;
import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.repository.DiseaseWeatherConditionRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DiseaseWeatherRiskEvaluator {

    private final DiseaseWeatherConditionRepository conditionRepository;

    record GroupKey(Integer diseaseId, String conditionGroup) {}

    // Đánh giá điều kiện thời tiết thuận lợi cho bệnh
    public List<DiseaseWeatherRiskDTO> evaluate(List<Integer> diseaseIds, WeatherDTO weather) {
        if (diseaseIds == null || diseaseIds.isEmpty() || weather == null) {
            return List.of();
        }

        List<DiseaseWeatherCondition> allConditions = conditionRepository
                .findByDiseaseIdInAndIsActiveTrueAndIsDeleteFalse(diseaseIds);

        if (allConditions.isEmpty()) return List.of();

        Map<GroupKey, List<DiseaseWeatherCondition>> groups = allConditions.stream()
                .collect(Collectors.groupingBy(c ->
                        new GroupKey(c.getDisease().getId(), c.getConditionGroup())
                ));

        return groups.values().stream()
                .map(groupConditions -> evaluateGroup(groupConditions, weather))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
    }

    // Kiểm tra 1 group: TẤT CẢ điều kiện phải match (AND logic)
    private Optional<DiseaseWeatherRiskDTO> evaluateGroup(
            List<DiseaseWeatherCondition> conditions, WeatherDTO weather) {

        List<String> matchedDescriptions = new ArrayList<>();

        for (DiseaseWeatherCondition condition : conditions) {
            Double actualValue = condition.getWeatherFactor().extract(weather);

            if (actualValue == null) return Optional.empty();
            if (!isConditionMatch(condition, actualValue)) return Optional.empty();

            matchedDescriptions.add(formatConditionDescription(condition, actualValue));
        }

        DiseaseWeatherCondition first = conditions.get(0);
        return Optional.of(DiseaseWeatherRiskDTO.builder()
                .diseaseId(first.getDisease().getId())
                .diseaseCode(first.getDisease().getDiseaseCode())
                .diseaseName(first.getDisease().getDiseaseName())
                .conditionGroup(first.getConditionGroup())
                .matchedConditions(matchedDescriptions)
                .recommendationNotes(first.getRecommendationNote())
                .build());
    }

    // So sánh giá trị thực tế với ngưỡng
    private boolean isConditionMatch(DiseaseWeatherCondition condition, Double actualValue) {
        BigDecimal actual = BigDecimal.valueOf(actualValue);
        Operator operator = condition.getOperator();
        if (operator == null) return false;

        return switch (operator) {
            case GREATER_THAN -> condition.getMinValue() != null
                    && actual.compareTo(condition.getMinValue()) > 0;
            case LESS_THAN    -> condition.getMaxValue() != null
                    && actual.compareTo(condition.getMaxValue()) < 0;
            case BETWEEN      -> condition.getMinValue() != null
                    && condition.getMaxValue() != null
                    && actual.compareTo(condition.getMinValue()) >= 0
                    && actual.compareTo(condition.getMaxValue()) <= 0;
            case EQUALS       -> condition.getMinValue() != null
                    && actual.compareTo(condition.getMinValue()) == 0;
        };
    }

    // Mô tả điều kiện đã match (VD: "Nhiệt độ: 25.0°C (ngưỡng 20-28°C)")
    private String formatConditionDescription(DiseaseWeatherCondition condition, Double actualValue) {
        String factorName = condition.getWeatherFactor().displayName;

        String threshold = switch (condition.getOperator()) {
            case BETWEEN      -> condition.getMinValue() + "-" + condition.getMaxValue() + condition.getUnit();
            case GREATER_THAN -> ">" + condition.getMinValue() + condition.getUnit();
            case LESS_THAN    -> "<" + condition.getMaxValue() + condition.getUnit();
            case EQUALS       -> "=" + condition.getMinValue() + condition.getUnit();
        };

        return factorName + ": " + actualValue + condition.getUnit() + " (ngưỡng " + threshold + ")";
    }
}
