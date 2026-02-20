package com.familymed.icd10;

import com.familymed.icd10.entity.Icd10Code;
import com.familymed.icd10.repository.Icd10CodeRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class Icd10DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(Icd10DataInitializer.class);
    private static final UUID SYSTEM_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private final Icd10CodeRepository codeRepository;
    private final ResourceLoader resourceLoader;

    public Icd10DataInitializer(Icd10CodeRepository codeRepository, ResourceLoader resourceLoader) {
        this.codeRepository = codeRepository;
        this.resourceLoader = resourceLoader;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (codeRepository.count() > 0) {
            logger.info("ICD10_INIT skipped, existing rows={}", codeRepository.count());
            return;
        }

        Resource resource = resourceLoader.getResource("classpath:icd10_codes.csv");
        if (!resource.exists()) {
            logger.warn("ICD10_INIT skipped, icd10_codes.csv not found on classpath");
            return;
        }

        List<Icd10Code> toSave = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }

                List<String> columns = parseCsvLine(line);
                if (columns.isEmpty()) {
                    continue;
                }

                String code = safeGet(columns, 0);
                if (code == null || code.equalsIgnoreCase("code")) {
                    continue;
                }

                Icd10Code icd10Code = new Icd10Code();
                icd10Code.setCode(code);
                icd10Code.setDescription(safeGet(columns, 1));
                icd10Code.setChapter(safeGet(columns, 2));
                icd10Code.setBillable(parseBoolean(safeGet(columns, 3)));
                icd10Code.setCreatedAt(LocalDateTime.now());
                icd10Code.setCreatedBy(SYSTEM_USER_ID);

                toSave.add(icd10Code);
            }
        }

        if (!toSave.isEmpty()) {
            codeRepository.saveAll(toSave);
        }

        logger.info("ICD10_INIT loadedRows={}", toSave.size());
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (ch == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch == ',' && !inQuotes) {
                values.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }

        values.add(current.toString().trim());
        return values;
    }

    private String safeGet(List<String> values, int index) {
        if (index >= values.size()) {
            return null;
        }
        String value = values.get(index);
        return value != null && !value.isBlank() ? value.trim() : null;
    }

    private boolean parseBoolean(String value) {
        if (value == null) {
            return true;
        }
        String normalized = value.trim().toLowerCase();
        return normalized.equals("true") || normalized.equals("1") || normalized.equals("y") || normalized.equals("yes");
    }
}
