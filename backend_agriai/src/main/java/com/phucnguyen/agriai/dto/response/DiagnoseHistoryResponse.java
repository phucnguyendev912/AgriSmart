package com.phucnguyen.agriai.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DiagnoseHistoryResponse {
    private Integer id;
    private String originalImageUrl;
    private String status;
    private String cropName;
    private String areaName;
    private LocalDateTime createdAt;
}
