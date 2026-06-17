package com.phucnguyen.agriai.module.weather.dto.response;
import com.phucnguyen.agriai.module.weather.dto.DiseaseWeatherRiskDTO;
import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;
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
public class WeatherDiseaseRiskResponse {
    private WeatherDTO weather;

    @Builder.Default
    private List<DiseaseWeatherRiskDTO> diseaseWeatherRisks = new ArrayList<>();
}
