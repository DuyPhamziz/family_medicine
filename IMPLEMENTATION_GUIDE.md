# 🎯 HƯỚNG DẪN CÁC TÍNH NĂNG MỚI - FAMILY MEDICINE CDSS

> **Ngày cập nhật:** 3 tháng Ba, 2026  
> **Phiên bản:** 3.0

---

## 📝 Tổng quan các tính năng đã triển khai

Tất cả các tính năng đã được triển khai thành công:

1. ✅ **Định dạng ngày tháng kiểu Việt Nam** (dd/MM/yyyy, dd tháng MM, yyyy)
2. ✅ **Đổi đơn vị nhập liệu** (mg/dL ↔ mmol/L, glucose, cholesterol, creatinine, v.v.)
3. ✅ **Danh sách tiền sử bệnh** (Component riêng với 50+ bệnh phổ biến)
4. ✅ **Nút bỏ qua câu hỏi** (Skip button cho câu hỏi không bắt buộc)
5. ✅ **Tính tuổi tự động** (AGE(), BMI(), unit conversion functions)
6. ✅ **Ràng buộc 80% hoàn thành** (Chỉ cho submit khi hoàn thành ≥80% câu hỏi bắt buộc)
7. ✅ **Medical Validation Rules** (Kiểm tra giá trị y khoa, cảnh báo bất thường, phân loại)

---

## 1️⃣ ĐỊNH DẠNG NGÀY THÁNG VIỆT NAM

### 📍 Vị trí file:
- `frontend/src/utils/formatDate.js`
- `frontend/src/components/form/DynamicFormRenderer.jsx`

### 🎯 Tính năng:

Khi người dùng chọn ngày, hệ thống sẽ tự động hiển thị định dạng Việt Nam bên dưới input:

```
Input: 2026-03-03 (HTML date picker)
Display: 📅 3 tháng 3, 2026
```

### 📘 Các hàm có sẵn:

```javascript
import { 
  formatToVietnamese,        // "03/03/2026"
  formatVietnameseLong,       // "3 tháng 3, 2026"
  formatVietnameseFullMonth,  // "3 Tháng Ba, 2026"
  getAgeFromDate              // Tính tuổi từ ngày sinh
} from './utils/formatDate';
```

### 💡 Cách sử dụng:

**Trong component:**
```jsx
import { formatVietnameseLong } from '../../utils/formatDate';

const vietnameseDate = formatVietnameseLong('2026-03-03');
// Output: "3 tháng 3, 2026"
```

**Tính tuổi:**
```jsx
import { getAgeFromDate } from '../../utils/formatDate';

const age = getAgeFromDate('1990-05-15');
// Output: 35 (năm 2026)
```

---

## 2️⃣ HỆ THỐNG ĐỔI ĐƠN VỊ NHẬP LIỆU

### 📍 Vị trí file:
- `frontend/src/utils/unitConverter.js`
- `frontend/src/components/form/AutoCalculationSetup.jsx`

### 🎯 Đơn vị được hỗ trợ:

#### **Glucose (Đường huyết)**
- mg/dL ↔ mmol/L
- Factor: 0.0555 (mg/dL → mmol/L), 18.0182 (mmol/L → mg/dL)

#### **Creatinine (Chức năng thận)**
- mg/dL ↔ μmol/L
- Factor: 88.4 (mg/dL → μmol/L), 0.01131 (μmol/L → mg/dL)

#### **Cholesterol (Lipid máu)**
- mg/dL ↔ mmol/L
- Factor: 0.02586, 38.67

#### **Triglycerides (Lipid máu)**
- mg/dL ↔ mmol/L
- Factor: 0.01129, 88.57

#### **Hemoglobin**
- g/dL ↔ mmol/L
- Factor: 0.6206, 1.6114

#### **Cân nặng**
- kg ↔ lbs ↔ g

#### **Chiều cao**
- cm ↔ inches ↔ m

#### **Nhiệt độ**
- °C ↔ °F (sử dụng formula)

#### **Huyết áp**
- mmHg ↔ kPa

### 📘 Cách sử dụng:

