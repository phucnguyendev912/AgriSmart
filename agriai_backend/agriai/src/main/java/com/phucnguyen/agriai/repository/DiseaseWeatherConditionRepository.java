package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiseaseWeatherCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseaseWeatherConditionRepository extends JpaRepository<DiseaseWeatherCondition, Integer> {

    List<DiseaseWeatherCondition> findByDiseaseIdInAndIsActiveTrueAndIsDeleteFalse(List<Integer> diseaseIds);

    List<DiseaseWeatherCondition> findByIsActiveTrueAndIsDeleteFalse();

    @Query("SELECT c FROM DiseaseWeatherCondition c WHERE (c.isDelete = false OR c.isDelete IS NULL)")
    Page<DiseaseWeatherCondition> findAllNotDeleted(Pageable pageable);

    @Query("SELECT c FROM DiseaseWeatherCondition c WHERE c.disease.id = :diseaseId AND (c.isDelete = false OR c.isDelete IS NULL)")
    Page<DiseaseWeatherCondition> findByDiseaseIdNotDeleted(@Param("diseaseId") Integer diseaseId, Pageable pageable);

    @Query("SELECT COUNT(c) FROM DiseaseWeatherCondition c WHERE (c.isDelete = false OR c.isDelete IS NULL)")
    long countNotDeleted();

    @Query("SELECT COUNT(c) FROM DiseaseWeatherCondition c WHERE c.isActive = true AND (c.isDelete = false OR c.isDelete IS NULL)")
    long countActiveNotDeleted();
}

