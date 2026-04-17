package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.AIModel;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AIModelRepository extends JpaRepository<AIModel, Integer> {
    Optional<AIModel> findFirstByIsActiveTrueAndIsDeleteFalseOrderByIdAsc();

    Optional<AIModel> findFirstByCropTypeIdAndIsActiveTrueAndIsDeleteFalse(Integer cropTypeId);
}
