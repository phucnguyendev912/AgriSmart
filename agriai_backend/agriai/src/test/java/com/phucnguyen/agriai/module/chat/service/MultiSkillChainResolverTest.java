package com.phucnguyen.agriai.module.chat.service;

import com.phucnguyen.agriai.module.chat.enums.SkillDefinition;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MultiSkillChainResolverTest {

    private MultiSkillChainResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new MultiSkillChainResolver();
    }

    // --- Single skill (no chain) ---

    @Test
    @DisplayName("DISEASE without treatment keywords → only DISEASE")
    void diseaseAloneNoChain() {
        List<SkillDefinition> result = resolver.resolve(SkillDefinition.DISEASE, "lúa bị đốm nâu trên lá");
        assertEquals(1, result.size());
        assertEquals(SkillDefinition.DISEASE, result.get(0));
    }

    @Test
    @DisplayName("CULTIVATION has no chain rule → always single")
    void cultivationAlwaysSingle() {
        List<SkillDefinition> result = resolver.resolve(SkillDefinition.CULTIVATION, "cách bón phân thuốc gì");
        assertEquals(1, result.size());
        assertEquals(SkillDefinition.CULTIVATION, result.get(0));
    }

    @Test
    @DisplayName("CONFLICT has no chain rule → always single")
    void conflictAlwaysSingle() {
        List<SkillDefinition> result = resolver.resolve(SkillDefinition.CONFLICT, "hai thuốc này pha chung được không");
        assertEquals(1, result.size());
        assertEquals(SkillDefinition.CONFLICT, result.get(0));
    }

    // --- Chained skills ---

    @Test
    @DisplayName("DISEASE + 'thuốc' keyword → chain to TREATMENT")
    void diseaseChainsTreatment() {
        List<SkillDefinition> result = resolver.resolve(SkillDefinition.DISEASE, "lúa bị đạo ôn phun thuốc gì");
        assertEquals(2, result.size());
        assertEquals(SkillDefinition.DISEASE, result.get(0));
        assertEquals(SkillDefinition.TREATMENT, result.get(1));
    }

    @Test
    @DisplayName("DISEASE + 'điều trị' keyword → chain to TREATMENT")
    void diseaseChainsTreatmentWithDieuTri() {
        List<SkillDefinition> result = resolver.resolve(SkillDefinition.DISEASE, "bệnh khô vằn điều trị như nào");
        assertEquals(2, result.size());
        assertEquals(SkillDefinition.TREATMENT, result.get(1));
    }

    @Test
    @DisplayName("TREATMENT + 'trộn' keyword → chain to CONFLICT")
    void treatmentChainsConflict() {
        List<SkillDefinition> result = resolver.resolve(SkillDefinition.TREATMENT, "thuốc này có trộn chung với thuốc kia được không");
        assertEquals(2, result.size());
        assertEquals(SkillDefinition.TREATMENT, result.get(0));
        assertEquals(SkillDefinition.CONFLICT, result.get(1));
    }

    @Test
    @DisplayName("TREATMENT + 'pha' keyword → chain to CONFLICT")
    void treatmentChainsConflictWithPha() {
        List<SkillDefinition> result = resolver.resolve(SkillDefinition.TREATMENT, "phun 2 loại thuốc pha chung");
        assertEquals(2, result.size());
        assertEquals(SkillDefinition.CONFLICT, result.get(1));
    }

    @Test
    @DisplayName("TREATMENT without conflict keywords → no chain")
    void treatmentAloneNoChain() {
        List<SkillDefinition> result = resolver.resolve(SkillDefinition.TREATMENT, "thuốc gì trị bệnh đạo ôn");
        assertEquals(1, result.size());
        assertEquals(SkillDefinition.TREATMENT, result.get(0));
    }

    // --- Max 2 skills ---

    @Test
    @DisplayName("Chain result never exceeds 2 skills")
    void neverExceedsTwoSkills() {
        List<SkillDefinition> result = resolver.resolve(SkillDefinition.DISEASE, "thuốc trị bệnh trộn pha chung xử lý");
        assertTrue(result.size() <= 2);
    }

    // --- Primary always first ---

    @Test
    @DisplayName("Primary skill is always first in result list")
    void primaryAlwaysFirst() {
        List<SkillDefinition> result = resolver.resolve(SkillDefinition.DISEASE, "thuốc trị bệnh");
        assertEquals(SkillDefinition.DISEASE, result.get(0));
    }
}