```javascript
import { convertValue, formatConvertedValue } from './utils/unitConverter';

// Chuyển đổi glucose từ mg/dL sang mmol/L
const glucoseMgDl = 100;
const glucoseMmol = convertValue(glucoseMgDl, 'mg/dL', 'mmol/L');
// Output: 5.55

// Format hiển thị
const display = formatConvertedValue(glucoseMmol, 'mmol/L');
// Output: "5.55 mmol/L"
```

### 🔧 Tích hợp trong form:

**Admin tạo câu hỏi với unit conversion:**
1. Vào Admin Dashboard → Forms → Edit Form
2. Thêm câu hỏi loại NUMBER
3. Chọn AutoCalculationSetup
4. Chọn "Đổi đơn vị"
5. Chọn loại conversion (VD: Glucose: mg/dL → mmol/L)
6. Tạo field output (VD: GLUCOSE_MMOL)

**Trong formula expression:**
```javascript
// Tự động convert glucose
formulaExpression: "CONVERT_FIELD('GLUCOSE_MGDL', 'mg/dL', 'mmol/L')"

// Hoặc convert trực tiếp
formulaExpression: "CONVERT(#GLUCOSE_VALUE, 'mg/dL', 'mmol/L')"
```

---

## 3️⃣ DANH SÁCH TIỀN SỬ BỆNH

### 📍 Vị trí file:
- `frontend/src/utils/medicalConditions.js`
- `frontend/src/components/form/MedicalHistoryComponent.jsx`
- `frontend/src/components/form/MedicalHistoryComponent.css`

### 🎯 Tính năng:

Component cho phép bệnh nhân chọn tiền sử bệnh từ **50+ bệnh phổ biến** được phân loại theo 11 nhóm:

1. **Hệ tim mạch**: Tăng huyết áp, Bệnh tim thiếu máu, Đột quỵ, Suy tim...
2. **Nội tiết**: Tiểu đường type 1/2, Rối loạn tuyến giáp...
3. **Hô hấp**: COPD, Hen suyễn, Lao...
4. **Gan**: Xơ gan, Viêm gan...
5. **Thận**: Bệnh thận mạn, Suy thận cuối kỳ...
6. **Thần kinh**: Động kinh, Parkinson, Dementia...
7. **Tâm lý**: Trầm cảm, Lo âu, Rối loạn lưỡng cực...
8. **Ung thư**: Đường tiêu hóa, Phổi, Vú...
9. **Cơ xương**: Viêm khớp, Loãng xương...
10. **Dị ứng**: Thức ăn, Thuốc, Môi trường...
11. **Khác**: HIV/AIDS, Rối loạn chảy máu...

### 📘 Cách tạo câu hỏi Medical History:

**Backend:** QuestionType đã hỗ trợ `MEDICAL_HISTORY`

**Admin tạo câu hỏi:**
1. Vào Admin → Forms → Edit Form
2. Thêm câu hỏi mới
3. Chọn Question Type: **MEDICAL_HISTORY**
4. Không cần thêm options (component tự động load danh sách)

**Frontend render tự động:**
```jsx
// DynamicFormRenderer tự động nhận diện MEDICAL_HISTORY
// và render MedicalHistoryComponent

case 'MEDICAL_HISTORY':
  return <MedicalHistoryComponent value={value} onChange={onChange} />;
```

### 💡 Component Features:

- ✅ Checkbox cho 50+ bệnh phổ biến
- ✅ Collapse/expand theo nhóm bệnh
- ✅ Thêm bệnh tùy chỉnh
- ✅ Badge hiển thị các bệnh đã chọn
- ✅ Nút xóa nhanh
- ✅ Read-only mode
- ✅ Responsive design

### 🎨 Ví dụ UI:

```
┌─────────────────────────────────────────────┐
│ Selected:                                   │
│ [🔵 Tăng huyết áp ×] [🔵 Tiểu đường type 2 ×]│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ▼ Hệ tim mạch                               │
│   ☑ Tăng huyết áp                           │
│   ☐ Bệnh tim thiếu máu                      │
│   ☐ Đột quỵ                                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ▶ Nội tiết                                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [+ Thêm bệnh khác]                          │
└─────────────────────────────────────────────┘
```

