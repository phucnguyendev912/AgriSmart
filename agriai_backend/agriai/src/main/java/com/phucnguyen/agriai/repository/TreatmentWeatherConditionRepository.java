package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.TreatmentWeatherCondition;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentWeatherConditionRepository extends JpaRepository<TreatmentWeatherCondition, Integer> {
    List<TreatmentWeatherCondition> findByTreatmentplanIdInAndIsDeleteFalse(List<Integer> treatmentIds);
}
