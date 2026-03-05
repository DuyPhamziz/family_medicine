# Test Publish Workflow - Step by Step Guide

## Bước 1: Login & Lấy JWT Token

### 1.1 Test Login API
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "yourPassword"
  }'
```

**Response:** Sẽ có `accessToken` - copy giá trị này

### 1.2 Hoặc Login qua Frontend
- Mở: http://localhost:5173
- Login với DOCTOR hoặc ADMIN account
- Token sẽ lưu trong browser localStorage

---

## Bước 2: Edit Form (Auto-Draft Test)

### 2.1 Cách 1: Frontend
1. Vào Admin Forms page
2. Chọn 1 form 
3. Click Edit
4. Thêm/sửa 1 câu hỏi
5. Click Save
6. **Kiểm tra:** Form status tự động chuyển sang "DRAFT"

### 2.2 Cách 2: API Test
```bash
# Lấy form hiện tại
curl -X GET "http://localhost:8080/api/forms/{form_id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Thêm section mới
curl -X POST "http://localhost:8080/api/forms/{form_id}/sections" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionName": "Test Section",
    "sectionOrder": 1,
    "subTitle": "Test"
  }'
```

---

## Bước 3: Test Publish Endpoint

### 3.1 Publish via API
```bash
curl -X POST "http://localhost:8080/api/forms/{form_id}/publish" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Successful Response (200):**
```json
{
  "success": true,
  "message": "Form published successfully",
  "publishedVersionId": "uuid-of-version",
  "versionNumber": 2
}
```

### 3.2 Publish via Frontend
1. Quay lại Admin Forms page
2. Tìm form có status "DRAFT"
3. Click nút **"Publish to Public"**
4. Xác nhận trong dialog

---

## Bước 4: Verify Snapshot Created

### 4.1 Check form_versions table
```sql
SELECT version_id, version_number, status, is_active, published_at
FROM form_versions
WHERE form_id = 'YOUR_FORM_ID'
ORDER BY version_number DESC;
```

**Kết quả mong đợi:**
- Xem được row mới
- status = 'PUBLISHED'
- is_active = true

### 4.2 Check diagnostic_forms update
```sql
SELECT form_id, status, published_version_id, version
FROM diagnostic_forms
WHERE form_id = 'YOUR_FORM_ID';
```

**Kết quả mong đợi:**
- status = 'PUBLISHED'
- published_version_id = ID vừa tạo
- version incremented

---

## Bước 5: Test Public Form Reads Snapshot

### 5.1 Lấy Public Token
```bash
curl -X GET "http://localhost:8080/api/public/forms" \
  -H "Accept: application/json"
```

Hoặc từ database:
```sql
SELECT public_token
FROM diagnostic_forms
WHERE form_id = 'YOUR_FORM_ID';
```

### 5.2 Load Public Form
```bash
curl -X GET "http://localhost:8080/api/public/forms/{public_token}" \
  -H "Accept: application/json"
```

**Response sẽ chứa:**
- Sections & Questions từ published snapshot
- Conditional logic rules (displayCondition)

### 5.3 Verify Data từ Snapshot
```bash
curl -X GET "http://localhost:8080/api/public/forms/{public_token}" | jq '.sections'
```

---

## Bước 6: Test Draft Isolation

### 6.1 Edit Form Lại (Doctor)
1. Quay lại Admin Forms page
2. Form vừa publish sẽ có status "PUBLISHED"
3. Click Edit
4. Thêm 1 question hoặc section mới
5. Save
6. Status tự động chuyển sang "DRAFT"

### 6.2 Verify Public Form Không Thay Đổi
```bash
# Gọi lại public endpoint
curl -X GET "http://localhost:8080/api/public/forms/{public_token}" | jq '.sections | length'
```

**Kết quả:**
- Số sections vẫn bằng cũ (question mới KHÔNG hiển thị)

### 6.3 Publish Lại
```bash
curl -X POST "http://localhost:8080/api/forms/{form_id}/publish" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6.4 Verify Public Form Cập Nhật
```bash
# Gọi lại public endpoint
curl -X GET "http://localhost:8080/api/public/forms/{public_token}" | jq '.sections | length'
```

**Kết quả:**
- Số sections tăng (question mới ĐÃ XUẤT HIỆN)

---

## Bước 7: Test Conditional Logic

### 7.1 Xem Form Có Conditional Logic
```sql
SELECT question_code, display_condition
FROM form_questions
WHERE display_condition IS NOT NULL
LIMIT 5;
```

### 7.2 Load Public Form & Check displayCondition
```bash
curl -X GET "http://localhost:8080/api/public/forms/{public_token}" | jq '.sections[].questions[] | select(.displayCondition != null) | {code: .questionCode, condition: .displayCondition}'
```

### 7.3 Test trong Browser
1. Load public form: http://localhost:5173/forms/{public_token}
2. Xem các questions có conditional logic
3. **Verify:**
   - Hiển thị khi điều kiện met
   - Ẩn khi điều kiện không met
   - Tương tác dynamic khi change input

---

## Quick Test Commands Summary

```powershell
# Set password
$env:PGPASSWORD='hp12345'

# Check form status
psql -h localhost -U postgres -d family_medicine_db -c "SELECT form_id, status FROM diagnostic_forms LIMIT 3;"

# Check versions
psql -h localhost -U postgres -d family_medicine_db -c "SELECT form_id, version_number, status FROM form_versions;"

# Test backend
Invoke-RestMethod -Uri "http://localhost:8080/api/public/forms" -Method GET
```

---

## Expected Results for Successful Test

✅ **Form Status Auto-Draft**
- Edit form → status changes to DRAFT

✅ **Publish Creates Snapshot**  
- Click publish → new row in form_versions
- form_versions.status = PUBLISHED
- diagnostic_forms.published_version_id updated

✅ **Public Form Reads Snapshot**
- Public endpoint returns form from form_versions, not live form.sections

✅ **Draft Isolation**
- Edit published form → status = DRAFT
- Public form unchanged until republish

✅ **Conditional Logic Works**
- displayCondition parsed and evaluated in public form
- Questions show/hide based on conditions

---

## If Something Goes Wrong

**Backend not starting:**
```powershell
$env:SPRING_DATASOURCE_PASSWORD='hp12345'
cd H:\family_medicine\backend
.\mvnw.cmd spring-boot:run -DskipTests
```

**Database connection error:**
```powershell
$env:PGPASSWORD='hp12345'
psql -h localhost -U postgres -d family_medicine_db -c "SELECT 1;"
```

**Check backend logs:**
- Run command above and watch console output
- Look for "Build SUCCESS" or error messages

**Check frontend:**
- Open http://localhost:5173
- Open browser console (F12) for JavaScript errors
- Check network tab for API calls
