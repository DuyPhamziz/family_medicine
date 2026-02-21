# Admin Error Troubleshooting Guide

## Các vấn đề thường gặp và cách fix

### 1. KHÔNG XÓA ĐƯỢC BIỂU MẪU / CÂU HỎI (403 Forbidden)

**Nguyên nhân:**
- Đăng nhập với role DOCTOR thay vì ADMIN
- Token hết hạn
- Backend chưa được restart sau khi fix authorization

**Cách kiểm tra:**
1. Mở trang Debug: http://localhost:5173/system/admin/debug
2. Kiểm tra `Role` phải là `ADMIN` (KHÔNG phải ROLE_ADMIN)
3. Kiểm tra `API Base URL` phải là `http://localhost:8080`
4. Kiểm tra `Token Expires` chưa hết hạn

**Cách fix:**
- Đăng xuất và đăng nhập lại với tài khoản admin
- Nếu Role = DOCTOR, cần dùng tài khoản admin: admin@familymed.vn
- Restart backend nếu vừa build mới

---

### 2. KHÔNG KẾT NỐI ĐƯỢC BACKEND (Network Error)

**Nguyên nhân:**
- Backend chưa chạy
- Port không đúng (backend = 8080, .env file sai)

**Cách fix:**
```bash
# Kiểm tra backend có chạy không
Get-NetTCPConnection -LocalPort 8080 -State Listen

# Nếu không có, start backend
cd h:\family_medicine\backend
mvn spring-boot:run
```

**Kiểm tra file .env:**
```
# h:\family_medicine\frontend\.env
VITE_API_BASE_URL=http://localhost:8080
```

---

### 3. 403 FORBIDDEN KHI XÓA BIỂU MẪU

**Backend endpoints (AdminFormController):**
- DELETE `/api/forms/admin/{id}` - Xóa form (soft delete: set status = INACTIVE)
- DELETE `/api/forms/admin/sections/{sectionId}` - Xóa section
- DELETE `/api/forms/admin/questions/{questionId}` - Xóa question
- DELETE `/api/forms/admin/options/{optionId}` - Xóa option

**Frontend code:**
```javascript
// AdminFormManagement.jsx (line 120)
await api.delete(`/api/forms/admin/${id}`);
```

**Authorization required:**
- Class-level: `@PreAuthorize("hasRole('ADMIN')")`
- User role trong JWT phải là `ADMIN` (không có prefix ROLE_)

**Đã fix trong code:**
- JwtAuthenticationFilter.java: Xử lý double ROLE_ prefix bug
- Lines 62-77: `String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;`

---

### 4. 403 FORBIDDEN KHI XÓA CÂU HỎI

**Backend endpoints (AdminQuestionController):**
- DELETE `/api/questions/admin/{id}` - Soft delete question (set isActive = false)

**Service implementation:**
```java
// QuestionServiceImpl.java
@Transactional
public void softDeleteQuestion(UUID id) {
    QuestionBank entity = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
    entity.setIsActive(false);
    repository.save(entity);
}
```

**Frontend code:**
```javascript
// AdminQuestionManagement.jsx (line 274)
await api.delete(`/api/forms/admin/questions/${questionId}`);
```

---

### 5. TOKEN HẾT HẠN (401 Unauthorized)

**JWT expiration settings:**
- Access token: 15 phút (900000ms)
- Refresh token: 7 ngày (604800000ms)

**Auto refresh mechanism:**
```javascript
// api.js - Response interceptor
if (error.response?.status === 401 && !originalRequest._retry) {
  // Tự động refresh token
  const token = await api.post('/api/auth/refresh', {}, { withCredentials: true });
  localStorage.setItem('token', token);
  // Retry request
  return api(originalRequest);
}
```

**Manual fix:**
- Đăng xuất và đăng nhập lại

---

### 6. FOREIGN KEY CONSTRAINT KHI XÓA

**Database structure:**
```
diagnostic_forms (form_id)
  └─> form_sections (section_id, form_id FK)
       └─> form_questions (question_id, section_id FK)
            ├─> form_question_options (option_id, question_id FK)
            └─> assessment_answers (answer_id, question_id FK)
```

**Solution: Soft delete thay vì hard delete**
- Forms: set `status = INACTIVE`
- Questions: set `isActive = false`

Không xóa thật sự khỏi database nên không vi phạm FK constraints.

