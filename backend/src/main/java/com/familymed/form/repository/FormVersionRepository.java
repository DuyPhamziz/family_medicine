package com.familymed.form.repository;

import com.familymed.form.entity.FormVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormVersionRepository extends JpaRepository<FormVersion, UUID> {
    
    List<FormVersion> findByFormFormIdOrderByVersionNumberDesc(UUID formId);
    
        Optional<FormVersion> findFirstByFormFormIdAndStatusOrderByVersionNumberDesc(
            UUID formId,
            FormVersion.VersionStatus status
        );
    
    Optional<FormVersion> findByFormFormIdAndVersionNumber(UUID formId, Integer versionNumber);
}
