package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.Ingredient;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class SprayProgramBuilderTest {

    @Mock
    private DrugInteractionChecker drugInteractionChecker;

    private SprayProgramBuilder builder;

    private Ingredient ingA;
    private Ingredient ingB;
    private TreatmentPlan planA;
    private TreatmentPlan planB;

    @BeforeEach
    void setUp() {
        builder = new SprayProgramBuilder(drugInteractionChecker);
        ingA = Ingredient.builder().id(1).ingredientName("Tricyclazole").build();
        ingB = Ingredient.builder().id(2).ingredientName("Validamycin").build();
        Disease diseaseA = Disease.builder().id(10).diseaseName("Dao on").build();
        Disease diseaseB = Disease.builder().id(20).diseaseName("Kho van").build();
        planA = TreatmentPlan.builder().id(100).disease(diseaseA).ingredient(ingA).treatmentName("Phun Filia")
                .dosage("25ml").build();
        planB = TreatmentPlan.builder().id(101).disease(diseaseB).ingredient(ingB).treatmentName("Phun Validacin")
                .dosage("30ml").build();
    }

    @Test
    @DisplayName("Empty plans → empty programs")
    void buildPrograms_emptyPlans_emptyResult() {
        List<TreatmentProgramDTO> result = builder.buildPrograms(List.of(), List.of(), Map.of());
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Single plan → 1 program, SINGLE_DISEASE_OR_SAFE_MIX strategy")
    void buildPrograms_singlePlan_oneProgram() {
        lenient().when(drugInteractionChecker.canBeGrouped(planA, List.of(), List.of())).thenReturn(true);

        List<TreatmentProgramDTO> result = builder.buildPrograms(List.of(planA), List.of(), Map.of());

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getProgramOrder());
        assertEquals("SPRAY-1", result.get(0).getProgramCode());
        assertEquals("READY", result.get(0).getStatus());
        assertEquals("SINGLE_DISEASE_OR_SAFE_MIX", result.get(0).getStrategy());
    }

    @Test
    @DisplayName("Two compatible plans → 1 program with MIX_COMPATIBLE reason")
    void buildPrograms_twoCompatiblePlans_oneMixProgram() {
        lenient().when(drugInteractionChecker.canBeGrouped(planA, List.of(), List.of())).thenReturn(true);
        lenient().when(drugInteractionChecker.canBeGrouped(planB, List.of(planA), List.of())).thenReturn(true);
        lenient().when(drugInteractionChecker.hasGroupInteractions(List.of(planA, planB), List.of())).thenReturn(false);

        List<TreatmentProgramDTO> result = builder.buildPrograms(List.of(planA, planB), List.of(), Map.of());

        assertEquals(1, result.size());
        assertTrue(result.get(0).getReasons().contains("MIX_COMPATIBLE"));
        assertTrue(result.get(0).getMixAllowed());
    }

    @Test
    @DisplayName("Blocking interaction → 2 separate programs with CONFLICT_SEPARATED + SEPARATE_SPRAY strategy")
    void buildPrograms_blockingInteraction_twoPrograms() {
        InteractionWarningDTO blocking = InteractionWarningDTO.builder()
                .ingredientAId(1).ingredientBId(2).blocksMixing(true).intervalDays(5).build();

        lenient().when(drugInteractionChecker.canBeGrouped(planA, List.of(), List.of(blocking))).thenReturn(true);
        lenient().when(drugInteractionChecker.canBeGrouped(planB, List.of(planA), List.of(blocking))).thenReturn(false);
        lenient().when(drugInteractionChecker.hasGroupInteractions(List.of(planA), List.of(blocking)))
                .thenReturn(false);
        lenient().when(drugInteractionChecker.hasGroupInteractions(List.of(planB), List.of(blocking)))
                .thenReturn(false);

        List<TreatmentProgramDTO> result = builder.buildPrograms(List.of(planA, planB), List.of(blocking), Map.of());

        assertEquals(2, result.size());
        assertEquals("SEPARATE_SPRAY", result.get(0).getStrategy());
        assertTrue(result.get(0).getReasons().contains("CONFLICT_SEPARATED"));
        assertEquals(5, result.get(1).getIntervalDays());
        assertNull(result.get(0).getIntervalDays());
    }

    @Test
    @DisplayName("Weather-blocked plan → WEATHER_BLOCKED reason and BLOCKED_BY_WEATHER status")
    void buildPrograms_weatherBlocked_blockedStatus() {
        lenient().when(drugInteractionChecker.canBeGrouped(planA, List.of(), List.of())).thenReturn(true);
        lenient().when(drugInteractionChecker.hasGroupInteractions(List.of(planA), List.of())).thenReturn(false);

        WeatherAlertDTO blockedAlert = WeatherAlertDTO.builder()
                .treatmentPlanId(100).weatherFactor("TEMPERATURE")
                .required(true).violated(true).actualValue(40.0).build();

        List<TreatmentProgramDTO> result = builder.buildPrograms(List.of(planA), List.of(),
                Map.of(100, List.of(blockedAlert)));

        assertEquals(1, result.size());
        assertEquals("BLOCKED_BY_WEATHER", result.get(0).getStatus());
        assertTrue(result.get(0).getReasons().contains("WEATHER_BLOCKED"));
    }

    // --- deriveStrategy ---

    @Test
    @DisplayName("Empty programs → NO_TREATMENT")
    void deriveStrategy_emptyPrograms_noTreatment() {
        assertEquals("NO_TREATMENT", builder.deriveStrategy(List.of(), List.of()));
    }

    @Test
    @DisplayName("1 program, no warnings → SINGLE_DISEASE_OR_SAFE_MIX")
    void deriveStrategy_oneProgram_noWarnings_safeMix() {
        TreatmentProgramDTO p = TreatmentProgramDTO.builder().programCode("SPRAY-1").build();
        assertEquals("SINGLE_DISEASE_OR_SAFE_MIX", builder.deriveStrategy(List.of(p), List.of()));
    }

    @Test
    @DisplayName("1 program + warnings → MIX_WITH_WARNING")
    void deriveStrategy_oneProgram_withWarnings_mixWithWarning() {
        TreatmentProgramDTO p = TreatmentProgramDTO.builder().programCode("SPRAY-1").build();
        InteractionWarningDTO w = InteractionWarningDTO.builder().build();
        assertEquals("MIX_WITH_WARNING", builder.deriveStrategy(List.of(p), List.of(w)));
    }

    @Test
    @DisplayName("2 programs → SEPARATE_SPRAY")
    void deriveStrategy_twoPrograms_separateSpray() {
        TreatmentProgramDTO p1 = TreatmentProgramDTO.builder().programCode("SPRAY-1").build();
        TreatmentProgramDTO p2 = TreatmentProgramDTO.builder().programCode("SPRAY-2").build();
        assertEquals("SEPARATE_SPRAY", builder.deriveStrategy(List.of(p1, p2), List.of()));
    }
}
