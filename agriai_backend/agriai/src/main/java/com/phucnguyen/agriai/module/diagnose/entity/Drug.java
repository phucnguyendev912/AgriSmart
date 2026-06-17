package com.phucnguyen.agriai.module.diagnose.entity;

import com.phucnguyen.agriai.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import java.util.List;

@Entity
@Table(name = "drug")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@AttributeOverride(name = "isDelete", column = @Column(name = "is_deleted"))
public class Drug extends BaseEntity {

    @Column(name = "drug_name", length = 150, nullable = false)
    private String drugName;

    @Column(name = "formulation", length = 20)
    private String formulation;

    @Column(name = "manufacturer", length = 150)
    private String manufacturer;

    @Column(name = "is_active")
    private Boolean isActive;

    @NotAudited
    @OneToMany(mappedBy = "drug", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DrugIngredient> ingredients;
}
