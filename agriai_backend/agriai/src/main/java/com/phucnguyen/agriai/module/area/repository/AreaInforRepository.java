package com.phucnguyen.agriai.module.area.repository;

import com.phucnguyen.agriai.module.area.entity.AreaInfor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AreaInforRepository extends JpaRepository<AreaInfor, Integer> {
    List<AreaInfor> findByUserIdAndIsDeleteFalse(Integer userId);


    // Kiểm tra user đã có khu vực với địa chỉ này chưa (bỏ qua khu vực đã xóa mềm)
    boolean existsByUserIdAndAddressAndIsDeleteFalse(Integer userId, String address);

}
