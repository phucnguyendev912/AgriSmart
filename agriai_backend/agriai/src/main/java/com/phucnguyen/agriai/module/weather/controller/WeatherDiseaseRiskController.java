package com.phucnguyen.agriai.module.weather.controller;

import com.phucnguyen.agriai.module.weather.dto.response.WeatherDiseaseRiskResponse;
import com.phucnguyen.agriai.module.weather.service.WeatherDiseaseRiskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherDiseaseRiskController {

    private final WeatherDiseaseRiskService weatherDiseaseRiskService;

    @GetMapping("/disease-risks")
    public ResponseEntity<WeatherDiseaseRiskResponse> getDiseaseRisks(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        return ResponseEntity.ok(weatherDiseaseRiskService.getDiseaseRisks(latitude, longitude));
    }
}
