package com.phucnguyen.agriai.module.diagnose.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
public class DiagnoseRequest {

    @NotNull(message = "Ảnh không hợp lệ, vui lòng thử lại")
    private MultipartFile image;

    @NotNull(message = "Vui lòng chọn loại cây trồng trước khi chẩn đoán")
    private Integer cropTypeId;

    private Double latitude;

    private Double longitude;

    public boolean hasGps() {
        return latitude != null && longitude != null;
    }
}
