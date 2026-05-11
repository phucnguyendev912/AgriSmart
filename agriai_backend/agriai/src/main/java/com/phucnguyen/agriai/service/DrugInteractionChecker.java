package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.entity.DrugInteraction;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.repository.DrugInteractionRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.StaticMessageSource;
import org.springframework.stereotype.Component;

@Component
public class DrugInteractionChecker {
        private static final Logger log = LoggerFactory.getLogger(DrugInteractionChecker.class);

        // TODO: Nếu dữ liệu DB không được kiểm soát, đổi actionRule sang enum để tránh false positive
        private static final List<String> BLOCKING_ACTION_RULE_KEYWORDS = List.of("SEPARATE", "DO_NOT", "AVOID");

        private final DrugInteractionRepository drugInteractionRepository;
        private final MessageSource messageSource;

        @Autowired
        public DrugInteractionChecker(
                        DrugInteractionRepository drugInteractionRepository,
                        MessageSource messageSource) {
                this.drugInteractionRepository = drugInteractionRepository;
                this.messageSource = messageSource;
        }

        public DrugInteractionChecker(DrugInteractionRepository drugInteractionRepository) {
                this(drugInteractionRepository, new StaticMessageSource());
        }

        // Kết quả kiểm tra tương tác giữa các recommended plans
        public record InteractionResult(
                        List<InteractionWarningDTO> warnings,
                        boolean hasWarning,
                        String summary) {
                static InteractionResult empty() {
                        return new InteractionResult(List.of(), false, null);
                }
        }

        // find all interaction between ingredients warning
        public List<InteractionWarningDTO> buildInteractionWarnings(List<TreatmentPlan> plans) {
                Set<Integer> ingredientIdsSet = new HashSet<>();
                for (TreatmentPlan plan : plans) {
                        ingredientIdsSet.addAll(extractIngredientIds(plan));
                }
                
                List<Integer> ingredientIds = new ArrayList<>(ingredientIdsSet);
                if (ingredientIds.size() < 2) {
                        return List.of();
                }
                return drugInteractionRepository.findInteractionsBetweenIngredients(ingredientIds).stream()
                                .map(this::toInteractionWarning)
                                .toList();
        }

        // checking if candidate can be grouped with group
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

        // checking if group has interactions
        public boolean hasGroupInteractions(
                        List<TreatmentPlan> group,
                        List<InteractionWarningDTO> interactionWarnings) {
                Set<Integer> ingredientIds = new HashSet<>();
                for (TreatmentPlan plan : group) {
                        ingredientIds.addAll(extractIngredientIds(plan));
                }

                return interactionWarnings.stream()
                                .anyMatch(warning -> ingredientIds.contains(warning.getIngredientAId())
                                                && ingredientIds.contains(warning.getIngredientBId()));
        }

        // Kiểm tra tương tác giữa recommended plans (lấy ingredients từ drug mới, fallback legacy)
        public InteractionResult checkRecommendedPlans(
                        List<TreatmentDTO> rankedTreatments,
                        List<TreatmentPlan> allPlans) {

                List<Integer> recommendedPlanIds = rankedTreatments.stream()
                                .filter(t -> Boolean.TRUE.equals(t.getRecommended()))
                                .map(TreatmentDTO::getTreatmentPlanId)
                                .toList();

                if (recommendedPlanIds.size() < 2) return InteractionResult.empty();

                List<TreatmentPlan> recommendedPlans = allPlans.stream()
                                .filter(p -> recommendedPlanIds.contains(p.getId()))
                                .toList();

                // Log nếu caller truyền allPlans thiếu — để dễ debug
                if (recommendedPlans.size() < recommendedPlanIds.size()) {
                        log.warn("[DrugInteractionChecker] Missing plans in allPlans. Expected IDs: {}, found: {}",
                                        recommendedPlanIds,
                                        recommendedPlans.stream().map(TreatmentPlan::getId).toList());
                }

                // Build map planId → ingredientIds để lọc same-plan interaction
                Map<Integer, List<Integer>> ingredientsByPlan = new HashMap<>();
                Set<Integer> allIngredientIdsSet = new HashSet<>();

                for (TreatmentPlan plan : recommendedPlans) {
                        List<Integer> ids = extractIngredientIds(plan);
                        ingredientsByPlan.put(plan.getId(), ids);
                        allIngredientIdsSet.addAll(ids);
                }

                List<Integer> allIngredientIds = new ArrayList<>(allIngredientIdsSet);

                if (allIngredientIds.size() < 2) return InteractionResult.empty();

                List<InteractionWarningDTO> warnings = drugInteractionRepository
                                .findInteractionsBetweenIngredients(allIngredientIds).stream()
                                .map(this::toInteractionWarning)
                                // Chỉ cảnh báo tương tác KHÁC plan (cross-plan)
                                // Same-plan = 2 hoạt chất trong cùng 1 drug đã được formulate sẵn
                                // → nhà sản xuất + cơ quan quản lý đã kiểm soát → bỏ qua
                                .filter(w -> !isSamePlanInteraction(w, ingredientsByPlan))
                                .toList();

                if (warnings.isEmpty()) return InteractionResult.empty();

                return new InteractionResult(warnings, true, buildSummary(warnings));
        }

