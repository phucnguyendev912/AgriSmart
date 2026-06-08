package com.phucnguyen.agriai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseWeatherRiskDTO { // DTO để chứa thông tin về nguy cơ bệnh
    private Integer diseaseId;
    private String diseaseCode;
    private String diseaseName;
    private String conditionGroup;
    private List<String> matchedConditions;
    private String recommendationNotes;
    private String diseaseDescription;
    private String symptoms;
}
