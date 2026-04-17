package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.enums.WeatherFactor;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "TreatmentWeatherCondition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TreatmentWeatherCondition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatmentId")
    private TreatmentPlan treatmentplan;

    @Enumerated(EnumType.STRING)
    @Column(name = "weatherFactor")
    private WeatherFactor weatherFactor;

    @Enumerated(EnumType.STRING)
    @Column(name = "operator")
    private Operator operator;

    @Column(name = "minValue", precision = 10, scale = 2)
    private BigDecimal minValue;

    @Column(name = "maxValue", precision = 10, scale = 2)
    private BigDecimal maxValue;

    @Column(name = "recommendationNote", columnDefinition = "TEXT")
    private String recommendationNote;

    @Column(name = "unit", columnDefinition = "TEXT")
    private String unit;

    @Column(name = "isRequired")
    private Boolean isRequired;
}
