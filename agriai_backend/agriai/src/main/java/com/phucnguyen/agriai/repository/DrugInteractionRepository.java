package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DrugInteraction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DrugInteractionRepository extends JpaRepository<DrugInteraction, Integer> {

    @Query("SELECT di FROM DrugInteraction di WHERE di.isDelete = false " +
            "AND ((di.ingredientA.id IN :ids AND di.ingredientB.id IN :ids))")
    List<DrugInteraction> findInteractionsBetweenIngredients(@Param("ids") List<Integer> ingredientIds);

    Page<DrugInteraction> findByIsDeleteFalse(Pageable pageable);

    long countByIsDeleteFalse();

    @Query("SELECT di FROM DrugInteraction di WHERE di.isDelete = false " +
           "AND (LOWER(di.ingredientA.ingredientName) LIKE :q OR LOWER(di.ingredientB.ingredientName) LIKE :q)")
    Page<DrugInteraction> searchByIngredientName(@Param("q") String query, Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(di) > 0 THEN true ELSE false END FROM DrugInteraction di " +
           "WHERE di.isDelete = false AND (di.ingredientA.id = :ingredientId OR di.ingredientB.id = :ingredientId)")
    boolean existsByIngredientIdAndIsDeleteFalse(@Param("ingredientId") Integer ingredientId);

    @Query("SELECT CASE WHEN COUNT(di) > 0 THEN true ELSE false END FROM DrugInteraction di " +
           "WHERE di.isDelete = false " +
           "AND ((di.ingredientA.id = :aId AND di.ingredientB.id = :bId) " +
           "OR (di.ingredientA.id = :bId AND di.ingredientB.id = :aId))")
    boolean existsByIngredientPair(@Param("aId") Integer ingredientAId, @Param("bId") Integer ingredientBId);
}

