package com.phucnguyen.agriai.module.diagnose.repository;

import com.phucnguyen.agriai.module.diagnose.entity.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



public interface IngredientRepository extends JpaRepository<Ingredient, Integer> {

    @Query("SELECT i FROM Ingredient i WHERE (i.isDelete = false OR i.isDelete IS NULL)")
    Page<Ingredient> findAllNotDeleted(Pageable pageable);

    @Query("SELECT i FROM Ingredient i WHERE LOWER(i.ingredientName) LIKE :name AND (i.isDelete = false OR i.isDelete IS NULL)")
    Page<Ingredient> findByNameNotDeleted(@Param("name") String name, Pageable pageable);

    @Query("SELECT COUNT(i) FROM Ingredient i WHERE (i.isDelete = false OR i.isDelete IS NULL)")
    long countNotDeleted();

    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM Ingredient i WHERE LOWER(i.ingredientName) = LOWER(:name) AND (i.isDelete = false OR i.isDelete IS NULL)")
    boolean existsByNameNotDeleted(@Param("name") String name);
}

