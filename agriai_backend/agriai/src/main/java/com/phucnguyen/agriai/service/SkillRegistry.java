package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.enums.SkillDefinition;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

// Service to load and cache skill markdown files from disk.
@Service
public class SkillRegistry {

    private static final Pattern KEYWORDS_PATTERN = Pattern.compile(
            "## Keywords\\s*\\n\\s*\\n([^#]+?)\\n\\s*\\n", Pattern.MULTILINE);

    private final String basePath;
    private final ConcurrentHashMap<SkillDefinition, String> contentCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<SkillDefinition, List<String>> keywordCache = new ConcurrentHashMap<>();

    public SkillRegistry(@Value("${agriai.skills.base-path:./skills}") String basePath) {
        this.basePath = basePath;
    }

    // Preloads all skills into cache at application startup.
    @PostConstruct
    public void preload() {
        for (SkillDefinition skill : SkillDefinition.values()) {
            String content = readFile(skill);
            contentCache.put(skill, content);
            keywordCache.put(skill, parseKeywords(content));
        }
    }

    // Returns the cached markdown content for a skill.
    public String getSkillContent(SkillDefinition skill) {
        return contentCache.computeIfAbsent(skill, s -> {
            String content = readFile(s);
            keywordCache.computeIfAbsent(s, k -> parseKeywords(content));
            return content;
        });
    }

    // Returns cached keywords parsed from the "## Keywords" section of the skill file.
    public List<String> getSkillKeywords(SkillDefinition skill) {
        return keywordCache.computeIfAbsent(skill, s -> parseKeywords(getSkillContent(s)));
    }

    // Clears the cache and reloads all skill content from disk.
    public void reloadAll() {
        contentCache.clear();
        keywordCache.clear();
        preload();
    }

    // Parses the "## Keywords" section into a list of cleaned keywords.
    List<String> parseKeywords(String markdown) {
        Matcher matcher = KEYWORDS_PATTERN.matcher(markdown);
        if (!matcher.find()) {
            return Collections.emptyList();
        }
        String keywordsLine = matcher.group(1).trim();
        return Arrays.stream(keywordsLine.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private String readFile(SkillDefinition skill) {
        Path filePath = skill.getFilePath(basePath);
        try {
            return Files.readString(filePath, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load skill file: " + filePath, e);
        }
    }
}
