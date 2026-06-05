package com.phucnguyen.agriai.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminCreateDrugInteractionRequest {

    @NotNull(message = "Hoạt chất A không được để trống")
    private Integer ingredientAId;

    @NotNull(message = "Hoạt chất B không được để trống")
    private Integer ingredientBId;

    @NotBlank(message = "Loại tương tác không được để trống")
    @Size(max = 50, message = "Loại tương tác không được vượt quá 50 ký tự")
    private String interactionType;

    @NotBlank(message = "Mức độ nghiêm trọng không được để trống")
    @Size(max = 50, message = "Mức độ không được vượt quá 50 ký tự")
    private String severity;

    @NotBlank(message = "Thông báo cảnh báo không được để trống")
    private String warningMessage;

    @Size(max = 50, message = "Quy tắc xử lý không được vượt quá 50 ký tự")
    private String actionRule;

    private Integer intervalDays;
}
