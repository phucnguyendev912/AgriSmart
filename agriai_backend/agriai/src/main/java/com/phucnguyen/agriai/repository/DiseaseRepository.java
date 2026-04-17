package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.Disease;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiseaseRepository extends JpaRepository<Disease, Integer> {
    // Tìm theo diseaseCode (case insensitive)
    Optional<Disease> findByDiseaseCodeIgnoreCaseAndIsDeleteFalse(String diseaseCode);

    // Tìm theo diseaseNameEn (case insensitive)
    Optional<Disease> findByDiseaseNameEnIgnoreCaseAndIsDeleteFalse(String diseaseNameEn);

    // Tìm theo diseaseName (case insensitive)
    Optional<Disease> findByDiseaseNameIgnoreCaseAndIsDeleteFalse(String diseaseName);

    List<Disease> findByCropTypeIdAndIsDeleteFalse(Integer cropTypeId);
}
