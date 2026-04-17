package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiagnoseHistoryDetail;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiagnoseHistoryDetailRepository extends JpaRepository<DiagnoseHistoryDetail, Integer> {
    List<DiagnoseHistoryDetail> findByDiagnoseHistoryIdAndIsDeleteFalse(Integer diagnoseHistoryId);
}
