package com.familymed.icd10;

import com.familymed.icd10.entity.Icd10Code;
import com.familymed.icd10.repository.Icd10CodeRepository;

import com.familymed.icd10.dto.Icd10CodeResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class Icd10Service {

    private static final Logger logger = LoggerFactory.getLogger(Icd10Service.class);

    private final Icd10CodeRepository codeRepository;

    @Transactional(readOnly = true)
    public List<Icd10CodeResponse> search(String keyword) {
        List<Icd10Code> codes;
        if (keyword == null || keyword.isBlank()) {
            codes = codeRepository.findTop50ByOrderByCodeAsc();
        } else {
            String normalized = keyword.trim();
            codes = codeRepository.findByCodeContainingIgnoreCaseOrDescriptionContainingIgnoreCase(normalized, normalized);
        }

        logger.info("ICD10_SEARCH keyword={} results={}", keyword, codes.size());

        return codes.stream()
                .map(Icd10CodeResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Icd10CodeResponse getByCode(String code) {
        Icd10Code entity = codeRepository.findById(code)
                .orElseThrow(() -> new RuntimeException("ICD-10 code not found"));
        return Icd10CodeResponse.fromEntity(entity);
    }
}
