package com.phucnguyen.agriai.module.ai.dto;

public record LocationConfirmPayload(
        Integer areaId,
        String displayName,
        String message,
        String redirectPath) {
}
