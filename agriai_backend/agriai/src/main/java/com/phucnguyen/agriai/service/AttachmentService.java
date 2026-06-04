package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.response.AttachmentResponse;
import com.phucnguyen.agriai.entity.Attachment;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.port.ImageStoragePort;
import com.phucnguyen.agriai.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final ImageStoragePort imageStoragePort;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "csv", "xlsx", "xls", "pdf", "docx", "doc", "jpg", "jpeg", "png"
    );

    public AttachmentResponse uploadAttachment(MultipartFile file, String category) {
        if (file == null || file.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tệp tải lên không được để trống.");
        }

        // Validate File Size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Dung lượng tệp vượt quá giới hạn cho phép (tối đa 10MB).");
        }

        // Validate Extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tên tệp không hợp lệ.");
        }

        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new AppException(HttpStatus.BAD_REQUEST, 
                    "Định dạng tệp không được hỗ trợ. Chỉ cho phép các định dạng: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // Upload to Cloudinary
        String fileUrl;
        try {
            fileUrl = imageStoragePort.upload(file);
        } catch (Exception e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Tải tệp lên Cloudinary thất bại: " + e.getMessage());
        }

        // Determine general file type
        String fileType = determineFileType(extension);

        // Build and Save Entity
        Attachment attachment = Attachment.builder()
                .fileName(originalFilename)
                .fileUrl(fileUrl)
                .fileType(fileType)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .category(category)
                .isDelete(false)
                .build();

        Attachment savedAttachment = attachmentRepository.save(attachment);
        return toResponse(savedAttachment);
    }

    public AttachmentResponse getAttachment(Integer id) {
        Attachment attachment = attachmentRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp đính kèm."));
        return toResponse(attachment);
    }

    public void deleteAttachment(Integer id) {
        Attachment attachment = attachmentRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp đính kèm."));
        
        attachment.setIsDelete(true);
        attachment.setDeletedAt(LocalDateTime.now());
        // Note: For now, we only perform soft delete in DB, keeping file physically on Cloudinary for audit log.
        attachmentRepository.save(attachment);
    }

    public void linkAttachment(Integer id, String referenceType, Integer referenceId) {
        if (id == null) return;
        Attachment attachment = attachmentRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp đính kèm với ID: " + id));
        
        attachment.setReferenceType(referenceType);
        attachment.setReferenceId(referenceId);
        attachmentRepository.save(attachment);
    }

    private String getFileExtension(String filename) {
        int lastIndexOf = filename.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return "";
        }
        return filename.substring(lastIndexOf + 1).toLowerCase(Locale.ROOT);
    }

    private String determineFileType(String extension) {
        switch (extension) {
            case "jpg":
            case "jpeg":
            case "png":
                return "IMAGE";
            case "pdf":
            case "docx":
            case "doc":
            case "xlsx":
            case "xls":
            case "csv":
                return "DOCUMENT";
            default:
                return "OTHER";
        }
    }

    private AttachmentResponse toResponse(Attachment attachment) {
        return AttachmentResponse.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileUrl(attachment.getFileUrl())
                .fileType(attachment.getFileType())
                .fileSize(attachment.getFileSize())
                .mimeType(attachment.getMimeType())
                .category(attachment.getCategory())
                .build();
    }
}
