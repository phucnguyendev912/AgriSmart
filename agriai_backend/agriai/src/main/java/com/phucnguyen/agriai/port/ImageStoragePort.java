package com.phucnguyen.agriai.port;

import org.springframework.web.multipart.MultipartFile;

/**
 * Port interface for uploading images to cloud storage.
 * Implementations: CloudinaryService.
 * Following D - Dependency Inversion Principle.
 */
public interface ImageStoragePort {
    String upload(MultipartFile file);
}
