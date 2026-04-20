package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.entity.DrugInteraction;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.repository.DrugInteractionRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Kiểm tra tương tác hóa học giữa các hoạt chất và
 * xác định các cặp thuốc không được phép phun chung.
 */
@Component
public class DrugInteractionChecker {

    private static final List<String> BLOCKING_ACTION_RULE_KEYWORDS = List.of("SEPARATE", "DO_NOT", "AVOID");

    private final DrugInteractionRepository drugInteractionRepository;

    public DrugInteractionChecker(DrugInteractionRepository drugInteractionRepository) {
        this.drugInteractionRepository = drugInteractionRepository;
    }

    public List<InteractionWarningDTO> buildInteractionWarnings(List<TreatmentPlan> plans) {
        List<Integer> ingredientIds = plans.stream()
                .filter(plan -> plan.getIngredient() != null)
                .map(plan -> plan.getIngredient().getId())
                .distinct()
                .toList();
        if (ingredientIds.size() < 2) {
            return List.of();
        }
        return drugInteractionRepository.findInteractionsBetweenIngredients(ingredientIds).stream()
                .map(this::toInteractionWarning)
                .toList();
    }

    public boolean canBeGrouped(
            TreatmentPlan candidate,
            List<TreatmentPlan> group,
            List<InteractionWarningDTO> interactionWarnings) {
        for (TreatmentPlan existing : group) {
            if (hasBlockingInteraction(candidate, existing, interactionWarnings)) {
                return false;
            }
        }
        return true;
    }

    public boolean hasGroupInteractions(
            List<TreatmentPlan> group,
            List<InteractionWarningDTO> interactionWarnings) {
        Set<Integer> ingredientIds = group.stream()
                .filter(plan -> plan.getIngredient() != null)
                .map(plan -> plan.getIngredient().getId())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        return interactionWarnings.stream()
                .anyMatch(warning -> ingredientIds.contains(warning.getIngredientAId())
                        && ingredientIds.contains(warning.getIngredientBId()));
    }

    private InteractionWarningDTO toInteractionWarning(DrugInteraction interaction) {
        String actionRule = interaction.getActionRule();
        boolean blocksMixing = actionRule != null
                && BLOCKING_ACTION_RULE_KEYWORDS.stream()
                        .anyMatch(keyword -> actionRule.toUpperCase().contains(keyword));
        return InteractionWarningDTO.builder()
                .ingredientAId(interaction.getIngredientA() != null ? interaction.getIngredientA().getId() : null)
                .ingredientAName(
                        interaction.getIngredientA() != null ? interaction.getIngredientA().getIngredientName() : null)
                .ingredientBId(interaction.getIngredientB() != null ? interaction.getIngredientB().getId() : null)
                .ingredientBName(
                        interaction.getIngredientB() != null ? interaction.getIngredientB().getIngredientName() : null)
                .interactionType(interaction.getInteractionType())
                .severity(interaction.getSeverity())
                .actionRule(actionRule)
                .warningMessage(interaction.getWarningMessage())
                .blocksMixing(blocksMixing)
                .intervalDays(interaction.getIntervalDays())
                .build();
    }

    private boolean hasBlockingInteraction(
            TreatmentPlan planA,
            TreatmentPlan planB,
            List<InteractionWarningDTO> interactionWarnings) {
        Integer ingredientAId = planA.getIngredient() != null ? planA.getIngredient().getId() : null;
        Integer ingredientBId = planB.getIngredient() != null ? planB.getIngredient().getId() : null;
        if (ingredientAId == null || ingredientBId == null) {
            return false;
        }
        return interactionWarnings.stream().anyMatch(warning -> Boolean.TRUE.equals(warning.getBlocksMixing())
                && samePair(ingredientAId, ingredientBId, warning));
    }

    private boolean samePair(Integer ingredientAId, Integer ingredientBId, InteractionWarningDTO warning) {
        return Objects.equals(ingredientAId, warning.getIngredientAId())
                && Objects.equals(ingredientBId, warning.getIngredientBId())
                || Objects.equals(ingredientAId, warning.getIngredientBId())
                        && Objects.equals(ingredientBId, warning.getIngredientAId());
    }
}
