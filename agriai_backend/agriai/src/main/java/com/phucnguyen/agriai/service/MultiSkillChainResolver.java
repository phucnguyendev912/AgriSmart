package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.enums.SkillDefinition;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class MultiSkillChainResolver {

    private static final Map<SkillDefinition, SkillDefinition> CHAIN_RULES = Map.of(
            SkillDefinition.DISEASE, SkillDefinition.TREATMENT,
            SkillDefinition.TREATMENT, SkillDefinition.CONFLICT
    );

    private static final Map<SkillDefinition, List<String>> CHAIN_TRIGGERS = Map.of(
            SkillDefinition.DISEASE, List.of(
                    "trị", "thuốc", "phun", "chữa", "điều trị", "xử lý"),
            SkillDefinition.TREATMENT, List.of(
                    "trộn", "pha", "kết hợp", "xung đột", "phối hợp")
    );

    public List<SkillDefinition> resolve(SkillDefinition primary, String userQuery) {
        List<SkillDefinition> skills = new ArrayList<>();
        skills.add(primary);

        SkillDefinition secondary = CHAIN_RULES.get(primary);
        if (secondary == null) {
            return skills;
        }

        // Check if the user query contains any chain trigger words.
        List<String> triggers = CHAIN_TRIGGERS.getOrDefault(primary, Collections.emptyList());
        String queryLower = userQuery.toLowerCase();
        boolean shouldChain = triggers.stream().anyMatch(queryLower::contains);

        if (shouldChain) {
            skills.add(secondary);
        }

        return skills;
    }
}
