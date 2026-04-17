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

    @NotNull(message = "Anh chan doan la bat buoc.")
    private MultipartFile image;

    @NotNull(message = "cropTypeId la bat buoc.")
    private Integer cropTypeId;

    private Double latitude;

    private Double longitude;
}
