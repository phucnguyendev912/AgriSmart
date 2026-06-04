package com.phucnguyen.agriai.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.phucnguyen.agriai.entity.CropType;

@Repository
public interface CropTypeRepository extends JpaRepository<CropType, Integer> {
    java.util.List<CropType> findByIsActiveTrueAndIsDeleteFalse();
    Page<CropType> findByCropNameContainingIgnoreCaseAndIsDeleteFalse(String cropName, Pageable pageable);
    Page<CropType> findByIsDeleteFalse(Pageable pageable);
    long countByIsDeleteFalse();
}
