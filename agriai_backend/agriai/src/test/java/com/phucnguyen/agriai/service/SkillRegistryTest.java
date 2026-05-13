package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.enums.SkillDefinition;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import static org.junit.jupiter.api.Assertions.*;

class SkillRegistryTest {

    @TempDir
    Path tempDir;

    private SkillRegistry skillRegistry;

    private static final String SKILL_WITH_KEYWORDS = """
            ---
            name: test-skill
            ---
            
            # Skill Title
            
            ## Keywords
            
            bệnh, lá vàng, đốm, vết nấm
            
            ## Mục tiêu
            
            Some content here.
            """;

    private static final String SKILL_WITHOUT_KEYWORDS = """
            ---
            name: test-skill
            ---
            
            # Skill Title
            
            ## Mục tiêu
            
            Some content without keywords section.
            """;

    @BeforeEach
    void setUp() throws IOException {
        for (SkillDefinition skill : SkillDefinition.values()) {
            Path folder = tempDir.resolve(skill.getFolderName());
            Files.createDirectories(folder);
            Files.writeString(folder.resolve("SKILL.md"), SKILL_WITH_KEYWORDS);
        }
        skillRegistry = new SkillRegistry(tempDir.toString());
    }

    @Test
    @DisplayName("preload should cache all 4 skills")
    void preloadCachesAllSkills() {
        skillRegistry.preload();
        for (SkillDefinition skill : SkillDefinition.values()) {
            assertNotNull(skillRegistry.getSkillContent(skill));
            assertFalse(skillRegistry.getSkillContent(skill).isEmpty());
        }
    }

    @Test
    @DisplayName("getSkillContent should lazy-load if not preloaded")
    void getSkillContentLazyLoads() {
        String content = skillRegistry.getSkillContent(SkillDefinition.TREATMENT);
        assertNotNull(content);
        assertTrue(content.contains("Skill Title"));
    }

    @Test
    @DisplayName("reloadAll should refresh cache with updated content")
    void reloadAllRefreshesCache() throws IOException {
        skillRegistry.preload();
        String before = skillRegistry.getSkillContent(SkillDefinition.DISEASE);

        Path diseaseFile = tempDir.resolve(SkillDefinition.DISEASE.getFolderName()).resolve("SKILL.md");
        Files.writeString(diseaseFile, "# Updated\n\n## Keywords\n\nnew keyword\n\n## Content");

        skillRegistry.reloadAll();
        String after = skillRegistry.getSkillContent(SkillDefinition.DISEASE);
        assertNotEquals(before, after);
    }

    @Test
    @DisplayName("Should throw IllegalStateException for missing file")
    void throwsForMissingFile() {
        SkillRegistry badRegistry = new SkillRegistry("/nonexistent/path");
        assertThrows(IllegalStateException.class,
                () -> badRegistry.getSkillContent(SkillDefinition.DISEASE));
    }

    // --- Keyword parsing tests ---

    @Test
    @DisplayName("parseKeywords should extract keywords from ## Keywords section")
    void parseKeywordsExtractsCorrectly() {
        List<String> keywords = skillRegistry.parseKeywords(SKILL_WITH_KEYWORDS);
        assertEquals(4, keywords.size());
        assertTrue(keywords.contains("bệnh"));
        assertTrue(keywords.contains("lá vàng"));
        assertTrue(keywords.contains("đốm"));
        assertTrue(keywords.contains("vết nấm"));
    }

    @Test
    @DisplayName("parseKeywords should return empty list when no Keywords section")
    void parseKeywordsReturnsEmptyWhenMissing() {
        List<String> keywords = skillRegistry.parseKeywords(SKILL_WITHOUT_KEYWORDS);
        assertTrue(keywords.isEmpty());
    }

    @Test
    @DisplayName("getSkillKeywords should return cached keywords after preload")
    void getSkillKeywordsReturnsCached() {
        skillRegistry.preload();
        List<String> keywords = skillRegistry.getSkillKeywords(SkillDefinition.DISEASE);
        assertFalse(keywords.isEmpty());
        assertTrue(keywords.contains("bệnh"));
    }

    @Test
    @DisplayName("getSkillKeywords should lazy-load if not preloaded")
    void getSkillKeywordsLazyLoads() {
        List<String> keywords = skillRegistry.getSkillKeywords(SkillDefinition.CULTIVATION);
        assertFalse(keywords.isEmpty());
    }
}
