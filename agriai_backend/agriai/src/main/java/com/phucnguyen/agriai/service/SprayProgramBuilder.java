package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Component;

@Component
public class SprayProgramBuilder {

    private final DrugInteractionChecker drugInteractionChecker;

    public SprayProgramBuilder(DrugInteractionChecker drugInteractionChecker) {
        this.drugInteractionChecker = drugInteractionChecker;
    }

    public List<TreatmentProgramDTO> buildPrograms(
            List<TreatmentPlan> selectedPlans,
            List<InteractionWarningDTO> interactionWarnings,
            Map<Integer, List<WeatherAlertDTO>> weatherAlertsByPlan) {

        List<List<TreatmentPlan>> groupedPlans = new ArrayList<>();
        // grouping plans
        for (TreatmentPlan candidate : selectedPlans) {
            boolean added = false;
            for (List<TreatmentPlan> group : groupedPlans) {
                if (drugInteractionChecker.canBeGrouped(candidate, group, interactionWarnings)) {
                    group.add(candidate);
                    added = true;
                    break;
                }
            }
            if (!added) {
                List<TreatmentPlan> newGroup = new ArrayList<>();
                newGroup.add(candidate);
                groupedPlans.add(newGroup);
            }
        }

        boolean isSingleGroup = groupedPlans.size() == 1;
        boolean hasConflict = !interactionWarnings.isEmpty();
        Integer maxIntervalDays = interactionWarnings.stream()
                .filter(w -> w.getIntervalDays() != null)
                .map(InteractionWarningDTO::getIntervalDays)
                .max(Integer::compareTo)
                .orElse(null);

        List<TreatmentProgramDTO> programs = new ArrayList<>();
        for (int i = 0; i < groupedPlans.size(); i++) {
            List<TreatmentPlan> group = groupedPlans.get(i);
            List<TreatmentDTO> treatments = group.stream()
                    .map(plan -> toTreatmentDTO(plan,
                            weatherAlertsByPlan.getOrDefault(plan.getId(), List.of()),
                            isSingleGroup))
                    .toList();

            List<String> diseaseNames = treatments.stream()
                    .map(TreatmentDTO::getDiseaseName)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            boolean blocked = treatments.stream().anyMatch(t -> Boolean.TRUE.equals(t.getWeatherBlocked()));
            boolean hasGroupInteraction = drugInteractionChecker.hasGroupInteractions(group, interactionWarnings);
            boolean mixAllowed = group.size() <= 1 || !hasGroupInteraction;

            programs.add(TreatmentProgramDTO.builder()
                    .programOrder(i + 1)
                    .programCode("SPRAY-" + (i + 1))
                    .strategy(isSingleGroup ? (hasConflict ? "MIX_WITH_WARNING" : "SINGLE_DISEASE_OR_SAFE_MIX")
                            : "SEPARATE_SPRAY")
                    .status(blocked ? "BLOCKED_BY_WEATHER" : "READY")
                    .mixAllowed(mixAllowed)
                    .diseaseNames(diseaseNames)
                    .reasons(buildProgramReasons(group, interactionWarnings, blocked))
                    .warnings(List.of())
                    .treatments(treatments)
                    .intervalDays((!isSingleGroup && i > 0) ? maxIntervalDays : null)
                    .build());
        }
        return programs;
    }

    // building strategy for treatment plan
    public String deriveStrategy(List<TreatmentProgramDTO> programs, List<InteractionWarningDTO> interactionWarnings) {
        if (programs.isEmpty()) {
            return "NO_TREATMENT";
        }
        if (programs.size() == 1 && interactionWarnings.isEmpty()) {
            return "SINGLE_DISEASE_OR_SAFE_MIX";
        }
        if (programs.size() == 1) {
            return "MIX_WITH_WARNING";
        }
        return "SEPARATE_SPRAY";
    }

    private TreatmentDTO toTreatmentDTO(
            TreatmentPlan plan,
            List<WeatherAlertDTO> weatherAlerts,
            boolean mergedProgram) {
        List<String> ingredients = new ArrayList<>();
        if (plan.getIngredient() != null) {
            ingredients.add(plan.getIngredient().getIngredientName());
        }
        boolean weatherBlocked = weatherAlerts.stream()
                .anyMatch(
                        alert -> Boolean.TRUE.equals(alert.getRequired()) && Boolean.TRUE.equals(alert.getViolated()));

        return TreatmentDTO.builder()
                .treatmentPlanId(plan.getId())
                .diseaseId(plan.getDisease() != null ? plan.getDisease().getId() : null)
                .diseaseName(plan.getDisease() != null ? plan.getDisease().getDiseaseName() : null)
                .treatmentName(plan.getTreatmentName())
                .ingredientId(plan.getIngredient() != null ? plan.getIngredient().getId() : null)
                .ingredientName(plan.getIngredient() != null ? plan.getIngredient().getIngredientName() : null)
                .ingredientDescription(plan.getIngredient() != null ? plan.getIngredient().getDescription() : null)
                .drugName(plan.getDrugName())
                .activeIngredients(ingredients)
                .dosage(plan.getDosage())
                .dosagePerHaValue(plan.getDosagePerHaValue())
                .dosagePerHaUnit(plan.getDosagePerHaUnit())
                .waterVolumePerHa(plan.getWaterVolumePerHa())
                .applicationMethod(plan.getApplicationMethod())
                .applicationTime(plan.getApplicationTime())
                .frequency(plan.getFrequency())
                .safetyNotes(plan.getSafetyNotes())
                .spraySchedule(mergedProgram ? "MERGED" : "SEPARATE")
                .required(Boolean.TRUE.equals(plan.getIsRequired()))
                .weatherBlocked(weatherBlocked)
                .weatherWarnings(List.of())
                .build();
    }

    private List<String> buildProgramReasons(
            List<TreatmentPlan> group,
            List<InteractionWarningDTO> interactionWarnings,
            boolean blocked) {
        List<String> reasons = new ArrayList<>();
        if (group.size() > 1) {
            reasons.add("MIX_COMPATIBLE");
        }
        if (group.size() == 1 && !interactionWarnings.isEmpty()) {
            reasons.add("CONFLICT_SEPARATED");
        }
        if (blocked) {
            reasons.add("WEATHER_BLOCKED");
        }
        if (reasons.isEmpty()) {
            reasons.add("DEFAULT_PRIORITY");
        }
        return reasons;
    }
}
