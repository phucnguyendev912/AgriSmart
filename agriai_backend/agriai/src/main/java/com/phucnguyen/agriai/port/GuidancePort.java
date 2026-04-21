package com.phucnguyen.agriai.port;

import com.phucnguyen.agriai.dto.response.DiagnoseResponse;


public interface GuidancePort {
    String generateGuidance(DiagnoseResponse response);
}
