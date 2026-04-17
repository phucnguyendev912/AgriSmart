package com.phucnguyen.agriai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.phucnguyen.agriai.entity.Ingredient;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Integer> {

}
