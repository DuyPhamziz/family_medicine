package com.familymed.form.repository;

import com.familymed.form.entity.PublicFormAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PublicFormAccessRepository extends JpaRepository<PublicFormAccess, UUID> {
    
    Optional<PublicFormAccess> findByAccessToken(String accessToken);
    
    Optional<PublicFormAccess> findByUrlSlug(String urlSlug);
    
    Optional<PublicFormAccess> findByAccessTokenAndStatusEquals(String token, PublicFormAccess.AccessStatus status);
}
