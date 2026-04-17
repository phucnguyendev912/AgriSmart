package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.DrugInteraction;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.entity.TreatmentWeatherCondition;
import com.phucnguyen.agriai.enums.WeatherFactor;
import com.phucnguyen.agriai.repository.DrugInteractionRepository;
import com.phucnguyen.agriai.repository.TreatmentPlanRepository;
import com.phucnguyen.agriai.repository.TreatmentWeatherConditionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Rule Engine: Xử lý logic đa bệnh, kiểm tra tương tác hoạt chất,
 * kiểm tra điều kiện thời tiết, và tổng hợp phác đồ điều trị.
 */
@Service
@Transactional(readOnly = true)
public class RuleEngineService {

    @Autowired
    private TreatmentPlanRepository treatmentPlanRepository;
    @Autowired
    private DrugInteractionRepository drugInteractionRepository;
    @Autowired
    private TreatmentWeatherConditionRepository weatherConditionRepository;

    /**
     * Lấy phác đồ điều trị cho danh sách diseaseIds, kiểm tra tương tác,
     * và sinh cảnh báo thời tiết.
     */
    public RuleEngineResult process(List<Integer> diseaseIds, WeatherDTO weather) {
        // 1. Lấy tất cả treatment plans cho các bệnh
        List<TreatmentPlan> allPlans = new ArrayList<>();
        for (Integer diseaseId : diseaseIds) {
            allPlans.addAll(treatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse(diseaseId));
        }

        // 2. Build TreatmentDTO list
        List<TreatmentDTO> treatments = allPlans.stream()
                .map(this::toTreatmentDTO)
                .collect(Collectors.toList());

        // 3. Kiểm tra tương tác hoạt chất (chỉ khi >= 2 bệnh)
        List<String> warnings = new ArrayList<>();
        if (diseaseIds.size() >= 2) {
            warnings.addAll(checkDrugInteractions(allPlans));
        }

        // 4. Kiểm tra điều kiện thời tiết
        if (weather != null) {
            List<Integer> planIds = allPlans.stream()
                    .map(TreatmentPlan::getId).collect(Collectors.toList());
            warnings.addAll(checkWeatherConditions(planIds, weather));
        }

        return new RuleEngineResult(treatments, warnings);
    }

    /**
     * Kiểm tra tương tác giữa các hoạt chất của các phác đồ.
     */
    private List<String> checkDrugInteractions(List<TreatmentPlan> plans) {
        List<String> warnings = new ArrayList<>();

        // Collect unique ingredient IDs
        List<Integer> ingredientIds = plans.stream()
                .filter(p -> p.getIngredient() != null)
                .map(p -> p.getIngredient().getId())
                .distinct()
                .collect(Collectors.toList());

        if (ingredientIds.size() < 2)
            return warnings;

        List<DrugInteraction> interactions = drugInteractionRepository
                .findInteractionsBetweenIngredients(ingredientIds);

        for (DrugInteraction interaction : interactions) {
            String ingredientAName = interaction.getIngredientA() != null
                    ? interaction.getIngredientA().getIngredientName()
                    : "N/A";
            String ingredientBName = interaction.getIngredientB() != null
                    ? interaction.getIngredientB().getIngredientName()
                    : "N/A";

            String warning = String.format("⚠️ %s: %s + %s — %s (Quy tắc: %s)",
                    interaction.getInteractionType(),
                    ingredientAName,
                    ingredientBName,
                    interaction.getWarningMessage(),
                    interaction.getActionRule());
            warnings.add(warning);
        }

        return warnings;
    }

    /**
     * Kiểm tra điều kiện thời tiết so với TreatmentWeatherCondition.
     */
    private List<String> checkWeatherConditions(List<Integer> planIds, WeatherDTO weather) {
        List<String> warnings = new ArrayList<>();
        if (planIds.isEmpty())
            return warnings;

        List<TreatmentWeatherCondition> conditions = weatherConditionRepository
                .findByTreatmentplanIdInAndIsDeleteFalse(planIds);

        for (TreatmentWeatherCondition cond : conditions) {
            Double actualValue = getWeatherValue(weather, cond.getWeatherFactor());
            if (actualValue == null)
                continue;

            boolean violated = isConditionViolated(cond, actualValue);
            if (violated) {
                String prefix = Boolean.TRUE.equals(cond.getIsRequired()) ? "🚫 BẮT BUỘC" : "⚠️ Khuyến nghị";
                warnings.add(String.format("%s: %s", prefix, cond.getRecommendationNote()));
            }
        }

        return warnings;
    }

    private Double getWeatherValue(WeatherDTO weather, WeatherFactor factor) {
        if (factor == null || weather == null)
            return null;
        return switch (factor) {
            case TEMPERATURE -> weather.getTemperature();
            case HUMIDITY -> weather.getHumidity();
            case RAINFALL -> weather.getRainfall();
            default -> null;
        };
    }

    private boolean isConditionViolated(TreatmentWeatherCondition cond, Double actualValue) {
        BigDecimal actual = BigDecimal.valueOf(actualValue);
        return switch (cond.getOperator()) {
            case GREATER_THAN -> cond.getMaxValue() != null && actual.compareTo(cond.getMaxValue()) > 0;
            case LESS_THAN -> cond.getMinValue() != null && actual.compareTo(cond.getMinValue()) < 0;
            case BETWEEN -> (cond.getMinValue() != null && actual.compareTo(cond.getMinValue()) < 0)
                    || (cond.getMaxValue() != null && actual.compareTo(cond.getMaxValue()) > 0);
            case EQUALS -> cond.getMinValue() != null && actual.compareTo(cond.getMinValue()) != 0;
        };
    }

    private TreatmentDTO toTreatmentDTO(TreatmentPlan plan) {
        List<String> ingredients = new ArrayList<>();
        if (plan.getIngredient() != null) {
            ingredients.add(plan.getIngredient().getIngredientName());
        }

        String diseaseName = plan.getDisease() != null ? plan.getDisease().getDiseaseName() : null;

        return TreatmentDTO.builder()
                .treatmentName(plan.getTreatmentName())
                .diseaseName(diseaseName)
                .drugName(plan.getDrugName())
                .activeIngredients(ingredients)
                .dosage(plan.getDosage())
                .applicationMethod(plan.getApplicationMethod())
                .applicationTime(plan.getApplicationTime())
                .frequency(plan.getFrequency())
                .safetyNotes(plan.getSafetyNotes())
                .build();
    }

    /**
     * Kết quả xử lý từ Rule Engine.
     */
    public record RuleEngineResult(List<TreatmentDTO> treatments, List<String> warnings) {
    }
}