    // Ưu tiên drug.ingredients (mới)
    private List<Integer> extractIngredientIds(TreatmentPlan plan) {
            if (plan.getDrug() != null && plan.getDrug().getIngredients() != null
                            && !plan.getDrug().getIngredients().isEmpty()) {
                    return plan.getDrug().getIngredients().stream()
                                    .filter(di -> di.getIngredient() != null)
                                    .map(di -> di.getIngredient().getId())
                                    .toList();
            }
            return List.of();
    }

        private String buildSummary(List<InteractionWarningDTO> warnings) {
                long blockingCount = warnings.stream()
                                .filter(w -> Boolean.TRUE.equals(w.getBlocksMixing()))
                                .count();
                if (blockingCount > 0) {
                        return messageSource.getMessage(
                                        "drug.interaction.summary.blocking",
                                        new Object[] { blockingCount },
                                        "C\u00f3 " + blockingCount
                                                        + " c\u1eb7p ho\u1ea1t ch\u1ea5t KH\u00d4NG \u0111\u01b0\u1ee3c tr\u1ed9n chung. C\u1ea7n phun ri\u00eang.",
                                        LocaleContextHolder.getLocale());
                }
                return messageSource.getMessage(
                                "drug.interaction.summary.warning",
                                new Object[] { warnings.size() },
                                "C\u00f3 " + warnings.size() + " c\u1eb7p ho\u1ea1t ch\u1ea5t c\u1ea7n l\u01b0u \u00fd khi tr\u1ed9n chung.",
                                LocaleContextHolder.getLocale());
        }

        // convert DrugInteraction to InteractionWarningDTO
        private InteractionWarningDTO toInteractionWarning(DrugInteraction interaction) {
                String actionRule = interaction.getActionRule();
                boolean blocksMixing = actionRule != null
                                && BLOCKING_ACTION_RULE_KEYWORDS.stream()
                                                .anyMatch(keyword -> actionRule.toUpperCase().contains(keyword));
                return InteractionWarningDTO.builder()
                                .ingredientAId(interaction.getIngredientA() != null
                                                ? interaction.getIngredientA().getId()
                                                : null)
                                .ingredientAName(
                                                interaction.getIngredientA() != null
                                                                ? interaction.getIngredientA().getIngredientName()
                                                                : null)
                                .ingredientBId(interaction.getIngredientB() != null
                                                ? interaction.getIngredientB().getId()
                                                : null)
                                .ingredientBName(
                                                interaction.getIngredientB() != null
                                                                ? interaction.getIngredientB().getIngredientName()
                                                                : null)
                                .interactionType(interaction.getInteractionType())
                                .severity(interaction.getSeverity())
                                .actionRule(actionRule)
                                .warningMessage(interaction.getWarningMessage())
                                .blocksMixing(blocksMixing)
                                .intervalDays(interaction.getIntervalDays())
                                .build();
        }

        // checking has blocking interaction
        private boolean hasBlockingInteraction(
                        TreatmentPlan planA,
                        TreatmentPlan planB,
                        List<InteractionWarningDTO> interactionWarnings) {
                List<Integer> idsA = extractIngredientIds(planA);
                List<Integer> idsB = extractIngredientIds(planB);
                if (idsA.isEmpty() || idsB.isEmpty()) {
                        return false;
                }
                return interactionWarnings.stream()
                                .filter(warning -> Boolean.TRUE.equals(warning.getBlocksMixing()))
                                .anyMatch(warning -> hasOverlap(idsA, idsB, warning));
        }

        // Kiểm tra cặp ingredient có khớp với warning không (chiều xuôi hoặc ngược)
        private boolean hasOverlap(List<Integer> idsA, List<Integer> idsB, InteractionWarningDTO warning) {
                return (idsA.contains(warning.getIngredientAId()) && idsB.contains(warning.getIngredientBId()))
                                || (idsA.contains(warning.getIngredientBId()) && idsB.contains(warning.getIngredientAId()));
        }

        // Trả về true nếu cả 2 hoạt chất trong warning đều thuộc cùng 1 plan (bỏ qua)
        private boolean isSamePlanInteraction(
                        InteractionWarningDTO warning,
                        Map<Integer, List<Integer>> ingredientsByPlan) {
                for (List<Integer> ids : ingredientsByPlan.values()) {
                        if (ids.contains(warning.getIngredientAId()) && ids.contains(warning.getIngredientBId())) {
                                return true;
                        }
                }
                return false;
        }
}
