package com.phucnguyen.agriai.module.area.service;

import com.phucnguyen.agriai.module.ai.dto.LocationConfirmPayload;
import com.phucnguyen.agriai.module.area.entity.AreaInfor;
import com.phucnguyen.agriai.module.user.entity.User;
import com.phucnguyen.agriai.module.area.port.NominatimPort;
import com.phucnguyen.agriai.module.area.port.NominatimResult;
import com.phucnguyen.agriai.module.area.repository.AreaInforRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeocodingService {

    private final NominatimPort nominatimPort;
    private final AreaInforRepository areaInforRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;


    public void processGeocoding(User user, Double lat, Double lon) {
        // 1. Call Nominatim API to get the physical address.
        NominatimResult result = nominatimPort.reverseGeocode(lat, lon);
        if (result == null || result.displayName() == null) {
            log.warn("Cannot get address from Nominatim for coordinates ({}, {})", lat, lon);
            return;
        }


        // 2. Kiểm tra trùng dựa trên địa chỉ (short address)
        if (areaInforRepository.existsByUserIdAndAddressAndIsDeleteFalse(user.getId(), result.shortAddress())) {
            log.debug("Địa chỉ '{}' đã tồn tại cho user {}", result.shortAddress(), user.getId());

            return;
        }

        // 3. Save the new area with an unconfirmed status.
        AreaInfor saved = areaInforRepository.save(
                AreaInfor.builder()
                        .user(user)
                        .areaName("Khu vực canh tác mới")
                        .latitude(lat)
                        .longitude(lon)
                        .address(result.shortAddress())
                        .province(result.province())
                        .build());

        // 4. Send a WebSocket notification to the user to confirm the location.
        String message = "Địa chỉ khu vực canh tác của bạn ở: " + result.shortAddress()
                + ". Hãy vào trang Khu vực canh tác để xác nhận!";

        simpMessagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/location-confirm",
                new LocationConfirmPayload(
                        saved.getId(),
                        result.shortAddress(),
                        message,
                        "/farming-areas"));

        log.info("Suggested new area '{}' to user {}", result.shortAddress(), user.getEmail());

    }
}
