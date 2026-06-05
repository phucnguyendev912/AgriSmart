package com.phucnguyen.agriai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.phucnguyen.agriai.dto.response.AttachmentResponse;
import com.phucnguyen.agriai.entity.Attachment;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.port.ImageStoragePort;
import com.phucnguyen.agriai.repository.AttachmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class AttachmentServiceTest {

    @Mock
    private AttachmentRepository attachmentRepository;

    @Mock
    private ImageStoragePort imageStoragePort;

    private AttachmentService attachmentService;

    @BeforeEach
    void setUp() {
        attachmentService = new AttachmentService(attachmentRepository, imageStoragePort);
    }

    @Test
    void uploadAttachment_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test_file.pdf", "application/pdf", new byte[]{1, 2, 3}
        );

        when(imageStoragePort.upload(file)).thenReturn("https://cloudinary.com/test_file.pdf");
        when(attachmentRepository.save(any(Attachment.class))).thenAnswer(invocation -> {
            Attachment attachment = invocation.getArgument(0);
            attachment.setId(42);
            return attachment;
        });

        AttachmentResponse response = attachmentService.uploadAttachment(file, "CHAT");

        assertNotNull(response);
        assertEquals(42, response.getId());
        assertEquals("test_file.pdf", response.getFileName());
        assertEquals("https://cloudinary.com/test_file.pdf", response.getFileUrl());
        assertEquals("DOCUMENT", response.getFileType());
        verify(imageStoragePort).upload(file);
        verify(attachmentRepository).save(any(Attachment.class));
    }

    @Test
    void uploadAttachment_fileTooLarge_throwsException() {
        // 11MB file
        byte[] largeBytes = new byte[11 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.png", "image/png", largeBytes
        );

        AppException exception = assertThrows(AppException.class, () ->
                attachmentService.uploadAttachment(file, "AVATAR")
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("vượt quá giới hạn"));
        verifyNoInteractions(imageStoragePort, attachmentRepository);
    }

    @Test
    void uploadAttachment_invalidExtension_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "malicious.exe", "application/octet-stream", new byte[]{1, 2, 3}
        );

        AppException exception = assertThrows(AppException.class, () ->
                attachmentService.uploadAttachment(file, "AVATAR")
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("Định dạng tệp không được hỗ trợ"));
        verifyNoInteractions(imageStoragePort, attachmentRepository);
    }

    @Test
    void getAttachment_success() {
        Attachment attachment = Attachment.builder()
                .id(10)
                .fileName("avatar.jpg")
                .fileUrl("https://cloudinary.com/avatar.jpg")
                .fileType("IMAGE")
                .isDelete(false)
                .build();

        when(attachmentRepository.findByIdAndIsDeleteFalse(10)).thenReturn(Optional.of(attachment));

        AttachmentResponse response = attachmentService.getAttachment(10);

        assertNotNull(response);
        assertEquals("avatar.jpg", response.getFileName());
    }

    @Test
    void getAttachment_notFound_throwsException() {
        when(attachmentRepository.findByIdAndIsDeleteFalse(99)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () ->
                attachmentService.getAttachment(99)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void deleteAttachment_success() {
        Attachment attachment = Attachment.builder()
                .id(10)
                .fileName("avatar.jpg")
                .fileUrl("https://cloudinary.com/avatar.jpg")
                .fileType("IMAGE")
                .isDelete(false)
                .build();

        when(attachmentRepository.findByIdAndIsDeleteFalse(10)).thenReturn(Optional.of(attachment));

        attachmentService.deleteAttachment(10);

        assertTrue(attachment.getIsDelete());
        assertNotNull(attachment.getDeletedAt());
        verify(attachmentRepository).save(attachment);
    }

    @Test
    void linkAttachment_success() {
        Attachment attachment = Attachment.builder()
                .id(10)
                .isDelete(false)
                .build();

        when(attachmentRepository.findByIdAndIsDeleteFalse(10)).thenReturn(Optional.of(attachment));

        attachmentService.linkAttachment(10, "USER", 5);

        assertEquals("USER", attachment.getReferenceType());
        assertEquals(5, attachment.getReferenceId());
        verify(attachmentRepository).save(attachment);
    }
}
