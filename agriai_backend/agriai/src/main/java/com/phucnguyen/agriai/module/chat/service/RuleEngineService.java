package com.phucnguyen.agriai.module.chat.service;
import com.phucnguyen.agriai.module.weather.dto.DiseaseWeatherRiskDTO;
import com.phucnguyen.agriai.module.diagnose.service.DrugInteractionChecker;
import com.phucnguyen.agriai.module.diagnose.service.TreatmentLookupService;
import com.phucnguyen.agriai.module.diagnose.service.TreatmentRankingService;
import com.phucnguyen.agriai.module.weather.service.DiseaseWeatherRiskEvaluator;

import com.phucnguyen.agriai.module.weather.dto.DiseaseWeatherRiskDTO;
import com.phucnguyen.agriai.module.diagnose.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.module.diagnose.dto.TreatmentDTO;
import com.phucnguyen.agriai.module.diagnose.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;
import com.phucnguyen.agriai.module.diagnose.dto.DiseaseContextDTO;
import com.phucnguyen.agriai.module.diagnose.entity.TreatmentPlan;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RuleEngineService {

        private final TreatmentLookupService treatmentLookupService;
        private final TreatmentRankingService treatmentRankingService;
        private final DrugInteractionChecker drugInteractionChecker;
        private final DiseaseWeatherRiskEvaluator diseaseWeatherRiskEvaluator;

        public RuleEngineResult process(List<DiseaseContextDTO> diseases, WeatherDTO weather) {
                if (diseases == null || diseases.isEmpty()) {
                        return RuleEngineResult.empty();
                }

                List<Integer> diseaseIds = diseases.stream().map(DiseaseContextDTO::diseaseId).toList();

                Map<Integer, List<TreatmentPlan>> plansByDisease = treatmentLookupService
                                .findByDiseaseIds(diseaseIds);

                if (plansByDisease.isEmpty()) {
                        List<DiseaseWeatherRiskDTO> weatherRisks = diseaseWeatherRiskEvaluator
                                        .evaluate(diseaseIds, weather);
                        return new RuleEngineResult(
                                        List.of(), List.of(), List.of(), List.of(), List.of(),
                                        weatherRisks, false, null);
                }

                List<TreatmentPlan> allPlans = new ArrayList<>();
                for (List<TreatmentPlan> plans : plansByDisease.values()) {
                        allPlans.addAll(plans);
                }

                List<TreatmentDTO> rankedTreatments = treatmentRankingService.rankPlans(plansByDisease, diseases, weather);

                DrugInteractionChecker.InteractionResult interactionResult = drugInteractionChecker
                                .checkRecommendedPlans(rankedTreatments, allPlans);
                List<DiseaseWeatherRiskDTO> weatherRisks = diseaseWeatherRiskEvaluator
                                .evaluate(diseaseIds, weather);

                return new RuleEngineResult(
                                rankedTreatments,
                                List.of(),
                                List.of(),
                                interactionResult.warnings(),
                                List.of(),
                                weatherRisks,
                                interactionResult.hasWarning(),
                                interactionResult.summary());
        }

        public record RuleEngineResult(
                        List<TreatmentDTO> treatments,
                        List<String> warnings,
                        List<TreatmentProgramDTO> sprayPrograms,
                        List<InteractionWarningDTO> interactionWarnings,
                        List<WeatherAlertDTO> weatherAlerts,
                        List<DiseaseWeatherRiskDTO> diseaseWeatherRisks,
                        boolean hasInteractionWarning,
                        String interactionSummary) {
                public static RuleEngineResult empty() {
                        return new RuleEngineResult(
                                        List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false, null);
                }
        }
}
