package com.familymed.form.application;

import com.familymed.form.dto.publicapi.PublicFormDetailDTO;
import com.familymed.form.entity.FormVersion;
import com.familymed.form.service.FormPublishWorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FormPublishUseCase {

    private final FormPublishWorkflowService publishWorkflowService;

    public FormVersion publish(UUID formId) {
        return publishWorkflowService.publishForm(formId);
    }

    public PublicFormDetailDTO getPublishedForm(UUID formId) {
        return publishWorkflowService.getPublishedForm(formId);
    }
}
