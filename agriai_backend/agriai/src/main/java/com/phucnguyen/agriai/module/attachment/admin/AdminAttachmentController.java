package com.phucnguyen.agriai.module.attachment.admin;

import com.phucnguyen.agriai.module.attachment.dto.response.AttachmentResponse;
import com.phucnguyen.agriai.module.attachment.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping("/attachments")
    public ResponseEntity<Page<AttachmentResponse>> getAttachments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isDelete,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AttachmentResponse> attachments = attachmentService.getAttachmentsForAdmin(search, fileType, category, isDelete, pageable);
        return ResponseEntity.ok(attachments);
    }

    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable("id") Integer id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/attachments/{id}/restore")
    public ResponseEntity<Void> restoreAttachment(@PathVariable("id") Integer id) {
        attachmentService.restoreAttachment(id);
        return ResponseEntity.ok().build();
    }
}
