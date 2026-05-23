package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseWeatherRiskDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.DiseaseWeatherCondition;
import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.repository.DiseaseWeatherConditionRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service to evaluate disease outbreak risks based on real-time weather conditions
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DiseaseWeatherRiskEvaluator {

    private final DiseaseWeatherConditionRepository conditionRepository;

    // Group key mapping disease ID and condition group label
    record GroupKey(Integer diseaseId, String conditionGroup) {}

    // Evaluate weather risk for a list of specific disease IDs
    public List<DiseaseWeatherRiskDTO> evaluate(List<Integer> diseaseIds, WeatherDTO weather) {
        if (diseaseIds == null || diseaseIds.isEmpty() || weather == null) {
            return List.of();
        }

        List<DiseaseWeatherCondition> allConditions = conditionRepository
                .findByDiseaseIdInAndIsActiveTrueAndIsDeleteFalse(diseaseIds);

        return evaluateConditions(allConditions, weather);
    }

    // Evaluate risk for all active diseases in the system
    public List<DiseaseWeatherRiskDTO> evaluateAll(WeatherDTO weather) {
        if (weather == null) {
            return List.of();
        }

        return evaluateConditions(conditionRepository.findByIsActiveTrueAndIsDeleteFalse(), weather);
    }

    // Process list of conditions against current weather context
    private List<DiseaseWeatherRiskDTO> evaluateConditions(
            List<DiseaseWeatherCondition> allConditions, WeatherDTO weather) {
        if (allConditions == null || allConditions.isEmpty()) return List.of();

        Map<GroupKey, List<DiseaseWeatherCondition>> groups = allConditions.stream()
                .collect(Collectors.groupingBy(condition ->
                        new GroupKey(condition.getDisease().getId(), condition.getConditionGroup())
                ));

        List<DiseaseWeatherRiskDTO> matchedRisks = groups.values().stream()
                .map(groupConditions -> evaluateGroup(groupConditions, weather))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();

        return deduplicateByDisease(matchedRisks);
    }

    // Evaluate a single condition group; matches when at least one condition criteria is met
    private Optional<DiseaseWeatherRiskDTO> evaluateGroup(
            List<DiseaseWeatherCondition> conditions, WeatherDTO weather) {

        List<String> matchedDescriptions = new ArrayList<>();
        List<DiseaseWeatherCondition> matchedConditions = new ArrayList<>();

        for (DiseaseWeatherCondition condition : conditions) {
            Double actualValue = condition.getWeatherFactor().extract(weather);

            if (actualValue == null || !isConditionMatch(condition, actualValue)) {
                continue;
            }

            matchedConditions.add(condition);
            matchedDescriptions.add(formatConditionDescription(condition, actualValue));
        }

        if (matchedConditions.isEmpty()) return Optional.empty();

        DiseaseWeatherCondition first = conditions.get(0);
        DiseaseWeatherCondition firstMatched = matchedConditions.get(0);
        return Optional.of(DiseaseWeatherRiskDTO.builder()
                .diseaseId(first.getDisease().getId())
                .diseaseCode(first.getDisease().getDiseaseCode())
                .diseaseName(first.getDisease().getDiseaseName())
                .conditionGroup(first.getConditionGroup())
                .matchedConditions(matchedDescriptions)
                .recommendationNotes(firstMatched.getRecommendationNote())
                .build());
    }

    // Deduplicate risks keeping the highest priority risk per disease
    private List<DiseaseWeatherRiskDTO> deduplicateByDisease(List<DiseaseWeatherRiskDTO> risks) {
        Map<Integer, DiseaseWeatherRiskDTO> byDisease = new LinkedHashMap<>();

        for (DiseaseWeatherRiskDTO risk : risks) {
            byDisease.merge(risk.getDiseaseId(), risk, this::choosePreferredRisk);
        }

        return new ArrayList<>(byDisease.values());
    }

    // Compare and pick preferred risk record based on priority and match count
    private DiseaseWeatherRiskDTO choosePreferredRisk(
            DiseaseWeatherRiskDTO current,
            DiseaseWeatherRiskDTO candidate) {
        int currentPriority = riskPriority(current);
        int candidatePriority = riskPriority(candidate);

        if (candidatePriority > currentPriority) return candidate;
        if (candidatePriority < currentPriority) return current;

        int currentMatches = current.getMatchedConditions() != null ? current.getMatchedConditions().size() : 0;
        int candidateMatches = candidate.getMatchedConditions() != null ? candidate.getMatchedConditions().size() : 0;

        return candidateMatches > currentMatches ? candidate : current;
    }

    // Resolve risk priority level based on condition group name (High > Medium > Low)
    private int riskPriority(DiseaseWeatherRiskDTO risk) {
        String group = risk.getConditionGroup() != null ? risk.getConditionGroup().toUpperCase() : "";
        if (group.contains("HIGH")) return 2;
        if (group.contains("MEDIUM")) return 1;
        return 0;
    }

    // Determine if weather factor value satisfies condition operator threshold
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

    // Format condition match details to a user-friendly string
    private String formatConditionDescription(DiseaseWeatherCondition condition, Double actualValue) {
        String factorName = condition.getWeatherFactor().displayName;

        String threshold = switch (condition.getOperator()) {
            case BETWEEN      -> condition.getMinValue() + "-" + condition.getMaxValue() + condition.getUnit();
            case GREATER_THAN -> ">" + condition.getMinValue() + condition.getUnit();
            case LESS_THAN    -> "<" + condition.getMaxValue() + condition.getUnit();
            case EQUALS       -> "=" + condition.getMinValue() + condition.getUnit();
        };

        return factorName + ": " + actualValue + condition.getUnit() + " (nguong " + threshold + ")";
    }
}
