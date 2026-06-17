package com.phucnguyen.agriai.module.crop.dto.response.admin;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCropTypeResponse {
    private Integer id;
    private String cropName;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
