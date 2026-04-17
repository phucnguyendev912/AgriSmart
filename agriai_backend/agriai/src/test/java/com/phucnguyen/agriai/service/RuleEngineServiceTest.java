package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.*;
import com.phucnguyen.agriai.repository.DrugInteractionRepository;
import com.phucnguyen.agriai.repository.TreatmentPlanRepository;
import com.phucnguyen.agriai.repository.TreatmentWeatherConditionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RuleEngineServiceTest {

        @InjectMocks
        private RuleEngineService ruleEngineService;

        @Mock
        private TreatmentPlanRepository treatmentPlanRepository;
        @Mock
        private DrugInteractionRepository drugInteractionRepository;
        @Mock
        private TreatmentWeatherConditionRepository weatherConditionRepository;

        // ======================== TEST 7: Có xung đột hoạt chất
        // ========================
        @Test
        @DisplayName("TC7: Có xung đột hoạt chất → sinh cảnh báo")
        void process_withDrugInteraction_generatesWarning() {
                Ingredient ingA = new Ingredient();
                ingA.setId(1);
                ingA.setIngredientName("Tricyclazole");
                Ingredient ingB = new Ingredient();
                ingB.setId(2);
                ingB.setIngredientName("Validamycin");

                Disease d1 = new Disease();
                d1.setId(10);
                d1.setDiseaseName("Đạo Ôn");
                Disease d2 = new Disease();
                d2.setId(20);
                d2.setDiseaseName("Khô Vằn");

                TreatmentPlan tp1 = new TreatmentPlan();
                tp1.setId(101);
                tp1.setDisease(d1);
                tp1.setIngredient(ingA);
                tp1.setDrugName("Filia 525SE");
                tp1.setDosage("10ml");
                tp1.setTreatmentName("Phun Filia");

                TreatmentPlan tp2 = new TreatmentPlan();
                tp2.setId(102);
                tp2.setDisease(d2);
                tp2.setIngredient(ingB);
                tp2.setDrugName("Validacin 3SL");
                tp2.setDosage("15ml");
                tp2.setTreatmentName("Phun Validacin");

                when(treatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse(10))
                                .thenReturn(List.of(tp1));
                when(treatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse(20))
                                .thenReturn(List.of(tp2));

                DrugInteraction interaction = new DrugInteraction();
                interaction.setIngredientA(ingA);
                interaction.setIngredientB(ingB);
                interaction.setInteractionType("CONFLICT");
                interaction.setSeverity("HIGH");
                interaction.setWarningMessage("Không được pha chung");
                interaction.setActionRule("SEPARATE_SPRAY");

                when(drugInteractionRepository.findInteractionsBetweenIngredients(anyList()))
                                .thenReturn(List.of(interaction));

                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(10, 20), null);

                assertEquals(2, result.treatments().size());
                assertFalse(result.warnings().isEmpty());
                assertTrue(result.warnings().get(0).contains("Không được pha chung"));
        }

        // ======================== TEST 8: Không có xung đột ========================
        @Test
        @DisplayName("TC8: Không có xung đột hoạt chất → gộp phun")
        void process_noDrugInteraction_noWarnings() {
                Ingredient ing = new Ingredient();
                ing.setId(1);
                ing.setIngredientName("Tricyclazole");

                Disease d1 = new Disease();
                d1.setId(10);
                d1.setDiseaseName("Đạo Ôn");

                TreatmentPlan tp1 = new TreatmentPlan();
                tp1.setId(101);
                tp1.setDisease(d1);
                tp1.setIngredient(ing);
                tp1.setDrugName("Filia 525SE");
                tp1.setDosage("10ml");
                tp1.setTreatmentName("Phun Filia");

                when(treatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse(10))
                                .thenReturn(List.of(tp1));

                // Chỉ 1 bệnh → không check drugInteraction
                RuleEngineService.RuleEngineResult result = ruleEngineService.process(List.of(10), null);

                assertEquals(1, result.treatments().size());
                assertTrue(result.warnings().isEmpty());
        }
}
