package com.phucnguyen.agriai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.phucnguyen.agriai.entity.CropType;

@Repository
public interface CropTypeRepository extends JpaRepository<CropType, Integer> {
    java.util.List<CropType> findByIsActiveTrueAndIsDeleteFalse();
}
