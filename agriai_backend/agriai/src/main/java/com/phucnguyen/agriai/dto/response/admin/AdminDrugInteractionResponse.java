package com.phucnguyen.agriai.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDrugInteractionResponse {
    private Integer id;
    private Integer ingredientAId;
    private String ingredientAName;
    private Integer ingredientBId;
    private String ingredientBName;
    private String interactionType;
    private String severity;
    private String warningMessage;
    private String actionRule;
    private Integer intervalDays;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
