package com.phucnguyen.agriai.module.ai.port;

import com.phucnguyen.agriai.module.diagnose.dto.response.DiagnoseResponse;


public interface GuidancePort {
    String generateGuidance(DiagnoseResponse response);
}
