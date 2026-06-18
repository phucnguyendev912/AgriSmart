package com.phucnguyen.agriai.module.crop.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.phucnguyen.agriai.module.crop.entity.CropType;
public interface CropTypeRepository extends JpaRepository<CropType, Integer> {
    java.util.List<CropType> findByIsActiveTrueAndIsDeleteFalse();
    Page<CropType> findByCropNameContainingIgnoreCaseAndIsDeleteFalse(String cropName, Pageable pageable);
    Page<CropType> findByIsDeleteFalse(Pageable pageable);
    long countByIsDeleteFalse();
}
