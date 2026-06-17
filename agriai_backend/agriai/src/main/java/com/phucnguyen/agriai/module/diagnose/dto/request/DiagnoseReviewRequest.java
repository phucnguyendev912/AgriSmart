package com.phucnguyen.agriai.module.diagnose.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class DiagnoseReviewRequest {
    private Integer historyId;

    @JsonProperty("isAccurate")
    private Boolean isAccurate;

    private Integer rating;

    private String feedback;
}
