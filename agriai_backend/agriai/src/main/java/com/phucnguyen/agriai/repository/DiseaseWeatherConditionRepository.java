package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiseaseWeatherCondition;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiseaseWeatherConditionRepository extends JpaRepository<DiseaseWeatherCondition, Integer> {

    // get disease weather condition by disease ids and isactive true and isdelete
    // false
    List<DiseaseWeatherCondition> findByDiseaseIdInAndIsActiveTrueAndIsDeleteFalse(List<Integer> diseaseIds);

    List<DiseaseWeatherCondition> findByIsActiveTrueAndIsDeleteFalse();
}
