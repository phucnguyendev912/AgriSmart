package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.enums.WeatherFactor;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.envers.Audited;
import java.math.BigDecimal;

@Entity
@Table(name = "disease_weather_condition")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DiseaseWeatherCondition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    private Disease disease;

    // nhóm điều kiện AND — tất cả row cùng group phải match
    @Column(name = "condition_group", length = 50, nullable = false)
    private String conditionGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "weather_factor", nullable = false)
    private WeatherFactor weatherFactor;

    @Enumerated(EnumType.STRING)
    @Column(name = "operator", nullable = false)
    private Operator operator;

    @Column(name = "min_value", precision = 8, scale = 2)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 8, scale = 2)
    private BigDecimal maxValue;

    @Column(name = "recommendation_note", length = 255)
    private String recommendationNote;  

    @Column(name = "unit", length = 20)
    private String unit; // °C, %, mm, m/s

    @Column(name = "is_active")
    private Boolean isActive;
}
