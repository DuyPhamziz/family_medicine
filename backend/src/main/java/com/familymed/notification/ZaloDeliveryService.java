package com.familymed.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ZaloDeliveryService {

    public void sendDoctorResponse(String phone, String message) {
        log.info("[ZALO_STUB] Sending doctor response to {}: {}", phone, message);
    }
}
