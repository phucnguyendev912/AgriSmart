package com.phucnguyen.agriai.module.chat.enums;
import com.phucnguyen.agriai.module.chat.enums.SkillDefinition;

import java.nio.file.Path;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SkillDefinitionTest {

    @Test
    @DisplayName("Should have exactly 4 skills")
    void shouldHaveFourSkills() {
        assertEquals(4, SkillDefinition.values().length);
    }

    @Test
    @DisplayName("DISEASE should map to correct folder")
    void diseaseFolderMapping() {
        assertEquals("01_nhan_dien_benh", SkillDefinition.DISEASE.getFolderName());
        assertEquals("nhan-dien-benh-lua", SkillDefinition.DISEASE.getSkillName());
    }

    @Test
    @DisplayName("TREATMENT should map to correct folder")
    void treatmentFolderMapping() {
        assertEquals("02_phac_do_dieu_tri", SkillDefinition.TREATMENT.getFolderName());
    }

    @Test
    @DisplayName("CONFLICT should map to correct folder")
    void conflictFolderMapping() {
        assertEquals("03_xung_dot_thuoc", SkillDefinition.CONFLICT.getFolderName());
    }

    @Test
    @DisplayName("CULTIVATION should map to correct folder")
    void cultivationFolderMapping() {
        assertEquals("04_ky_thuat_canh_tac", SkillDefinition.CULTIVATION.getFolderName());
    }

    @Test
    @DisplayName("getFilePath should resolve to SKILL.md inside folder")
    void getFilePathResolvesCorrectly() {
        Path result = SkillDefinition.DISEASE.getFilePath("/base");
        assertTrue(result.toString().contains("01_nhan_dien_benh"));
        assertTrue(result.toString().endsWith("SKILL.md"));
    }

    @Test
    @DisplayName("All skills should produce valid file paths")
    void allSkillsProduceValidPaths() {
        for (SkillDefinition skill : SkillDefinition.values()) {
            Path path = skill.getFilePath("/tmp/skills");
            assertNotNull(path);
            assertTrue(path.toString().endsWith("SKILL.md"));
            assertTrue(path.toString().contains(skill.getFolderName()));
        }
    }
}
