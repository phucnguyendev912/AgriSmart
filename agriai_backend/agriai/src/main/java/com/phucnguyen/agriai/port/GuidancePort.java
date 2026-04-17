package com.phucnguyen.agriai.port;

import com.phucnguyen.agriai.dto.response.DiagnoseResponse;

/**
 * Port interface for generating AI-based cultivation guidance text.
 * Implementations: LLMService (LangChain4J / Gemini / OpenAI).
 * Following D - Dependency Inversion Principle.
 */
public interface GuidancePort {
    String generateGuidance(DiagnoseResponse response);
}
