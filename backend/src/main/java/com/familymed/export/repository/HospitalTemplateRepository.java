package com.familymed.export.repository;

import com.familymed.export.entity.HospitalTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalTemplateRepository extends JpaRepository<HospitalTemplate, UUID> {
    Optional<HospitalTemplate> findByActiveAndIsDefaultTrue(Boolean active);
    Optional<HospitalTemplate> findByIsDefaultTrue();
}
