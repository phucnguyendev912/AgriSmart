package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiseaseWeatherCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseaseWeatherConditionRepository extends JpaRepository<DiseaseWeatherCondition, Integer> {

    List<DiseaseWeatherCondition> findByDiseaseIdInAndIsActiveTrueAndIsDeleteFalse(List<Integer> diseaseIds);

    List<DiseaseWeatherCondition> findByIsActiveTrueAndIsDeleteFalse();

    Page<DiseaseWeatherCondition> findByIsDeleteFalse(Pageable pageable);

    Page<DiseaseWeatherCondition> findByDiseaseIdAndIsDeleteFalse(Integer diseaseId, Pageable pageable);

    long countByIsDeleteFalse();

    long countByIsActiveTrueAndIsDeleteFalse();
}
