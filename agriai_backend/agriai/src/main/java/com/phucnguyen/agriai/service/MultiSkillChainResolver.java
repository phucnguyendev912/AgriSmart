package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.enums.SkillDefinition;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

// resolves whether a query needs chaining to a secondary skill (max 2 skills)
@Service
public class MultiSkillChainResolver {

    // rule-based chains: primary → possible secondary
    private static final Map<SkillDefinition, SkillDefinition> CHAIN_RULES = Map.of(
            SkillDefinition.DISEASE, SkillDefinition.TREATMENT,
            SkillDefinition.TREATMENT, SkillDefinition.CONFLICT
    );

    // trigger words that hint the user wants the chained skill too
    private static final Map<SkillDefinition, List<String>> CHAIN_TRIGGERS = Map.of(
            SkillDefinition.DISEASE, List.of(
                    "trị", "thuốc", "phun", "chữa", "điều trị", "xử lý"),
            SkillDefinition.TREATMENT, List.of(
                    "trộn", "pha", "kết hợp", "xung đột", "phối hợp")
    );

    // resolve primary skill → list of skills to use (1 or 2)
    public List<SkillDefinition> resolve(SkillDefinition primary, String userQuery) {
        List<SkillDefinition> skills = new ArrayList<>();
        skills.add(primary);

        SkillDefinition secondary = CHAIN_RULES.get(primary);
        if (secondary == null) {
            return skills;
        }

        // check if user query contains chain trigger words
        List<String> triggers = CHAIN_TRIGGERS.getOrDefault(primary, Collections.emptyList());
        String queryLower = userQuery.toLowerCase();
        boolean shouldChain = triggers.stream().anyMatch(queryLower::contains);

        if (shouldChain) {
            skills.add(secondary);
        }

        return skills;
    }
}
