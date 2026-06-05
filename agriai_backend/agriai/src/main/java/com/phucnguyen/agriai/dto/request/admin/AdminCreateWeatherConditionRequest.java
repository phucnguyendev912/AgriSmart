package com.phucnguyen.agriai.dto.request.admin;

import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.enums.WeatherFactor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AdminCreateWeatherConditionRequest {

    @NotNull(message = "Bệnh không được để trống")
    private Integer diseaseId;

    @NotBlank(message = "Nhóm điều kiện không được để trống")
    @Size(max = 50, message = "Nhóm điều kiện không được vượt quá 50 ký tự")
    private String conditionGroup;

    @NotNull(message = "Yếu tố thời tiết không được để trống")
    private WeatherFactor weatherFactor;

    @NotNull(message = "Toán tử không được để trống")
    private Operator operator;

    private BigDecimal minValue;

    private BigDecimal maxValue;

    @Size(max = 255, message = "Ghi chú không được vượt quá 255 ký tự")
    private String recommendationNote;

    @Size(max = 20, message = "Đơn vị không được vượt quá 20 ký tự")
    private String unit;

    private Boolean isActive = true;
}
