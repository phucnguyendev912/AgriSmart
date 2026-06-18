package com.phucnguyen.agriai.module.user.service;
import com.phucnguyen.agriai.module.attachment.service.AttachmentService;

import com.phucnguyen.agriai.module.user.dto.request.ProfileUpdateRequest;
import com.phucnguyen.agriai.module.user.dto.response.UserResponse;
import com.phucnguyen.agriai.module.user.entity.User;
import com.phucnguyen.agriai.infrastructure.exception.AppException;
import com.phucnguyen.agriai.module.attachment.entity.Attachment;
import com.phucnguyen.agriai.module.attachment.repository.AttachmentRepository;
import com.phucnguyen.agriai.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final AttachmentRepository attachmentRepository;
    private final AttachmentService attachmentService;

    public UserResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng."));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());

        if (request.getAvatarAttachmentId() != null) {
            Attachment attachment = attachmentRepository.findByIdAndIsDeleteFalse(request.getAvatarAttachmentId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp đính kèm làm ảnh đại diện."));
            user.setAttachment(attachment);
            
            // Link attachment
            attachmentService.linkAttachment(attachment.getId(), "USER", user.getId());
        }

        User updatedUser = userRepository.save(user);

        return UserResponse.builder()
                .id(updatedUser.getId())
                .fullName(updatedUser.getFullName())
                .email(updatedUser.getEmail())
                .phoneNumber(updatedUser.getPhoneNumber())
                .role(updatedUser.getRole() != null ? updatedUser.getRole().getRoleName() : null)
                .avatarUrl(updatedUser.getAttachment() != null ? updatedUser.getAttachment().getFileUrl() : null)
                .build();
    }
}
