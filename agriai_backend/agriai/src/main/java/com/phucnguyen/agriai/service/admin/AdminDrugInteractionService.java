package com.phucnguyen.agriai.service.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateDrugInteractionRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminDrugInteractionResponse;
import com.phucnguyen.agriai.entity.DrugInteraction;
import com.phucnguyen.agriai.entity.Ingredient;
import com.phucnguyen.agriai.exception.AppException;
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
public class AdminDrugInteractionService {

    private final DrugInteractionRepository drugInteractionRepository;
    private final IngredientRepository ingredientRepository;

    @Transactional(readOnly = true)
    public Page<AdminDrugInteractionResponse> getInteractions(String query, Pageable pageable) {
        Page<DrugInteraction> page;
        if (query != null && !query.trim().isEmpty()) {
            page = drugInteractionRepository.searchByIngredientName("%" + query.trim().toLowerCase() + "%", pageable);
        } else {
            page = drugInteractionRepository.findByIsDeleteFalse(pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminDrugInteractionResponse getInteractionById(Integer id) {
        return mapToResponse(getEntityById(id));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInteractionStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalInteractions", drugInteractionRepository.countByIsDeleteFalse());
        return stats;
    }

    @Transactional
    public AdminDrugInteractionResponse createInteraction(AdminCreateDrugInteractionRequest request) {
        if (request.getIngredientAId().equals(request.getIngredientBId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hoạt chất A và B không được trùng nhau");
        }

        Ingredient ingredientA = getActiveIngredient(request.getIngredientAId());
        Ingredient ingredientB = getActiveIngredient(request.getIngredientBId());

        if (drugInteractionRepository.existsByIngredientPair(ingredientA.getId(), ingredientB.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Tương tác giữa '" + ingredientA.getIngredientName() + "' và '" + ingredientB.getIngredientName() + "' đã tồn tại");
        }

        DrugInteraction interaction = DrugInteraction.builder()
                .ingredientA(ingredientA)
                .ingredientB(ingredientB)
                .interactionType(request.getInteractionType())
                .severity(request.getSeverity())
                .warningMessage(request.getWarningMessage())
                .actionRule(request.getActionRule())
                .intervalDays(request.getIntervalDays())
                .isDelete(false)
                .build();

        return mapToResponse(drugInteractionRepository.save(interaction));
    }

    @Transactional
    public AdminDrugInteractionResponse updateInteraction(Integer id, AdminCreateDrugInteractionRequest request) {
        DrugInteraction interaction = getEntityById(id);

        if (request.getIngredientAId().equals(request.getIngredientBId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hoạt chất A và B không được trùng nhau");
        }

        Ingredient ingredientA = getActiveIngredient(request.getIngredientAId());
        Ingredient ingredientB = getActiveIngredient(request.getIngredientBId());

        // Check pair duplicate, excluding self
        boolean pairExists = drugInteractionRepository.existsByIngredientPair(ingredientA.getId(), ingredientB.getId());
        boolean isSamePair = (interaction.getIngredientA().getId().equals(ingredientA.getId())
                && interaction.getIngredientB().getId().equals(ingredientB.getId()))
                || (interaction.getIngredientA().getId().equals(ingredientB.getId())
                && interaction.getIngredientB().getId().equals(ingredientA.getId()));

        if (pairExists && !isSamePair) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Tương tác giữa '" + ingredientA.getIngredientName() + "' và '" + ingredientB.getIngredientName() + "' đã tồn tại");
        }

        interaction.setIngredientA(ingredientA);
        interaction.setIngredientB(ingredientB);
        interaction.setInteractionType(request.getInteractionType());
        interaction.setSeverity(request.getSeverity());
        interaction.setWarningMessage(request.getWarningMessage());
        interaction.setActionRule(request.getActionRule());
        interaction.setIntervalDays(request.getIntervalDays());

        return mapToResponse(drugInteractionRepository.save(interaction));
    }

    @Transactional
    public void deleteInteraction(Integer id) {
        DrugInteraction interaction = getEntityById(id);
        interaction.setIsDelete(true);
        drugInteractionRepository.save(interaction);
    }

    private DrugInteraction getEntityById(Integer id) {
        return drugInteractionRepository.findById(id)
                .filter(di -> !di.getIsDelete())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tương tác thuốc với ID: " + id));
    }

    private Ingredient getActiveIngredient(Integer id) {
        return ingredientRepository.findById(id)
                .filter(i -> !i.getIsDelete())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hoạt chất với ID: " + id));
    }

    private AdminDrugInteractionResponse mapToResponse(DrugInteraction di) {
        return AdminDrugInteractionResponse.builder()
                .id(di.getId())
                .ingredientAId(di.getIngredientA().getId())
                .ingredientAName(di.getIngredientA().getIngredientName())
                .ingredientBId(di.getIngredientB().getId())
                .ingredientBName(di.getIngredientB().getIngredientName())
                .interactionType(di.getInteractionType())
                .severity(di.getSeverity())
                .warningMessage(di.getWarningMessage())
                .actionRule(di.getActionRule())
                .intervalDays(di.getIntervalDays())
                .createdAt(di.getCreatedAt())
                .updatedAt(di.getUpdatedAt())
                .build();
    }
}
