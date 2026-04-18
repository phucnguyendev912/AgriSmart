package com.phucnguyen.agriai.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentProgramDTO {
    private Integer programOrder;
    private String programCode;
    private String strategy;
    private String status;
    private Boolean mixAllowed;
    private List<String> diseaseNames;
    private List<String> reasons;
    private List<String> warnings;
    private List<TreatmentDTO> treatments;
    private Integer intervalDays; // Số ngày cách nhau với đợt phun trước (chỉ có khi CONFLICT_SEPARATED)
}
