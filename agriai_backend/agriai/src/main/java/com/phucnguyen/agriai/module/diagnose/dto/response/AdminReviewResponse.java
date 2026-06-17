package com.phucnguyen.agriai.module.diagnose.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewResponse {
    private Integer id;
    private Integer historyId;
    private Integer userId;
    private String userFullName;
    private Boolean accurate;
    private Integer rating;
    private String feedback;
    private LocalDateTime createdAt;
}
