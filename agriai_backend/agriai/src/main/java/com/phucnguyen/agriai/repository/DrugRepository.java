package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.Drug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DrugRepository extends JpaRepository<Drug, Integer> {
    List<Drug> findByIsActiveTrueAndIsDeleteFalse();
}
