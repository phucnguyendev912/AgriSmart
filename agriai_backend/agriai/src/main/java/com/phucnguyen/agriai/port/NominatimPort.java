package com.phucnguyen.agriai.port;

public interface NominatimPort {

    NominatimResult reverseGeocode(Double latitude, Double longitude);
}
