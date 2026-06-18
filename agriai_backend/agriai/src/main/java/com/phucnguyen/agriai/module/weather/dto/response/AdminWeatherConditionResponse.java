package com.phucnguyen.agriai.module.weather.dto.response;

import com.phucnguyen.agriai.module.diagnose.enums.Operator;
import com.phucnguyen.agriai.module.weather.enums.WeatherFactor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminWeatherConditionResponse {
    private Integer id;
    private Integer diseaseId;
    private String diseaseName;
    private String conditionGroup;
    private WeatherFactor weatherFactor;
    private Operator operator;
    private BigDecimal minValue;
    private BigDecimal maxValue;
    private String unit;
    private String recommendationNote;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
