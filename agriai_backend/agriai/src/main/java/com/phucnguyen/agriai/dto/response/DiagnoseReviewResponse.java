package com.phucnguyen.agriai.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DiagnoseReviewResponse {
    private Integer id;
    private Integer historyId;
    private Boolean isAccurate;
    private Integer rating;
    private String feedback;
    private LocalDateTime createdAt;
    private String userName;
}
