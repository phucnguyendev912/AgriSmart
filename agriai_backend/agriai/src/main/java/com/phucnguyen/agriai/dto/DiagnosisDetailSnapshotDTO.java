package com.phucnguyen.agriai.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class DiagnosisDetailSnapshotDTO {
    private String diagnosisType;
    private List<TreatmentDTO> treatments;
    private List<TreatmentProgramDTO> sprayPrograms;
    private List<InteractionWarningDTO> interactionWarnings;
    private List<WeatherAlertDTO> weatherAlerts;
    private List<DiseaseWeatherRiskDTO> diseaseWeatherRisks;
    private List<String> warnings;
}
