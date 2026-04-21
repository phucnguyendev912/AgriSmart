package com.phucnguyen.agriai.port;

import org.springframework.web.multipart.MultipartFile;


public interface ImageStoragePort {
    String upload(MultipartFile file);
}
