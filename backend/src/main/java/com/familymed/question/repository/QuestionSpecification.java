package com.familymed.question.repository;

import com.familymed.question.entity.QuestionBank;
import com.familymed.question.entity.QuestionType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class QuestionSpecification {

    public static Specification<QuestionBank> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(keyword)) {
                return null;
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("questionText")), likePattern),
                cb.like(cb.lower(root.get("questionCode")), likePattern)
            );
        };
    }

    public static Specification<QuestionBank> hasType(QuestionType type) {
        return (root, query, cb) -> {
            if (type == null) {
                return null;
            }
            return cb.equal(root.get("questionType"), type);
        };
    }

    public static Specification<QuestionBank> hasActiveStatus(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) {
                return null;
            }
            return cb.equal(root.get("isActive"), isActive);
        };
    }
}
