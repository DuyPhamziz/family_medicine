package com.familymed.form.service;

import org.springframework.stereotype.Service;
import java.util.*;

/**
 * Service để tính toán nguy cơ bệnh dựa trên các chỉ số y tế
 * Sử dụng các công thức được công bố từ các nguồn y tế uy tín
 */
@Service
public class RiskCalculationService {

    /**
     * Tính toán nguy cơ dựa trên tên biểu mẫu
     */
    public Map<String, Object> calculateRisk(String formName, Map<String, Object> answers) {
        String lowerFormName = formName.toLowerCase();

        if (lowerFormName.contains("tiểu") || lowerFormName.contains("diabetes")) {
            return calculateDiabetesRisk(answers);
        } else if (lowerFormName.contains("ung thư") || lowerFormName.contains("cancer")) {
            return calculateCancerRisk(answers);
        } else if (lowerFormName.contains("tim") || lowerFormName.contains("heart") || lowerFormName.contains("cardiovascular")) {
            return calculateCardiovascularRisk(answers);
        } else if (lowerFormName.contains("huyết áp") || lowerFormName.contains("blood pressure")) {
            return calculateHypertensionRisk(answers);
        } else if (lowerFormName.contains("bmi") || lowerFormName.contains("weight")) {
            return calculateObesityRisk(answers);
        } else {
            // Default risk calculation
            return calculateDefaultRisk(answers);
        }
    }

    /**
     * FINDRISC: Finnish Diabetes Risk Score
     * Được sử dụng rộng rãi để dự đoán nguy cơ tiểu đường loại 2
     * Điểm: 0-26 = Rủi ro thấp, 27-32 = Rủi ro cao, 33+ = Rủi ro rất cao
     */
    private Map<String, Object> calculateDiabetesRisk(Map<String, Object> answers) {
        double score = 0;
        int age = getIntValue(answers.get("age"), 0);
        int bmi = getIntValue(answers.get("bmi"), 0);
        int waistCirc = getIntValue(answers.get("waist_circumference"), 0);
        boolean familyHistory = getBooleanValue(answers.get("family_history_diabetes"), false);
        boolean highBloodPressure = getBooleanValue(answers.get("high_blood_pressure"), false);
        boolean highCholesterol = getBooleanValue(answers.get("high_cholesterol"), false);

        // Age scoring
        if (age < 45) score += 0;
        else if (age < 55) score += 2;
        else if (age < 65) score += 4;
        else score += 6;

        // BMI scoring
        if (bmi < 25) score += 0;
        else if (bmi < 30) score += 1;
        else score += 3;

        // Waist circumference scoring
        if (waistCirc < 80) score += 0;
        else if (waistCirc < 90) score += 1;
        else if (waistCirc < 100) score += 2;
        else score += 3;

        // Family history
        if (familyHistory) score += 3;

        // Blood pressure
        if (highBloodPressure) score += 2;

        // Cholesterol
        if (highCholesterol) score += 2;

        // Physical activity
        boolean physicalActivity = getBooleanValue(answers.get("physical_activity"), false);
        if (!physicalActivity) score += 2;

        // Vegetables consumption
        boolean vegetableConsumption = getBooleanValue(answers.get("vegetable_consumption"), false);
        if (!vegetableConsumption) score += 1;

        // Medication for blood pressure
        boolean medicationBP = getBooleanValue(answers.get("medication_high_bp"), false);
        if (medicationBP) score += 1;

        // Convert FINDRISC score (0-26) to percentage (0-100%)
        double riskPercentage = (score / 26.0) * 100;

        return Map.of(
                "totalScore", score,
                "maxScore", 26,
                "riskPercentage", Math.min(riskPercentage, 100),
                "riskLevel", determineRiskLevel(riskPercentage),
                "diagnosticResult", generateDiabetesResult(riskPercentage),
                "recommendations", getDiabetesRecommendations(riskPercentage)
        );
    }

