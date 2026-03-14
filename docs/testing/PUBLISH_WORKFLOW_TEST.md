# Hướng Dẫn Test Publish Workflow

## Kiến Trúc Test
```
Doctor Form (Workspace chỉnh sửa)
    ↓ Edit operations
    ↓ Auto: status = DRAFT
    ↓
[Publish Button] → Validation → Create JSON Snapshot
    ↓
form_versions (immutable)
    ↓
Public Form (Read snapshot only)
```

---

## STEP 1: Kiểm Tra Dữ Liệu Hiện Tại

### 1.1 Xem tất cả forms trong database
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT form_id, form_name, status, version, published_version_id 
FROM diagnostic_forms 
LIMIT 3;"
```

**Kết quả mong đợi:**
- Xem được danh sách forms
- `status` của forms là 'PUBLISHED' (migrated)
- `published_version_id` có UUID

### 1.2 Xem form_versions table
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT version_id, form_id, version_number, status, is_active, published_at 
FROM form_versions 
LIMIT 5;"
```

**Kết quả mong đợi:**
- Xem được published versions từ migration

---

## STEP 2: Test Qua Frontend

### 2.1 Mở Admin Forms Page
1. Mở browser: `http://localhost:5173` (frontend)
2. Login với DOCTOR hoặc ADMIN account
3. Vào **Admin Forms** page

### 2.2 Xem Form Status
- Xem form nào có **status = PUBLISHED**
- Ghi nhớ form_id của 1 form muốn test

### 2.3 Edit Form (Auto-Draft)
1. Click vào 1 form có status PUBLISHED
2. Edit nội dung (thêm/sửa section, question, option)
3. Lưu changes
4. **Kiểm tra database:**

```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT form_id, form_name, status 
FROM diagnostic_forms 
WHERE form_id = '<form_id_vừa_edit>';"
```

**Kết quả mong đợi:**
- `status` chuyển thành `DRAFT` (auto do FormService.markFormAsDraft())

---

## STEP 3: Test Publish Workflow

### 3.1 Click "Publish to Public" Button
1. Quay lại Admin Forms page
2. Tìm form vừa edit (status = DRAFT)
3. Click nút **"Publish to Public"** trên form card
4. **Xác nhận** trong dialog

### 3.2 Kiểm Tra Snapshot Được Tạo
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT version_id, version_number, status, is_active, published_at 
FROM form_versions 
WHERE form_id = '<form_id_vừa_publish>'
ORDER BY version_number DESC;"
```

**Kết quả mong đợi:**
- Có 1 row mới với `status = 'PUBLISHED'`
- `is_active = true`
- `published_at` = timestamp hiện tại (hoặc gần đó)

### 3.3 Kiểm Tra diagnostic_forms Update
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT status, published_version_id, version 
FROM diagnostic_forms 
WHERE form_id = '<form_id_vừa_publish>';"
```

**Kết quả mong đợi:**
- `status = 'PUBLISHED'` (chuyển từ DRAFT)
- `published_version_id` = version_id của snapshot vừa tạo
- `version` incremented

---

## STEP 4: Test Public Form Isolation

### 4.1 Load Public Form (Before Edit)
```bash
# Lấy public token của form
curl -X GET "http://localhost:8080/api/public/forms/list" \
  -H "Accept: application/json"
```

**Hoặc từ database:**
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT public_token, form_name 
FROM diagnostic_forms 
WHERE form_id = '<form_id>';"
```

### 4.2 Test Public Endpoint
```bash
# Thay {{public_token}} bằng token từ trên
curl -X GET "http://localhost:8080/api/public/forms/{{public_token}}" \
  -H "Accept: application/json"
```

**Kết quả mong đợi:**
- Trả về form schema từ **published snapshot**
- Chứa sections, questions, options từ lúc publish

### 4.3 Edit Doctor Form Lại
1. Quay lại Admin Forms page
2. Edit form vừa publish (thêm 1 question mới)
3. Lưu changes (status tự động DRAFT lại)

### 4.4 Kiểm Tra Public Form Không Thay Đổi
```bash
# Gọi lại public endpoint
curl -X GET "http://localhost:8080/api/public/forms/{{public_token}}" \
  -H "Accept: application/json"
