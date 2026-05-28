package com.phucnguyen.agriai.service.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateDiseaseRequest;
import com.phucnguyen.agriai.dto.request.admin.AdminUpdateDiseaseRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminDiseaseResponse;
import com.phucnguyen.agriai.entity.CropType;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.CropTypeRepository;
import com.phucnguyen.agriai.repository.DiseaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDiseaseService {

    private final DiseaseRepository diseaseRepository;
    private final CropTypeRepository cropTypeRepository;

    @Transactional(readOnly = true)
    public Page<AdminDiseaseResponse> getDiseases(Integer cropTypeId, Pageable pageable) {
        Page<Disease> diseases = diseaseRepository.findAllByFilter(cropTypeId, pageable);
        return diseases.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminDiseaseResponse getDiseaseById(Integer id) {
        Disease disease = getDiseaseEntityById(id);
        return mapToResponse(disease);
    }

    @Transactional
    public AdminDiseaseResponse createDisease(AdminCreateDiseaseRequest request) {
        CropType cropType = cropTypeRepository.findById(request.getCropTypeId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Loại cây trồng không tồn tại"));

        if (!cropType.getIsActive() || cropType.getIsDelete()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Loại cây trồng không còn hoạt động hoặc đã bị xóa");
        }

        diseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse(request.getDiseaseCode())
                .ifPresent(d -> {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Mã bệnh đã tồn tại trong hệ thống");
                });

        Disease disease = Disease.builder()
                .cropType(cropType)
                .diseaseName(request.getDiseaseName())
                .diseaseNameEn(request.getDiseaseNameEn())
                .diseaseCode(request.getDiseaseCode())
                .description(request.getDescription())
                .symptoms(request.getSymptoms())
                .isDelete(false)
                .build();

        Disease savedDisease = diseaseRepository.save(disease);
        return mapToResponse(savedDisease);
    }

    @Transactional
    public AdminDiseaseResponse updateDisease(Integer id, AdminUpdateDiseaseRequest request) {
        Disease disease = getDiseaseEntityById(id);

        CropType cropType = cropTypeRepository.findById(request.getCropTypeId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Loại cây trồng không tồn tại"));

        if (!cropType.getIsActive() || cropType.getIsDelete()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Loại cây trồng không còn hoạt động hoặc đã bị xóa");
        }

        diseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse(request.getDiseaseCode())
                .ifPresent(d -> {
                    if (!d.getId().equals(disease.getId())) {
                        throw new AppException(HttpStatus.BAD_REQUEST, "Mã bệnh đã tồn tại trong hệ thống");
                    }
                });

        disease.setCropType(cropType);
        disease.setDiseaseName(request.getDiseaseName());
        disease.setDiseaseNameEn(request.getDiseaseNameEn());
        disease.setDiseaseCode(request.getDiseaseCode());
        disease.setDescription(request.getDescription());
        disease.setSymptoms(request.getSymptoms());

        Disease updatedDisease = diseaseRepository.save(disease);
        return mapToResponse(updatedDisease);
    }

    // Soft deletes a crop disease record.
    @Transactional
    public void deleteDisease(Integer id) {
        Disease disease = getDiseaseEntityById(id);
        disease.setIsDelete(true);
        diseaseRepository.save(disease);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDiseaseStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalDiseases = diseaseRepository.countTotalDiseases();
        long totalCropTypes = cropTypeRepository.findByIsActiveTrueAndIsDeleteFalse().size();
        
        stats.put("totalDiseases", totalDiseases);
        stats.put("totalCropTypes", totalCropTypes);
        
        return stats;
    }

    private Disease getDiseaseEntityById(Integer id) {
        return diseaseRepository.findById(id)
                .filter(d -> !d.getIsDelete())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy bệnh cây trồng với ID: " + id));
    }

    private AdminDiseaseResponse mapToResponse(Disease disease) {
        return AdminDiseaseResponse.builder()
                .id(disease.getId())
                .cropTypeId(disease.getCropType() != null ? disease.getCropType().getId() : null)
                .cropTypeName(disease.getCropType() != null ? disease.getCropType().getCropName() : null)
                .diseaseName(disease.getDiseaseName())
                .diseaseNameEn(disease.getDiseaseNameEn())
                .diseaseCode(disease.getDiseaseCode())
                .description(disease.getDescription())
                .symptoms(disease.getSymptoms())
                .createdAt(disease.getCreatedAt())
                .build();
    }
}
