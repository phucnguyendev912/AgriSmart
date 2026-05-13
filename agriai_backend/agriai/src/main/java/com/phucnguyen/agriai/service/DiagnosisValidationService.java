package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.entity.CropType;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.CropTypeRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class DiagnosisValidationService {

    private static final String INVALID_IMAGE_MESSAGE = "Ảnh không hợp lệ, vui lòng thử lại";
    private static final String MISSING_CROP_MESSAGE = "Vui lòng chọn loại cây trồng trước khi chẩn đoán";

    private final UserRepository userRepository;
    private final CropTypeRepository cropTypeRepository;

    public DiagnosisContext validate(String email, DiagnoseRequest request) {
        validateImage(request.getImage());
        if (request.getCropTypeId() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, MISSING_CROP_MESSAGE);
        }

        CropType cropType = cropTypeRepository.findById(request.getCropTypeId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay loai cay trong."));
        if (Boolean.TRUE.equals(cropType.getIsDelete()) || !Boolean.TRUE.equals(cropType.getIsActive())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Loai cay trong khong hoat dong.");
        }

        User user = null;
        if (email != null && !email.isBlank()) {
            user = userRepository.findByEmail(email).orElse(null);
        }

        return new DiagnosisContext(user, cropType);
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, INVALID_IMAGE_MESSAGE);
        }
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(HttpStatus.BAD_REQUEST, INVALID_IMAGE_MESSAGE);
        }
    }

    public record DiagnosisContext(User user, CropType cropType) {
    }
}
