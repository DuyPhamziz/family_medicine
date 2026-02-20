package com.familymed.icd10.repository;

import com.familymed.icd10.entity.Icd10Code;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Icd10CodeRepository extends JpaRepository<Icd10Code, String> {
    List<Icd10Code> findTop50ByOrderByCodeAsc();

    List<Icd10Code> findByCodeContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String codeKeyword,
                                                                                   String descriptionKeyword);
}
