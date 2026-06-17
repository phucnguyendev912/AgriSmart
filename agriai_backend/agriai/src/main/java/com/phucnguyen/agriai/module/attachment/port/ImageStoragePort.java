package com.phucnguyen.agriai.module.attachment.port;

import org.springframework.web.multipart.MultipartFile;


public interface ImageStoragePort {
    String upload(MultipartFile file);
}
