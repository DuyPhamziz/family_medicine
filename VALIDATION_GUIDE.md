# 🏥 HƯỚNG DẪN VALIDATION RULES CHO FORM

## 📋 Mục Lục

1. [Giới Thiệu](#giới-thiệu)
2. [Danh Sách Validation Keys](#danh-sách-validation-keys)
3. [Cách Thiết Lập Validation](#cách-thiết-lập-validation)
4. [Ví Dụ Thực Tế](#ví-dụ-thực-tế)
5. [Trigger Alerts](#trigger-alerts)
6. [Chi Tiết Từng Validation](#chi-tiết-từng-validation)

---

## 🎯 Giới Thiệu

Validation rules giúp:
- ✅ Kiểm tra giá trị y khoa hợp lệ (VD: huyết áp 0-250 mmHg)
- ⚠️ Cảnh báo giá trị bất thường (VD: glucose > 180 mg/dL)
- 🔴 Chặn giá trị ngoài phạm vi tuyệt đối
- 🎨 Hiển thị phân loại y khoa (VD: Cao huyết áp giai đoạn 2)
- 📊 Cải thiện chất lượng dữ liệu
- 👨‍⚕️ Giúp bác sĩ nhận biết giá trị bất thường nhanh hơn

---

## 📊 Danh Sách Validation Keys

### Huyết Áp (Blood Pressure)

| Key | Phạm vi | Cảnh báo | Đơn vị |
|-----|---------|---------|--------|
| `BLOOD_PRESSURE_SYSTOLIC` | 70-250 | 90-140 | mmHg |
| `BLOOD_PRESSURE_DIASTOLIC` | 40-150 | 60-90 | mmHg |

**Phân loại:**
- Bình thường: < 120 / < 80
- Elevated: 120-129 / < 80
- Cao huyết áp giai đoạn 1: 130-139 / 80-89
- Cao huyết áp giai đoạn 2: ≥ 140 / ≥ 90
- Crisis: > 180 / > 120

**Ví dụ:**
```
Huyết áp tâm thu: 140 → Cao huyết áp giai đoạn 2 (🔴 đỏ)
Huyết áp tâm thu: 125 → Elevated (🟡 vàng)
Huyết áp tâm thu: 110 → Bình thường (🟢 xanh)
```

---

### Đường Huyết (Glucose)

| Key | Phạm vi | Cảnh báo | Đơn vị | Ghi chú |
|-----|---------|---------|--------|---------|
| `GLUCOSE` | 0-600 | 70-180 | mg/dL | Đường huyết lúc kiếng / sau ăn |
| `GLUCOSE_MMOL` | 0-33.3 | 3.9-10 | mmol/L | Chuyển đổi từ mg/dL |

**Phân loại:**
- Bình thường: 70-100 mg/dL (kiếng)
- Tiền tiểu đường: 100-125 mg/dL
- Tiểu đường: ≥ 126 mg/dL

**Ví dụ:**
```
Glucose: 65 → ⚠️ Cảnh báo: Đường huyết bất thường (65-180 mg/dL)
Glucose: 95 → ✅ Bình thường
Glucose: 200 → ⚠️ Cảnh báo: Đường huyết bất thường
```

---

### Nhịp Tim (Heart Rate)

| Key | Phạm vi | Cảnh báo | Đơn vị |
|-----|---------|---------|--------|
| `HEART_RATE` | 30-220 | 60-100 | bpm |

**Ghi chú:**
- < 60: Nhịp chậm (Bradycardia)
- 60-100: Bình thường
- > 100: Nhịp nhanh (Tachycardia)

---

### Chỉ Số Khối Cơ Thể (BMI)

| Key | Phạm vi | Lý tưởng | Đơn vị |
|-----|---------|---------|--------|
| `BMI` | 10-60 | 18.5-24.9 | kg/m² |

**Phân loại WHO:**
- < 18.5: Gầy (🔵 xanh dương)
- 18.5-24.9: Bình thường (🟢 xanh)
- 25-29.9: Thừa cân (🟠 cam)
- 30-34.9: Béo phì độ 1 (🔴 đỏ)
- 35-39.9: Béo phì độ 2 (🔴 đỏ)
- ≥ 40: Béo phì độ 3 (🔴 đỏ)

**Ví dụ:**
```
BMI: 23 → Bình thường (🟢)
BMI: 27 → Thừa cân (🟠)
BMI: 35 → Béo phì độ 2 (🔴)
```

---

### Cân Nặng & Chiều Cao

| Key | Phạm vi | Đơn vị |
|-----|---------|--------|
| `WEIGHT` | 20-250 | kg |
| `HEIGHT` | 100-230 | cm |

---

### Nhiệt Độ (Temperature)

| Key | Phạm vi | Bình thường | Đơn vị |
|-----|---------|-----------|--------|
| `TEMPERATURE` | 35-42 | 36.5-37.5 | °C |

**Phân loại:**
- < 36.5: Hạ thân nhiệt
- 36.5-37.5: Bình thường
- 37.6-38.5: Sốt nhẹ
- 38.6-39.5: Sốt cao
- > 39.5: Sốt rất cao

---

### Chức Năng Thận (Kidney Function)

| Key | Phạm vi | Bình thường | Đơn vị |
|-----|---------|-----------|--------|
| `CREATININE` | 0-10 | 0.7-1.3 | mg/dL |

**Ghi chú:**
- > 1.3: Suy thận nhẹ
- > 3: Suy thận nặng

---

### Chỉ Số Máu (Blood Tests)

| Key | Phạm vi | Bình thường | Đơn vị |
|-----|---------|-----------|--------|
| `HEMOGLOBIN` | 5-20 | 13.5-17.5 (nam) | g/dL |
| `HEMATOCRIT` | 20-60 | 40-54 (nam) | % |
| `WBC` | 1-50 | 4.5-11 | 10^3/µL |
| `PLATELETS` | 10-1000 | 150-400 | 10^3/µL |

---

### Cholesterol & Triglycerides

| Key | Phạm vi | Lý tưởng | Đơn vị |
|-----|---------|---------|--------|
| `CHOLESTEROL` | 0-500 | < 200 | mg/dL |
| `TRIGLYCERIDES` | 0-1000 | < 150 | mg/dL |
| `HDL` | 0-100 | > 40 | mg/dL |
| `LDL` | 0-300 | < 130 | mg/dL |

---

### Tuổi

| Key | Phạm vi | Đơn vị |
|-----|---------|--------|
| `AGE` | 0-150 | năm |

---

## 🔧 Cách Thiết Lập Validation

### 1. Khi Tạo Form Question (Admin Dashboard)

**Bước 1:** Chọn Question Type = `NUMBER`

**Bước 2:** Chọn Validation Key từ dropdown:
```
[ ] BLOOD_PRESSURE_SYSTOLIC
[ ] BLOOD_PRESSURE_DIASTOLIC
[ ] GLUCOSE
[ ] GLUCOSE_MMOL
[ ] HEART_RATE
[ ] BMI
[ ] WEIGHT
[ ] HEIGHT
[ ] TEMPERATURE
[ ] CREATININE
[ ] HEMOGLOBIN
[ ] ...
```

**Bước 3:** Hệ thống tự động fill:
- Min Value: 70 (nếu BLOOD_PRESSURE_SYSTOLIC)
- Max Value: 250
- Warning Min: 90
- Warning Max: 140

**Bước 4:** (Optional) Có thể override giá trị warning

**Bước 5:** Save form

### 2. Backend Side

FormQuestion entity:
```java
@Entity
public class FormQuestion {
    private UUID questionId;
    private String questionCode;      // VD: "V1", "GLUCOSE"
    private String questionText;      // "Đường huyết"
    private Double minValue;          // 0
    private Double maxValue;          // 600
    private String validationKey;     // "GLUCOSE"
    private Double warningMin;        // 70
    private Double warningMax;        // 180
    private String validationPattern; // Regex (nếu cần)
}
```

### 3. Frontend Side

FormQuestion DTO được gửi về:
```javascript
{
  questionCode: "GLUCOSE",
  questionText: "Đường huyết",
  validationKey: "GLUCOSE",
  minValue: 0,
  maxValue: 600,
  warningMin: 70,
  warningMax: 180
}
```

DynamicFormRenderer tự động:
- ✓ Validate giá trị khi user nhập
- ✓ Hiển thị cảnh báo nếu ngoài range warning
- ✓ Chặn submit nếu ngoài range tuyệt đối

---

## 💡 Ví Dụ Thực Tế

### Ví dụ 1: Form Khám Sức Khỏe

```json
{
  "formName": "Khám Sức Khỏe Định Kỳ",
  "sections": [
    {
      "sectionName": "Chỉ Số Sức Khỏe",
      "questions": [
        {
          "questionCode": "BP_SYS",
          "questionText": "Huyết áp tâm thu (mmHg)",
          "questionType": "NUMBER",
          "validationKey": "BLOOD_PRESSURE_SYSTOLIC"
        },
        {
          "questionCode": "BP_DIA",
          "questionText": "Huyết áp tâm trương (mmHg)",
          "questionType": "NUMBER",
          "validationKey": "BLOOD_PRESSURE_DIASTOLIC"
        },
        {
          "questionCode": "GLUCOSE",
          "questionText": "Đường huyết (mg/dL)",
          "questionType": "NUMBER",
          "validationKey": "GLUCOSE"
        },
        {
          "questionCode": "BMI",
          "questionText": "Chỉ số BMI",
          "questionType": "NUMBER",
          "validationKey": "BMI"
        }
      ]
    }
  ]
}
```

**Khi user nhập:**
```
BP_SYS: 160 → ⚠️ Cao huyết áp giai đoạn 2
GLUCOSE: 250 → ⚠️ Đường huyết bất thường (70-180 mg/dL)
BMI: 32 → 📊 Béo phì độ 1
```

---

### Ví dụ 2: Form Tiểu Đường

```json
{
  "formName": "Đánh Giá Bệnh Tiểu Đường",
  "sections": [
    {
      "sectionName": "Kết Quả Xét Nghiệm",
      "questions": [
        {
          "questionCode": "GLUCOSE_FASTING",
          "questionText": "Glucose lúc kiếng (mg/dL) - Lúc 8 sáng",
          "questionType": "NUMBER",
          "validationKey": "GLUCOSE"
        },
        {
          "questionCode": "HBA1C",
          "questionText": "HbA1c (%)",
          "questionType": "NUMBER",
          "minValue": 0,
          "maxValue": 20
        },
        {
          "questionCode": "CREATININE",
          "questionText": "Creatinine (mg/dL)",
          "questionType": "NUMBER",
          "validationKey": "CREATININE"
        }
      ]
    }
  ]
}
```

---

## 🚨 Trigger Alerts

### Severity Levels

#### 🔴 ERROR (Lỗi - không cho submit)
- Giá trị < minValue hoặc > maxValue
- Ví dụ: Glucose = 700 mg/dL → "Lỗi: Giá trị ngoài phạm vi (0-600)"

#### ⚠️ WARNING (Cảnh báo - cho phép submit nhưng báo lên)
- Giá trị ngoài warning range
- Ví dụ: Glucose = 65 mg/dL → "⚠️ Đường huyết bất thường (70-180 mg/dL)"

#### ℹ️ INFO (Thông tin - chỉ gợi ý)
- Phân loại y khoa
- Ví dụ: "🏥 Cao huyết áp giai đoạn 2"

---

## 🎨 Màu Sắc Theo Severity

```css
/* ERROR - Đỏ */
color: #dc2626;
background: #fee2e2;
border-left: #991b1b;

/* WARNING - Vàng */
color: #ca8a04;
background: #fef3c7;
border-left: #ca8a04;

/* INFO - Xanh nước biển */
color: #0284c7;
background: #dbeafe;
border-left: #0284c7;
```

---

## 🔍 Chi Tiết Từng Validation

### BLOOD_PRESSURE_SYSTOLIC

**Backend:**
```json
{
  "validationKey": "BLOOD_PRESSURE_SYSTOLIC",
  "minValue": 70,
  "maxValue": 250,
  "warningMin": 90,
  "warningMax": 140
}
```

**Frontend:**
- Nhỏ hơn 70: ❌ Lỗi
- 70-89: ✅ Bình thường
- 90-140: ✅ Bình thường
- 140-180: ⚠️ Cao huyết áp giai đoạn 2
- Lớn hơn 180: ❌ Lỗi hoặc ⚠️ Crisis

**Classification:**
```javascript
classifyBloodPressure(140, 90) // → "Cao huyết áp giai đoạn 2" (🔴)
classifyBloodPressure(125, 75) // → "Elevated" (🟡)
classifyBloodPressure(110, 70) // → "Bình thường" (🟢)
```

---

### GLUCOSE

**Backend:**
```json
{
  "validationKey": "GLUCOSE",
  "minValue": 0,
  "maxValue": 600,
  "warningMin": 70,
  "warningMax": 180
}
```

**Cảnh báo:**
- < 70: Hạ đường huyết
- 70-100: Bình thường (kiếng)
- 100-180: Bình thường (sau ăn)
- > 180: Cao

**Công thức:**
```
mg/dL → mmol/L: ÷ 18.0182
mmol/L → mg/dL: × 18.0182
```

---

### BMI

**Công thức:**
```
BMI = Cân nặng (kg) / [Chiều cao (m)]²

Ví dụ:
- Cân nặng: 70 kg
- Chiều cao: 175 cm = 1.75 m
- BMI = 70 / (1.75 × 1.75) = 22.86 (Bình thường)
```

**Classification:**
```javascript
classifyBMI(23)   // → "Bình thường" (🟢)
classifyBMI(28)   // → "Thừa cân" (🟠)
classifyBMI(35)   // → "Béo phì độ 2" (🔴)
```

---

## 🔐 Bảo Mật & Quyền Hạn

### Ai có thể set validation?

- ✅ **ADMIN**: Có thể tạo/sửa/xóa validation rules
- ✅ **DOCTOR**: Có thể xem validation guidelines
- ❌ **PATIENT**: Chỉ xem form, không thể sửa validation

### Audit Log

Mỗi khi validation rule được tạo/sửa:
```
2026-03-03 14:35:22 | ADMIN | Dr. Nguyễn Văn A | CREATED | GLUCOSE validation |
  minValue: 0, maxValue: 600, warningMin: 70, warningMax: 180
```

---

## 📱 UX Design

### Desktop (≥ 1024px)

```
┌─────────────────────────────────────┐
│ Đường huyết (mg/dL)          [?]   │
│                                      │
│ ┌───────────────────────────────────┐│
│ │ 250                                 ││
│ └───────────────────────────────────┘│
│                                      │
│ ⚠️ Cảnh báo: Giá trị bất thường     │
│    (Cần từ 70-180 mg/dL)           │
│                                      │
│ 📊 Cao đường huyết (Hyperglycemia)  │
└─────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌────────────────────────┐
│ Đường huyết (mg/dL) │
│                        │
│ ┌──────────────────────┐│
│ │ 250                   ││
│ └──────────────────────┘│
│                        │
│ ⚠️ Bất thường          │
│ 70-180 mg/dL          │
│                        │
│ 📊 Cao đường huyết    │
└────────────────────────┘
```

---

## 🐛 Troubleshooting

### Problem: Validation không hoạt động

**Nguyên nhân:** `validationKey` bị typo hoặc không tồn tại

**Giải pháp:**
```javascript
// ❌ SAI
validationKey: "GLUCOSE_MG" // Không tồn tại

// ✅ ĐÚNG
validationKey: "GLUCOSE" // Phải chính xác
```

### Problem: Warning không hiện

**Nguyên nhân:** `warningMin` hoặc `warningMax` không được set

**Giải pháp:**
```java
// Phải set cả hai
question.setWarningMin(70.0);
question.setWarningMax(180.0);
```

### Problem: Classification không thay đổi

**Nguyên nhân:** User chưa save value hoặc validation chưa run

**Giải pháp:**
```javascript
// Trigger re-render
handleAnswerChange("GLUCOSE", "250");
```

---

## 📚 Tham Khảo

- Frontend validation: `frontend/src/utils/medicalValidation.js`
- Component: `frontend/src/components/form/DynamicFormRenderer.jsx`
- Backend entity: `backend/src/main/java/com/familymed/form/entity/FormQuestion.java`
- Guidelines: WHO, American Heart Association, Diabetes Association

---

✨ **Happy validating!** ✨

Nếu có vấn đề, kiểm tra:
1. `validationKey` có chính xác không?
2. `warningMin` và `warningMax` có được set không?
3. Browser console có error không? (F12)
4. Database migration có update schema không?