    /**
     * LCRAT: Lung Cancer Risk Assessment Tool
     * Dự đoán nguy cơ ung thư phổi dựa trên lịch sử hút thuốc và các yếu tố khác
     */
    private Map<String, Object> calculateCancerRisk(Map<String, Object> answers) {
        double score = 0;
        int age = getIntValue(answers.get("age"), 0);
        int smokingYears = getIntValue(answers.get("smoking_years"), 0);
        int cigarettesPerDay = getIntValue(answers.get("cigarettes_per_day"), 0);
        int yearsQuitSmoking = getIntValue(answers.get("years_quit_smoking"), 0);
        boolean familyHistoryCancer = getBooleanValue(answers.get("family_history_cancer"), false);
        boolean occupationalExposure = getBooleanValue(answers.get("occupational_exposure"), false);

        // Age factor
        if (age < 40) score += 1;
        else if (age < 60) score += 3;
        else if (age < 70) score += 5;
        else score += 6;

        // Smoking pack-years (packs per day × years)
        double packsPerDay = cigarettesPerDay / 20.0;
        double packYears = packsPerDay * smokingYears;

        if (smokingYears > 0) {
            if (packYears < 10) score += 2;
            else if (packYears < 20) score += 4;
            else if (packYears < 40) score += 6;
            else score += 8;

            // Years quit smoking
            if (yearsQuitSmoking < 5) score += 2;
            else if (yearsQuitSmoking < 10) score += 1;
        }

        // Family history
        if (familyHistoryCancer) score += 3;

        // Occupational exposure
        if (occupationalExposure) score += 2;

        // Convert to percentage
        double riskPercentage = Math.min((score / 30.0) * 100, 100);

        return Map.of(
                "totalScore", score,
                "maxScore", 30,
                "riskPercentage", riskPercentage,
                "riskLevel", determineRiskLevel(riskPercentage),
                "diagnosticResult", generateCancerResult(riskPercentage, smokingYears),
                "recommendations", getCancerRecommendations(riskPercentage)
        );
    }

    /**
     * Framingham Cardiovascular Risk Score
     * Tính toán nguy cơ bệnh tim mạch
     */
    private Map<String, Object> calculateCardiovascularRisk(Map<String, Object> answers) {
        double score = 0;
        int age = getIntValue(answers.get("age"), 0);
        int systolicBP = getIntValue(answers.get("systolic_bp"), 0);
        int totalCholesterol = getIntValue(answers.get("total_cholesterol"), 0);
        int hdlCholesterol = getIntValue(answers.get("hdl_cholesterol"), 0);
        boolean smoking = getBooleanValue(answers.get("smoking"), false);
        boolean diabetes = getBooleanValue(answers.get("diabetes"), false);

        // Age
        if (age < 35) score += 1;
        else if (age < 45) score += 2;
        else if (age < 55) score += 3;
        else score += 4;

        // Systolic BP
        if (systolicBP < 120) score += 0;
        else if (systolicBP < 130) score += 1;
        else if (systolicBP < 140) score += 2;
        else score += 3;

        // Total cholesterol (mg/dL)
        if (totalCholesterol < 160) score += 0;
        else if (totalCholesterol < 200) score += 1;
        else if (totalCholesterol < 240) score += 2;
        else score += 3;

        // HDL cholesterol (mg/dL)
        if (hdlCholesterol >= 60) score += 0;
        else if (hdlCholesterol >= 50) score += 1;
        else if (hdlCholesterol >= 40) score += 2;
        else score += 3;

        // Smoking
        if (smoking) score += 3;

        // Diabetes
        if (diabetes) score += 2;

        double riskPercentage = Math.min((score / 20.0) * 100, 100);

        return Map.of(
                "totalScore", score,
                "maxScore", 20,
                "riskPercentage", riskPercentage,
                "riskLevel", determineRiskLevel(riskPercentage),
                "diagnosticResult", generateCardiovascularResult(riskPercentage),
                "recommendations", getCardiovascularRecommendations(riskPercentage)
        );
    }

    /**
     * Hypertension Risk Assessment
     */
    private Map<String, Object> calculateHypertensionRisk(Map<String, Object> answers) {
        double score = 0;
        int systolicBP = getIntValue(answers.get("systolic_bp"), 0);
        int diastolicBP = getIntValue(answers.get("diastolic_bp"), 0);
        int age = getIntValue(answers.get("age"), 0);
        boolean familyHistory = getBooleanValue(answers.get("family_history_hypertension"), false);
        boolean overweight = getBooleanValue(answers.get("overweight"), false);
        boolean highSodiumDiet = getBooleanValue(answers.get("high_sodium_diet"), false);

        // BP readings - most important
        if (systolicBP < 120 && diastolicBP < 80) score += 0;
        else if (systolicBP < 130 && diastolicBP < 80) score += 1;
        else if (systolicBP < 140 && diastolicBP < 90) score += 3;
        else if (systolicBP < 160 && diastolicBP < 100) score += 5;
        else score += 8;

        // Age
        if (age > 60) score += 2;

        // Family history
        if (familyHistory) score += 2;

        // Overweight
        if (overweight) score += 2;

        // High sodium diet
        if (highSodiumDiet) score += 1;

        double riskPercentage = Math.min((score / 20.0) * 100, 100);

        return Map.of(
                "totalScore", score,
                "maxScore", 20,
                "riskPercentage", riskPercentage,
                "riskLevel", determineRiskLevel(riskPercentage),
                "diagnosticResult", generateHypertensionResult(riskPercentage, systolicBP, diastolicBP),
                "recommendations", getHypertensionRecommendations(riskPercentage)
        );
    }

