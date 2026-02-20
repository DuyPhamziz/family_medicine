package com.familymed.guideline;

import com.familymed.guideline.dto.GuidelineRequest;
import com.familymed.guideline.dto.GuidelineResponse;

import java.util.List;
import java.util.UUID;

public interface GuidelineService {
    List<GuidelineResponse> getAll();

    GuidelineResponse create(GuidelineRequest request);

    GuidelineResponse update(UUID id, GuidelineRequest request);

    void delete(UUID id);
}
