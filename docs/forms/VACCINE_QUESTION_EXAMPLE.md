# Ví dụ cấu hình Câu hỏi Tiêm chủng (Copy & Paste)

## Cấu hình Question

### Question Code
```
VACCINE_HISTORY
```

### Question Text
```
Bạn đã tiêm những vaccin nào? (Chọn tất cả các loại đã tiêm)
```

### Question Type
```
MULTIPLE_CHOICE_WITH_SUBFIELDS
```

### Options (one per line)
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

### Sub-fields Config (JSON)

**Option 1: Cơ bản (chỉ năm tiêm + ghi chú)**
```json
[
  {"key": "year", "label": "Năm tiêm", "type": "NUMBER", "placeholder": "Ví dụ: 2023"},
  {"key": "incomplete_doses", "label": "Trường hợp tiêm không đủ mũi", "type": "TEXT", "rows": 2, "placeholder": "Nhập lý do nếu chưa tiêm đủ mũi..."}
]
```

**Option 2: Chi tiết hơn (có loại vaccin)**
```json
[
  {"key": "year", "label": "Năm tiêm", "type": "NUMBER", "placeholder": "2023"},
  {"key": "vaccine_brand", "label": "Loại/Thương hiệu vaccin", "type": "TEXT", "placeholder": "Ví dụ: Pfizer, Moderna, PCV13..."},
  {"key": "doses_count", "label": "Số mũi đã tiêm", "type": "NUMBER", "placeholder": "1, 2, 3..."},
  {"key": "notes", "label": "Ghi chú thêm", "type": "TEXT", "rows": 2, "placeholder": "Phản ứng sau tiêm, kế hoạch tiêm tiếp..."}
]
```

**Option 3: Nâng cao nhất (có dropdown cho loại vaccin)**
```json
[
  {"key": "year", "label": "Năm tiêm", "type": "NUMBER", "placeholder": "2023"},
  {"key": "vaccine_type", "label": "Loại vaccin", "type": "SELECT", "options": [
    {"value": "pfizer", "label": "Pfizer-BioNTech"},
    {"value": "moderna", "label": "Moderna"},
    {"value": "astra", "label": "AstraZeneca"},
    {"value": "sinovac", "label": "Sinovac"},
    {"value": "pcv13", "label": "PCV13 (Phế cầu)"},
    {"value": "ppsv23", "label": "PPSV23 (Phế cầu)"},
    {"value": "other", "label": "Khác"}
  ]},
  {"key": "doses_status", "label": "Tình trạng tiêm", "type": "SELECT", "options": [
    {"value": "completed", "label": "Đã tiêm đủ mũi"},
    {"value": "incomplete", "label": "Chưa tiêm đủ mũi"},
    {"value": "booster_needed", "label": "Cần tiêm nhắc lại"}
  ]},
  {"key": "notes", "label": "Ghi chú", "type": "TEXT", "rows": 2}
]
```

---

## Khuyến nghị

- **Dùng Option 1** nếu chỉ cần thông tin cơ bản
- **Dùng Option 2** nếu cần theo dõi loại vaccin và số mũi
- **Dùng Option 3** nếu muốn chuẩn hóa data với dropdown

---

## Preview UI sau khi tạo

Khi người dùng điền form, sẽ thấy:

```
┌─────────────────────────────────────────────┐
│ ☑️ Phế cầu                                  │
├─────────────────────────────────────────────┤
│   📝 Năm tiêm: [2023___________]           │
│   📝 Loại vaccin: [PCV13________________]  │
│   📝 Trường hợp tiêm không đủ mũi:         │
│      [________________________]            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ☑️ HPV                                      │
├─────────────────────────────────────────────┤
│   📝 Năm tiêm: [2024___________]           │
│   📝 Loại vaccin: [Gardasil 9___________]  │
│   📝 Trường hợp tiêm không đủ mũi:         │
│      [Tiêm 2/3 mũi, chờ mũi cuối 6 tháng  │
│       sau________________________]         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ☐ Thủy đậu                                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ☐ Zona (Herpes zoster)                      │
└─────────────────────────────────────────────┘
```

Khi **KHÔNG** tick, các sub-fields sẽ ẩn đi.

---

## Testing Steps

1. Tạo question với config trên trong Admin
2. Publish form
3. Điền form test:
   - Tick 2-3 vaccin
   - Nhập năm tiêm và ghi chú cho mỗi loại
4. Submit form
5. Vào Admin → View Submissions → Kiểm tra data đã lưu đúng

---

