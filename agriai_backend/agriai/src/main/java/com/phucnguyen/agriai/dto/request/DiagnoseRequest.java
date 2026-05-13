package com.phucnguyen.agriai.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
public class DiagnoseRequest {

    @NotNull(message = "Image is required.")
    private MultipartFile image;

    @NotNull(message = "Crop type ID is required.")
    private Integer cropTypeId;

    private Double latitude;

    private Double longitude;

    public boolean hasGps() {
        return latitude != null && longitude != null;
    }
}
