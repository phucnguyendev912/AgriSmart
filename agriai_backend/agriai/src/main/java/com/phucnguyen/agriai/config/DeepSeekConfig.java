package com.phucnguyen.agriai.config;

import dev.langchain4j.model.openai.OpenAiChatModel;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DeepSeekConfig {

    @Bean
    @ConditionalOnProperty(value = "deepseek.api.key")
    public OpenAiChatModel deepSeekChatModel(
            @Value("${deepseek.api.key}") String apiKey,
            @Value("${deepseek.base-url}") String baseUrl,
            @Value("${deepseek.model-name}") String modelName) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }
        return OpenAiChatModel.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .modelName(modelName)
                .temperature(0.2)
                .timeout(Duration.ofSeconds(120))
                .build();
    }
}
