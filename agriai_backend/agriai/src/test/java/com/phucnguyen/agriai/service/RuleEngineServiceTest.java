package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseWeatherRiskDTO;
import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.DiseaseContextDTO;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RuleEngineServiceTest {

        @Mock
        private TreatmentLookupService treatmentLookupService;

        @Mock
        private TreatmentRankingService treatmentRankingService;

        @Mock
        private DrugInteractionChecker drugInteractionChecker;

        @Mock
        private DiseaseWeatherRiskEvaluator diseaseWeatherRiskEvaluator;

        @Test
        void process_returnsRankedTreatmentsAndNewContractFields() {
                List<DiseaseContextDTO> diseases = List.of(new DiseaseContextDTO(1, "Dao on", null, null),
                                new DiseaseContextDTO(2, "Bac la", null, null));
                List<Integer> diseaseIds = List.of(1, 2);
                WeatherDTO weather = WeatherDTO.builder().temperature(25.0).humidity(90.0).build();
                TreatmentPlan planA = TreatmentPlan.builder().id(10).build();
                TreatmentPlan planB = TreatmentPlan.builder().id(20).build();
                List<TreatmentDTO> rankedTreatments = List.of(
                                TreatmentDTO.builder().treatmentPlanId(10).recommended(true).build(),
                                TreatmentDTO.builder().treatmentPlanId(20).recommended(true).build());
                List<InteractionWarningDTO> interactionWarnings = List.of(
                                InteractionWarningDTO.builder().ingredientAId(1).ingredientBId(2).build());
                List<DiseaseWeatherRiskDTO> weatherRisks = List.of(
                                DiseaseWeatherRiskDTO.builder().diseaseId(1).diseaseName("Dao on").build());
                Map<Integer, List<TreatmentPlan>> plansByDisease = new LinkedHashMap<>();
                plansByDisease.put(1, List.of(planA));
                plansByDisease.put(2, List.of(planB));

                when(treatmentLookupService.findByDiseaseIds(diseaseIds)).thenReturn(plansByDisease);
                when(treatmentRankingService.rankPlans(plansByDisease, diseases, weather)).thenReturn(rankedTreatments);
                when(drugInteractionChecker.checkRecommendedPlans(rankedTreatments, List.of(planA, planB)))
                                .thenReturn(new DrugInteractionChecker.InteractionResult(interactionWarnings, true,
                                                "Co canh bao"));
                when(diseaseWeatherRiskEvaluator.evaluate(diseaseIds, weather)).thenReturn(weatherRisks);

                RuleEngineService service = new RuleEngineService(
                                treatmentLookupService,
                                treatmentRankingService,
                                drugInteractionChecker,
                                diseaseWeatherRiskEvaluator);

                RuleEngineService.RuleEngineResult result = service.process(diseases, weather);

                assertEquals(rankedTreatments, result.treatments());
                assertEquals(interactionWarnings, result.interactionWarnings());
                assertEquals(weatherRisks, result.diseaseWeatherRisks());
                assertTrue(result.hasInteractionWarning());
                assertEquals("Co canh bao", result.interactionSummary());
                assertTrue(result.sprayPrograms().isEmpty());
                assertTrue(result.weatherAlerts().isEmpty());
        }

        @Test
        void process_whenNoPlans_stillEvaluatesDiseaseWeatherRisk() {
                List<DiseaseContextDTO> diseases = List.of(new DiseaseContextDTO(1, "Dao on", null, null));
                List<Integer> diseaseIds = List.of(1);
                WeatherDTO weather = WeatherDTO.builder().temperature(25.0).build();
                List<DiseaseWeatherRiskDTO> weatherRisks = List.of(
                                DiseaseWeatherRiskDTO.builder().diseaseId(1).build());

                when(treatmentLookupService.findByDiseaseIds(diseaseIds)).thenReturn(Map.of());
                when(diseaseWeatherRiskEvaluator.evaluate(diseaseIds, weather)).thenReturn(weatherRisks);

                RuleEngineService service = new RuleEngineService(
                                treatmentLookupService,
                                treatmentRankingService,
                                drugInteractionChecker,
                                diseaseWeatherRiskEvaluator);

                RuleEngineService.RuleEngineResult result = service.process(diseases, weather);

                assertTrue(result.treatments().isEmpty());
                assertEquals(weatherRisks, result.diseaseWeatherRisks());
                assertFalse(result.hasInteractionWarning());
                verifyNoInteractions(treatmentRankingService, drugInteractionChecker);
        }

        @Test
        void process_whenDiseaseIdsEmpty_returnsEmptyResult() {
                RuleEngineService service = new RuleEngineService(
                                treatmentLookupService,
                                treatmentRankingService,
                                drugInteractionChecker,
                                diseaseWeatherRiskEvaluator);

                RuleEngineService.RuleEngineResult result = service.process(List.of(), WeatherDTO.builder().build());

                assertTrue(result.treatments().isEmpty());
                assertTrue(result.diseaseWeatherRisks().isEmpty());
                verifyNoInteractions(treatmentLookupService, treatmentRankingService, drugInteractionChecker,
                                diseaseWeatherRiskEvaluator);
        }
}
