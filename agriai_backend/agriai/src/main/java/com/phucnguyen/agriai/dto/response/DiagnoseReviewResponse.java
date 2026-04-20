package com.phucnguyen.agriai.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO trả về thông tin đánh giá của một lần chẩn đoán.
 */
@Data
@Builder
public class DiagnoseReviewResponse {
    private Integer id;
    private Integer historyId;
    private Boolean isAccurate;
    private Integer rating;
    private String feedback;
    private LocalDateTime createdAt;
}
