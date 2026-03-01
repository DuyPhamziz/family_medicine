package com.familymed.guideline;

import com.familymed.guideline.dto.GuidelineRequest;
import com.familymed.guideline.dto.GuidelineResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/guidelines")
@RequiredArgsConstructor
public class GuidelineController {

    private final GuidelineService guidelineService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<List<GuidelineResponse>> getAll() {
        return ResponseEntity.ok(guidelineService.getAll());
    }

    @GetMapping("/form/{formId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<GuidelineResponse> getByFormId(@PathVariable UUID formId) {
        return guidelineService.getByFormId(formId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GuidelineResponse> create(@Valid @RequestBody GuidelineRequest request) {
        return ResponseEntity.ok(guidelineService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GuidelineResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody GuidelineRequest request) {
        return ResponseEntity.ok(guidelineService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        guidelineService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
