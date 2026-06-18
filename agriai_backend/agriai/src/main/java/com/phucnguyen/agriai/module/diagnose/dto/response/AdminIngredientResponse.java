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
public class AdminIngredientResponse {
    private Integer id;
    private String ingredientName;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
