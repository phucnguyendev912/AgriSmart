package com.phucnguyen.agriai.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class AdminUpdateDrugRequest {

    @NotBlank(message = "Tên thuốc không được để trống")
    @Size(max = 150, message = "Tên thuốc không được vượt quá 150 ký tự")
    private String drugName;

    @Size(max = 20, message = "Dạng thuốc không được vượt quá 20 ký tự")
    private String formulation;

    @Size(max = 150, message = "Nhà sản xuất không được vượt quá 150 ký tự")
    private String manufacturer;

    @NotNull(message = "Trạng thái hoạt động không được để trống")
    private Boolean isActive;

    private List<DrugIngredientRequest> ingredients;

    @Data
    public static class DrugIngredientRequest {
        @NotNull(message = "ID hoạt chất không được để trống")
        private Integer ingredientId;

        private BigDecimal concentrationValue;
        private String concentrationUnit;
    }
}
