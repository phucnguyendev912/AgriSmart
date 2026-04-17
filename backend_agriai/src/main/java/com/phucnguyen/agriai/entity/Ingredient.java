package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "ingredient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Ingredient extends BaseEntity {

    @Column(name = "ingredient_name", length = 255)
    private String ingredientName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
