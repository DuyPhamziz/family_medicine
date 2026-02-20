package com.familymed.guideline;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GuidelineRepository extends JpaRepository<Guideline, UUID> {
}
