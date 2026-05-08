package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.DrugInteraction;
import com.phucnguyen.agriai.entity.Ingredient;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.entity.TreatmentWeatherCondition;
import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.enums.WeatherFactor;
import com.phucnguyen.agriai.repository.DrugInteractionRepository;
import com.phucnguyen.agriai.repository.TreatmentWeatherConditionRepository;
import java.math.BigDecimal;
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

/**
 * Integration-style unit test for RuleEngineService.
 * Tests the full orchestration flow with all real sub-components
 * and only mocks at the repository boundary.
 */
@ExtendWith(MockitoExtension.class)
class RuleEngineServiceTest {

        @Mock
        private TreatmentLookupService treatmentLookupService;
        @Mock
        private DrugInteractionRepository drugInteractionRepository;
        @Mock
        private TreatmentWeatherConditionRepository weatherConditionRepository;

        private RuleEngineService ruleEngineService;

        private Ingredient ingredientA;
        private Ingredient ingredientB;
        private Disease diseaseA;
        private Disease diseaseB;
        private TreatmentPlan planA;
        private TreatmentPlan planB;

        @BeforeEach
        void setUp() {
                // Wire the real sub-components, only mock repositories
                DrugInteractionChecker drugInteractionChecker = new DrugInteractionChecker(drugInteractionRepository);
                WeatherAlertEvaluator weatherAlertEvaluator = new WeatherAlertEvaluator(weatherConditionRepository);
                SprayProgramBuilder sprayProgramBuilder = new SprayProgramBuilder(drugInteractionChecker);
                TreatmentSelector treatmentSelector = new TreatmentSelector();

                ruleEngineService = new RuleEngineService(
                                treatmentLookupService,
                                treatmentSelector,
                                drugInteractionChecker,
                                weatherAlertEvaluator,
                                sprayProgramBuilder);

                ingredientA = Ingredient.builder().id(1).ingredientName("Tricyclazole")
                                .description("Hoat chat tri dao on").build();
                ingredientB = Ingredient.builder().id(2).ingredientName("Validamycin")
                                .description("Hoat chat tri kho van").build();
                diseaseA = Disease.builder().id(10).diseaseName("Dao on").build();
                diseaseB = Disease.builder().id(20).diseaseName("Kho van").build();

                planA = TreatmentPlan.builder()
                                .id(100).disease(diseaseA).ingredient(ingredientA)
                                .treatmentName("Phun Filia").drugName("Filia 525SE")
                                .dosage("25ml/binh 16L")
                                .dosagePerHaValue(new BigDecimal("1.5")).dosagePerHaUnit("L")
                                .waterVolumePerHa("400-500 L/ha")
                                .applicationMethod("Phun deu mat la")
                                .applicationTime("Sang som")
                                .frequency("7 ngay/lan")
                                .safetyNotes("Doi 14 ngay truoc thu hoach")
                                .build();

                planB = TreatmentPlan.builder()
                                .id(101).disease(diseaseB).ingredient(ingredientB)
                                .treatmentName("Phun Validacin").drugName("Validacin 5L")
                                .dosage("30ml/binh 16L")
                                .build();
        }

        @Test
        @DisplayName("TC1: Null disease IDs returns empty result")
        void process_nullDiseaseIds_returnsEmpty() {
                RuleEngineService.RuleEngineResult result = ruleEngineService.process(null, null);
                assertTrue(result.treatments().isEmpty());
                assertTrue(result.sprayPrograms().isEmpty());
                assertEquals("NO_TREATMENT", result.strategy());
        }

