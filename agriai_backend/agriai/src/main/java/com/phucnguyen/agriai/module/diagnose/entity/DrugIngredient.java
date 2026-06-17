package com.phucnguyen.agriai.module.diagnose.entity;

import com.phucnguyen.agriai.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;

@Entity
@Table(name = "drug_ingredient",
    uniqueConstraints = @UniqueConstraint(columnNames = {"drug_id", "ingredient_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DrugIngredient extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drug_id", nullable = false)
    private Drug drug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "concentration_value", precision = 10, scale = 4)
    private BigDecimal concentrationValue;

    @Column(name = "concentration_unit", length = 20)
    private String concentrationUnit; // g/L, g/kg, %

    @Column(name = "raw_concentration", length = 100)
    private String rawConcentration; // text gốc khi không parse được chính xác
}
