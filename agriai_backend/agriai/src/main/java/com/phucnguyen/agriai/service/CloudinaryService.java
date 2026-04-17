package com.phucnguyen.agriai.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.phucnguyen.agriai.port.ImageStoragePort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class CloudinaryService implements ImageStoragePort {

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public String upload(MultipartFile file) {
        try {
            // Upload ảnh lên Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            // Trả về URL ảnh
            return uploadResult.get("url").toString();
        } catch (Exception e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage(), e);
        }
    }
}
