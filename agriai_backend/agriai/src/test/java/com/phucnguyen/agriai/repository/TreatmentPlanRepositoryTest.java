package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.lang.reflect.Method;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.EntityGraph;

import static org.junit.jupiter.api.Assertions.assertTrue;

class TreatmentPlanRepositoryTest {

    @Test
    void findByDiseaseIdIn_fetchesDrugIngredientsForRankingAndInteractionCheck() throws NoSuchMethodException {
        Method method = TreatmentPlanRepository.class
                .getMethod("findByDiseaseIdInAndIsDeleteFalse", List.class);

        EntityGraph entityGraph = method.getAnnotation(EntityGraph.class);
        List<String> paths = List.of(entityGraph.attributePaths());

        assertTrue(paths.contains("disease"));
        assertTrue(paths.contains("drug"));
        assertTrue(paths.contains("drug.ingredients"));
        assertTrue(paths.contains("drug.ingredients.ingredient"));
    }
}