---

## 4️⃣ NÚT BỎ QUA CÂU HỎI KHÔNG BẮT BUỘC

### 📍 Vị trí file:
- `frontend/src/components/form/DynamicFormRenderer.jsx`

### 🎯 Tính năng:

Câu hỏi không bắt buộc (`required: false`) sẽ có:
1. **Badge "Không bắt buộc"** (màu xám) bên cạnh tiêu đề
2. **Nút "Bỏ qua"** khi đã điền câu trả lời (để clear đi)
3. **Không tính vào progress bar** nếu bỏ qua

### 📘 Cách hoạt động:

**Backend:**
- Field `required` trong FormQuestion entity
- Giá trị: `true` (bắt buộc) hoặc `false` (không bắt buộc)

**Frontend hiển thị:**
```jsx
// Câu hỏi BẮT BUỘC
Câu hỏi: Họ và tên? *
[Input field...]

// Câu hỏi KHÔNG BẮT BUỘC
Câu hỏi: Ghi chú thêm? [Không bắt buộc]  [Bỏ qua]
[Input field...]
```

### 💡 Validation logic:

```javascript
// Required questions phải có câu trả lời
if (isRequired && !answer) {
  errors.push("Câu hỏi bắt buộc");
}

// Optional questions không validate
if (!isRequired) {
  // Skip validation
}
```

### 🎨 UI/UX:

- Badge "Không bắt buộc" có màu `bg-gray-100 text-gray-600`
- Nút "Bỏ qua" chỉ hiện khi đã điền câu trả lời
- Click "Bỏ qua" → clear answer → ẩn nút
- Progress bar: chỉ tính các câu bắt buộc (required)

---

## 5️⃣ TÍNH TOÁN TỰ ĐỘNG (AGE, BMI, CONVERSIONS)

### 📍 Vị trí file:
- `frontend/src/components/form/DynamicFormRenderer.jsx` (evaluateFormulaExpression)

### 🎯 Hàm helper được hỗ trợ:

#### **1. AGE(dateField)**
Tính tuổi từ câu hỏi ngày sinh
```javascript
formulaExpression: "AGE('DOB')"
// DOB = '1990-05-15' → Output: 35 (năm 2026)
```

#### **2. BMI(weightField, heightField)**
Tính BMI từ cân nặng (kg) và chiều cao (cm)
```javascript
formulaExpression: "BMI('WEIGHT', 'HEIGHT')"
// WEIGHT = 70, HEIGHT = 170 → Output: 24.22
```

#### **3. CONVERT(value, fromUnit, toUnit)**
Chuyển đổi đơn vị
```javascript
formulaExpression: "CONVERT(100, 'mg/dL', 'mmol/L')"
// Output: 5.55
```

#### **4. CONVERT_FIELD(sourceField, fromUnit, toUnit)**
Chuyển đổi từ giá trị field khác
```javascript
formulaExpression: "CONVERT_FIELD('GLUCOSE_MGDL', 'mg/dL', 'mmol/L')"
// GLUCOSE_MGDL = 100 → Output: 5.55
```

#### **5. IF(condition, trueValue, falseValue)**
Logic điều kiện
```javascript
formulaExpression: "IF(#AGE > 65, 'Cao tuổi', 'Trung niên')"
// AGE = 70 → Output: "Cao tuổi"
```

#### **6. MAX(...values), MIN(...values)**
Giá trị lớn nhất, nhỏ nhất
```javascript
formulaExpression: "MAX(#BP_SYSTOLIC, #BP_DIASTOLIC)"
// BP_SYSTOLIC = 120, BP_DIASTOLIC = 80 → Output: 120
```

#### **7. AVG(...fields)**
Trung bình các field
```javascript
formulaExpression: "AVG('GLUCOSE_DAY1', 'GLUCOSE_DAY2', 'GLUCOSE_DAY3')"
// 100, 110, 105 → Output: 105
```

#### **8. SUM(...fields)**
Tổng các field
```javascript
formulaExpression: "SUM('SCORE_Q1', 'SCORE_Q2', 'SCORE_Q3')"
// 5, 3, 4 → Output: 12
```

