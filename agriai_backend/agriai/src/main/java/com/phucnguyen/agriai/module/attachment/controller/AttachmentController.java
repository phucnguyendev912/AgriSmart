package com.phucnguyen.agriai.module.attachment.controller;

import com.phucnguyen.agriai.module.attachment.dto.response.AttachmentResponse;
import com.phucnguyen.agriai.module.attachment.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category) {
        return ResponseEntity.ok(attachmentService.uploadAttachment(file, category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttachmentResponse> get(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(attachmentService.getAttachment(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }
}
