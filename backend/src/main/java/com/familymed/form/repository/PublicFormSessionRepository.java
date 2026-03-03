package com.familymed.form.repository;

import com.familymed.form.entity.PublicFormSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PublicFormSessionRepository extends JpaRepository<PublicFormSession, UUID> {
    
    Optional<PublicFormSession> findBySessionToken(UUID sessionToken);
    
    long countByClientIpAndCreatedAtAfter(String clientIp, LocalDateTime after);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
