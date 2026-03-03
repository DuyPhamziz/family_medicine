package com.familymed.form.scheduled;

import com.familymed.form.service.PublicFormAntiSpamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled tasks for public form maintenance
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PublicFormScheduledTasks {
    
    private final PublicFormAntiSpamService antiSpamService;
    
    /**
     * Clean up expired sessions every hour
     * Runs at 5 minutes past every hour
     */
    @Scheduled(cron = "0 5 * * * *")
    public void cleanupExpiredSessions() {
        log.info("Starting scheduled cleanup of expired public form sessions");
        try {
            antiSpamService.cleanupExpiredSessions();
            log.info("Successfully cleaned up expired sessions");
        } catch (Exception e) {
            log.error("Error during session cleanup", e);
        }
    }
}
