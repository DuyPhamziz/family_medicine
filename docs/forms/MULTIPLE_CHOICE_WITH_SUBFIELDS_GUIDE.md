# Hướng dẫn sử dụng MULTIPLE_CHOICE_WITH_SUBFIELDS

## Tổng quan
Question type **MULTIPLE_CHOICE_WITH_SUBFIELDS** cho phép người dùng chọn nhiều lựa chọn, và mỗi lựa chọn được tick sẽ hiển thị các trường phụ (sub-fields) ngay bên dưới.

**Ví dụ thực tế:** Câu hỏi về tiêm chủng vaccin
- Khi tick "Phế cầu" → Hiện trường: "Năm tiêm", "Loại vaccin"
- Khi tick "HPV" → Hiện trường: "Năm tiêm"
- Khi tick "Uốn ván" → Hiện trường: "Năm tiêm", "Ghi chú"

---

## Cách tạo câu hỏi

### 1. Trong Admin Question Management

1. Nhấn **"Add Question"**
2. Chọn **Question Type**: `MULTIPLE_CHOICE_WITH_SUBFIELDS`
3. Nhập **Options** (mỗi dòng một option):
   ```
   Cúm mùa trong năm nay
   COVID-19
   Phế cầu
   HPV
   Thủy đậu
   Zona (Herpes zoster)
   ```

4. Nhập **Sub-fields config** (JSON):

```json
[
  {"key": "year", "label": "Năm tiêm", "type": "NUMBER"},
  {"key": "vaccine_type", "label": "Loại vaccin", "type": "TEXT"},
  {"key": "notes", "label": "Ghi chú", "type": "TEXT"}
]
```

**Lưu ý:** Config này sẽ áp dụng cho TẤT CẢ options. Nếu muốn mỗi option có sub-fields khác nhau, cần customize code thêm.

### 2. Sub-field types hỗ trợ

| Type | Mô tả | UI Component |
|------|-------|--------------|
| `NUMBER` | Số nguyên hoặc thập phân | `<input type="number">` |
| `TEXT` | Text ngắn hoặc dài | `<textarea>` |
| `DATE` | Ngày tháng | `<input type="date">` |
| `SELECT` | Dropdown chọn | `<select>` |

### 3. Ví dụ Sub-fields config nâng cao

```json
[
  {
    "key": "year",
    "label": "Năm tiêm",
    "type": "NUMBER",
    "placeholder": "Ví dụ: 2023"
  },
  {
    "key": "vaccine_type",
    "label": "Loại vaccin",
    "type": "SELECT",
    "options": [
      {"value": "PCV13", "label": "PCV13"},
      {"value": "PPSV23", "label": "PPSV23"}
    ]
  },
  {
    "key": "doses_completed",
    "label": "Số mũi đã tiêm",
    "type": "NUMBER"
  },
  {
    "key": "notes",
    "label": "Ghi chú (nếu tiêm không đủ mũi)",
    "type": "TEXT",
    "rows": 3,
    "placeholder": "Nhập lý do, kế hoạch tiêm tiếp..."
  }
]
```

---

## Cấu trúc dữ liệu lưu trữ

### Frontend (form submission)
Khi người dùng điền form, dữ liệu được lưu dưới dạng:

```json
{
  "selectedOptions": ["Phế cầu", "HPV", "Uốn ván"],
  "subFieldsData": {
    "Phế cầu": {
      "year": "2023",
      "vaccine_type": "PCV13",
      "notes": "Tiêm 2 mũi"
    },
    "HPV": {
      "year": "2024",
      "vaccine_type": "",
      "notes": ""
    },
    "Uốn ván": {
      "year": "2022"
    }
  }
}
```

### Backend (SubmissionAnswer entity)
- **`value`**: Lưu `selectedOptions` as JSON array string
- **`subFieldsData`**: Lưu sub-fields answers as JSON object string

---

## Ví dụ cụ thể: Câu hỏi tiêm chủng

### Question Setup

**Question Text:** Bạn đã tiêm những vaccin nào?

**Options:**
```
Cúm mùa trong năm nay
COVID-19
Phế cầu
HPV
Thủy đậu
Zona (Herpes zoster)
Viêm gan A
Viêm gan B
Viêm gan B chưa tiêm ngừa nhưng đã có kháng thể
Sốt xuất huyết
Dại
Não mô cầu
Sốt vàng
Uốn ván
Bạch hầu - ho gà - uốn ván
```

**Sub-fields Config:**
```json
[
  {"key": "year", "label": "Năm tiêm", "type": "NUMBER"},
  {"key": "incomplete_doses", "label": "Trường hợp tiêm không đủ mũi", "type": "TEXT", "rows": 2}
]
```

### UI Kết quả
```
☑️ Phế cầu
   ┌─────────────────────────────┐
   │ Năm tiêm: [2023]            │
   │ Trường hợp tiêm không đủ mũi│
   │ [_______________________]   │
   └─────────────────────────────┘

☑️ HPV
   ┌─────────────────────────────┐
   │ Năm tiêm: [2024]            │
   │ Trường hợp tiêm không đủ mũi│
   │ [Tiêm 2/3 mũi, dự kiến...] │
   └─────────────────────────────┘

☐ Thủy đậu
☐ Zona
```

---

## Lợi ích của giải pháp này

✅ **Tổng quát**: Có thể dùng cho bất kỳ câu hỏi nào cần sub-fields (không chỉ vaccin)
✅ **Linh hoạt**: Config sub-fields qua JSON, không cần code thêm
✅ **UX tốt**: Sub-fields xuất hiện ngay dưới option, không cần scroll
✅ **Dữ liệu có cấu trúc**: Lưu trữ rõ ràng, dễ query và phân tích

---

## Các trường hợp sử dụng khác

1. **Lịch sử bệnh**
   - Options: Tim mạch, Đái tháo đường, Ung thư...
   - Sub-fields: Năm chẩn đoán, Đang điều trị (Yes/No), Thuốc đang dùng

2. **Dị ứng**
   - Options: Penicillin, Aspirin, Thực phẩm...
   - Sub-fields: Triệu chứng, Mức độ nghiêm trọng, Năm xảy ra

3. **Khảo sát sở thích**
   - Options: Chạy bộ, Bơi lội, Yoga...
   - Sub-fields: Tần suất/tuần, Thời lượng/buổi

---

## Hạn chế hiện tại

⚠️ **Sub-fields config chung:** Hiện tại tất cả options dùng chung một bộ sub-fields. 
   - **Workaround:** Có thể để một số sub-fields trống nếu không áp dụng cho option đó
   - **Future enhancement:** Cho phép config riêng từng option

⚠️ **Validation:** Chưa có validation tự động cho sub-fields
   - **Workaround:** Thêm helpText để hướng dẫn người dùng

---

## Troubleshooting

### Lỗi: "Invalid JSON in Sub-fields config"
- Kiểm tra JSON syntax (missing quotes, commas)
- Dùng JSON validator: https://jsonlint.com

### Sub-fields không hiện
- Kiểm tra `questionType` phải là `MULTIPLE_CHOICE_WITH_SUBFIELDS`
- Kiểm tra console log browser xem có lỗi parse JSON không

### Dữ liệu không lưu
- Kiểm tra column `sub_fields_data` đã tồn tại trong DB chưa
- Run migration: `migration_add_subfields_columns.sql`

---

