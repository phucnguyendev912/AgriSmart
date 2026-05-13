package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.port.ImageStoragePort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DiagnosisAttachmentService {

    private final ImageStoragePort imageStoragePort;

    public DiagnosisAttachmentService(
            ImageStoragePort imageStoragePort) {
        this.imageStoragePort = imageStoragePort;
    }

    public String uploadAndSave(MultipartFile file, Integer diagnoseHistoryId) {
        return imageStoragePort.upload(file);
    }
}
