package com.phucnguyen.agriai.module.disease_map.dto;

import java.time.LocalDateTime;

public record MapMarkerResponse(
                Integer detailId,
                Integer historyId,
                Double latitude,
                Double longitude,
                Integer diseaseId,
                String diseaseName,
                LocalDateTime diagnosedAt,
                String province) {
}
