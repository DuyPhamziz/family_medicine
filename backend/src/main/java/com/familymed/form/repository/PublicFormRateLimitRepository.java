package com.familymed.form.repository;

import com.familymed.form.entity.PublicFormRateLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PublicFormRateLimitRepository extends JpaRepository<PublicFormRateLimit, UUID> {
    
    Optional<PublicFormRateLimit> findByClientIpAndFormIdAndSubmissionDateAfter(
        String clientIp, 
        UUID formId, 
        LocalDateTime after
    );
    
    List<PublicFormRateLimit> findByClientIpAndSubmissionDateAfter(
        String clientIp, 
        LocalDateTime after
    );
    
    long countByClientIpAndSubmissionDateAfterAndBlocked(
        String clientIp,
        LocalDateTime after,
        Boolean blocked
    );
}
