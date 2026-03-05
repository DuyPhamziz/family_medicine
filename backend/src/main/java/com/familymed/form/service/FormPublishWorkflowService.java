package com.familymed.form.service;

import com.familymed.form.dto.publicapi.PublicFormDetailDTO;
import com.familymed.form.dto.publicapi.PublicFormOptionDTO;
import com.familymed.form.dto.publicapi.PublicFormQuestionDTO;
import com.familymed.form.dto.publicapi.PublicFormSectionDTO;
import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.entity.FormQuestion;
import com.familymed.form.entity.FormQuestionOption;
import com.familymed.form.entity.FormSection;
import com.familymed.form.entity.FormVersion;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.form.repository.FormVersionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
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
            throw new RuntimeException("Form must have at least one section before publish");
        }

        Set<String> questionCodes = new HashSet<>();

        for (FormSection section : sections) {
            List<FormQuestion> questions = section.getQuestions() == null ? List.of() : section.getQuestions();
            if (questions.isEmpty()) {
                throw new RuntimeException("Section has no questions: " + section.getSectionName());
            }

            Set<Integer> orderIndices = new HashSet<>();
            for (FormQuestion question : questions) {
                if (question.getQuestionOrder() == null || !orderIndices.add(question.getQuestionOrder())) {
                    throw new RuntimeException("Duplicate or missing order_index in section: " + section.getSectionName());
                }
                if (question.getQuestionCode() == null || question.getQuestionCode().isBlank()) {
                    throw new RuntimeException("Question code is required");
                }
                if (question.getQuestionText() == null || question.getQuestionText().isBlank()) {
                    throw new RuntimeException("Question label is required for question: " + question.getQuestionCode());
                }
                questionCodes.add(question.getQuestionCode());

                String type = question.getQuestionType() == null ? "" : question.getQuestionType().name();
                if (isChoiceType(type)) {
                    List<FormQuestionOption> options = question.getOptionItems() == null ? List.of() : question.getOptionItems();
                    if (options.isEmpty()) {
                        throw new RuntimeException("Choice question must have options: " + question.getQuestionCode());
                    }
                }
            }
        }

        for (FormSection section : sections) {
            List<FormQuestion> questions = section.getQuestions() == null ? List.of() : section.getQuestions();
            for (FormQuestion question : questions) {
                validateConditionJson(question.getDisplayCondition(), questionCodes, question.getQuestionCode());
            }
        }
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
                    throw new RuntimeException("Condition references unknown question code: " + ref);
                }
                if (ref.equals(currentQuestionCode)) {
                    throw new RuntimeException("Condition cannot self-reference question: " + currentQuestionCode);
                }
            }
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Invalid condition_json for question: " + currentQuestionCode, ex);
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

        return PublicFormSectionDTO.builder()
                .sectionName(asText(sectionNode, "sectionName", ""))
                .sectionOrder(sectionNode.path("sectionOrder").asInt(0))
                .questions(questions)
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
        dto.setOptions(options);
        return dto;
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
}
