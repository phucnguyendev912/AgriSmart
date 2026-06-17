package com.phucnguyen.agriai.module.diagnose.entity;

import com.phucnguyen.agriai.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "drug_interaction", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ingredient_a_id", "ingredient_b_id"})
})
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
    private Integer intervalDays; // Days interval required when spraying separately (e.g. 3)

    @PrePersist
    @PreUpdate
    public void validateAndNormalize() {
        if (ingredientA != null && ingredientB != null) {
            if (ingredientA.getId().equals(ingredientB.getId())) {
                throw new IllegalArgumentException("Hoạt chất không thể tương tác với chính nó");
            }
            // Swap if A > B to ensure consistent ordering (prevent A-B and B-A duplicates)
            if (ingredientA.getId() > ingredientB.getId()) {
                Ingredient temp = ingredientA;
                ingredientA = ingredientB;
                ingredientB = temp;
            }
        }
    }
}
