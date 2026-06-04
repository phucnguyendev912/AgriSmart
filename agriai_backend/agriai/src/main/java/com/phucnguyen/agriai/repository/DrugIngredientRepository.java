package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DrugIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DrugIngredientRepository extends JpaRepository<DrugIngredient, Integer> {

    @Query("SELECT CASE WHEN COUNT(di) > 0 THEN true ELSE false END FROM DrugIngredient di " +
           "WHERE di.ingredient.id = :ingredientId AND di.isDelete = false")
    boolean existsByIngredientIdAndIsDeleteFalse(@Param("ingredientId") Integer ingredientId);
}

