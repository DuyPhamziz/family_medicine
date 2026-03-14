package com.familymed.form.service;

import com.familymed.form.dto.publicapi.PublicFormDetailDTO;
import com.familymed.form.dto.publicapi.PublicFormOptionDTO;
import com.familymed.form.dto.publicapi.PublicFormQuestionDTO;
import com.familymed.form.dto.publicapi.PublicFormQuestionGroupDTO;
import com.familymed.form.dto.publicapi.PublicFormSectionDTO;
import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.entity.FormQuestion;
import com.familymed.form.entity.FormQuestionOption;
import com.familymed.form.entity.FormSection;
import com.familymed.form.entity.FormVersion;
import com.familymed.form.exception.FormValidationException;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.form.repository.FormVersionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FormPublishWorkflowService {

    private final DiagnosticFormRepository formRepository;
    private final FormVersionRepository formVersionRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public FormVersion publishForm(UUID formId) {
        UUID safeFormId = Objects.requireNonNull(formId, "formId is required");
        DiagnosticForm form = formRepository.findById(safeFormId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        validateDraft(form);

        FormVersion latest = formVersionRepository.findTopByFormFormIdOrderByVersionNumberDesc(formId).orElse(null);
        int nextVersion = latest == null ? 1 : latest.getVersionNumber() + 1;

        String schemaJson = buildSchemaJson(form, nextVersion);

        if (form.getPublishedVersionId() != null) {
            UUID publishedVersionId = Objects.requireNonNull(form.getPublishedVersionId());
            formVersionRepository.findById(publishedVersionId).ifPresent(previous -> {
                previous.setStatus(FormVersion.VersionStatus.DEPRECATED);
                previous.setIsActive(false);
                formVersionRepository.save(previous);
            });
        }

        FormVersion newVersion = new FormVersion();
        newVersion.setVersionId(UUID.randomUUID());
        newVersion.setForm(form);
        newVersion.setVersionNumber(nextVersion);
        newVersion.setFormSchemaJson(schemaJson);
        newVersion.setScoringRulesJson(form.getScoringRules());
        newVersion.setStatus(FormVersion.VersionStatus.PUBLISHED);
        newVersion.setIsActive(true);
        newVersion.setChangeLog("Published from doctor draft");
        newVersion.setPublishedAt(LocalDateTime.now());

        FormVersion savedVersion = formVersionRepository.save(newVersion);

        form.setPublishedVersionId(savedVersion.getVersionId());
        form.setVersion(savedVersion.getVersionNumber());
        form.setStatus(DiagnosticForm.FormStatus.PUBLISHED);
        form.setIsPublic(true);  // Make form publicly accessible when published
        if (form.getPublicToken() == null) {
            form.setPublicToken(UUID.randomUUID());  // Generate public token if not exists
        }
        formRepository.save(form);

        return savedVersion;
    }

    @Transactional(readOnly = true)
    public PublicFormDetailDTO getPublishedForm(UUID formId) {
        UUID safeFormId = Objects.requireNonNull(formId, "formId is required");
        DiagnosticForm form = formRepository.findById(safeFormId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        FormVersion version = getPublishedVersion(form);
        return toPublicDetail(form, version);
    }

    @Transactional(readOnly = true)
    public FormVersion getPublishedVersionByToken(UUID publicToken) {
        DiagnosticForm form = formRepository.findByPublicToken(publicToken)
                .orElseThrow(() -> new RuntimeException("Public form not found"));
        return getPublishedVersion(form);
    }

    @Transactional(readOnly = true)
    public PublicFormDetailDTO getPublishedFormByToken(UUID publicToken) {
        DiagnosticForm form = formRepository.findByPublicToken(publicToken)
                .orElseThrow(() -> new RuntimeException("Public form not found"));
        FormVersion version = getPublishedVersion(form);
        return toPublicDetail(form, version);
    }

    @Transactional(readOnly = true)
    public Map<String, UUID> getPublishedQuestionCodeMap(UUID formId) {
        UUID safeFormId = Objects.requireNonNull(formId, "formId is required");
        DiagnosticForm form = formRepository.findById(safeFormId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        FormVersion version = getPublishedVersion(form);

        try {
            JsonNode root = objectMapper.readTree(version.getFormSchemaJson());
            Map<String, UUID> result = new HashMap<>();

            JsonNode sections = root.path("sections");
            if (!sections.isArray()) {
                return result;
            }

            for (JsonNode section : sections) {
                JsonNode questions = section.path("questions");
                if (!questions.isArray()) {
                    continue;
                }
                for (JsonNode question : questions) {
                    String questionCode = asText(question, "questionCode", null);
                    String questionId = asText(question, "questionId", null);
                    if (questionCode != null && questionId != null) {
                        try {
                            result.put(questionCode, UUID.fromString(questionId));
                        } catch (IllegalArgumentException ignored) {
                        }
                    }
                }
            }
            return result;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to parse published schema", ex);
        }
    }

    public String buildSchemaJson(DiagnosticForm form, Integer versionNumber) {
        try {
            Map<String, Object> root = new LinkedHashMap<>();
            root.put("schemaVersion", "1.0");
            root.put("formId", form.getFormId());
            root.put("title", form.getFormName());
            root.put("description", form.getDescription());
            root.put("category", form.getCategory());
            root.put("estimatedTime", form.getEstimatedTime());
            root.put("iconColor", form.getIconColor());
            root.put("version", versionNumber);

            List<Map<String, Object>> sectionMaps = new ArrayList<>();
            List<FormSection> sections = form.getSections() == null ? List.of() : form.getSections();
            sections.stream()
                    .sorted(Comparator.comparing(FormSection::getSectionOrder, Comparator.nullsLast(Integer::compareTo)))
                    .forEach(section -> sectionMaps.add(toSectionMap(section)));

            root.put("sections", sectionMaps);
            return objectMapper.writeValueAsString(root);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to build published schema", ex);
        }
    }

    private void validateDraft(DiagnosticForm form) {
        List<FormSection> sections = form.getSections() == null ? List.of() : form.getSections();
        
        if (sections.isEmpty()) {
            log.error("Form {} has no sections", form.getFormId());
            throw new FormValidationException("Biểu mẫu phải có ít nhất một phần trước khi công khai");
        }

        Set<String> questionCodes = new HashSet<>();

        for (FormSection section : sections) {
            if (section.getSectionId() == null) {
                log.warn("Form {} has section with null ID", form.getFormId());
            }
            
            List<FormQuestion> questions = section.getQuestions() == null ? List.of() : section.getQuestions();
            if (questions.isEmpty()) {
                log.error("Form {} section {} ({}) has no questions", 
                    form.getFormId(), section.getSectionId(), section.getSectionName());
                throw new FormValidationException(
                    "Phần '" + section.getSectionName() + "' không có câu hỏi nào");
            }

            Set<Integer> orderIndices = new HashSet<>();
            for (FormQuestion question : questions) {
                // Validate questionOrder
                if (question.getQuestionOrder() == null) {
                    log.error("Form {} question {} has null order", 
                        form.getFormId(), question.getQuestionId());
                    throw new FormValidationException(
                        "Câu hỏi phải có thứ tự sắp xếp (order) trong phần '" + section.getSectionName() + "'");
                }
                
                if (!orderIndices.add(question.getQuestionOrder())) {
                    log.error("Form {} section {} has duplicate order {}", 
                        form.getFormId(), section.getSectionId(), question.getQuestionOrder());
                    throw new FormValidationException(
                        "Phần '" + section.getSectionName() + "' có các câu hỏi với cùng thứ tự sắp xếp: " + 
                        question.getQuestionOrder());
                }
                
                // Validate question code
                if (question.getQuestionCode() == null || question.getQuestionCode().isBlank()) {
                    log.error("Form {} question {} has empty code", 
                        form.getFormId(), question.getQuestionId());
                    throw new FormValidationException(
                        "Mỗi câu hỏi phải có mã câu hỏi (question code)");
                }
                
                // Validate question text
                if (question.getQuestionText() == null || question.getQuestionText().isBlank()) {
                    log.error("Form {} question {} ({}) has empty text", 
                        form.getFormId(), question.getQuestionId(), question.getQuestionCode());
                    throw new FormValidationException(
                        "Câu hỏi '" + question.getQuestionCode() + "' phải có nội dung câu hỏi");
                }

                if (Boolean.TRUE.equals(question.getIsRepeatableGroup())) {
                    if (question.getGroupId() == null || question.getGroupId().isBlank()) {
                        throw new FormValidationException(
                            "Câu hỏi '" + question.getQuestionCode() + "' bật repeat group nhưng thiếu group_id");
                    }
                    if (question.getMaxRepeat() != null && question.getMaxRepeat() < 0) {
                        throw new FormValidationException(
                            "Câu hỏi '" + question.getQuestionCode() + "' có max_repeat không hợp lệ");
                    }
                }
                
                questionCodes.add(question.getQuestionCode());

                // Validate choice questions have options
                String type = question.getQuestionType() == null ? "" : question.getQuestionType().name();
                if (isChoiceType(type)) {
                    List<FormQuestionOption> options = question.getOptionItems() == null ? List.of() : question.getOptionItems();
                    if (options.isEmpty()) {
                        log.error("Form {} choice question {} ({}) has no options", 
                            form.getFormId(), question.getQuestionId(), question.getQuestionCode());
                        throw new FormValidationException(
                            "Câu hỏi lựa chọn '" + question.getQuestionCode() + "' phải có ít nhất một lựa chọn");
                    }
                }
            }
        }

        // Validate display conditions reference valid questions
        for (FormSection section : sections) {
            List<FormQuestion> questions = section.getQuestions() == null ? List.of() : section.getQuestions();
            for (FormQuestion question : questions) {
                try {
                    validateConditionJson(question.getDisplayCondition(), questionCodes, question.getQuestionCode());
                } catch (FormValidationException ex) {
                    log.error("Display condition validation failed for question {}", question.getQuestionCode(), ex);
                    throw ex;
                }
            }
        }
        
        log.info("Form {} validation passed with {} questions", form.getFormId(), questionCodes.size());
    }

    private void validateConditionJson(String conditionJson, Set<String> questionCodes, String currentQuestionCode) {
        if (conditionJson == null || conditionJson.isBlank()) {
            return;
        }

        try {
            JsonNode node = objectMapper.readTree(conditionJson);
            Set<String> refs = new HashSet<>();
            collectQuestionCodeReferences(node, refs);

            for (String ref : refs) {
                if (!questionCodes.contains(ref)) {
                    log.error("Display condition for question {} references unknown question: {}", 
                        currentQuestionCode, ref);
                    throw new FormValidationException(
                        "Điều kiện hiển thị của câu hỏi '" + currentQuestionCode + 
                        "' tham chiếu đến câu hỏi không tồn tại: '" + ref + "'");
                }
                if (ref.equals(currentQuestionCode)) {
                    log.error("Question {} has self-referencing display condition", currentQuestionCode);
                    throw new FormValidationException(
                        "Câu hỏi '" + currentQuestionCode + "' không thể tham chiếu tới chính nó trong điều kiện hiển thị");
                }
            }
        } catch (FormValidationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to parse display condition for question {}: {}", currentQuestionCode, ex.getMessage());
            throw new FormValidationException(
                "Điều kiện hiển thị không hợp lệ cho câu hỏi '" + currentQuestionCode + "': " + ex.getMessage(), ex);
        }
    }

    private void collectQuestionCodeReferences(JsonNode node, Set<String> refs) {
        if (node == null || node.isNull()) {
            return;
        }

        if (node.isObject()) {
            if (node.has("questionCode")) {
                refs.add(node.path("questionCode").asText());
            }
            if (node.has("targetQuestion")) {
                refs.add(node.path("targetQuestion").asText());
            }
            node.fields().forEachRemaining(entry -> collectQuestionCodeReferences(entry.getValue(), refs));
            return;
        }

        if (node.isArray()) {
            for (JsonNode item : node) {
                collectQuestionCodeReferences(item, refs);
            }
        }
    }

    private boolean isChoiceType(String type) {
        String normalized = type.toUpperCase(Locale.ROOT);
        return normalized.equals("SINGLE_CHOICE")
                || normalized.equals("MULTIPLE_CHOICE")
                || normalized.equals("SINGLE_CHOICE_WITH_SUBFIELDS")
                || normalized.equals("MULTIPLE_CHOICE_WITH_SUBFIELDS")
                || normalized.equals("SELECT_DROPDOWN")
                || normalized.equals("RADIO")
                || normalized.equals("CHECKBOX");
    }

    private Map<String, Object> toSectionMap(FormSection section) {
        Map<String, Object> sectionMap = new LinkedHashMap<>();
        sectionMap.put("sectionId", section.getSectionId());
        sectionMap.put("sectionName", section.getSectionName());
        sectionMap.put("sectionOrder", section.getSectionOrder());

        List<Map<String, Object>> questionMaps = new ArrayList<>();
        List<FormQuestion> questions = section.getQuestions() == null ? List.of() : section.getQuestions();
        questions.stream()
                .sorted(Comparator.comparing(FormQuestion::getQuestionOrder, Comparator.nullsLast(Integer::compareTo)))
                .forEach(question -> questionMaps.add(toQuestionMap(question)));

        sectionMap.put("questions", questionMaps);
        return sectionMap;
    }

    private Map<String, Object> toQuestionMap(FormQuestion question) {
        Map<String, Object> questionMap = new LinkedHashMap<>();

        questionMap.put("questionId", question.getQuestionId());
        questionMap.put("questionCode", question.getQuestionCode());
        questionMap.put("questionText", question.getQuestionText());
        questionMap.put("questionType", question.getQuestionType() == null ? null : question.getQuestionType().name());
        questionMap.put("required", Boolean.TRUE.equals(question.getRequired()));
        questionMap.put("helpText", question.getHelpText());
        questionMap.put("minValue", question.getMinValue());
        questionMap.put("maxValue", question.getMaxValue());
        questionMap.put("unit", question.getUnit());
        questionMap.put("formulaExpression", question.getFormulaExpression());
        questionMap.put("displayCondition", question.getDisplayCondition());
        questionMap.put("groupId", question.getGroupId());
        questionMap.put("isRepeatableGroup", Boolean.TRUE.equals(question.getIsRepeatableGroup()));
        questionMap.put("repeatGroupRoot", Boolean.TRUE.equals(question.getRepeatGroupRoot()));
        questionMap.put("maxRepeat", question.getMaxRepeat());
        questionMap.put("labelAddButton", question.getLabelAddButton());
        if (question.getMatrixConfig() != null) {
            questionMap.put("rows", parseJsonList(question.getMatrixConfig().getRowsJson()));
            questionMap.put("columns", parseJsonList(question.getMatrixConfig().getColumnsJson()));
            questionMap.put("allowAdditionalColumn", Boolean.TRUE.equals(question.getMatrixConfig().getAllowAdditionalColumn()));
            questionMap.put("allowAdditionalRow", Boolean.TRUE.equals(question.getMatrixConfig().getAllowAdditionalRow()));
            questionMap.put("allow_additional_column", Boolean.TRUE.equals(question.getMatrixConfig().getAllowAdditionalColumn()));
            questionMap.put("allow_additional_row", Boolean.TRUE.equals(question.getMatrixConfig().getAllowAdditionalRow()));
        }

        questionMap.put("type", question.getQuestionType() == null ? null : question.getQuestionType().name());
        questionMap.put("label", question.getQuestionText());
        questionMap.put("placeholder", question.getHelpText());
        questionMap.put("orderIndex", question.getQuestionOrder());
        questionMap.put("conditionJson", question.getDisplayCondition());

        Map<String, Object> metadataJson = new LinkedHashMap<>();
        metadataJson.put("points", question.getPoints());
        metadataJson.put("validationKey", question.getValidationKey());
        metadataJson.put("warningMin", question.getWarningMin());
        metadataJson.put("warningMax", question.getWarningMax());
        metadataJson.put("validationPattern", question.getValidationPattern());
        metadataJson.put("allowAdditionalAnswers", Boolean.TRUE.equals(question.getAllowAdditionalAnswers()));
        metadataJson.put("maxAdditionalAnswers", question.getMaxAdditionalAnswers());
        metadataJson.put("groupId", question.getGroupId());
        metadataJson.put("isRepeatableGroup", Boolean.TRUE.equals(question.getIsRepeatableGroup()));
        metadataJson.put("repeatGroupRoot", Boolean.TRUE.equals(question.getRepeatGroupRoot()));
        metadataJson.put("maxRepeat", question.getMaxRepeat());
        metadataJson.put("labelAddButton", question.getLabelAddButton());
        if (question.getMatrixConfig() != null) {
            metadataJson.put("rows", parseJsonList(question.getMatrixConfig().getRowsJson()));
            metadataJson.put("columns", parseJsonList(question.getMatrixConfig().getColumnsJson()));
            metadataJson.put("allowAdditionalColumn", Boolean.TRUE.equals(question.getMatrixConfig().getAllowAdditionalColumn()));
            metadataJson.put("allowAdditionalRow", Boolean.TRUE.equals(question.getMatrixConfig().getAllowAdditionalRow()));
            metadataJson.put("allow_additional_column", Boolean.TRUE.equals(question.getMatrixConfig().getAllowAdditionalColumn()));
            metadataJson.put("allow_additional_row", Boolean.TRUE.equals(question.getMatrixConfig().getAllowAdditionalRow()));
        }
        questionMap.put("metadataJson", metadataJson);

        List<Map<String, Object>> optionMaps = new ArrayList<>();
        List<FormQuestionOption> options = question.getOptionItems() == null ? List.of() : question.getOptionItems();
        options.stream()
                .sorted(Comparator.comparing(FormQuestionOption::getOptionOrder, Comparator.nullsLast(Integer::compareTo)))
                .forEach(option -> optionMaps.add(toOptionMap(option)));

        questionMap.put("options", optionMaps);
        return questionMap;
    }

    private Map<String, Object> toOptionMap(FormQuestionOption option) {
        Map<String, Object> optionMap = new LinkedHashMap<>();
        optionMap.put("text", option.getOptionText());
        optionMap.put("label", option.getOptionText());
        optionMap.put("value", option.getOptionValue() == null ? option.getOptionText() : option.getOptionValue());
        optionMap.put("orderIndex", option.getOptionOrder());
        optionMap.put("subFieldsConfig", option.getSubFieldsConfig());
        return optionMap;
    }

    private FormVersion getPublishedVersion(DiagnosticForm form) {
        if (form.getPublishedVersionId() == null) {
            throw new RuntimeException("Form has no published version");
        }

        UUID publishedVersionId = Objects.requireNonNull(form.getPublishedVersionId());
        return formVersionRepository.findById(publishedVersionId)
                .filter(v -> v.getStatus() == FormVersion.VersionStatus.PUBLISHED)
                .orElseThrow(() -> new RuntimeException("Published version not found"));
    }

    private PublicFormDetailDTO toPublicDetail(DiagnosticForm form, FormVersion version) {
        try {
            JsonNode root = objectMapper.readTree(version.getFormSchemaJson());
            List<PublicFormSectionDTO> sections = new ArrayList<>();

            JsonNode sectionsNode = root.path("sections");
            if (sectionsNode.isArray()) {
                for (JsonNode sectionNode : sectionsNode) {
                    sections.add(toSectionDto(sectionNode));
                }
            }

            return PublicFormDetailDTO.builder()
                    .publicToken(form.getPublicToken())
                    .title(asText(root, "title", form.getFormName()))
                    .description(asText(root, "description", form.getDescription()))
                    .category(asText(root, "category", form.getCategory()))
                    .version(root.path("version").asInt(version.getVersionNumber()))
                    .sections(sections)
                    .build();
        } catch (Exception ex) {
            throw new RuntimeException("Cannot parse published form schema", ex);
        }
    }

    private PublicFormSectionDTO toSectionDto(JsonNode sectionNode) {
        List<PublicFormQuestionDTO> questions = new ArrayList<>();
        JsonNode questionsNode = sectionNode.path("questions");
        if (questionsNode.isArray()) {
            for (JsonNode questionNode : questionsNode) {
                questions.add(toQuestionDto(questionNode));
            }
        }

        Map<String, List<PublicFormQuestionDTO>> groupedQuestions = new LinkedHashMap<>();
        questions.stream()
            .filter(q -> q.getGroupId() != null && !q.getGroupId().isBlank())
            .forEach(q -> groupedQuestions.computeIfAbsent(q.getGroupId(), ignored -> new ArrayList<>()).add(q));

        List<PublicFormQuestionGroupDTO> questionGroups = groupedQuestions.entrySet().stream()
            .map(entry -> {
                List<PublicFormQuestionDTO> groupQuestions = entry.getValue();
                boolean repeatable = groupQuestions.stream().anyMatch(q -> Boolean.TRUE.equals(q.getIsRepeatableGroup()));
                Integer maxRepeat = groupQuestions.stream()
                    .map(PublicFormQuestionDTO::getMaxRepeat)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
                String labelAddButton = groupQuestions.stream()
                    .map(PublicFormQuestionDTO::getLabelAddButton)
                    .filter(label -> label != null && !label.isBlank())
                    .findFirst()
                    .orElse(null);

                return PublicFormQuestionGroupDTO.builder()
                    .questionGroup(entry.getKey())
                    .repeatable(repeatable)
                    .maxRepeat(maxRepeat)
                    .labelAddButton(labelAddButton)
                    .questions(groupQuestions)
                    .build();
            })
            .toList();

        return PublicFormSectionDTO.builder()
                .sectionName(asText(sectionNode, "sectionName", ""))
                .sectionOrder(sectionNode.path("sectionOrder").asInt(0))
                .questions(questions)
            .questionGroups(questionGroups)
                .build();
    }

    private PublicFormQuestionDTO toQuestionDto(JsonNode node) {
        List<PublicFormOptionDTO> options = new ArrayList<>();
        JsonNode optionsNode = node.path("options");
        if (optionsNode.isArray()) {
            for (JsonNode optionNode : optionsNode) {
                PublicFormOptionDTO optionDto = new PublicFormOptionDTO();
                optionDto.setText(asText(optionNode, "text", asText(optionNode, "label", null)));
                optionDto.setLabel(asText(optionNode, "label", asText(optionNode, "text", null)));
                optionDto.setValue(asText(optionNode, "value", asText(optionNode, "text", null)));
                optionDto.setOrderIndex(optionNode.path("orderIndex").isNumber() ? optionNode.path("orderIndex").asInt() : null);
                optionDto.setSubFieldsConfig(asText(optionNode, "subFieldsConfig", null));
                options.add(optionDto);
            }
        }

        PublicFormQuestionDTO dto = new PublicFormQuestionDTO();
        dto.setQuestionId(parseUuid(asText(node, "questionId", null)));
        dto.setQuestionCode(asText(node, "questionCode", null));
        dto.setQuestionText(asText(node, "questionText", asText(node, "label", null)));
        dto.setQuestionType(asText(node, "questionType", asText(node, "type", null)));
        dto.setFormulaExpression(asText(node, "formulaExpression", null));
        dto.setRequired(node.path("required").asBoolean(true));
        dto.setHelpText(asText(node, "helpText", asText(node, "placeholder", null)));
        dto.setMinValue(node.path("minValue").isNumber() ? node.path("minValue").asDouble() : null);
        dto.setMaxValue(node.path("maxValue").isNumber() ? node.path("maxValue").asDouble() : null);
        dto.setUnit(asText(node, "unit", null));
        dto.setDisplayCondition(asText(node, "displayCondition", asText(node, "conditionJson", null)));
        dto.setConditionJson(asText(node, "conditionJson", asText(node, "displayCondition", null)));
        dto.setMetadataJson(node.has("metadataJson") ? node.get("metadataJson").toString() : null);
        dto.setOrderIndex(node.path("orderIndex").isNumber() ? node.path("orderIndex").asInt() : null);
        dto.setType(asText(node, "type", asText(node, "questionType", null)));
        dto.setLabel(asText(node, "label", asText(node, "questionText", null)));
        dto.setPlaceholder(asText(node, "placeholder", asText(node, "helpText", null)));
        dto.setGroupId(readStringValue(node, "groupId", "metadataJson", "groupId"));
        dto.setIsRepeatableGroup(readBooleanValue(node, "isRepeatableGroup", "metadataJson", "isRepeatableGroup", false));
        dto.setRepeatGroupRoot(readBooleanValue(node, "repeatGroupRoot", "metadataJson", "repeatGroupRoot", false));
        dto.setMaxRepeat(readIntegerValue(node, "maxRepeat", "metadataJson", "maxRepeat"));
        dto.setLabelAddButton(readStringValue(node, "labelAddButton", "metadataJson", "labelAddButton"));
        dto.setRows(readObjectListValue(node, "rows", "metadataJson", "rows"));
        dto.setColumns(readObjectListValue(node, "columns", "metadataJson", "columns"));
        dto.setAllowAdditionalColumn(readBooleanValueWithAliases(node, "allowAdditionalColumn", "allow_additional_column", "metadataJson", "allowAdditionalColumn", false));
        dto.setAllowAdditionalRow(readBooleanValueWithAliases(node, "allowAdditionalRow", "allow_additional_row", "metadataJson", "allowAdditionalRow", false));
        dto.setOptions(options);
        return dto;
    }

    private List<Map<String, Object>> parseJsonList(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            JsonNode node = objectMapper.readTree(json);
            if (!node.isArray()) {
                return List.of();
            }
            List<Map<String, Object>> result = new ArrayList<>();
            for (JsonNode item : node) {
                if (item.isObject()) {
                    result.add(objectMapper.convertValue(item, Map.class));
                } else if (item.isTextual()) {
                    result.add(Map.of(
                        "key", slugify(item.asText()),
                        "label", item.asText()
                    ));
                }
            }
            return result;
        } catch (Exception ex) {
            return List.of();
        }
    }

    private String asText(JsonNode node, String field, String fallback) {
        if (node == null || !node.has(field) || node.get(field).isNull()) {
            return fallback;
        }
        String value = node.get(field).asText();
        return value == null || value.isBlank() ? fallback : value;
    }

    private UUID parseUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String readStringValue(JsonNode node, String topLevelField, String metadataField, String metadataKey) {
        String topLevelValue = asText(node, topLevelField, null);
        if (topLevelValue != null) {
            return topLevelValue;
        }

        JsonNode metadataNode = node.path(metadataField);
        if (metadataNode.isObject() && metadataNode.has(metadataKey) && !metadataNode.get(metadataKey).isNull()) {
            String value = metadataNode.get(metadataKey).asText();
            return value == null || value.isBlank() ? null : value;
        }
        return null;
    }

    private Boolean readBooleanValue(JsonNode node, String topLevelField, String metadataField, String metadataKey, boolean fallback) {
        if (node.has(topLevelField) && !node.get(topLevelField).isNull()) {
            return node.get(topLevelField).asBoolean(fallback);
        }

        JsonNode metadataNode = node.path(metadataField);
        if (metadataNode.isObject() && metadataNode.has(metadataKey) && !metadataNode.get(metadataKey).isNull()) {
            return metadataNode.get(metadataKey).asBoolean(fallback);
        }
        return fallback;
    }

    private Integer readIntegerValue(JsonNode node, String topLevelField, String metadataField, String metadataKey) {
        if (node.has(topLevelField) && node.get(topLevelField).isNumber()) {
            return node.get(topLevelField).asInt();
        }

        JsonNode metadataNode = node.path(metadataField);
        if (metadataNode.isObject() && metadataNode.has(metadataKey) && metadataNode.get(metadataKey).isNumber()) {
            return metadataNode.get(metadataKey).asInt();
        }
        return null;
    }

    private Boolean readBooleanValueWithAliases(JsonNode node, String topLevelField, String topLevelAlias, String metadataField, String metadataKey, boolean fallback) {
        if (node.has(topLevelField) && !node.get(topLevelField).isNull()) {
            return node.get(topLevelField).asBoolean(fallback);
        }
        if (node.has(topLevelAlias) && !node.get(topLevelAlias).isNull()) {
            return node.get(topLevelAlias).asBoolean(fallback);
        }

        JsonNode metadataNode = node.path(metadataField);
        if (metadataNode.isObject()) {
            if (metadataNode.has(metadataKey) && !metadataNode.get(metadataKey).isNull()) {
                return metadataNode.get(metadataKey).asBoolean(fallback);
            }
            if (metadataNode.has(topLevelAlias) && !metadataNode.get(topLevelAlias).isNull()) {
                return metadataNode.get(topLevelAlias).asBoolean(fallback);
            }
        }
        return fallback;
    }

    private List<Map<String, Object>> readObjectListValue(JsonNode node, String topLevelField, String metadataField, String metadataKey) {
        JsonNode source = node.path(topLevelField);
        if (source.isMissingNode() || source.isNull()) {
            JsonNode metadataNode = node.path(metadataField);
            if (metadataNode.isObject()) {
                source = metadataNode.path(metadataKey);
            }
        }

        if (!source.isArray()) {
            return List.of();
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (JsonNode item : source) {
            if (item.isObject()) {
                result.add(objectMapper.convertValue(item, Map.class));
            } else if (item.isTextual()) {
                result.add(Map.of(
                    "key", slugify(item.asText()),
                    "label", item.asText()
                ));
            }
        }
        return result;
    }

    private String slugify(String value) {
        if (value == null) {
            return "";
        }
        return value
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
    }
}
