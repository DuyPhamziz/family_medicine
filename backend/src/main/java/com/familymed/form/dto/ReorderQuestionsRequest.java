package com.familymed.form.dto;

import lombok.Data;
import java.util.UUID;
import java.util.List;

@Data
public class ReorderQuestionsRequest {
    private UUID sectionId;
    private List<QuestionOrder> questionOrders;

    @Data
    public static class QuestionOrder {
        private UUID questionId;
        private Integer newOrder;
    }
}
