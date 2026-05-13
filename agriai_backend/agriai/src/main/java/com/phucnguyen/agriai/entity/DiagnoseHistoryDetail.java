package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import com.phucnguyen.agriai.enums.SeverityLevel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;

@Entity
@Table(name = "DiagnoseHistoryDetail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DiagnoseHistoryDetail extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnosehistoryId")
    private DiagnoseHistory diagnoseHistory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diseaseId")
    private Disease disease;

    @Column(name = "confidenceScore", precision = 5, scale = 4)
    private BigDecimal confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "severityLevel")
    private SeverityLevel severity;

    @Column(name = "riskWarning", length = 255)
    private String riskWarning;

    @Column(name = "treatmentData", columnDefinition = "TEXT")
    private String treatmentData;

    @Column(name = "cultivationData", columnDefinition = "TEXT")
    private String cultivationData;
}
