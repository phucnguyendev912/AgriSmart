package com.phucnguyen.agriai.dto;

public record LocationConfirmPayload(
        Integer areaId,
        String displayName,
        String message,
        String redirectPath) {
}
