package com.phucnguyen.agriai.module.chat.service;

import com.phucnguyen.agriai.module.chat.enums.SkillDefinition;
import com.phucnguyen.agriai.module.chat.service.SkillContextBuilder.SkillSection;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillContextBuilderTest {

    private static final String SAMPLE_MARKDOWN = """
            # Skill Header
            
            Some intro text.
            
            ## Bệnh Đạo Ôn
            
            Vết bệnh hình thoi, tâm xám, viền nâu đỏ.
            Giai đoạn đẻ nhánh hay bị nhất.
            
            ## Bệnh Khô Vằn
            
            Vết vằn da hổ trên bẹ lá.
            Hạch nấm nổi trên mặt nước.
            
            ## Bệnh Bạc Lá
            
            Vết vàng từ mép lá, giọt keo vàng sáng sớm.
            Vi khuẩn gây ra.
            
            ### Phân biệt Bạc Lá và Cháy Bìa Lá
            
            Bạc lá có giọt keo, cháy bìa lá có vân đồng tâm.
            """;

    @Mock
    private SkillRegistry skillRegistry;

    private SkillContextBuilder contextBuilder;

    @BeforeEach
    void setUp() {
        contextBuilder = new SkillContextBuilder(skillRegistry, 3000);
    }

    @Test
    @DisplayName("splitIntoSections should split markdown by ## and ### headings")
    void splitIntoSectionsSplitsByHeadings() {
        List<SkillSection> sections = contextBuilder.splitIntoSections(SAMPLE_MARKDOWN);
        // intro (before first ##) + 3 ## sections + 1 ### section = at least 4 headed sections
        assertTrue(sections.size() >= 4,
                "Expected at least 4 sections, got " + sections.size());
    }

    @Test
    @DisplayName("splitIntoSections should extract heading text")
    void splitExtractsHeadings() {
        List<SkillSection> sections = contextBuilder.splitIntoSections(SAMPLE_MARKDOWN);
        List<String> headings = sections.stream()
                .map(SkillSection::heading)
                .toList();
        assertTrue(headings.stream().anyMatch(h -> h.contains("Đạo Ôn")));
        assertTrue(headings.stream().anyMatch(h -> h.contains("Khô Vằn")));
        assertTrue(headings.stream().anyMatch(h -> h.contains("Bạc Lá")));
    }

    @Test
    @DisplayName("scoreSections should rank matching sections higher")
    void scoreSectionsRanksCorrectly() {
        List<SkillSection> sections = contextBuilder.splitIntoSections(SAMPLE_MARKDOWN);
        List<SkillSection> scored = contextBuilder.scoreSections(sections, "hình thoi xám nâu đẻ nhánh");

        // "Đạo Ôn" section should score highest (contains hình thoi, xám, nâu, đẻ nhánh)
        SkillSection top = scored.get(0);
        assertTrue(top.content().contains("hình thoi"),
                "Top section should be Đạo Ôn, got: " + top.heading());
        assertTrue(top.score() > 0);
    }

    @Test
    @DisplayName("scoreSections should give 0 to unrelated sections")
    void scoreSectionsGivesZeroToUnrelated() {
        List<SkillSection> sections = contextBuilder.splitIntoSections(SAMPLE_MARKDOWN);
        List<SkillSection> scored = contextBuilder.scoreSections(sections, "xyz abc 123");

        // all sections should score 0 for completely unrelated query
        for (SkillSection section : scored) {
            assertEquals(0, section.score(),
                    "Section '" + section.heading() + "' should score 0 for unrelated query");
        }
    }

    @Test
    @DisplayName("selectTopSections should respect character budget")
    void selectTopSectionsRespectsCharBudget() {
        // create builder with tiny budget
        SkillContextBuilder smallBuilder = new SkillContextBuilder(skillRegistry, 100);
        List<SkillSection> sections = smallBuilder.splitIntoSections(SAMPLE_MARKDOWN);
        List<SkillSection> scored = smallBuilder.scoreSections(sections, "đạo ôn hình thoi");
        List<SkillSection> selected = smallBuilder.selectTopSections(scored);

        int totalChars = selected.stream().mapToInt(s -> s.content().length()).sum();
        assertTrue(totalChars <= 100,
                "Total chars " + totalChars + " should not exceed budget 100");
    }

    @Test
    @DisplayName("buildContext should return non-empty string for matching query")
    void buildContextReturnsRelevantContent() {
        when(skillRegistry.getSkillContent(SkillDefinition.DISEASE))
                .thenReturn(SAMPLE_MARKDOWN);

        String context = contextBuilder.buildContext(SkillDefinition.DISEASE, "đạo ôn hình thoi");
        assertNotNull(context);
        assertFalse(context.isEmpty());
        assertTrue(context.contains("hình thoi"));
    }

    @Test
    @DisplayName("buildContext should return content even for low-match query")
    void buildContextReturnsContentForLowMatch() {
        when(skillRegistry.getSkillContent(SkillDefinition.DISEASE))
                .thenReturn(SAMPLE_MARKDOWN);

        String context = contextBuilder.buildContext(SkillDefinition.DISEASE, "lúa bị sao");
        assertNotNull(context);
        // should still return some sections (top scored, even if score = 0)
        assertFalse(context.isEmpty());
    }

    @Test
    @DisplayName("Single-word queries with length < 2 should not count toward score")
    void shortWordsIgnoredInScoring() {
        List<SkillSection> sections = contextBuilder.splitIntoSections(SAMPLE_MARKDOWN);
        List<SkillSection> scored = contextBuilder.scoreSections(sections, "a b c");

        for (SkillSection section : scored) {
            assertEquals(0, section.score(),
                    "Single-char words should not contribute to score");
        }
    }

    @Test
    @DisplayName("Heading boost: query containing disease bigram should rank that section first")
    void headingBoostPrioritizesDiseaseSection() {
        // SAMPLE_MARKDOWN has sections: "Đạo Ôn", "Khô Vằn", "Bạc Lá"
        // query "bạc lá" bigram should boost "Bạc Lá" section to top
        List<SkillSection> sections = contextBuilder.splitIntoSections(SAMPLE_MARKDOWN);
        List<SkillSection> scored = contextBuilder.scoreSections(sections, "bạc lá triệu chứng");

        SkillSection top = scored.get(0);
        assertTrue(top.heading().contains("Bạc Lá"),
                "Section 'Bạc Lá' should rank first due to heading bigram boost, got: " + top.heading());
    }

    @Test
    @DisplayName("Without disease name in query, scoring falls back to word-based ranking")
    void nonDiseaseQueryUsesNormalScoring() {
        // query only has words common across sections, not a disease bigram
        // heading boost should not change the natural word-match order
        List<SkillSection> sections = contextBuilder.splitIntoSections(SAMPLE_MARKDOWN);
        List<SkillSection> scored = contextBuilder.scoreSections(sections, "hình thoi xám nâu đẻ nhánh");

        // "Đạo Ôn" has "hình thoi", "xám", "nâu", "đẻ nhánh" — highest word match
        SkillSection top = scored.get(0);
        assertTrue(top.content().contains("hình thoi"),
                "Top section should be Đạo Ôn by word-match, got: " + top.heading());
        assertTrue(top.score() > 0);
    }
}
