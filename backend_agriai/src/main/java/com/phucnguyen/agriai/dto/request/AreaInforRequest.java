package com.phucnguyen.agriai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AreaInforRequest {
    @NotBlank
    private String areaName;

    private String province;

    private String address;

    private Double area;

    private String description;
}
