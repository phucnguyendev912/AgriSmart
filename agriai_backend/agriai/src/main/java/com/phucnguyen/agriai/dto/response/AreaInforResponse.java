package com.phucnguyen.agriai.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AreaInforResponse {
    private Integer id;
    private String areaName;
    private String province;
    private String address;
    private Double area;
    private String description;
    private Double latitude;
    private Double longitude;
}
