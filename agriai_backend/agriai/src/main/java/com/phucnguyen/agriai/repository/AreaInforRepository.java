package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.AreaInfor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AreaInforRepository extends JpaRepository<AreaInfor, Integer> {
    List<AreaInfor> findByUserIdAndIsDeleteFalse(Integer userId);

    // Kiểm tra user đã có khu vực với địa chỉ này chưa (sau khi gọi Nominatim)
    boolean existsByUserIdAndAddress(Integer userId, String address);
}