```

**Kết quả mong đợi:**
- Question mới **KHÔNG** có trong public form
- Public form vẫn hiển thị version cũ từ snapshot

### 4.5 Publish Lại
1. Click "Publish to Public" button
2. Xác nhận

### 4.6 Kiểm Tra Public Form Cập Nhật
```bash
curl -X GET "http://localhost:8080/api/public/forms/{{public_token}}" \
  -H "Accept: application/json"
```

**Kết quả mong đợi:**
- Question mới **ĐÃ CÓ** trong public form

---

## STEP 5: Test Conditional Logic

### 5.1 Kiểm Tra displayCondition JSON
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT question_code, display_condition 
FROM form_questions 
WHERE display_condition IS NOT NULL
LIMIT 3;"
```

### 5.2 Load Public Form Có Conditional Logic
```bash
# Tìm form có conditional logic
curl -X GET "http://localhost:8080/api/public/forms/{{public_token}}" \
  -H "Accept: application/json" | jq '.sections[0].questions[] | select(.displayCondition != null)'
```

**Kết quả mong đợi:**
- Các questions có `displayCondition` là JSON string
- Frontend hook `useConditionalLogic` parse và evaluate logic

### 5.3 Test Conditional Rendering
1. Load public form trong browser
2. Xem các questions có conditional logic
3. **Verify:**
   - Hi hiện khi điều kiện met
   - Ẩn khi điều kiện không met
   - Toggle giá trị input → update visibility

---

## STEP 6: Database Consistency Checks

### 6.1 Xem Complete Workflow
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT 
  df.form_id,
  df.form_name,
  df.status as 'doctor_status',
  df.version,
  df.published_version_id,
  fv.version_number,
  fv.status as 'version_status',
  fv.is_active,
  fv.published_at
FROM diagnostic_forms df
LEFT JOIN form_versions fv ON df.published_version_id = fv.version_id
LIMIT 5;"
```

### 6.2 Xem Form Versions History
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "
SELECT version_number, status, is_active, published_at, created_at
FROM form_versions 
WHERE form_id = '<form_id>'
ORDER BY version_number DESC;"
```

---

## Troubleshooting

### Problem: Publish button không xuất hiện
- ✅ Check frontend code: [AdminFormsPage.jsx](../frontend/src/app/system/AdminFormsPage.jsx)
- ✅ Check form status = 'PUBLISHED' (chỉ publish form đã exist)

### Problem: Publish button click nhưng không có gì xảy ra
- ✅ Check browser console cho errors
- ✅ Check backend logs: `.\mvnw.cmd spring-boot:run -DskipTests`
- ✅ Check API call: POST `/api/forms/{id}/publish`

### Problem: Public form vẫn load live data
- ✅ Check [PublicFormService.java](../backend/src/main/java/com/familymed/form/service/PublicFormService.java)
- ✅ Verify method `getPublicForm()` deserialize từ `FormVersion.formSchemaJson`
- ✅ Check `published_version_id` exist trong `diagnostic_forms`

### Problem: Conditional logic không hoạt động
- ✅ Check [useConditionalLogic.js](../frontend/src/hooks/ui/useConditionalLogic.js)
- ✅ Verify `displayCondition` JSON format trong database
- ✅ Check DynamicFormRenderer sử dụng hook

---

## Xác Nhận Publish Workflow Hoàn Toàn Working

Khi đã test hết, bạn sẽ thấy:

✅ **Doctor Edit Form** → Auto status = DRAFT
✅ **Publish Form** → Snapshot created in form_versions  
✅ **Public Form Reads Snapshot** → Shows published version only
✅ **Doctor Edit Again** → Doesn't affect public form
✅ **Publish Again** → New snapshot, public form updates
✅ **Conditional Logic Works** → displayCondition evaluated correctly

**→ Publish workflow fully operational!** 🎉
