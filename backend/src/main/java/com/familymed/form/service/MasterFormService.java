package com.familymed.form.service;

import com.familymed.form.dto.DiagnosticFormDTO;
import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.entity.FormQuestion;
import com.familymed.form.entity.FormQuestionOption;
import com.familymed.form.entity.FormSection;
import com.familymed.form.entity.QuestionCondition;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.form.repository.FormSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MasterFormService {

    public static final String MASTER_FORM_NAME = "FORM_KHAM_TONG_HOP";
    public static final String MASTER_FORM_DESCRIPTION = "Form khám tổng hợp đầy đủ";

    private final DiagnosticFormRepository diagnosticFormRepository;
    private final FormSectionRepository formSectionRepository;

    @Transactional(readOnly = true)
    public Optional<DiagnosticFormDTO> getMasterForm() {
        return diagnosticFormRepository.findFirstByIsMasterTrueOrderByUpdatedAtDesc()
            .map(form -> DiagnosticFormDTO.fromForm(form, form.getSections()));
    }

    @Transactional
    public DiagnosticFormDTO generateMasterForm() {
        DiagnosticForm master = diagnosticFormRepository.findFirstByIsMasterTrue().orElse(null);
        if (master != null && Boolean.TRUE.equals(master.getMasterLocked())) {
            throw new IllegalStateException("Master form is locked. Unlock before regenerating.");
        }

        List<DiagnosticForm> sourceForms = diagnosticFormRepository
            .findByStatusInAndIsMasterFalse(List.of(
                DiagnosticForm.FormStatus.ACTIVE,
                DiagnosticForm.FormStatus.PUBLISHED
            ));

        if (sourceForms.isEmpty()) {
            throw new IllegalStateException("No active forms available to generate master form");
        }

        List<MergedQuestion> mergedQuestions = collectAndMergeQuestions(sourceForms);

        DiagnosticForm masterForm = (master == null) ? new DiagnosticForm() : master;
        if (masterForm.getFormId() == null) {
            masterForm.setFormId(UUID.randomUUID());
        }

        masterForm.setFormName(MASTER_FORM_NAME);
        masterForm.setDescription(MASTER_FORM_DESCRIPTION);
        masterForm.setCategory("MASTER");
        masterForm.setStatus(DiagnosticForm.FormStatus.PUBLISHED);
        masterForm.setIsPublic(true);
        masterForm.setIsMaster(true);
        masterForm.setMasterLocked(false);
        masterForm.setEstimatedTime(Math.max(mergedQuestions.size() / 2, 10));
        masterForm.setIconColor("#2563eb");
        if (masterForm.getPublicToken() == null) {
            masterForm.setPublicToken(UUID.randomUUID());
        }

        Integer currentVersion = masterForm.getVersion() == null ? 0 : masterForm.getVersion();
        masterForm.setVersion(Math.max(currentVersion + 1, 1));

        DiagnosticForm persisted = diagnosticFormRepository.save(masterForm);

        // Clear existing sections properly to avoid orphan collection error
        if (persisted.getSections() != null) {
            persisted.getSections().clear();
            diagnosticFormRepository.flush();
        } else {
            persisted.setSections(new ArrayList<>());
        }

        Map<String, FormSection> sectionsByName = new LinkedHashMap<>();
        final int[] generatedSectionOrder = {1};

        for (MergedQuestion mergedQuestion : mergedQuestions) {
            String sectionName = mergedQuestion.sectionName().isBlank() ? "Nhóm câu hỏi" : mergedQuestion.sectionName();
            FormSection section = sectionsByName.computeIfAbsent(sectionName, key -> {
                FormSection createdSection = new FormSection();
                createdSection.setSectionId(UUID.randomUUID());
                createdSection.setForm(persisted);
                createdSection.setSectionName(sectionName);
                createdSection.setSectionOrder(generatedSectionOrder[0]++);
                createdSection.setQuestions(new ArrayList<>());
                return createdSection;
            });

            int nextQuestionOrder = section.getQuestions().size() + 1;
            FormQuestion clonedQuestion = cloneQuestion(mergedQuestion.question(), section, nextQuestionOrder);
            section.getQuestions().add(clonedQuestion);
        }

        persisted.getSections().addAll(sectionsByName.values());
        DiagnosticForm saved = diagnosticFormRepository.save(persisted);
        return DiagnosticFormDTO.fromForm(saved, saved.getSections());
    }

    @Transactional
    public DiagnosticFormDTO setMasterLock(boolean locked) {
        DiagnosticForm master = diagnosticFormRepository.findFirstByIsMasterTrue()
            .orElseThrow(() -> new IllegalStateException("Master form not found. Generate it first."));

        master.setMasterLocked(locked);
        DiagnosticForm saved = diagnosticFormRepository.save(master);
        return DiagnosticFormDTO.fromForm(saved, saved.getSections());
    }

    private List<MergedQuestion> collectAndMergeQuestions(List<DiagnosticForm> sourceForms) {
        Map<String, MergedQuestion> mergedByCode = new LinkedHashMap<>();

        sourceForms.stream()
            .sorted(Comparator.comparing(form -> normalize(form.getFormName())))
            .forEach(form -> {
                List<FormSection> sections = form.getSections() == null ? List.of() : form.getSections();
                sections.stream()
                    .sorted(Comparator.comparing(FormSection::getSectionOrder, Comparator.nullsLast(Integer::compareTo)))
                    .forEach(section -> {
                        List<FormQuestion> questions = section.getQuestions() == null ? List.of() : section.getQuestions();
                        questions.stream()
                            .sorted(Comparator.comparing(FormQuestion::getQuestionOrder, Comparator.nullsLast(Integer::compareTo)))
                            .forEach(question -> {
                                String questionCodeKey = normalize(question.getQuestionCode());
                                String dedupKey = questionCodeKey.isEmpty()
                                    ? "__NO_CODE__" + question.getQuestionId()
                                    : questionCodeKey;

                                MergedQuestion existing = mergedByCode.get(dedupKey);
                                if (existing == null) {
                                    mergedByCode.put(
                                        dedupKey,
                                        new MergedQuestion(
                                            normalize(section.getSectionName()),
                                            section.getSectionOrder(),
                                            cloneDetachedQuestion(question)
                                        )
                                    );
                                } else {
                                    mergeQuestionInPlace(existing.question(), question);
                                    Integer currentSectionOrder = existing.sectionOrder();
                                    Integer incomingSectionOrder = section.getSectionOrder();
                                    if (incomingSectionOrder != null && (currentSectionOrder == null || incomingSectionOrder < currentSectionOrder)) {
                                        existing.sectionOrder = incomingSectionOrder;
                                        existing.sectionName = normalize(section.getSectionName());
                                    }
                                }
                            });
                    });
            });

        return mergedByCode.values().stream()
            .sorted(
                Comparator.comparing((MergedQuestion q) -> q.sectionOrder() == null ? Integer.MAX_VALUE : q.sectionOrder())
                    .thenComparing(q -> normalize(q.sectionName()))
                    .thenComparing(q -> q.question().getQuestionOrder() == null ? Integer.MAX_VALUE : q.question().getQuestionOrder())
                    .thenComparing(q -> normalize(q.question().getQuestionCode()))
            )
            .toList();
    }

    private FormQuestion cloneDetachedQuestion(FormQuestion source) {
        FormQuestion clone = new FormQuestion();
        clone.setQuestionCode(source.getQuestionCode());
        clone.setQuestionText(source.getQuestionText());
        clone.setQuestionType(source.getQuestionType());
        clone.setQuestionOrder(source.getQuestionOrder());
        // DO NOT copy options string directly - will be generated from cloned optionItems
        clone.setUnit(source.getUnit());
        clone.setMinValue(source.getMinValue());
        clone.setMaxValue(source.getMaxValue());
        clone.setPoints(source.getPoints());
        clone.setRequired(Boolean.TRUE.equals(source.getRequired()));
        clone.setHelpText(source.getHelpText());
        clone.setDisplayCondition(source.getDisplayCondition());
        clone.setFormulaExpression(source.getFormulaExpression());
        clone.setAllowAdditionalAnswers(Boolean.TRUE.equals(source.getAllowAdditionalAnswers()));
        clone.setMaxAdditionalAnswers(source.getMaxAdditionalAnswers());

        List<FormQuestionOption> optionItems = source.getOptionItems() == null ? List.of() : source.getOptionItems();
        if (!optionItems.isEmpty()) {
            List<FormQuestionOption> clonedOptions = optionItems.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(FormQuestionOption::getOptionOrder, Comparator.nullsLast(Integer::compareTo)))
                .map(this::cloneDetachedOption)
                .toList();
            clone.setOptionItems(clonedOptions);
            
            // Generate options JSON string from cloned optionItems to ensure consistency
            List<String> labels = clonedOptions.stream()
                .map(FormQuestionOption::getOptionText)
                .filter(label -> label != null && !label.isBlank())
                .toList();
            if (!labels.isEmpty()) {
                String optionsJson = labels.stream()
                    .map(label -> "\"" + label.replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
                    .collect(java.util.stream.Collectors.joining(",", "[", "]"));
                clone.setOptions(optionsJson);
            }
        } else {
            clone.setOptionItems(new ArrayList<>());
            clone.setOptions(null);
        }

        List<QuestionCondition> conditions = source.getConditions() == null ? List.of() : source.getConditions();
        if (!conditions.isEmpty()) {
            clone.setConditions(conditions.stream().filter(Objects::nonNull).map(this::cloneDetachedCondition).toList());
        } else {
            clone.setConditions(new ArrayList<>());
        }

        return clone;
    }

    private void mergeQuestionInPlace(FormQuestion base, FormQuestion incoming) {
        if (isBlank(base.getQuestionText()) && !isBlank(incoming.getQuestionText())) {
            base.setQuestionText(incoming.getQuestionText());
        }
        if (base.getQuestionType() == null && incoming.getQuestionType() != null) {
            base.setQuestionType(incoming.getQuestionType());
        }
        if (base.getQuestionOrder() == null || (incoming.getQuestionOrder() != null && incoming.getQuestionOrder() < base.getQuestionOrder())) {
            base.setQuestionOrder(incoming.getQuestionOrder());
        }
        // DO NOT merge options string - it will be auto-generated from merged optionItems
        if (isBlank(base.getUnit()) && !isBlank(incoming.getUnit())) {
            base.setUnit(incoming.getUnit());
        }

        if (incoming.getMinValue() != null) {
            base.setMinValue(base.getMinValue() == null ? incoming.getMinValue() : Math.min(base.getMinValue(), incoming.getMinValue()));
        }
        if (incoming.getMaxValue() != null) {
            base.setMaxValue(base.getMaxValue() == null ? incoming.getMaxValue() : Math.max(base.getMaxValue(), incoming.getMaxValue()));
        }

        if (incoming.getPoints() != null) {
            base.setPoints(base.getPoints() == null ? incoming.getPoints() : Math.max(base.getPoints(), incoming.getPoints()));
        }

        base.setRequired(Boolean.TRUE.equals(base.getRequired()) || Boolean.TRUE.equals(incoming.getRequired()));

        if (isBlank(base.getHelpText()) && !isBlank(incoming.getHelpText())) {
            base.setHelpText(incoming.getHelpText());
        }
        if (isBlank(base.getDisplayCondition()) && !isBlank(incoming.getDisplayCondition())) {
            base.setDisplayCondition(incoming.getDisplayCondition());
        }
        if (isBlank(base.getFormulaExpression()) && !isBlank(incoming.getFormulaExpression())) {
            base.setFormulaExpression(incoming.getFormulaExpression());
        }

        base.setAllowAdditionalAnswers(Boolean.TRUE.equals(base.getAllowAdditionalAnswers())
            || Boolean.TRUE.equals(incoming.getAllowAdditionalAnswers()));

        if (Boolean.TRUE.equals(base.getAllowAdditionalAnswers())) {
            if (base.getMaxAdditionalAnswers() == null) {
                base.setMaxAdditionalAnswers(incoming.getMaxAdditionalAnswers());
            } else if (incoming.getMaxAdditionalAnswers() != null) {
                base.setMaxAdditionalAnswers(Math.max(base.getMaxAdditionalAnswers(), incoming.getMaxAdditionalAnswers()));
            }
        } else {
            base.setMaxAdditionalAnswers(null);
        }

        mergeOptionItems(base, incoming);
        mergeConditions(base, incoming);
    }

    private void mergeOptionItems(FormQuestion base, FormQuestion incoming) {
        List<FormQuestionOption> baseOptions = base.getOptionItems() == null ? new ArrayList<>() : new ArrayList<>(base.getOptionItems());
        Map<String, FormQuestionOption> byKey = new LinkedHashMap<>();
        for (FormQuestionOption option : baseOptions) {
            byKey.put(optionKey(option), option);
        }

        List<FormQuestionOption> incomingOptions = incoming.getOptionItems() == null ? List.of() : incoming.getOptionItems();
        for (FormQuestionOption option : incomingOptions) {
            if (option == null) {
                continue;
            }
            byKey.putIfAbsent(optionKey(option), cloneDetachedOption(option));
        }

        int index = 1;
        for (FormQuestionOption option : byKey.values()) {
            option.setOptionOrder(index++);
        }
        List<FormQuestionOption> mergedOptions = new ArrayList<>(byKey.values());
        base.setOptionItems(mergedOptions);
        
        // CRITICAL FIX: Update options JSON string to match merged optionItems
        // This ensures frontend gets correct data when parsing question.options
        if (!mergedOptions.isEmpty()) {
            List<String> labels = mergedOptions.stream()
                .map(FormQuestionOption::getOptionText)
                .filter(label -> label != null && !label.isBlank())
                .toList();
            String optionsJson = labels.stream()
                .map(label -> "\"" + label.replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
                .collect(java.util.stream.Collectors.joining(",", "[", "]"));
            base.setOptions(optionsJson);
        } else {
            base.setOptions(null);
        }
    }

    private void mergeConditions(FormQuestion base, FormQuestion incoming) {
        List<QuestionCondition> baseConditions = base.getConditions() == null ? new ArrayList<>() : new ArrayList<>(base.getConditions());
        Map<String, QuestionCondition> byKey = new LinkedHashMap<>();
        for (QuestionCondition condition : baseConditions) {
            byKey.put(conditionKey(condition), condition);
        }

        List<QuestionCondition> incomingConditions = incoming.getConditions() == null ? List.of() : incoming.getConditions();
        for (QuestionCondition condition : incomingConditions) {
            if (condition == null) {
                continue;
            }
            byKey.putIfAbsent(conditionKey(condition), cloneDetachedCondition(condition));
        }

        base.setConditions(new ArrayList<>(byKey.values()));
    }

    private FormQuestionOption cloneDetachedOption(FormQuestionOption source) {
        FormQuestionOption clone = new FormQuestionOption();
        clone.setOptionText(source.getOptionText());
        clone.setOptionValue(source.getOptionValue());
        clone.setOptionOrder(source.getOptionOrder());
        clone.setPoints(source.getPoints());
        return clone;
    }

    private QuestionCondition cloneDetachedCondition(QuestionCondition source) {
        QuestionCondition clone = new QuestionCondition();
        clone.setConditionType(source.getConditionType());
        clone.setConditionRulesJson(source.getConditionRulesJson());
        clone.setPriority(source.getPriority());
        clone.setEnabled(source.getEnabled());
        return clone;
    }

    private String optionKey(FormQuestionOption option) {
        String value = normalize(option.getOptionValue());
        if (!value.isEmpty()) {
            return value;
        }
        return normalize(option.getOptionText());
    }

    private String conditionKey(QuestionCondition condition) {
        return normalize(condition.getConditionType()) + "|" + normalize(condition.getConditionRulesJson()) + "|" +
            (condition.getPriority() == null ? 0 : condition.getPriority());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private FormQuestion cloneQuestion(FormQuestion source, FormSection targetSection, int order) {
        FormQuestion clone = new FormQuestion();
        clone.setQuestionId(UUID.randomUUID());
        clone.setSection(targetSection);
        clone.setQuestionCode(source.getQuestionCode());
        clone.setQuestionText(source.getQuestionText());
        clone.setQuestionType(source.getQuestionType());
        clone.setQuestionOrder(order);
        clone.setOptions(source.getOptions());
        clone.setUnit(source.getUnit());
        clone.setMinValue(source.getMinValue());
        clone.setMaxValue(source.getMaxValue());
        clone.setPoints(source.getPoints());
        clone.setRequired(Boolean.TRUE.equals(source.getRequired()));
        clone.setHelpText(source.getHelpText());
        clone.setDisplayCondition(source.getDisplayCondition());
        clone.setFormulaExpression(source.getFormulaExpression());
        clone.setAllowAdditionalAnswers(Boolean.TRUE.equals(source.getAllowAdditionalAnswers()));
        clone.setMaxAdditionalAnswers(source.getMaxAdditionalAnswers());

        List<FormQuestionOption> sourceOptions = source.getOptionItems();
        if (sourceOptions != null && !sourceOptions.isEmpty()) {
            List<FormQuestionOption> clonedOptions = sourceOptions.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(FormQuestionOption::getOptionOrder, Comparator.nullsLast(Integer::compareTo)))
                .map(option -> {
                    FormQuestionOption optionClone = new FormQuestionOption();
                    optionClone.setOptionId(UUID.randomUUID());
                    optionClone.setQuestion(clone);
                    optionClone.setOptionText(option.getOptionText());
                    optionClone.setOptionValue(option.getOptionValue());
                    optionClone.setOptionOrder(option.getOptionOrder());
                    optionClone.setPoints(option.getPoints());
                    return optionClone;
                })
                .toList();
            clone.setOptionItems(clonedOptions);
        }

        return clone;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private static final class MergedQuestion {
        private String sectionName;
        private Integer sectionOrder;
        private final FormQuestion question;

        private MergedQuestion(String sectionName, Integer sectionOrder, FormQuestion question) {
            this.sectionName = sectionName;
            this.sectionOrder = sectionOrder;
            this.question = question;
        }

        private String sectionName() {
            return sectionName;
        }

        private Integer sectionOrder() {
            return sectionOrder;
        }

        private FormQuestion question() {
            return question;
        }
    }
}
