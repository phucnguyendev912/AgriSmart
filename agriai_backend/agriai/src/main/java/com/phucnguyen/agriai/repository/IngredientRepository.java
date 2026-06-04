package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Integer> {

    Page<Ingredient> findByIsDeleteFalse(Pageable pageable);

    Page<Ingredient> findByIngredientNameContainingIgnoreCaseAndIsDeleteFalse(String name, Pageable pageable);

    long countByIsDeleteFalse();

    boolean existsByIngredientNameIgnoreCaseAndIsDeleteFalse(String name);
}
