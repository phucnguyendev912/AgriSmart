package com.phucnguyen.agriai.dto.request;

import com.phucnguyen.agriai.enums.SkillDefinition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class SendChatMessageRequest {

    @NotBlank(message = "Message content is required.")
    @Size(max = 1000, message = "Message must not exceed 1000 characters.")
    private String messageContent;

    // optional: skill hint from frontend dropdown; null means use intent classifier fallback
    private SkillDefinition selectedSkill;
}
