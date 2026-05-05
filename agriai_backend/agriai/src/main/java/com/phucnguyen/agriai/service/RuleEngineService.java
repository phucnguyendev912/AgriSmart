package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RuleEngineService {

    private final TreatmentLookupService treatmentLookupService;
    private final TreatmentSelector treatmentSelector;
    private final DrugInteractionChecker drugInteractionChecker;
    private final WeatherAlertEvaluator weatherAlertEvaluator;
    private final SprayProgramBuilder sprayProgramBuilder;

    public RuleEngineResult process(List<Integer> diseaseIds, WeatherDTO weather) {
        if (diseaseIds == null || diseaseIds.isEmpty()) {
            return RuleEngineResult.empty();
        }
        // get treatment plans by disease ids via TreatmentLookupService
        Map<Integer, List<TreatmentPlan>> plansByDisease = new LinkedHashMap<>();
        for (Integer diseaseId : diseaseIds) {
            List<TreatmentPlan> plans = treatmentLookupService.findByDiseaseId(diseaseId);
            if (!plans.isEmpty()) {
                plansByDisease.put(diseaseId, plans);
            }
        }

        List<TreatmentPlan> selectedPlans = plansByDisease.values().stream()
                .map(treatmentSelector::selectPrimaryPlan)
                .filter(Objects::nonNull)
                .toList();

        List<InteractionWarningDTO> interactionWarnings = drugInteractionChecker
                .buildInteractionWarnings(selectedPlans);
        Map<Integer, List<WeatherAlertDTO>> weatherAlertsByPlan = weatherAlertEvaluator
                .buildWeatherAlerts(selectedPlans, weather);
        List<WeatherAlertDTO> weatherAlerts = weatherAlertsByPlan.values().stream()
                .flatMap(List::stream)
                .toList();
        // building spray program
        List<TreatmentProgramDTO> programs = sprayProgramBuilder.buildPrograms(selectedPlans, interactionWarnings,
                weatherAlertsByPlan);
        // flat list of treatments
        List<TreatmentDTO> flatTreatments = programs.stream()
                .flatMap(program -> program.getTreatments().stream())
                .toList();
        // building strategy
        String strategy = sprayProgramBuilder.deriveStrategy(programs, interactionWarnings);
        return new RuleEngineResult(flatTreatments, List.of(), programs, interactionWarnings, weatherAlerts, strategy);
    }

    public record RuleEngineResult(
            List<TreatmentDTO> treatments,
            List<String> warnings,
            List<TreatmentProgramDTO> sprayPrograms,
            List<InteractionWarningDTO> interactionWarnings,
            List<WeatherAlertDTO> weatherAlerts,
            String strategy) {
        static RuleEngineResult empty() {
            return new RuleEngineResult(List.of(), List.of(), List.of(), List.of(), List.of(), "NO_TREATMENT");
        }
    }
}
