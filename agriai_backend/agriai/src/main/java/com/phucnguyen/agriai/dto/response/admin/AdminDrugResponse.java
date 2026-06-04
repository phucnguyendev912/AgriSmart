package com.phucnguyen.agriai.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDrugResponse {
    private Integer id;
    private String drugName;
    private String formulation;
    private String manufacturer;
    private Boolean isActive;
    private List<DrugIngredientResponse> ingredients;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DrugIngredientResponse {
        private Integer id; // ID of the DrugIngredient record
        private Integer ingredientId;
        private String ingredientName;
        private BigDecimal concentrationValue;
        private String concentrationUnit;
        private String rawConcentration;
    }
}
