package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DrugInteraction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DrugInteractionRepository extends JpaRepository<DrugInteraction, Integer> {

    @Query("SELECT di FROM DrugInteraction di WHERE di.isDelete = false " +
            "AND ((di.ingredientA.id IN :ids AND di.ingredientB.id IN :ids))")
    List<DrugInteraction> findInteractionsBetweenIngredients(@Param("ids") List<Integer> ingredientIds);
}
