package com.phucnguyen.agriai.module.area.service;
import com.phucnguyen.agriai.module.area.dto.request.AreaInforRequest;
import com.phucnguyen.agriai.module.area.dto.response.AreaInforResponse;
import com.phucnguyen.agriai.module.area.entity.AreaInfor;
import com.phucnguyen.agriai.module.user.entity.User;
import com.phucnguyen.agriai.infrastructure.exception.AppException;
import com.phucnguyen.agriai.module.area.repository.AreaInforRepository;
import com.phucnguyen.agriai.module.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AreaInforService {

        private final AreaInforRepository areaInforRepository;
        private final UserRepository userRepository;

        public AreaInforService(AreaInforRepository areaInforRepository, UserRepository userRepository) {
                this.areaInforRepository = areaInforRepository;
                this.userRepository = userRepository;
        }

        public AreaInforResponse create(String email, AreaInforRequest request) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Khong tim thay nguoi dung."));
                AreaInfor area = AreaInfor.builder().user(user).areaName(request.getAreaName())
                                .province(request.getProvince()).address(request.getAddress())
                                .area(request.getArea()).description(request.getDescription()).build();
                return toResponse(areaInforRepository.save(area));
        }

        // Get all active (non-deleted) farming areas of a user
        public List<AreaInforResponse> getByUser(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Khong tim thay nguoi dung."));
                return areaInforRepository.findByUserIdAndIsDeleteFalse(user.getId())
                                .stream().map(this::toResponse).collect(Collectors.toList());
        }

        // Confirm area details and verify ownership of the area
        public AreaInforResponse confirm(String email, Integer id,
                        com.phucnguyen.agriai.module.area.dto.request.AreaInforConfirmRequest request) {
                AreaInfor area = areaInforRepository.findById(id)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay khu vuc."));

                if (!area.getUser().getEmail().equals(email)) {
                        throw new AppException(HttpStatus.FORBIDDEN, "Khong co quyen truy cap khu vuc nay.");
                }

                return toResponse(areaInforRepository.save(area));
        }

        // Update details (name, province, address, size) of a farming area
        public AreaInforResponse update(String email, Integer id, AreaInforRequest request) {
                AreaInfor area = areaInforRepository.findById(id)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy khu vực."));

                if (!area.getUser().getEmail().equals(email)) {
                        throw new AppException(HttpStatus.FORBIDDEN, "Không có quyền chỉnh sửa khu vực này.");
                }

                area.setAreaName(request.getAreaName());
                area.setProvince(request.getProvince());
                area.setAddress(request.getAddress());
                area.setArea(request.getArea());
                area.setDescription(request.getDescription());

                return toResponse(areaInforRepository.save(area));
        }

        // Soft delete a farming area by setting the isDelete flag to true
        public void delete(String email, Integer id) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Khong tim thay nguoi dung."));
                AreaInfor area = areaInforRepository.findById(id)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy khu vực."));
                if (!area.getUser().getEmail().equals(email)) {
                        throw new AppException(HttpStatus.FORBIDDEN, "Không có quyền xóa khu vực này.");
                }
                area.setIsDelete(true);
                area.setDeletedAt(LocalDateTime.now());
                area.setDeletedBy(user.getId());
                areaInforRepository.save(area);
        }

        // Helper to convert AreaInfor entity to response DTO
        private AreaInforResponse toResponse(AreaInfor a) {
                return AreaInforResponse.builder().id(a.getId()).areaName(a.getAreaName())
                                .province(a.getProvince()).address(a.getAddress())
                                .area(a.getArea()).description(a.getDescription())
                                .latitude(a.getLatitude()).longitude(a.getLongitude()).build();
        }
}
