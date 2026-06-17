package com.phucnguyen.agriai.module.area.port;

public interface NominatimPort {

    NominatimResult reverseGeocode(Double latitude, Double longitude);
}
