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
public class WeatherAlertDTO {
    private Integer treatmentPlanId;
    private String treatmentName;
    private String weatherFactor;
    private String operator;
    private Double actualValue;
    private Double minValue;
    private Double maxValue;
    private Boolean required;
    private Boolean violated;
    private String recommendationNote;
    private String unit;
}