    /**
     * Obesity/BMI Risk Assessment
     */
    private Map<String, Object> calculateObesityRisk(Map<String, Object> answers) {
        int bmi = getIntValue(answers.get("bmi"), 0);
        int waistCirc = getIntValue(answers.get("waist_circumference"), 0);

        double score = 0;

        // BMI classification (WHO)
        if (bmi < 18.5) score += 0; // Underweight
        else if (bmi < 25) score += 1; // Normal
        else if (bmi < 30) score += 2; // Overweight
        else if (bmi < 35) score += 4; // Obesity Class I
        else if (bmi < 40) score += 6; // Obesity Class II
        else score += 8; // Obesity Class III

        // Waist circumference (abdominal fat)
        if (waistCirc < 90) score += 0;
        else if (waistCirc < 100) score += 1;
        else score += 2;

        double riskPercentage = Math.min((score / 10.0) * 100, 100);

        return Map.of(
                "totalScore", score,
                "maxScore", 10,
                "riskPercentage", riskPercentage,
                "riskLevel", determineRiskLevel(riskPercentage),
                "diagnosticResult", generateObesityResult(riskPercentage, bmi),
                "recommendations", getObesityRecommendations(riskPercentage, bmi)
        );
    }

    /**
     * Default risk calculation khi không khớp với bất kỳ loại nào
     */
    private Map<String, Object> calculateDefaultRisk(Map<String, Object> answers) {
        int totalAnswers = (int) answers.values().stream()
                .filter(v -> v != null && !v.toString().isEmpty())
                .count();
        int validAnswers = Math.max(totalAnswers, 1);
        int totalQuestions = answers.size();

        // Tính % dựa trên lượng câu trả lời valid
        double riskPercentage = (validAnswers / (double) totalQuestions) * 100;

        return Map.of(
                "totalScore", validAnswers,
                "maxScore", totalQuestions,
                "riskPercentage", riskPercentage,
                "riskLevel", determineRiskLevel(riskPercentage),
                "diagnosticResult", "Kết quả đánh giá: " + Math.round(riskPercentage) + "% hoàn thành",
                "recommendations", getDefaultRecommendations(riskPercentage)
        );
    }

    // ============ Helper Methods ============

    private String determineRiskLevel(double percentage) {
        if (percentage <= 33) return "LOW";
        if (percentage <= 66) return "MEDIUM";
        return "HIGH";
    }

    private String generateDiabetesResult(double percentage) {
        if (percentage <= 33) {
            return "Bệnh nhân có nguy cơ tiểu đường thấp. Tiếp tục duy trì lối sống lành mạnh và kiểm tra định kỳ.";
        } else if (percentage <= 66) {
            return "Bệnh nhân có nguy cơ tiểu đường trung bình. Cần tăng cường hoạt động thể chất, kiểm soát chế độ ăn uống và giảm cân.";
        } else {
            return "Bệnh nhân có nguy cơ tiểu đường cao. Cần can thiệp ngay lập tức, tham khảo ý kiến bác sĩ và xét nghiệm máu sắc.";
        }
    }

    private String generateCancerResult(double percentage, int smokingYears) {
        if (smokingYears == 0) {
            return "Bệnh nhân không hút thuốc. Nguy cơ ung thư phổi thấp. Tiếp tục duy trì lối sống lành mạnh.";
        }
        
        if (percentage <= 33) {
            return "Mặc dù có lịch sử hút thuốc, nguy cơ ung thư phổi hiện tại là thấp. Nên thực hiện sàng lọc định kỳ.";
        } else if (percentage <= 66) {
            return "Nguy cơ ung thư phổi trung bình. Cần sàng lọc CT phổi định kỳ và tham khảo bác sĩ chuyên khoa.";
        } else {
            return "Nguy cơ ung thư phổi cao. CẦN KIỂM SOÁT CHẶT CHẼ. Thực hiện sàng lọc CT phổi ngay và tham khảo bác sĩ.";
        }
    }

