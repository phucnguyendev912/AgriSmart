package com.phucnguyen.agriai.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.phucnguyen.agriai.enums.DosageType;
import java.math.BigDecimal;

@Data
public class AdminCreateTreatmentPlanRequest {

    @NotNull(message = "Bệnh điều trị không được để trống")
    private Integer diseaseId;

    @NotBlank(message = "Tên phác đồ không được để trống")
    private String treatmentName;

    private Integer drugId;

    @NotNull(message = "Loại liều lượng không được để trống")
    private DosageType dosageType;

    private BigDecimal dosageValueMin;
    private BigDecimal dosageValueMax;
    private String dosageUnit;

    private BigDecimal dosageAreaValue;
    private String dosageAreaUnit;

    private String mixingInstruction;

    private BigDecimal waterVolumeMin;
    private BigDecimal waterVolumeMax;
    private String waterVolumeUnit;

    private Short sprayTimes;
    private String sprayInterval;

    private String applicationMethod;
    private String applicationTime;

    private String safetyNotes;

    private String description;
}
