package com.phucnguyen.agriai.module.area.port;

public record NominatimResult(
                String displayName,
                String shortAddress,
                String province,
                String city,
                String district,
                String village,
                String road) {
}
