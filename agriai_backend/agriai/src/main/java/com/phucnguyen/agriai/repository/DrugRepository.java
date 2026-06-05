package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.Drug;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DrugRepository extends JpaRepository<Drug, Integer> {
    List<Drug> findByIsActiveTrueAndIsDeleteFalse();

    @Query("""
        SELECT d FROM Drug d
        WHERE d.isDelete = false
          AND (:drugName IS NULL OR LOWER(d.drugName) LIKE :drugName)
          AND (:manufacturer IS NULL OR LOWER(d.manufacturer) LIKE :manufacturer)
          AND (:isActive IS NULL OR d.isActive = :isActive)
    """)
    Page<Drug> findAllByFilter(
            @Param("drugName") String drugName,
            @Param("manufacturer") String manufacturer,
            @Param("isActive") Boolean isActive,
            Pageable pageable);

    long countByIsDeleteFalse();
}
