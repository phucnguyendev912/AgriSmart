package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.entity.AIModel;
import com.phucnguyen.agriai.entity.CropType;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.AIModelRepository;
import com.phucnguyen.agriai.repository.CropTypeRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DiagnosisValidationService {

    private final UserRepository userRepository;
    private final CropTypeRepository cropTypeRepository;
    private final AIModelRepository aiModelRepository;

    public DiagnosisValidationService(
            UserRepository userRepository,
            CropTypeRepository cropTypeRepository,
            AIModelRepository aiModelRepository) {
        this.userRepository = userRepository;
        this.cropTypeRepository = cropTypeRepository;
        this.aiModelRepository = aiModelRepository;
    }

    public DiagnosisContext validate(String email, DiagnoseRequest request) {
        validateImage(request.getImage());
        if (request.getCropTypeId() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "cropTypeId la bat buoc.");
        }

        CropType cropType = cropTypeRepository.findById(request.getCropTypeId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay loai cay trong."));
        if (Boolean.TRUE.equals(cropType.getIsDelete()) || !Boolean.TRUE.equals(cropType.getIsActive())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Loai cay trong khong hoat dong.");
        }

        AIModel aiModel = aiModelRepository.findFirstByCropTypeIdAndIsActiveTrueAndIsDeleteFalse(cropType.getId())
                .orElseGet(() -> aiModelRepository.findFirstByIsActiveTrueAndIsDeleteFalseOrderByIdAsc()
                        .orElse(null));

        User user = null;
        if (email != null && !email.isBlank()) {
            user = userRepository.findByEmail(email).orElse(null);
        }

        return new DiagnosisContext(user, cropType, aiModel);
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Anh chan doan la bat buoc.");
        }
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Dinh dang anh khong hop le.");
        }
    }

    public record DiagnosisContext(User user, CropType cropType, AIModel aiModel) {
    }
}
