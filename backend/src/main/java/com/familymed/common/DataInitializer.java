package com.familymed.common;

import com.familymed.form.DiagnosticForm;
import com.familymed.form.DiagnosticFormRepository;
import com.familymed.form.FormQuestion;
import com.familymed.form.FormQuestion.QuestionType;
import com.familymed.form.FormQuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DiagnosticFormRepository formRepository;
    private final FormQuestionRepository questionRepository;

    public DataInitializer(DiagnosticFormRepository formRepository, 
                          FormQuestionRepository questionRepository) {
        this.formRepository = formRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if forms already exist
        if (formRepository.count() > 0) {
            System.out.println("✓ Diagnostic forms already initialized, skipping...");
            return;
        }

        System.out.println("🔄 Initializing diagnostic forms...");

        // Form 1: Tiểu Đường Screening
        DiagnosticForm form1 = new DiagnosticForm();
        form1.setFormId(UUID.randomUUID());
        form1.setFormName("Tiểu Đường Screening");
        form1.setDescription("Câu hỏi sơ cấp để đánh giá nguy cơ tiểu đường loại 2");
        form1.setCategory("ENDOCRINOLOGY");
        form1.setVersion(1);
        form1 = formRepository.save(form1);

        List<FormQuestion> questions1 = new ArrayList<>();
        
        FormQuestion q1 = new FormQuestion();
        q1.setQuestionId(UUID.randomUUID());
        q1.setForm(form1);
        q1.setQuestionText("Tuổi của bạn?");
        q1.setQuestionType(QuestionType.NUMBER);
        q1.setPoints(0);
        q1.setUnit("năm");
        q1.setMinValue(15.0);
        q1.setMaxValue(100.0);
        q1.setQuestionOrder(1);
        q1.setRequired(true);
        questions1.add(q1);

        FormQuestion q2 = new FormQuestion();
        q2.setQuestionId(UUID.randomUUID());
        q2.setForm(form1);
        q2.setQuestionText("Bạn có tiền sử gia đình bị tiểu đường không?");
        q2.setQuestionType(QuestionType.SINGLE_CHOICE);
        q2.setPoints(0);
        q2.setQuestionOrder(2);
        q2.setOptions("[\"Có\", \"Không\"]");
        q2.setRequired(true);
        questions1.add(q2);

        FormQuestion q3 = new FormQuestion();
        q3.setQuestionId(UUID.randomUUID());
        q3.setForm(form1);
        q3.setQuestionText("Bạn gặp những triệu chứng nào? (chọn tất cả những cái phù hợp)");
        q3.setQuestionType(QuestionType.MULTIPLE_CHOICE);
        q3.setPoints(0);
        q3.setQuestionOrder(3);
        q3.setOptions("[\"Khát nước nhiều\", \"Đi tiểu nhiều\", \"Mệt mỏi\", \"Giảm cân không lý do\", \"Vết thương lành chậm\"]");
        q3.setRequired(false);
        questions1.add(q3);

        FormQuestion q4 = new FormQuestion();
        q4.setQuestionId(UUID.randomUUID());
        q4.setForm(form1);
        q4.setQuestionText("Đo đường huyết lần gần nhất (mg/dL)?");
        q4.setQuestionType(QuestionType.NUMBER);
        q4.setPoints(0);
        q4.setUnit("mg/dL");
        q4.setMinValue(50.0);
        q4.setMaxValue(500.0);
        q4.setQuestionOrder(4);
        q4.setRequired(false);
        questions1.add(q4);

        FormQuestion q5 = new FormQuestion();
        q5.setQuestionId(UUID.randomUUID());
        q5.setForm(form1);
        q5.setQuestionText("Ghi chú thêm:");
        q5.setQuestionType(QuestionType.TEXT);
        q5.setPoints(0);
        q5.setQuestionOrder(5);
        q5.setRequired(false);
        questions1.add(q5);

        questionRepository.saveAll(questions1);

        // Form 2: Chỉ số BMI
        DiagnosticForm form2 = new DiagnosticForm();
        form2.setFormId(UUID.randomUUID());
        form2.setFormName("Tính Chỉ số BMI");
        form2.setDescription("Tính chỉ số khối cơ thể để đánh giá tình trạng cân nặng");
        form2.setCategory("GENERAL");
        form2.setVersion(1);
        form2 = formRepository.save(form2);

        List<FormQuestion> questions2 = new ArrayList<>();

        FormQuestion q6 = new FormQuestion();
        q6.setQuestionId(UUID.randomUUID());
        q6.setForm(form2);
        q6.setQuestionText("Chiều cao của bạn?");
        q6.setQuestionType(QuestionType.NUMBER);
        q6.setPoints(0);
        q6.setUnit("cm");
        q6.setMinValue(100.0);
        q6.setMaxValue(250.0);
        q6.setQuestionOrder(1);
        q6.setRequired(true);
        questions2.add(q6);

        FormQuestion q7 = new FormQuestion();
        q7.setQuestionId(UUID.randomUUID());
        q7.setForm(form2);
        q7.setQuestionText("Cân nặng của bạn?");
        q7.setQuestionType(QuestionType.NUMBER);
        q7.setPoints(0);
        q7.setUnit("kg");
        q7.setMinValue(20.0);
        q7.setMaxValue(200.0);
        q7.setQuestionOrder(2);
        q7.setRequired(true);
        questions2.add(q7);

        FormQuestion q8 = new FormQuestion();
        q8.setQuestionId(UUID.randomUUID());
        q8.setForm(form2);
        q8.setQuestionText("Giới tính?");
        q8.setQuestionType(QuestionType.SINGLE_CHOICE);
        q8.setPoints(0);
        q8.setQuestionOrder(3);
        q8.setOptions("[\"Nam\", \"Nữ\"]");
        q8.setRequired(true);
        questions2.add(q8);

        FormQuestion q9 = new FormQuestion();
        q9.setQuestionId(UUID.randomUUID());
        q9.setForm(form2);
        q9.setQuestionText("Bạn có tập thể dục thường xuyên không?");
        q9.setQuestionType(QuestionType.SINGLE_CHOICE);
        q9.setPoints(0);
        q9.setQuestionOrder(4);
        q9.setOptions("[\"Có, hàng ngày\", \"Vài lần/tuần\", \"Hiếm khi\", \"Không\"]");
        q9.setRequired(false);
        questions2.add(q9);

        FormQuestion q10 = new FormQuestion();
        q10.setQuestionId(UUID.randomUUID());
        q10.setForm(form2);
        q10.setQuestionText("Ghi chú:");
        q10.setQuestionType(QuestionType.TEXT);
        q10.setPoints(0);
        q10.setQuestionOrder(5);
        q10.setRequired(false);
        questions2.add(q10);

        questionRepository.saveAll(questions2);

        // Form 3: Đánh giá Huyết Áp
        DiagnosticForm form3 = new DiagnosticForm();
        form3.setFormId(UUID.randomUUID());
        form3.setFormName("Đánh giá Huyết Áp");
        form3.setDescription("Đánh giá mức độ nguy cơ dựa trên huyết áp");
        form3.setCategory("CARDIOVASCULAR");
        form3.setVersion(1);
        form3 = formRepository.save(form3);

        List<FormQuestion> questions3 = new ArrayList<>();

        FormQuestion q11 = new FormQuestion();
        q11.setQuestionId(UUID.randomUUID());
        q11.setForm(form3);
        q11.setQuestionText("Huyết áp tâm thu (Systolic) - mmHg?");
        q11.setQuestionType(QuestionType.NUMBER);
        q11.setPoints(0);
        q11.setUnit("mmHg");
        q11.setMinValue(70.0);
        q11.setMaxValue(250.0);
        q11.setQuestionOrder(1);
        q11.setRequired(true);
        questions3.add(q11);

        FormQuestion q12 = new FormQuestion();
        q12.setQuestionId(UUID.randomUUID());
        q12.setForm(form3);
        q12.setQuestionText("Huyết áp tâm trương (Diastolic) - mmHg?");
        q12.setQuestionType(QuestionType.NUMBER);
        q12.setPoints(0);
        q12.setUnit("mmHg");
        q12.setMinValue(40.0);
        q12.setMaxValue(150.0);
        q12.setQuestionOrder(2);
        q12.setRequired(true);
        questions3.add(q12);

        FormQuestion q13 = new FormQuestion();
        q13.setQuestionId(UUID.randomUUID());
        q13.setForm(form3);
        q13.setQuestionText("Tuổi?");
        q13.setQuestionType(QuestionType.NUMBER);
        q13.setPoints(0);
        q13.setUnit("năm");
        q13.setMinValue(15.0);
        q13.setMaxValue(100.0);
        q13.setQuestionOrder(3);
        q13.setRequired(true);
        questions3.add(q13);

        FormQuestion q14 = new FormQuestion();
        q14.setQuestionId(UUID.randomUUID());
        q14.setForm(form3);
        q14.setQuestionText("Bạn có bệnh tiểu đường không?");
        q14.setQuestionType(QuestionType.SINGLE_CHOICE);
        q14.setPoints(0);
        q14.setQuestionOrder(4);
        q14.setOptions("[\"Có\", \"Không\"]");
        q14.setRequired(true);
        questions3.add(q14);

        FormQuestion q15 = new FormQuestion();
        q15.setQuestionId(UUID.randomUUID());
        q15.setForm(form3);
        q15.setQuestionText("Bạn có hút thuốc lá không?");
        q15.setQuestionType(QuestionType.SINGLE_CHOICE);
        q15.setPoints(0);
        q15.setQuestionOrder(5);
        q15.setOptions("[\"Hiện tại\", \"Từng hút\", \"Chưa từng\"]");
        q15.setRequired(false);
        questions3.add(q15);

        questionRepository.saveAll(questions3);

        System.out.println("✓ Initialized 3 diagnostic forms with " + 
                          (questions1.size() + questions2.size() + questions3.size()) + " questions");
    }
}

