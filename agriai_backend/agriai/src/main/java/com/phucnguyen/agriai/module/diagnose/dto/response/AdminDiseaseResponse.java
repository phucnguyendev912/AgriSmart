package com.phucnguyen.agriai.module.diagnose.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDiseaseResponse {
    private Integer id;
    private Integer cropTypeId;
    private String cropTypeName;
    private String diseaseName;
    private String diseaseNameEn;
    private String diseaseCode;
    private String description;
    private String symptoms;
    private LocalDateTime createdAt;
}
