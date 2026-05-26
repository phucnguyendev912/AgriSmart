package com.phucnguyen.agriai.dto;

public record DiseaseContextDTO(
        Integer diseaseId,
        String diseaseName,
        String severity,
        Double confidence) {
}
