package com.phucnguyen.agriai.module.diagnose.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminCreateIngredientRequest {

    @NotBlank(message = "Tên hoạt chất không được để trống")
    @Size(max = 255, message = "Tên hoạt chất không được vượt quá 255 ký tự")
    private String ingredientName;

    private String description;
}
