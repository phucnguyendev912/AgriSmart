package com.phucnguyen.agriai.dto;

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