        @Test
        @DisplayName("TC2: Empty disease IDs returns empty result")
        void process_emptyDiseaseIds_returnsEmpty() {
                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(), null);
                assertTrue(result.treatments().isEmpty());
                assertEquals("NO_TREATMENT", result.strategy());
        }

        @Test
        @DisplayName("TC3: Single disease produces DEFAULT_PRIORITY reason")
        void process_singleDisease_defaultPriority() {
                when(treatmentLookupService.findByDiseaseId(10)).thenReturn(List.of(planA));

                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(10), null);

                assertEquals(1, result.sprayPrograms().size());
                assertEquals("SINGLE_DISEASE_OR_SAFE_MIX", result.strategy());
                TreatmentProgramDTO program = result.sprayPrograms().get(0);
                assertTrue(program.getReasons().contains("DEFAULT_PRIORITY"));
                assertEquals("READY", program.getStatus());
                assertNull(program.getIntervalDays());
        }

        @Test
        @DisplayName("TC4: Drug interaction splits into separate spray programs")
        void process_withDrugInteraction_separatePrograms() {
                when(treatmentLookupService.findByDiseaseId(10)).thenReturn(List.of(planA));
                when(treatmentLookupService.findByDiseaseId(20)).thenReturn(List.of(planB));

                DrugInteraction interaction = DrugInteraction.builder()
                                .ingredientA(ingredientA).ingredientB(ingredientB)
                                .warningMessage("Khong duoc pha chung")
                                .actionRule("SEPARATE_SPRAY")
                                .interactionType("CONFLICT").severity("HIGH")
                                .intervalDays(5)
                                .build();
                when(drugInteractionRepository.findInteractionsBetweenIngredients(anyList()))
                                .thenReturn(List.of(interaction));

                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(10, 20), null);

                assertEquals("SEPARATE_SPRAY", result.strategy());
                assertEquals(2, result.sprayPrograms().size());
                assertFalse(result.interactionWarnings().isEmpty());

                TreatmentProgramDTO prog1 = result.sprayPrograms().get(0);
                assertTrue(prog1.getReasons().contains("CONFLICT_SEPARATED"));
                assertNull(prog1.getIntervalDays());

                TreatmentProgramDTO prog2 = result.sprayPrograms().get(1);
                assertEquals(5, prog2.getIntervalDays());

                InteractionWarningDTO warning = result.interactionWarnings().get(0);
                assertEquals("Tricyclazole", warning.getIngredientAName());
                assertEquals("Validamycin", warning.getIngredientBName());
                assertTrue(warning.getBlocksMixing());
        }

        @Test
        @DisplayName("TC5: No drug interaction → single mix program with MIX_COMPATIBLE")
        void process_withoutDrugInteraction_singleMixProgram() {
                when(treatmentLookupService.findByDiseaseId(10)).thenReturn(List.of(planA));
                when(treatmentLookupService.findByDiseaseId(20)).thenReturn(List.of(planB));
                when(drugInteractionRepository.findInteractionsBetweenIngredients(anyList())).thenReturn(List.of());

                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(10, 20),
                                WeatherDTO.builder().build());

                assertEquals(1, result.sprayPrograms().size());
                assertTrue(result.interactionWarnings().isEmpty());
                assertTrue(result.sprayPrograms().get(0).getMixAllowed());
                assertTrue(result.sprayPrograms().get(0).getReasons().contains("MIX_COMPATIBLE"));
        }

        @Test
        @DisplayName("TC6: TreatmentDTO maps all fields correctly")
        void process_mapsNewFieldsCorrectly() {
                when(treatmentLookupService.findByDiseaseId(10)).thenReturn(List.of(planA));

                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(10), null);

                TreatmentDTO t = result.treatments().get(0);
                assertEquals("Tricyclazole", t.getIngredientName());
                assertEquals("Hoat chat tri dao on", t.getIngredientDescription());
                assertEquals(new BigDecimal("1.5"), t.getDosagePerHaValue());
                assertEquals("L", t.getDosagePerHaUnit());
                assertEquals("400-500 L/ha", t.getWaterVolumePerHa());
                assertEquals("Phun deu mat la", t.getApplicationMethod());
                assertEquals("Sang som", t.getApplicationTime());
                assertEquals("7 ngay/lan", t.getFrequency());
                assertEquals("Doi 14 ngay truoc thu hoach", t.getSafetyNotes());
                assertEquals("Filia 525SE", t.getDrugName());
        }

        @Test
        @DisplayName("TC7: Weather alert outside range is marked as violated")
        void process_weatherAlert_violatedWhenOutsideRange() {
                when(treatmentLookupService.findByDiseaseId(10)).thenReturn(List.of(planA));

                TreatmentWeatherCondition condition = TreatmentWeatherCondition.builder()
                                .id(500).treatmentplan(planA)
                                .weatherFactor(WeatherFactor.TEMPERATURE)
                                .operator(Operator.BETWEEN)
                                .minValue(new BigDecimal("20")).maxValue(new BigDecimal("30"))
                                .unit("°C").isRequired(true)
                                .recommendationNote("Nhiet do ly tuong de phun thuoc")
                                .build();

                when(weatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse(anyList()))
                                .thenReturn(List.of(condition));

                WeatherDTO weather = WeatherDTO.builder().temperature(35.0).build();
                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(10), weather);

                assertFalse(result.weatherAlerts().isEmpty());
                WeatherAlertDTO alert = result.weatherAlerts().get(0);
                assertEquals("°C", alert.getUnit());
                assertEquals("TEMPERATURE", alert.getWeatherFactor());
                assertEquals(35.0, alert.getActualValue());
                assertTrue(alert.getViolated());
                assertTrue(alert.getRequired());
                assertEquals("Nhiet do ly tuong de phun thuoc", alert.getRecommendationNote());
        }

        @Test
        @DisplayName("TC8: Weather within range is not violated")
        void process_weatherWithinRange_notViolated() {
                when(treatmentLookupService.findByDiseaseId(10)).thenReturn(List.of(planA));

                TreatmentWeatherCondition condition = TreatmentWeatherCondition.builder()
                                .id(500).treatmentplan(planA)
                                .weatherFactor(WeatherFactor.HUMIDITY)
                                .operator(Operator.BETWEEN)
                                .minValue(new BigDecimal("60")).maxValue(new BigDecimal("90"))
                                .unit("%").isRequired(false)
                                .build();

                when(weatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse(anyList()))
                                .thenReturn(List.of(condition));

                WeatherDTO weather = WeatherDTO.builder().humidity(75.0).build();
                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(10), weather);

                assertFalse(result.weatherAlerts().isEmpty());
                assertFalse(result.weatherAlerts().get(0).getViolated());
        }

        @Test
        @DisplayName("TC9: Required weather violation produces WEATHER_BLOCKED status")
        void process_requiredWeatherViolation_weatherBlockedStatus() {
                when(treatmentLookupService.findByDiseaseId(10)).thenReturn(List.of(planA));

                TreatmentWeatherCondition condition = TreatmentWeatherCondition.builder()
                                .id(500).treatmentplan(planA)
                                .weatherFactor(WeatherFactor.RAINFALL)
                                .operator(Operator.LESS_THAN)
                                .minValue(new BigDecimal("5"))
                                .unit("mm").isRequired(true)
                                .build();

                when(weatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse(anyList()))
                                .thenReturn(List.of(condition));

                WeatherDTO weather = WeatherDTO.builder().rainfall(10.0).build(); // 10mm >= 5mm → violated
                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(10), weather);

                TreatmentProgramDTO program = result.sprayPrograms().get(0);
                assertTrue(program.getReasons().contains("WEATHER_BLOCKED"));
                assertEquals("BLOCKED_BY_WEATHER", program.getStatus());
        }

        @Test
        @DisplayName("TC10: Warnings list is always empty — use interactionWarnings DTO instead")
        void process_warningsListIsEmpty() {
                when(treatmentLookupService.findByDiseaseId(10)).thenReturn(List.of(planA));
                when(treatmentLookupService.findByDiseaseId(20)).thenReturn(List.of(planB));

                DrugInteraction interaction = DrugInteraction.builder()
                                .ingredientA(ingredientA).ingredientB(ingredientB)
                                .warningMessage("Conflict").actionRule("SEPARATE_SPRAY")
                                .interactionType("CONFLICT").severity("HIGH")
                                .build();
                when(drugInteractionRepository.findInteractionsBetweenIngredients(anyList()))
                                .thenReturn(List.of(interaction));

                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(10, 20), null);

                assertTrue(result.warnings().isEmpty());
                assertFalse(result.interactionWarnings().isEmpty());
        }
}
