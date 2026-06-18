package com.phucnguyen.agriai.module.weather.dto;

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
public class WeatherDTO {
    private Double temperature;
    private Double humidity;
    private Double rainfall;
}
