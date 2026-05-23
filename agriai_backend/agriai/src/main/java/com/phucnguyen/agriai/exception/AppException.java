package com.phucnguyen.agriai.exception;

import org.springframework.http.HttpStatus;

// Custom runtime exception to handle application-specific errors with a HTTP status code
public class AppException extends RuntimeException {
    private final HttpStatus status;

    // Create exception with designated HTTP status and message
    public AppException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
