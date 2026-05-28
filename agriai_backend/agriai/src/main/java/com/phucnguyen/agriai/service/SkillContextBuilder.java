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

    public String buildContext(SkillDefinition skill, String userQuery) {
        String markdown = skillRegistry.getSkillContent(skill);
        List<SkillSection> sections = splitIntoSections(markdown);
        List<SkillSection> scored = scoreSections(sections, userQuery);
        List<SkillSection> selected = selectTopSections(scored);
        return selected.stream()
                .map(SkillSection::content)
                .collect(Collectors.joining("\n---\n"));
    }

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

    // Boosts the score (+5) if a section heading matches a multi-word token (e.g., a disease name).
    List<SkillSection> scoreSections(List<SkillSection> sections, String userQuery) {
        String queryLower = userQuery.toLowerCase();
        String[] queryWords = queryLower.split("\\s+");

        // Build query bigrams (2-word pairs) to identify specific disease names.
        List<String> queryBigrams = buildBigrams(queryWords);

        return sections.stream()
                .map(section -> {
                    String contentLower = section.content().toLowerCase();
                    String headingLower = section.heading().toLowerCase();
                    int score = 0;

                    // Content word-level matching score.
                    for (String word : queryWords) {
                        if (word.length() >= 2 && contentLower.contains(word)) {
                            score++;
                        }
                    }

                    // Heading boost: +5 if the heading matches any bigram from the query.
                    for (String bigram : queryBigrams) {
                        if (headingLower.contains(bigram)) {
                            score += 5;
                            break;
                        }
                    }

                    // Heading boost: +3 if the heading contains any single query word (length >= 3).
                    for (String word : queryWords) {
                        if (word.length() >= 3 && headingLower.contains(word)) {
                            score += 3;
                            break;
                        }
                    }

                    return new SkillSection(section.heading(), section.content(), score);
                })
                .sorted(Comparator.comparingInt(SkillSection::score).reversed())
                .collect(Collectors.toList());
    }

    private List<String> buildBigrams(String[] words) {
        List<String> bigrams = new ArrayList<>();
        for (int i = 0; i < words.length - 1; i++) {
            if (words[i].length() >= 2 && words[i + 1].length() >= 2) {
                bigrams.add(words[i] + " " + words[i + 1]);
            }
        }
        return bigrams;
    }

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

    private String extractHeading(String section) {
        int newline = section.indexOf('\n');
        if (newline == -1) {
            return section;
        }
        return section.substring(0, newline).replaceAll("^#+\\s*", "").trim();
    }

    record SkillSection(String heading, String content, int score) {
    }
}
