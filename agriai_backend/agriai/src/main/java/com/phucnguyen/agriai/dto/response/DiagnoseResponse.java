package com.phucnguyen.agriai.dto.response;

import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.DiseaseWeatherRiskDTO;
import java.util.ArrayList;
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
public class DiagnoseResponse {
    private Integer id;
    private String originalImageUrl;
    private String annotatedImageUrl;
    private WeatherDTO weather;
    private List<DiseaseResultDTO> diseases;
    private List<String> warnings;
    private List<TreatmentDTO> treatments;

    @Builder.Default
    private List<TreatmentProgramDTO> sprayPrograms = new ArrayList<>();

    @Builder.Default
    private List<InteractionWarningDTO> interactionWarnings = new ArrayList<>();

    @Builder.Default
    private List<WeatherAlertDTO> weatherAlerts = new ArrayList<>();

    @Builder.Default
    private List<DiseaseWeatherRiskDTO> diseaseWeatherRisks = new ArrayList<>();

    private Boolean hasInteractionWarning;
    private String interactionSummary;

    private String userGuidance;
    private Boolean isHealthy;
    private Boolean gpsUsed;
    private String diagnosisType;
}
