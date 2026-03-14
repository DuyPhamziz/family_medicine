package com.familymed.form.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkQuestionGroupUpdateRequest {
    private List<UUID> questionIds;
    private String groupId;
    private UUID rootQuestionId;
    private Integer maxRepeat;
    private String labelAddButton;
}