### 📘 Syntax:

**Tham chiếu field khác:** Dùng `#FIELD_CODE`
```javascript
formulaExpression: "#WEIGHT / ((#HEIGHT / 100) ^ 2)"
// Tính BMI thủ công
```

**Toán tử:**
- `+, -, *, /` (cộng, trừ, nhân, chia)
- `^` hoặc `**` (lũy thừa)
- `>, <, >=, <=, ==, !=` (so sánh)

### 💡 Cách setup trong Admin:

1. Tạo câu hỏi output (VD: `CALCULATED_AGE`, type: NUMBER)
2. Set `formulaExpression`: `"AGE('DOB')"`
3. Câu hỏi sẽ tự động cập nhật khi DOB thay đổi
4. Input bị disabled (read-only) vì là calculated field

---

## 🚀 SỬ DỤNG THỰC TẾ

### Ví dụ 1: Form đánh giá nguy cơ tiểu đường

```javascript
// Câu hỏi 1: Ngày sinh (DATE)
questionCode: "DOB"
questionType: "DATE"

// Câu hỏi 2: Tuổi (NUMBER - Auto calculated)
questionCode: "AGE"
questionType: "NUMBER"
formulaExpression: "AGE('DOB')"
required: false  // Không cần nhập vì tự động

// Câu hỏi 3: Cân nặng (kg)
questionCode: "WEIGHT"
questionType: "NUMBER"
unit: "kg"

// Câu hỏi 4: Chiều cao (cm)
questionCode: "HEIGHT"
questionType: "NUMBER"
unit: "cm"

// Câu hỏi 5: BMI (Auto calculated)
questionCode: "BMI"
questionType: "NUMBER"
formulaExpression: "BMI('WEIGHT', 'HEIGHT')"

// Câu hỏi 6: Đường huyết (mg/dL)
questionCode: "GLUCOSE_MGDL"
questionType: "NUMBER"
unit: "mg/dL"

// Câu hỏi 7: Đường huyết (mmol/L - Auto converted)
questionCode: "GLUCOSE_MMOL"
questionType: "NUMBER"
formulaExpression: "CONVERT_FIELD('GLUCOSE_MGDL', 'mg/dL', 'mmol/L')"
unit: "mmol/L"

// Câu hỏi 8: Tiền sử bệnh
questionCode: "MEDICAL_HISTORY"
questionType: "MEDICAL_HISTORY"

// Câu hỏi 9: Ghi chú (Optional)
questionCode: "NOTES"
questionType: "TEXT"
required: false  // Có nút "Bỏ qua"
```

### Ví dụ 2: Tính điểm nguy cơ tim mạch

```javascript
// Tổng điểm nguy cơ
questionCode: "RISK_SCORE"
formulaExpression: "SUM('AGE_SCORE', 'BP_SCORE', 'CHOLESTEROL_SCORE', 'SMOKING_SCORE')"

// Phân loại nguy cơ
questionCode: "RISK_LEVEL"
formulaExpression: "IF(#RISK_SCORE < 10, 'Thấp', IF(#RISK_SCORE < 20, 'Trung bình', 'Cao'))"
```

---

## 6️⃣ RÀNG BUỘC HOÀN THÀNH 80%

### 📍 Vị trí file:
- `frontend/src/components/form/DynamicFormRenderer.jsx`

### 🎯 Tính năng:

Form chỉ cho phép submit khi người dùng đã hoàn thành **ít nhất 80%** các câu hỏi bắt buộc.

### 🔒 Cơ chế hoạt động:

#### **1. Progress Tracking**
- Tính % hoàn thành: `(Câu đã trả lời / Tổng câu bắt buộc) × 100`
- Chỉ tính câu hỏi bắt buộc (`required: true`)
- Câu hỏi ẩn (conditional logic) không tính vào

#### **2. Visual Feedback**

**Progress Bar:**
- < 80%: Màu xanh dương (`blue-500 → cyan-500`)
- ≥ 80%: Màu xanh lá (`green-500 → emerald-500`)

**Warning Message (khi < 80%):**
```
⚠️ Cần hoàn thành ít nhất 80% để gửi biểu mẫu (còn thiếu X%)
```

