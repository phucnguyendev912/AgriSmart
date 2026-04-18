package com.phucnguyen.agriai.dto;

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
public class DiseaseResultDTO {
    private Integer diseaseId;
    private String diseaseCode;
    private String diseaseName;
    private Double confidence;
    private String severity;
    private Integer boxX;
    private Integer boxY;
    private Integer boxWidth;
    private Integer boxHeight;
}
