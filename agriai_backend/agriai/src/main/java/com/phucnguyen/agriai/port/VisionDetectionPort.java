package com.phucnguyen.agriai.port;

import com.phucnguyen.agriai.dto.VisionResultDTO;
import java.util.List;


public interface VisionDetectionPort {
    List<VisionResultDTO> detect(String imageUrl, String modelFilePath);
}
