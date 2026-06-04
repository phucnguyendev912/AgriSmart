package com.phucnguyen.agriai.dto.response.admin;

import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.enums.WeatherFactor;
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
