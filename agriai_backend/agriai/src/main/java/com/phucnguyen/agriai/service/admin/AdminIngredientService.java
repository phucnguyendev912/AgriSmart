package com.phucnguyen.agriai.service.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateIngredientRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminIngredientResponse;
import com.phucnguyen.agriai.entity.Ingredient;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.DrugIngredientRepository;
import com.phucnguyen.agriai.repository.DrugInteractionRepository;
import com.phucnguyen.agriai.repository.IngredientRepository;
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
public class AdminIngredientService {

    private final IngredientRepository ingredientRepository;
    private final DrugIngredientRepository drugIngredientRepository;
    private final DrugInteractionRepository drugInteractionRepository;

    @Transactional(readOnly = true)
    public Page<AdminIngredientResponse> getIngredients(String name, Pageable pageable) {
        Page<Ingredient> page;
        if (name != null && !name.trim().isEmpty()) {
            page = ingredientRepository.findByNameNotDeleted("%" + name.trim().toLowerCase() + "%", pageable);
        } else {
            page = ingredientRepository.findAllNotDeleted(pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminIngredientResponse getIngredientById(Integer id) {
        return mapToResponse(getEntityById(id));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getIngredientStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalIngredients", ingredientRepository.countNotDeleted());
        return stats;
    }

    @Transactional
    public AdminIngredientResponse createIngredient(AdminCreateIngredientRequest request) {
        if (ingredientRepository.existsByNameNotDeleted(request.getIngredientName())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hoạt chất '" + request.getIngredientName() + "' đã tồn tại");
        }

        Ingredient ingredient = Ingredient.builder()
                .ingredientName(request.getIngredientName())
                .description(request.getDescription())
                .isDelete(false)
                .build();

        return mapToResponse(ingredientRepository.save(ingredient));
    }

    @Transactional
    public AdminIngredientResponse updateIngredient(Integer id, AdminCreateIngredientRequest request) {
        Ingredient ingredient = getEntityById(id);

        boolean nameChanged = !ingredient.getIngredientName().equalsIgnoreCase(request.getIngredientName());
        if (nameChanged && ingredientRepository.existsByNameNotDeleted(request.getIngredientName())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hoạt chất '" + request.getIngredientName() + "' đã tồn tại");
        }

        ingredient.setIngredientName(request.getIngredientName());
        ingredient.setDescription(request.getDescription());

        return mapToResponse(ingredientRepository.save(ingredient));
    }

    @Transactional
    public void deleteIngredient(Integer id) {
        Ingredient ingredient = getEntityById(id);

        boolean usedInDrug = drugIngredientRepository.existsByIngredientIdAndIsDeleteFalse(id);
        if (usedInDrug) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể xóa hoạt chất này vì đang được sử dụng trong danh mục thuốc");
        }

        boolean usedInInteraction = drugInteractionRepository.existsByIngredientIdAndIsDeleteFalse(id);
        if (usedInInteraction) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể xóa hoạt chất này vì đang được cấu hình trong danh sách tương tác thuốc");
        }

        ingredient.setIsDelete(true);
        ingredientRepository.save(ingredient);
    }

    private Ingredient getEntityById(Integer id) {
        return ingredientRepository.findById(id)
                .filter(i -> !Boolean.TRUE.equals(i.getIsDelete()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hoạt chất với ID: " + id));
    }

    private AdminIngredientResponse mapToResponse(Ingredient ingredient) {
        return AdminIngredientResponse.builder()
                .id(ingredient.getId())
                .ingredientName(ingredient.getIngredientName())
                .description(ingredient.getDescription())
                .createdAt(ingredient.getCreatedAt())
                .updatedAt(ingredient.getUpdatedAt())
                .build();
    }
}
