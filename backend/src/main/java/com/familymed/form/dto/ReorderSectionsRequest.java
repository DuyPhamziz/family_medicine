package com.familymed.form.dto;

import lombok.Data;
import java.util.UUID;
import java.util.List;

@Data
public class ReorderSectionsRequest {
    private UUID formId;
    private List<SectionOrder> sectionOrders;

    @Data
    public static class SectionOrder {
        private UUID sectionId;
        private Integer newOrder;
    }
}
