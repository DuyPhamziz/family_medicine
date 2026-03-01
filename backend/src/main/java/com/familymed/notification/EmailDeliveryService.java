package com.familymed.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailDeliveryService {

    public void sendDoctorResponse(String toEmail, String message) {
        log.info("[EMAIL_STUB] Sending doctor response to {}: {}", toEmail, message);
    }
}
