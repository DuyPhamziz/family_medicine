package com.familymed.form.application;

import com.familymed.form.dto.publicapi.PublicFormDetailDTO;
import com.familymed.form.dto.publicapi.PublicFormSubmitRequest;
import com.familymed.form.dto.publicapi.PublicFormSummaryDTO;
import com.familymed.form.service.PublicFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PublicFormSubmitUseCase {

    private final PublicFormService publicFormService;

    public List<PublicFormSummaryDTO> getPublicForms() {
        return publicFormService.getPublicForms();
    }

    public PublicFormDetailDTO getPublicForm(UUID formToken) {
        return publicFormService.getPublicForm(formToken);
    }

    public UUID getFormIdByToken(UUID formToken) {
        return publicFormService.getFormIdByToken(formToken);
    }

    public Map<String, Object> submitPublicForm(UUID formToken, PublicFormSubmitRequest request, String clientIp) {
        return publicFormService.submitPublicForm(formToken, request, clientIp);
    }
}
