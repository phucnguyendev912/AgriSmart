package com.phucnguyen.agriai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InteractionWarningDTO {
    private Integer ingredientAId;
    private String ingredientAName;
    private Integer ingredientBId;
    private String ingredientBName;
    private String interactionType;
    private String severity;
    private String actionRule;
    private String warningMessage;
    private Boolean blocksMixing;
    private Integer intervalDays;
}