---

### 7. CORS ERROR

**Backend config (SecurityConfig.java):**
```java
@Value("${security.cors.allowed-origins:http://localhost:5173}")
private String allowedOrigins;
```

**Nếu gặp CORS error:**
1. Kiểm tra frontend đang chạy trên port 5173
2. Kiểm tra application.properties:
   ```
   security.cors.allowed-origins=http://localhost:5173
   ```

---

### 8. DUPLICATE ROLE_ PREFIX BUG (ĐÃ FIX)

**Bug cũ:**
```java
// OLD CODE - WRONG
String authority = "ROLE_" + role; // "ADMIN" becomes "ROLE_ADMIN"
```

JWT token có role = "DOCTOR"  
→ Filter thêm prefix: "ROLE_DOCTOR"  
→ CustomUserDetailsService cũng thêm: "ROLE_ROLE_DOCTOR" ❌

**Fix mới:**
```java
// NEW CODE - CORRECT (JwtAuthenticationFilter.java line 66)
String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
```

---

## CHECKLIST DEBUG ADMIN ERRORS

### Khi gặp lỗi 403 ở admin pages:

- [ ] 1. Kiểm tra Role = ADMIN (không phải DOCTOR)
- [ ] 2. Kiểm tra backend đang chạy (port 8080)
- [ ] 3. Kiểm tra .env file (VITE_API_BASE_URL=http://localhost:8080)
- [ ] 4. Kiểm tra token chưa hết hạn
- [ ] 5. Mở Developer Tools → Network tab → xem response của DELETE request
- [ ] 6. Kiểm tra Authorization header có Bearer token không
- [ ] 7. Test với trang Debug: /system/admin/debug

### Khi build mới backend:

- [ ] 1. Stop backend cũ: `Get-NetTCPConnection -LocalPort 8080 | Stop-Process -Force`
- [ ] 2. Build: `mvn clean package -DskipTests`
- [ ] 3. Start: `mvn spring-boot:run`
- [ ] 4. Chờ 10-15 giây để khởi động hoàn tất
- [ ] 5. Đăng xuất frontend và đăng nhập lại
- [ ] 6. Test API với Debug page

---

## TÀI KHOẢN TEST

### Admin account:
- Email: `admin@familymed.vn`
- Password: (kiểm tra trong database hoặc UserInitializer.java)
- Role: `ADMIN`
- Quyền: Full CRUD tất cả resources

### Doctor account:
- Email: `doctor@familymed.vn`
- Password: (kiểm tra trong database)
- Role: `DOCTOR`
- Quyền: CRUD patients, read forms, submit assessments (KHÔNG XÓA ĐƯỢC FORMS)

---

## LOG DEBUG

### Backend logs (quan trọng):
```bash
# Xem logs của JWT filter
logging.level.com.familymed.auth.filter=DEBUG

# Logs sẽ hiển thị:
# "Processing JWT token for: /api/forms/admin/123"
# "Token details - Username: admin@familymed.vn, Role: ADMIN"
# "✓ Authentication set for user: admin@familymed.vn with authority: ROLE_ADMIN"
```

### Frontend logs (Browser Console):
```javascript
// Xem request/response
console.log('JWT Token:', localStorage.getItem('token'));
console.log('User data:', JSON.parse(localStorage.getItem('user')));

// Decode JWT manually
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
```

---

## SUMMARY: NHỮNG GÌ ĐÃ FIX

### Backend:
✅ JwtAuthenticationFilter - Fixed double ROLE_ prefix  
✅ PatientController - Added @PreAuthorize to all 5 endpoints  
✅ FormController - Restricted CRUD to ADMIN only  
✅ SubmissionController - Added proper authorization  
✅ AdminFormController - Has @PreAuthorize("hasRole('ADMIN')") at class level  
✅ AdminQuestionController - Has @PreAuthorize("hasRole('ADMIN')") at class level

### Frontend:
✅ AdminFormManagement.jsx - Delete calls correct endpoint  
✅ AdminQuestionManagement.jsx - Delete calls correct endpoint  
✅ api.js - Auto-attaches JWT token to all requests  
✅ .env - Correct API base URL (localhost:8080)

### Còn lại phải làm:
- Đăng nhập với tài khoản ADMIN
- Test delete functionality trực tiếp
- Xem logs nếu vẫn gặp lỗi
