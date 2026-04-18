package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "drug_interaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DrugInteraction extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_a_id")
    private Ingredient ingredientA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_b_id")
    private Ingredient ingredientB;

    @Column(name = "interaction_type", length = 50)
    private String interactionType;

    @Column(name = "severity", length = 50)
    private String severity;

    @Column(name = "warning_message", columnDefinition = "TEXT")
    private String warningMessage;

    @Column(name = "action_rule", length = 50)
    private String actionRule;

    @Column(name = "interval_days")
    private Integer intervalDays; // Số ngày cần cách nhau khi phun riêng (VD: 3)
}
