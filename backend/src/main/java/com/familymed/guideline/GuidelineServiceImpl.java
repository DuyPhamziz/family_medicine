package com.familymed.guideline;

import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.guideline.dto.GuidelineRequest;
import com.familymed.guideline.dto.GuidelineResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GuidelineServiceImpl implements GuidelineService {

    private final GuidelineRepository guidelineRepository;
    private final DiagnosticFormRepository diagnosticFormRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GuidelineResponse> getAll() {
        return guidelineRepository.findAll().stream()
                .map(GuidelineResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public GuidelineResponse create(GuidelineRequest request) {
        Guideline guideline = new Guideline();
        guideline.setId(UUID.randomUUID());
        guideline.setTitle(request.getTitle());
        guideline.setSummary(request.getSummary());
        guideline.setContent(request.getContent());
        guideline.setCategory(request.getCategory());
        guideline.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        guideline.setOwner(request.getOwner());
        guideline.setRecommendations(request.getRecommendations());
        guideline.setReferenceList(request.getReferenceList());
        
        // Link to form if formId provided
        if (request.getFormId() != null) {
            DiagnosticForm form = diagnosticFormRepository.findById(request.getFormId())
                    .orElseThrow(() -> new RuntimeException("Form not found"));
            guideline.setForm(form);
        }
        
        guideline.setCreatedAt(LocalDateTime.now());
        guideline.setUpdatedAt(LocalDateTime.now());
        
        return GuidelineResponse.fromEntity(guidelineRepository.save(guideline));
    }

    @Override
    @Transactional
    public GuidelineResponse update(UUID id, GuidelineRequest request) {
        Guideline guideline = guidelineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guideline not found"));
        
        guideline.setTitle(request.getTitle());
        guideline.setSummary(request.getSummary());
        guideline.setContent(request.getContent());
        guideline.setCategory(request.getCategory());
        guideline.setStatus(request.getStatus());
        guideline.setOwner(request.getOwner());
        guideline.setRecommendations(request.getRecommendations());
        guideline.setReferenceList(request.getReferenceList());
        
        // Link to form if formId provided
        if (request.getFormId() != null) {
            DiagnosticForm form = diagnosticFormRepository.findById(request.getFormId())
                    .orElseThrow(() -> new RuntimeException("Form not found"));
            guideline.setForm(form);
        } else {
            guideline.setForm(null);
        }
        
        guideline.setUpdatedAt(LocalDateTime.now());
        
        return GuidelineResponse.fromEntity(guidelineRepository.save(guideline));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        guidelineRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GuidelineResponse> getByFormId(UUID formId) {
        return guidelineRepository.findByFormFormId(formId)
                .map(GuidelineResponse::fromEntity);
    }
}
