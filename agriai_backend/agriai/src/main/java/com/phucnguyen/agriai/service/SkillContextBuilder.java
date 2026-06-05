package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.enums.SkillDefinition;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

// extracts relevant sections from skill markdown based on keyword matching
// heading-boost: sections whose heading matches a disease name in the query score +5
@Service
public class SkillContextBuilder {

    private static final Pattern SECTION_SPLITTER = Pattern.compile("(?=^#{2,3}\\s)", Pattern.MULTILINE);

    private final SkillRegistry skillRegistry;
    private final int maxContextChars;

    public SkillContextBuilder(
            SkillRegistry skillRegistry,
            @Value("${agriai.chatbot.max-context-chars:3000}") int maxContextChars) {
        this.skillRegistry = skillRegistry;
        this.maxContextChars = maxContextChars;
    }

    // build trimmed context from skill markdown, selecting top relevant sections
    public String buildContext(SkillDefinition skill, String userQuery) {
        String markdown = skillRegistry.getSkillContent(skill);
        // split skill markdown into sections
        List<SkillSection> sections = splitIntoSections(markdown);
        // score sections by counting query words that appear in content
        List<SkillSection> scored = scoreSections(sections, userQuery);
        // select top sections within character budget
        List<SkillSection> selected = selectTopSections(scored);
        // join selected sections with "---" separator
        return selected.stream()
                .map(SkillSection::content)
                .collect(Collectors.joining("\n---\n"));
    }

    // split markdown by ## and ### headings
    List<SkillSection> splitIntoSections(String markdown) {
        String[] parts = SECTION_SPLITTER.split(markdown);
        List<SkillSection> sections = new ArrayList<>();
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            String heading = extractHeading(trimmed);
            sections.add(new SkillSection(heading, trimmed, 0));
        }
        return sections;
    }

    // score sections by counting query words that appear in content
    // heading-boost: +5 if heading contains a multi-word token from query (disease name match)
    List<SkillSection> scoreSections(List<SkillSection> sections, String userQuery) {
        String queryLower = userQuery.toLowerCase();
        String[] queryWords = queryLower.split("\\s+");

        // build query bigrams (2-word combos) to detect disease names like "đốm nâu"
        List<String> queryBigrams = buildBigrams(queryWords);

        return sections.stream()
                .map(section -> {
                    String contentLower = section.content().toLowerCase();
                    String headingLower = section.heading().toLowerCase();
                    int score = 0;

                    // word-level score from content
                    for (String word : queryWords) {
                        if (word.length() >= 2 && contentLower.contains(word)) {
                            score++;
                        }
                    }

                    // heading boost: +5 if heading contains any bigram from query
                    for (String bigram : queryBigrams) {
                        if (headingLower.contains(bigram)) {
                            score += 5;
                            break; // one boost per section
                        }
                    }

                    // heading boost: +3 if heading contains any single query word (length >= 3)
                    for (String word : queryWords) {
                        if (word.length() >= 3 && headingLower.contains(word)) {
                            score += 3;
                            break; // one boost per section
                        }
                    }

                    return new SkillSection(section.heading(), section.content(), score);
                })
                .sorted(Comparator.comparingInt(SkillSection::score).reversed())
                .collect(Collectors.toList());
    }

    // build consecutive word pairs from query tokens
    private List<String> buildBigrams(String[] words) {
        List<String> bigrams = new ArrayList<>();
        for (int i = 0; i < words.length - 1; i++) {
            if (words[i].length() >= 2 && words[i + 1].length() >= 2) {
                bigrams.add(words[i] + " " + words[i + 1]);
            }
        }
        return bigrams;
    }

    // select top sections within character budget
    List<SkillSection> selectTopSections(List<SkillSection> scoredSections) {
        List<SkillSection> selected = new ArrayList<>();
        int totalChars = 0;
        for (SkillSection section : scoredSections) {
            if (totalChars + section.content().length() > maxContextChars) {
                break;
            }
            selected.add(section);
            totalChars += section.content().length();
        }
        return selected;
    }

    // extract heading from section
    private String extractHeading(String section) {
        int newline = section.indexOf('\n');
        if (newline == -1) {
            return section;
        }
        // remove # and whitespace from heading
        return section.substring(0, newline).replaceAll("^#+\\s*", "").trim();
    }

    // record to store section with heading, content, and score
    record SkillSection(String heading, String content, int score) {
    }
}