    private String generateCardiovascularResult(double percentage) {
        if (percentage <= 33) {
            return "Nguy cơ bệnh tim mạch thấp. Tiếp tục duy trì lối sống lành mạnh, tập thể dục thường xuyên.";
        } else if (percentage <= 66) {
            return "Nguy cơ bệnh tim mạch trung bình. Cần kiểm soát huyết áp, cholesterol và giảm cân nếu cần thiết.";
        } else {
            return "Nguy cơ bệnh tim mạch cao. CẦN CAN THIỆP NGAY. Tham khảo bác sĩ tim mạch và xét nghiệm chuyên sâu.";
        }
    }

    private String generateHypertensionResult(double percentage, int systolicBP, int diastolicBP) {
        String bpStatus = "";
        if (systolicBP < 120 && diastolicBP < 80) {
            bpStatus = "Huyết áp bình thường";
        } else if (systolicBP < 130 && diastolicBP < 80) {
            bpStatus = "Huyết áp cao bình thường";
        } else if (systolicBP < 140 && diastolicBP < 90) {
            bpStatus = "Tăng huyết áp giai đoạn 1";
        } else {
            bpStatus = "Tăng huyết áp giai đoạn 2";
        }

        return bpStatus + ". " + (percentage <= 33
                ? "Tiếp tục theo dõi huyết áp thường xuyên."
                : percentage <= 66
                ? "Cần kiểm soát huyết áp bằng thay đổi lối sống."
                : "CẦN KIỂM SOÁT CHẶT CHẼ. Có thể cần dùng thuốc.");
    }

    private String generateObesityResult(double percentage, int bmi) {
        String bmiStatus = "";
        if (bmi < 18.5) {
            bmiStatus = "Thiếu cân";
        } else if (bmi < 25) {
            bmiStatus = "Cân nặng bình thường";
        } else if (bmi < 30) {
            bmiStatus = "Thừa cân";
        } else if (bmi < 35) {
            bmiStatus = "Béo phì cấp I";
        } else if (bmi < 40) {
            bmiStatus = "Béo phì cấp II";
        } else {
            bmiStatus = "Béo phì cấp III";
        }

        return "BMI: " + bmi + " - " + bmiStatus + (percentage > 50
                ? ". Cần can thiệp để giảm cân."
                : ". Tiếp tục duy trì hoặc cải thiện chỉ số BMI.");
    }

    private List<String> getDiabetesRecommendations(double percentage) {
        List<String> recommendations = new ArrayList<>();

        if (percentage <= 33) {
            recommendations.add("Duy trì chế độ ăn cân bằng giàu rau xanh và chất xơ");
            recommendations.add("Tập thể dục ít nhất 150 phút/tuần");
            recommendations.add("Kiểm tra glucose định kỳ hàng năm");
        } else if (percentage <= 66) {
            recommendations.add("Giảm cân 5-10% nếu đang thừa cân");
            recommendations.add("Tăng cường hoạt động thể chất lên 200 phút/tuần");
            recommendations.add("Hạn chế đường, thực phẩm chế biến");
            recommendations.add("Kiểm tra glucose máu 6 tháng/lần");
        } else {
            recommendations.add("Tham khảo bác sĩ ngay để xét nghiệm toàn diện");
            recommendations.add("Giảm cân mục tiêu 10% trọng lượng hiện tại");
            recommendations.add("Bắt đầu chương trình tập thể dục có giám sát");
            recommendations.add("Thay đổi chế độ ăn uống dưới hướng dẫn của chuyên gia dinh dưỡng");
            recommendations.add("Kiểm tra glucose máu 3 tháng/lần");
        }

        return recommendations;
    }

    private List<String> getCancerRecommendations(double percentage) {
        List<String> recommendations = new ArrayList<>();

        if (percentage <= 33) {
            recommendations.add("Tiếp tục không hút thuốc hoặc bỏ hút nếu đang hút");
            recommendations.add("Tránh khí thải ô nhiễm");
            recommendations.add("Kiểm tra sức khỏe định kỳ hàng năm");
        } else if (percentage <= 66) {
            recommendations.add("Thực hiện sàng lọc CT phổi hàng năm");
            recommendations.add("Tham khảo bác sĩ phổi về các biện pháp sàng lọc");
            recommendations.add("Bỏ thuốc ngay nếu còn hút");
            recommendations.add("Kiểm tra sức khỏe 6 tháng/lần");
        } else {
            recommendations.add("ĐẶT LỊCH KHÁM CẤP CỨU với bác sĩ phổi");
            recommendations.add("Thực hiện CT phổi dose thấp ngay");
            recommendations.add("Nếu còn hút, cần bỏ thuốc tuyệt đối");
            recommendations.add("Xét nghiệm máu và các xét nghiệm khác");
            recommendations.add("Theo dõi chặt chẽ định kỳ 3 tháng/lần");
        }

        return recommendations;
    }

