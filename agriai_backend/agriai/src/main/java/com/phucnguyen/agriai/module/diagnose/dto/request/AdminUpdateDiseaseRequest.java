package com.phucnguyen.agriai.module.diagnose.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUpdateDiseaseRequest {

    @NotNull(message = "Loại cây trồng không được để trống")
    private Integer cropTypeId;

    @NotBlank(message = "Tên bệnh không được để trống")
    private String diseaseName;

    private String diseaseNameEn;

    @NotBlank(message = "Mã bệnh không được để trống")
    private String diseaseCode;

    private String description;

    private String symptoms;
}
