package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.entity.Attachment;
import com.phucnguyen.agriai.port.ImageStoragePort;
import com.phucnguyen.agriai.repository.AttachmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DiagnosisAttachmentService {

    private final ImageStoragePort imageStoragePort;
    private final AttachmentRepository attachmentRepository;

    public DiagnosisAttachmentService(
            ImageStoragePort imageStoragePort,
            AttachmentRepository attachmentRepository) {
        this.imageStoragePort = imageStoragePort;
        this.attachmentRepository = attachmentRepository;
    }

    public String uploadAndSave(MultipartFile file, Integer diagnoseHistoryId) {
        String imageUrl = imageStoragePort.upload(file);
        Attachment attachment = Attachment.builder()
                .referenceType("DiagnoseHistory")
                .referenceId(diagnoseHistoryId)
                .fileName(file.getOriginalFilename())
                .fileUrl(imageUrl)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .category("diagnosis")
                .build();
        attachmentRepository.save(attachment);
        return imageUrl;
    }
}