    private List<String> getCardiovascularRecommendations(double percentage) {
        List<String> recommendations = new ArrayList<>();

        if (percentage <= 33) {
            recommendations.add("Duy trì thói quen tập luyện thể chất");
            recommendations.add("Ăn nhiều rau xanh, trái cây");
            recommendations.add("Hạn chế muối, chất béo bão hòa");
            recommendations.add("Kiểm tra tim mạch 1 năm/lần");
        } else if (percentage <= 66) {
            recommendations.add("Tăng cường tập luyện 150 phút/tuần");
            recommendations.add("Kiểm soát cholesterol bằng chế độ ăn");
            recommendations.add("Kiểm soát huyết áp < 140/90 mmHg");
            recommendations.add("Xét nghiệm tim mạch 6 tháng/lần");
        } else {
            recommendations.add("Tham khảo bác sĩ tim mạch CẤP CỨU");
            recommendations.add("Có thể cần dùng thuốc hạ cholesterol/huyết áp");
            recommendations.add("Thực hiện ECG, echocardiogram");
            recommendations.add("Kiểm tra huyết áp hàng ngày");
            recommendations.add("Thay đổi lối sống dưới giám sát y tế");
        }

        return recommendations;
    }

    private List<String> getHypertensionRecommendations(double percentage) {
        List<String> recommendations = new ArrayList<>();

        if (percentage <= 33) {
            recommendations.add("Duy trì hoạt động thể chất đều đặn");
            recommendations.add("Hạn chế muối < 6g/ngày");
            recommendations.add("Duy trì cân nặng lành mạnh");
            recommendations.add("Kiểm tra huyết áp 1 năm/lần");
        } else if (percentage <= 66) {
            recommendations.add("Kiểm tra huyết áp tại nhà hàng ngày");
            recommendations.add("Tăng cường đi bộ 30 phút/ngày");
            recommendations.add("Giảm muối xuống 5g/ngày");
            recommendations.add("Có thể cần dùng thuốc hạ huyết áp");
        } else {
            recommendations.add("KIỂM SOÁT HUYẾT ÁP CẤP CỨU");
            recommendations.add("Dùng thuốc hạ huyết áp theo kê đơn");
            recommendations.add("Kiểm tra huyết áp 2-3 lần/ngày");
            recommendations.add("Tránh căng thẳng, thiên định");
            recommendations.add("Tham khảo bác sĩ ngay");
        }

        return recommendations;
    }

    private List<String> getObesityRecommendations(double percentage, int bmi) {
        List<String> recommendations = new ArrayList<>();

        if (bmi < 25) {
            recommendations.add("Duy trì cân nặng hiện tại");
            recommendations.add("Tiếp tục tập thể dục 150 phút/tuần");
            recommendations.add("Ăn uống cân bằng");
        } else if (bmi < 30) {
            recommendations.add("Giảm cân 5kg");
            recommendations.add("Tăng hoạt động thể chất");
            recommendations.add("Hạn chế thực phẩm nhiều calo");
        } else {
            recommendations.add("Giảm cân 5-10% trọng lượng hiện tại");
            recommendations.add("Tham khảo chuyên gia dinh dưỡng");
            recommendations.add("Bắt đầu chương trình tập luyện có giám sát");
            recommendations.add("Theo dõi tiến độ giảm cân hàng tháng");
        }

        return recommendations;
    }

    private List<String> getDefaultRecommendations(double percentage) {
        return List.of(
                "Tham khảo bác sĩ để giải thích chi tiết kết quả",
                "Theo dõi sức khỏe thường xuyên",
                "Duy trì lối sống lành mạnh",
                "Kiểm tra sức khỏe định kỳ hàng năm"
        );
    }

    // ============ Utility Methods ============

    private int getIntValue(Object value, int defaultValue) {
        try {
            if (value == null) return defaultValue;
            if (value instanceof Number) return ((Number) value).intValue();
            return Integer.parseInt(value.toString());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private boolean getBooleanValue(Object value, boolean defaultValue) {
        try {
            if (value == null) return defaultValue;
            if (value instanceof Boolean) return (Boolean) value;
            String str = value.toString().toLowerCase();
            return str.equals("true") || str.equals("yes") || str.equals("1") || str.equals("có");
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
