package com.phucnguyen.agriai.module.weather.repository;

import com.phucnguyen.agriai.module.weather.entity.TreatmentWeatherCondition;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TreatmentWeatherConditionRepository extends JpaRepository<TreatmentWeatherCondition, Integer> {
    List<TreatmentWeatherCondition> findByTreatmentplanIdInAndIsDeleteFalse(List<Integer> treatmentIds);
}
