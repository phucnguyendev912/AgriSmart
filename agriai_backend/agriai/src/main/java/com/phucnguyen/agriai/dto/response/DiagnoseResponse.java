package com.phucnguyen.agriai.dto.response;

import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
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
    private String originalImageUrl;
    private String annotatedImageUrl;
    private WeatherDTO weather;
    private List<DiseaseResultDTO> diseases;
    private List<String> warnings;
    private List<TreatmentDTO> treatments;
    private List<String> cultivationMeasures;
    private String userGuidance;
    private Boolean isHealthy;
}
