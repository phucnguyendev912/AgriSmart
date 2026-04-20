package com.phucnguyen.agriai.port;

public record NominatimResult(
                String displayName,
                String shortAddress,
                String province,
                String city,
                String district,
                String village,
                String road) {
}
