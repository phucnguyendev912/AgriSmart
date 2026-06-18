package com.phucnguyen.agriai.module.weather.service;

import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;
import com.phucnguyen.agriai.module.weather.dto.response.WeatherDiseaseRiskResponse;
import com.phucnguyen.agriai.infrastructure.exception.AppException;
import com.phucnguyen.agriai.module.weather.port.WeatherPort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class WeatherDiseaseRiskService {

    private final WeatherPort weatherPort;
    private final DiseaseWeatherRiskEvaluator diseaseWeatherRiskEvaluator;

    public WeatherDiseaseRiskResponse getDiseaseRisks(Double latitude, Double longitude) {
        WeatherDTO weather = weatherPort.getCurrentWeather(latitude, longitude);
        if (weather == null) {
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "Khong the tai du lieu thoi tiet.");
        }

        return WeatherDiseaseRiskResponse.builder()
                .weather(weather)
                .diseaseWeatherRisks(diseaseWeatherRiskEvaluator.evaluateAll(weather))
                .build();
    }
}