#### **3. Submit Button**

**Khi < 80%:**
- Button màu xám, disabled
- Text: "Hoàn thành X% (cần 80%)"
- Tooltip: "Cần hoàn thành ít nhất 80%"
- Hiển thị số câu còn thiếu

**Khi ≥ 80%:**
- Button màu xanh lá (`green-500 → emerald-500`)
- Text: "Gửi biểu mẫu"
- Enabled, có hover effect

#### **4. Validation Logic**

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Check 80% requirement FIRST
  if (progressPercent < 80) {
    setErrors({
      _form: `Vui lòng hoàn thành ít nhất 80% câu hỏi bắt buộc (hiện tại: ${progressPercent}%)`
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  // Then validate individual fields
  if (!validateForm()) {
    return;
  }
  
  // Finally submit
  await onSubmit(answers);
};
```

### 📘 Tùy chỉnh ngưỡng 80%

Nếu muốn thay đổi ngưỡng (VD: 70%, 90%), sửa trong `DynamicFormRenderer.jsx`:

```javascript
// Thay đổi tất cả 80 thành số mong muốn
const MINIMUM_COMPLETION = 80; // Hoặc 70, 90, etc.

if (progressPercent < MINIMUM_COMPLETION) {
  // Validation logic
}
```

### 💡 User Experience:

**Kịch bản 1: Người dùng mới mở form (0%)**
```
┌─────────────────────────────────────────┐
│ Tiến độ hoàn thành        0/20 • 0%    │
│ [░░░░░░░░░░░░░░░░░░░░ 0%]  (xanh dương) │
│ ⚠️ Cần hoàn thành ít nhất 80% để gửi    │
│    (còn thiếu 80%)                      │
└─────────────────────────────────────────┘

[⊗ Hoàn thành 0% (cần 80%)] ← Button xám, disabled
⚠️ Vui lòng điền thêm 16 câu hỏi bắt buộc
```

**Kịch bản 2: Đã điền 60% (chưa đủ)**
```
┌─────────────────────────────────────────┐
│ Tiến độ hoàn thành       12/20 • 60%   │
│ [███████████████░░░░░ 60%]  (xanh dương) │
│ ⚠️ Cần hoàn thành ít nhất 80% để gửi    │
│    (còn thiếu 20%)                      │
└─────────────────────────────────────────┘

[⊗ Hoàn thành 60% (cần 80%)] ← Button xám, disabled
⚠️ Vui lòng điền thêm 4 câu hỏi bắt buộc
```

**Kịch bản 3: Đã điền 85% (đủ điều kiện)**
```
┌─────────────────────────────────────────┐
│ Tiến độ hoàn thành       17/20 • 85%   │
│ [████████████████████ 85%]  (xanh lá) │
└─────────────────────────────────────────┘

[✓ Gửi biểu mẫu] ← Button xanh lá, enabled, hover scale up
```

### 🎨 CSS Classes:

```jsx
// Progress indicator colors
progressPercent >= 80 ? 'text-green-700' : 'text-blue-700'

// Progress bar colors
progressPercent >= 80 
  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
  : 'bg-gradient-to-r from-blue-500 to-cyan-500'

// Submit button
progressPercent >= 80
  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
  : 'bg-gray-400 cursor-not-allowed opacity-60'
```

### ⚙️ Edge Cases:

**1. Form không có câu hỏi bắt buộc:**
- `visibleRequiredQuestions.length === 0`
- `progressPercent = 100` (auto)
- Submit enabled ngay

**2. Conditional questions ẩn đi:**
- Recalculate progress khi conditional state thay đổi
- Có thể tăng hoặc giảm progressPercent

**3. Formula fields:**
- Không tính vào required (vì auto-calculated)
- Không block submit

**4. Optional questions:**
- Không ảnh hưởng đến progress
- Có thể bỏ qua hoàn toàn

### 🔍 Debug:

Check progress calculation trong console:

```javascript
console.log({
  visibleRequiredQuestions: visibleRequiredQuestions.length,
  answeredRequiredCount,
  progressPercent,
  canSubmit: progressPercent >= 80
});
```

---

## 🛠️ GỠ LỖI (TROUBLESHOOTING)

### Lỗi 1: Date không hiển thị định dạng Việt

**Nguyên nhân:** Value không đúng format ISO (YYYY-MM-DD)

**Giải pháp:**
```javascript
// Đảm bảo value là string ISO hoặc Date object
const value = '2026-03-03'; // Đúng
const value = '03/03/2026'; // SAI - sẽ không parse được
```

### Lỗi 2: Unit conversion không hoạt động

**Nguyên nhân:** Unit name không khớp với UNIT_CONVERSIONS

**Giải pháp:**
```javascript
// Kiểm tra tên unit chính xác
convertValue(100, 'mg/dL', 'mmol/L'); // Đúng
convertValue(100, 'mgdl', 'mmoll'); // SAI - không tìm thấy
```

### Lỗi 3: Formula không tính toán

**Nguyên nhân:** Syntax sai hoặc field không tồn tại

**Giải pháp:**
```javascript
// Kiểm tra console.error để xem lỗi chi tiết
// Đảm bảo field code đúng
formulaExpression: "AGE('DOB')" // Đúng
formulaExpression: "AGE(DOB)" // SAI - thiếu quotes
```

### Lỗi 4: Medical History không lưu

**Nguyên nhân:** Value không phải array

**Giải pháp:**
```javascript
// Component trả về array of condition IDs
onChange(['DM2', 'HTN', 'ASTHMA']); // Đúng

// Backend cần parse JSON array
// MySQL: JSON column hoặc TEXT column with JSON string
```

---

## 📝 CHECKLIST KIỂM TRA

Sau khi deploy, kiểm tra các điểm sau:

- [ ] Date picker hiển thị định dạng Việt bên dưới
- [ ] Unit conversion options hiển thị đầy đủ trong AutoCalculationSetup
- [ ] Medical History component load được danh sách bệnh
- [ ] Câu hỏi không bắt buộc có badge "Không bắt buộc"
- [ ] Nút "Bỏ qua" hoạt động khi có câu trả lời
- [ ] Formula AGE() tính đúng tuổi
- [ ] Formula BMI() tính đúng chỉ số
- [ ] Formula CONVERT_FIELD() chuyển đơn vị đúng
- [ ] Progress bar chỉ tính câu hỏi bắt buộc
- [ ] Backend QuestionType enum có MEDICAL_HISTORY
- [ ] Progress bar chuyển màu xanh lá khi đạt 80%
- [ ] Submit button bị disable khi < 80%
- [ ] Warning message hiện khi chưa đủ 80%
- [ ] Form có thể submit thành công khi ≥ 80%
- [ ] Validation warnings hiển thị khi giá trị bất thường
- [ ] Blood pressure classification hiển thị đúng (Bình thường/Elevated/Cao huyết áp)
- [ ] BMI classification hiển thị đúng đơn vị WHO (Gầy/Bình thường/Thừa cân/Béo phì)
- [ ] AdminValidationRuleSelector component render đúng với 20+ validation keys
- [ ] Hover lên validation warnings hiển thị icon & màu sắc đúng
- [ ] Glucose warning hiện ở 70-180 range
- [ ] Heart rate warning hiện ở 60-100 range

---

## 🎓 TÀI LIỆU THAM KHẢO

### Files đã tạo mới:
1. `frontend/src/utils/formatDate.js` - Vietnamese date utilities
2. `frontend/src/utils/unitConverter.js` - Medical unit conversions
3. `frontend/src/utils/medicalConditions.js` - Medical history data
4. `frontend/src/utils/medicalValidation.js` - Medical validation rules (NEW)
5. `frontend/src/components/form/MedicalHistoryComponent.jsx` - Medical history UI
6. `frontend/src/components/form/MedicalHistoryComponent.css` - Medical history styles
7. `frontend/src/components/admin/AdminValidationRuleSelector.jsx` - Admin validation selector (NEW)
8. `VALIDATION_GUIDE.md` - Validation rules documentation (NEW)

### Files đã chỉnh sửa:
1. `frontend/src/components/form/DynamicFormRenderer.jsx` - Added validation warnings & classifications
2. `frontend/src/components/form/AutoCalculationSetup.jsx` - Enhanced unit types
3. `backend/src/main/java/com/familymed/form/entity/FormQuestion.java` - Added validation fields
4. `backend/src/main/java/com/familymed/question/entity/QuestionType.java` - Added MEDICAL_HISTORY type
5. `IMPLEMENTATION_GUIDE.md` - Added section 7 about validation (this file)

---

## 7️⃣ VALIDATION RULES CHO GIÁ TRỊ Y KHOA

### 📍 Vị trí Files:

- `frontend/src/utils/medicalValidation.js` - Danh sách validation rules
- `frontend/src/components/form/DynamicFormRenderer.jsx` - Render validation warnings
- `frontend/src/components/admin/AdminValidationRuleSelector.jsx` - Component chọn validation
- `backend/src/main/java/com/familymed/form/entity/FormQuestion.java` - Validation metadata
- `VALIDATION_GUIDE.md` - Hướng dẫn chi tiết

### 🎯 Tính năng:

Validation rules giúp kiểm tra và cảnh báo các giá trị y khoa:

```
✅ VALID (Hợp lệ)
├─ Giá trị nằm trong phạm vi cho phép
├─ VD: Glucose = 95 mg/dL ✅

⚠️ WARNING (Cảnh báo)
├─ Giá trị hợp lệ nhưng bất thường
├─ VD: Glucose = 250 mg/dL → "Cảnh báo: Giá trị bất thường (70-180)"
├─ Bác sĩ vẫn có thể submit

❌ ERROR (Lỗi)
├─ Giá trị nằm ngoài phạm vi tuyệt đối
├─ VD: Glucose = 700 mg/dL → "Lỗi: Ngoài phạm vi (0-600)"
├─ Chặn submit, phải sửa lại
```

### 📊 Danh sách Validation Keys:

**Huyết Áp & Nhịp Tim:**
```
BLOOD_PRESSURE_SYSTOLIC: 70-250 mmHg (cảnh báo: 90-140)
BLOOD_PRESSURE_DIASTOLIC: 40-150 mmHg (cảnh báo: 60-90)
HEART_RATE: 30-220 bpm (cảnh báo: 60-100)
TEMPERATURE: 35-42 °C (bình thường: 36.5-37.5)
```

**Đường Huyết & Cân Nặng:**
```
GLUCOSE: 0-600 mg/dL (cảnh báo: 70-180)
GLUCOSE_MMOL: 0-33.3 mmol/L (cảnh báo: 3.9-10)
BMI: 10-60 kg/m² (lý tưởng: 18.5-24.9)
WEIGHT: 20-250 kg
HEIGHT: 100-230 cm
```

**Xét Nghiệm:**
```
CREATININE: 0-10 mg/dL (bình thường: 0.7-1.3)
CHOLESTEROL: 0-500 mg/dL (cảnh báo: <200)
TRIGLYCERIDES: 0-1000 mg/dL (cảnh báo: <150)
HEMOGLOBIN: 5-20 g/dL (bình thường: 13.5-17.5)
WBC: 1-50 10^3/µL (bình thường: 4.5-11)
```

Xem `VALIDATION_GUIDE.md` để danh sách đầy đủ 20+ validation keys.

### 🎨 Phân loại Medical Classifications:

**Blood Pressure Classification:**
```javascript
classifyBloodPressure(140, 90) // → "Cao huyết áp giai đoạn 2" (🔴)
classifyBloodPressure(125, 75) // → "Elevated" (🟡)
classifyBloodPressure(110, 70) // → "Bình thường" (🟢)
```

**BMI Classification (WHO):**
```javascript
classifyBMI(23)   // → "Bình thường" (🟢)
classifyBMI(28)   // → "Thừa cân" (🟠)
classifyBMI(35)   // → "Béo phì độ 2" (🔴)
```

### 💡 Cách Thiết Lập (Admin):

**Step 1:** Khi tạo Form Question, chọn Question Type = `NUMBER`

**Step 2:** Sẽ hiển thị dropdown "Validation Rule":
```
┌─ Huyết Áp (Blood Pressure)
├─ 🩺 Đường Huyết (Glucose)
├─ ⏱️ Dấu Hiệu Sống (Vital Signs)
├─ 📏 Chỉ Số Cơ Thể (Body Metrics)
└─ 🔬 Xét Nghiệm (Laboratory)
```

**Step 3:** Chọn một rule (VD: GLUCOSE)

**Step 4:** Hệ thống tự động fill:
```
Min Value: 0
Max Value: 600
Warning Min: 70
Warning Max: 180
```

**Step 5:** (Optional) Có thể override giá trị

**Step 6:** Save form

### 🔍 Cách Sử Dụng trong Component:

```jsx
// DynamicFormRenderer sẽ tự động validate
const question = {
  questionCode: "GLUCOSE",
  questionText: "Đường huyết (mg/dL)",
  questionType: "NUMBER",
  validationKey: "GLUCOSE",
  minValue: 0,
  maxValue: 600,
  warningMin: 70,
  warningMax: 180
};

// Khi user nhập 250:
handleAnswerChange("GLUCOSE", 250);

// ► Validation sẽ:
// 1. Check 250 trong phạm vi [0, 600] ✅
// 2. Check 250 trong warning [70, 180] ❌
// 3. Set validationWarnings: {
//    GLUCOSE: {
//      isValid: true,
//      message: "⚠️ Đường huyết bất thường (70-180 mg/dL)",
//      severity: "warning"
//    }
// }
// 4. Render warning badge dưới input
```

### 📱 UI/UX Scenarios:

**Scenario 1: Giá trị bình thường**
```
🩺 Blood Pressure Systolic
├─ Input: 120
├─ Status: ✅ Hợp lệ
└─ Badge: "🏥 Bình thường" (xanh)
```

**Scenario 2: Cảnh báo**
```
🩺 Blood Pressure Systolic
├─ Input: 160
├─ Status: ⚠️ Cảnh báo
├─ Message: "Giá trị bất thường (90-140 mmHg)"
└─ Badge: "🏥 Cao huyết áp giai đoạn 2" (đỏ)
```

**Scenario 3: Lỗi**
```
🩺 Blood Pressure Systolic
├─ Input: 300
├─ Status: ❌ Lỗi
├─ Message: "Ngoài phạm vi cho phép (70-250 mmHg)"
└─ Cannot submit form
```

### 🎓 Validation Admin Component:

`AdminValidationRuleSelector.jsx` cung cấp:

- **Dropdown chọn validation rule** (20+ rules được nhóm)
- **Custom range editor** cho min/max/warning values
- **Live preview** hiển thị cảnh báo cho giá trị khác nhau
- **Info tooltips** giải thích từng rule

```jsx
<AdminValidationRuleSelector
  selectedKey={question.validationKey}
  minValue={question.minValue}
  maxValue={question.maxValue}
  warningMin={question.warningMin}
  warningMax={question.warningMax}
  onRuleChange={(ruleConfig) => {
    // Update question with new validation
    setQuestion({...question, ...ruleConfig});
  }}
/>
```

### ✅ Checklist Kiểm Tra:

- [ ] Frontend: `medicalValidation.js` tính từng validation
- [ ] Frontend: `DynamicFormRenderer` hiển thị warnings/classifications
- [ ] Frontend: `AdminValidationRuleSelector` cho admin chọn rules
- [ ] Backend: `FormQuestion.java` có fields `validationKey`, `warningMin`, `warningMax`
- [ ] Backend: API trả về validation metadata trong form schema
- [ ] Database: Migration thêm columns mới vào `form_questions` table
- [ ] Admin Dashboard: Form builder UI thêm validation rules dropdown
- [ ] Testing: Verify warnings hiển thị ở các ngưỡng khác nhau

---

## 📞 HỖ TRỢ

Nếu có vấn đề, kiểm tra:
1. Console log errors (F12 → Console)
2. Network tab (API responses)
3. React DevTools (Component props)

**Formula expression debugging:**
```javascript
// Thêm console.log trong evaluateFormulaExpression
console.log('[Formula]', { expression, answers, result });
```

---

✨ **Chúc triển khai thành công!** ✨
