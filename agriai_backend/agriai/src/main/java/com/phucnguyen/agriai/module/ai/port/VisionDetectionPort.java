package com.phucnguyen.agriai.module.ai.port;

import com.phucnguyen.agriai.module.ai.dto.VisionResultDTO;
import java.util.List;


public interface VisionDetectionPort {
    List<VisionResultDTO> detect(String imageUrl);
}
