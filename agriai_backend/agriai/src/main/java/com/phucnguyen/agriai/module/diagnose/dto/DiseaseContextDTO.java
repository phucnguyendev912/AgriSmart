package com.phucnguyen.agriai.module.diagnose.dto;

public record DiseaseContextDTO(
        Integer diseaseId,
        String diseaseName,
        String severity,
        Double confidence) {
}
