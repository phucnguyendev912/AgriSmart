package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.request.AreaInforRequest;
import com.phucnguyen.agriai.dto.response.AreaInforResponse;
import com.phucnguyen.agriai.entity.AreaInfor;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.AreaInforRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AreaInforService {

        @Autowired
        private AreaInforRepository areaInforRepository;
        @Autowired
        private UserRepository userRepository;

        public AreaInforResponse create(String email, AreaInforRequest request) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Khong tim thay nguoi dung."));
                AreaInfor area = AreaInfor.builder().user(user).areaName(request.getAreaName())
                                .province(request.getProvince()).address(request.getAddress())
                                .area(request.getArea()).description(request.getDescription()).build();
                return toResponse(areaInforRepository.save(area));
        }

        public List<AreaInforResponse> getByUser(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Khong tim thay nguoi dung."));
                return areaInforRepository.findByUserIdAndIsDeleteFalse(user.getId())
                                .stream().map(this::toResponse).collect(Collectors.toList());
        }

        public AreaInforResponse confirm(String email, Integer id,
                        com.phucnguyen.agriai.dto.request.AreaInforConfirmRequest request) {
                AreaInfor area = areaInforRepository.findById(id)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay khu vuc."));

                if (!area.getUser().getEmail().equals(email)) {
                        throw new AppException(HttpStatus.FORBIDDEN, "Khong co quyen truy cap khu vuc nay.");
                }

                area.setConfirmed(true);
                if (request != null && request.getAddress() != null) {
                        area.setAddress(request.getAddress());
                }
                return toResponse(areaInforRepository.save(area));
        }

        private AreaInforResponse toResponse(AreaInfor a) {
                return AreaInforResponse.builder().id(a.getId()).areaName(a.getAreaName())
                                .province(a.getProvince()).address(a.getAddress())
                                .area(a.getArea()).description(a.getDescription()).build();
        }
}
