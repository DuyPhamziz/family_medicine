package com.familymed.form.repository;

import com.familymed.form.entity.FamilyDiseaseMatrixConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FamilyDiseaseMatrixConfigRepository extends JpaRepository<FamilyDiseaseMatrixConfig, UUID> {
    Optional<FamilyDiseaseMatrixConfig> findByQuestionQuestionId(UUID questionId);
    void deleteByQuestionQuestionId(UUID questionId);
}
