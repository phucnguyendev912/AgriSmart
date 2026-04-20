package com.phucnguyen.agriai.port;

public interface NominatimPort {
    /**
     * Reverse-geocode a GPS coordinate to a human-readable address.
     * Returns null if the API call fails.
     */
    NominatimResult reverseGeocode(Double latitude, Double longitude);
}
