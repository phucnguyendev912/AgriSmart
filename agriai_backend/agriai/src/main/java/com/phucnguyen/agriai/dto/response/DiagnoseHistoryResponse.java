package com.phucnguyen.agriai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnoseHistoryResponse {
    private Integer id;
    private LocalDateTime createdAt;
    private String originalImageUrl;
    private String cropName;
    private String diseaseName;
    private Double confidence;
    private String severity;
    private String status;
    private String diagnosisType;
}
