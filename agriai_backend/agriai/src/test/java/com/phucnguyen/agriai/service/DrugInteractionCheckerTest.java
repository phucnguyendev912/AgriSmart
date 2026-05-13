package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.DrugInteraction;
import com.phucnguyen.agriai.entity.Ingredient;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.repository.DrugInteractionRepository;
import java.util.List;
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
class DrugInteractionCheckerTest {

    @Mock
    private DrugInteractionRepository drugInteractionRepository;

    private DrugInteractionChecker checker;
    private Ingredient ingA;
    private Ingredient ingB;
    private TreatmentPlan planA;
    private TreatmentPlan planB;

    @BeforeEach
    void setUp() {
        checker = new DrugInteractionChecker(drugInteractionRepository);
        ingA = Ingredient.builder().id(1).ingredientName("Tricyclazole").build();
        ingB = Ingredient.builder().id(2).ingredientName("Validamycin").build();
        Disease d = Disease.builder().id(10).diseaseName("Dao on").build();
        planA = TreatmentPlan.builder().id(100).disease(d).ingredient(ingA).build();
        planB = TreatmentPlan.builder().id(101).disease(d).ingredient(ingB).build();
    }

    // --- buildInteractionWarnings ---

    @Test
    @DisplayName("Single plan → no cross-check, returns empty")
    void buildInteractionWarnings_singlePlan_empty() {
        List<InteractionWarningDTO> result = checker.buildInteractionWarnings(List.of(planA));
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("No match in DB → empty warnings")
    void buildInteractionWarnings_noDbMatch_empty() {
        when(drugInteractionRepository.findInteractionsBetweenIngredients(anyList())).thenReturn(List.of());
        List<InteractionWarningDTO> result = checker.buildInteractionWarnings(List.of(planA, planB));
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("SEPARATE keyword in actionRule → blocksMixing=true")
    void buildInteractionWarnings_separateKeyword_blocksMixing() {
        DrugInteraction interaction = DrugInteraction.builder()
                .ingredientA(ingA).ingredientB(ingB)
                .actionRule("SEPARATE_SPRAY").severity("HIGH")
                .interactionType("CONFLICT").intervalDays(7).build();
        when(drugInteractionRepository.findInteractionsBetweenIngredients(anyList()))
                .thenReturn(List.of(interaction));

        List<InteractionWarningDTO> result = checker.buildInteractionWarnings(List.of(planA, planB));

        assertEquals(1, result.size());
        assertTrue(result.get(0).getBlocksMixing());
        assertEquals(7, result.get(0).getIntervalDays());
        assertEquals("Tricyclazole", result.get(0).getIngredientAName());
    }

    @Test
    @DisplayName("CAUTION keyword (not blocking) → blocksMixing=false")
    void buildInteractionWarnings_cautionKeyword_notBlocksMixing() {
        DrugInteraction interaction = DrugInteraction.builder()
                .ingredientA(ingA).ingredientB(ingB)
                .actionRule("USE_CAUTION").severity("LOW")
                .interactionType("WARNING").build();
        when(drugInteractionRepository.findInteractionsBetweenIngredients(anyList()))
                .thenReturn(List.of(interaction));

        List<InteractionWarningDTO> result = checker.buildInteractionWarnings(List.of(planA, planB));

        assertEquals(1, result.size());
        assertFalse(result.get(0).getBlocksMixing());
    }

    // --- canBeGrouped ---

    @Test
    @DisplayName("Plans without blocking interaction can be grouped")
    void canBeGrouped_noBlockingInteraction_returnsTrue() {
        boolean result = checker.canBeGrouped(planA, List.of(planB), List.of());
        assertTrue(result);
    }

    @Test
    @DisplayName("Candidate with blocking interaction cannot be grouped")
    void canBeGrouped_blockingInteraction_returnsFalse() {
        InteractionWarningDTO blocking = InteractionWarningDTO.builder()
                .ingredientAId(1).ingredientBId(2).blocksMixing(true).build();

        boolean result = checker.canBeGrouped(planA, List.of(planB), List.of(blocking));
        assertFalse(result);
    }

    // --- hasGroupInteractions ---

    @Test
    @DisplayName("Group with shared ingredients in warning list → true")
    void hasGroupInteractions_sharedIngredients_returnsTrue() {
        InteractionWarningDTO warning = InteractionWarningDTO.builder()
                .ingredientAId(1).ingredientBId(2).build();

        boolean result = checker.hasGroupInteractions(List.of(planA, planB), List.of(warning));
        assertTrue(result);
    }

    @Test
    @DisplayName("Group with no matching ingredients in warning → false")
    void hasGroupInteractions_noMatch_returnsFalse() {
        InteractionWarningDTO warning = InteractionWarningDTO.builder()
                .ingredientAId(99).ingredientBId(98).build();

        boolean result = checker.hasGroupInteractions(List.of(planA, planB), List.of(warning));
        assertFalse(result);
    }
}
