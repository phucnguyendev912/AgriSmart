package com.phucnguyen.agriai.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisDetailSnapshotDTO {
    private String diagnosisType;
    private List<TreatmentDTO> treatments;
    private List<TreatmentProgramDTO> sprayPrograms;
    private List<InteractionWarningDTO> interactionWarnings;
    private List<WeatherAlertDTO> weatherAlerts;
    private List<String> warnings;
}
