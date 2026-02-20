package com.familymed.icd10;

import com.familymed.icd10.dto.Icd10CodeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/icd10")
@RequiredArgsConstructor
public class Icd10Controller {

    private final Icd10Service icd10Service;

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<List<Icd10CodeResponse>> search(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(icd10Service.search(keyword));
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<Icd10CodeResponse> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(icd10Service.getByCode(code));
    }
}
