# Hệ Thống Phân Quyền - Family Medicine System

## 📋 Tóm tắt các thay đổi

### ✅ Đã Fix:
1. **Double ROLE_ Prefix Bug** - JWT Filter không còn thêm `ROLE_` prefix trùng lặp
2. **PatientController** - Đã thêm phân quyền cho tất cả endpoints
3. **FormController** - Đã phân quyền CRUD forms theo đúng role
4. **SubmissionController** - Đã thêm phân quyền cho submission và export

---

## 🔐 Phân Quyền Theo Chức Năng

### **1. Quản Lý Bệnh Nhân (PatientController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| `/api/patients` | POST | ADMIN, DOCTOR | Tạo bệnh nhân mới |
| `/api/patients/{id}` | GET | ADMIN, DOCTOR, NURSE | Xem thông tin bệnh nhân |
| `/api/patients/doctor/list` | GET | ADMIN, DOCTOR | Xem danh sách bệnh nhân của bác sĩ |
| `/api/patients/{id}` | PUT | ADMIN, DOCTOR | Cập nhật thông tin bệnh nhân |
| `/api/patients/{id}` | DELETE | ADMIN, DOCTOR | Xóa bệnh nhân |

### **2. Quản Lý Biểu Mẫu/Form (FormController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| `/api/forms` | GET | ADMIN, DOCTOR, NURSE | Xem danh sách forms |
| `/api/forms/{id}` | GET | ADMIN, DOCTOR, NURSE | Xem chi tiết form |
| `/api/forms` | POST | **ADMIN only** | ✨ Tạo form mới |
| `/api/forms/{id}` | PUT | **ADMIN only** | ✨ Cập nhật form |
| `/api/forms/{id}` | DELETE | **ADMIN only** | ✨ Xóa form |
| `/api/forms/doctor/submissions` | GET | ADMIN, DOCTOR | Xem submissions của doctor |

### **3. Quản Lý Form Admin (AdminFormController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| Tất cả endpoints | ALL | **ADMIN only** | Quản lý forms (CRUD đầy đủ) |

### **4. Submit Form (SubmissionController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| `/api/submissions` | POST | ADMIN, DOCTOR | Submit form cho bệnh nhân |
| `/api/submissions/patient/{patientId}` | GET | ADMIN, DOCTOR, NURSE | Xem submissions của bệnh nhân |
| `/api/submissions/{id}/export` | GET | ADMIN, DOCTOR | Export submission ra Excel |

### **5. Quản Lý Câu Hỏi (AdminQuestionController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| Tất cả endpoints | ALL | **ADMIN only** | CRUD câu hỏi cho forms |

### **6. Logic CDSS (LogicController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| View logic | GET | ADMIN, DOCTOR, USER | Xem logic rules |
| CRUD logic | POST/PUT/DELETE | **ADMIN only** | Quản lý logic rules |

### **7. Đơn Thuốc (PrescriptionController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| Create/Update/Delete | POST/PUT/DELETE | **DOCTOR only** | Tạo/sửa/xóa đơn thuốc |
| View | GET | ADMIN, DOCTOR, NURSE | Xem đơn thuốc |

### **8. Lịch Hẹn (AppointmentController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| Create | POST | **DOCTOR only** | Tạo lịch hẹn |
| View/List | GET | ADMIN, DOCTOR, NURSE | Xem lịch hẹn |
| Update | PUT | **DOCTOR only** | Cập nhật lịch hẹn |

### **9. Kế Hoạch Chăm Sóc (CarePlanController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| CRUD | POST/PUT/DELETE | **DOCTOR only** | Quản lý kế hoạch |
| View | GET | ADMIN, DOCTOR, NURSE | Xem kế hoạch |

### **10. Dashboard (DoctorDashboardController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| `/api/dashboard/doctor` | GET | **DOCTOR only** | Dashboard cho bác sĩ |

### **11. Quản Lý User (AdminUserController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| Tất cả endpoints | ALL | **ADMIN only** | CRUD user accounts |

### **12. Audit Logs (AuditLogController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| View logs | GET | **ADMIN only** | Xem lịch sử thay đổi |

### **13. Hướng Dẫn Lâm Sàng (GuidelineController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| View | GET | ADMIN, DOCTOR, NURSE | Xem hướng dẫn |
| CRUD | POST/PUT/DELETE | **ADMIN only** | Quản lý hướng dẫn |

### **14. ICD-10 (Icd10Controller)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| Search/View | GET | ADMIN, DOCTOR, NURSE | Tìm kiếm mã ICD-10 |

### **15. Medical Records (MedicalRecordController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| Tất cả endpoints | ALL | ADMIN, DOCTOR, NURSE | Xem/quản lý hồ sơ bệnh án |

### **16. Diagnosis (PatientDiagnosisController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| Tất cả endpoints | ALL | ADMIN, DOCTOR, NURSE | Quản lý chẩn đoán |

### **17. Assessment (AssessmentController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| Tất cả endpoints | ALL | ADMIN, DOCTOR, NURSE | Đánh giá bệnh nhân |

### **18. Clinical Summary (ClinicalSummaryController)**
| Endpoint | Method | Phân Quyền | Mô tả |
|----------|--------|------------|-------|
| View summary | GET | ADMIN, DOCTOR, NURSE | Xem tóm tắt lâm sàng |

---

## 👥 Tổng Hợp Quyền Theo Role

### **ADMIN** 
**Quyền đầy đủ (Full Access)**
- ✅ Quản lý Forms (CRUD) - **ADMIN độc quyền**
- ✅ Quản lý Câu hỏi (CRUD) - **ADMIN độc quyền**
- ✅ Quản lý Users (CRUD) - **ADMIN độc quyền**
- ✅ Quản lý Logic Rules (CRUD) - **ADMIN độc quyền**
- ✅ Quản lý Hướng dẫn (CRUD) - **ADMIN độc quyền**
- ✅ Xem Audit Logs - **ADMIN độc quyền**
- ✅ Tất cả quyền của DOCTOR và NURSE

### **DOCTOR**
**Quyền làm việc với bệnh nhân**
- ✅ Quản lý bệnh nhân (CRUD)
- ✅ Xem và đọc Forms (chỉ Read)
- ✅ Submit Forms cho bệnh nhân
- ✅ Kê đơn thuốc
- ✅ Tạo lịch hẹn
- ✅ Quản lý kế hoạch chăm sóc
- ✅ Xem dashboard
- ✅ Xem/tạo chẩn đoán
- ✅ Export submissions
- ❌ **KHÔNG ĐƯỢC** tạo/sửa/xóa Forms
- ❌ **KHÔNG ĐƯỢC** tạo/sửa/xóa Câu hỏi

### **NURSE**
**Quyền xem và hỗ trợ**
- ✅ Xem thông tin bệnh nhân
- ✅ Xem Forms
- ✅ Xem submissions
- ✅ Xem đơn thuốc
- ✅ Xem lịch hẹn
- ✅ Xem kế hoạch chăm sóc
- ✅ Xem hồ sơ y tế
- ✅ Xem chẩn đoán
- ❌ **KHÔNG ĐƯỢC** tạo/sửa/xóa dữ liệu quan trọng

### **USER**
**Quyền giới hạn**
- ✅ Xem một số thông tin công khai
- ✅ Xem logic rules (nếu có)
- ❌ **KHÔNG ĐƯỢC** truy cập hầu hết chức năng

---

## 🔧 Chi Tiết Kỹ Thuật

### **JWT Token Structure**
```json
{
  "sub": "doctor@familymed.vn",  // username/email
  "role": "DOCTOR",               // role code (không có ROLE_ prefix)
  "userId": "uuid-here",
  "typ": "access",                // token type
  "iat": 1234567890,
  "exp": 1234567890
}
```

### **Authentication Flow**
1. User login → Backend tạo JWT token với role
2. Frontend gửi token trong header: `Authorization: Bearer <token>`
3. `JwtAuthenticationFilter` validate token:
   - Check signature
   - Check expiration
   - Check token type = "access"
   - Extract username, role
4. Tạo `UsernamePasswordAuthenticationToken` với authority = `ROLE_{role}`
5. Spring Security check `@PreAuthorize` annotations
6. Nếu match → cho phép truy cập
7. Nếu không match → trả về 403 Forbidden

### **Bug Đã Fix**
#### ❌ Trước khi fix:
```java
// Bug: Double ROLE_ prefix
String authority = "ROLE_" + role;  // role = "DOCTOR"
// Kết quả: "ROLE_DOCTOR" ✅

// Nhưng nếu role = "ROLE_DOCTOR":
String authority = "ROLE_" + role;  
// Kết quả: "ROLE_ROLE_DOCTOR" ❌
```

#### ✅ Sau khi fix:
```java
// Fix: Check prefix trước khi thêm
String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
// Kết quả luôn đúng: "ROLE_DOCTOR" ✅
```

---

## 🚀 Hướng Dẫn Sử Dụng

### **1. Restart Backend**
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

### **2. Login để lấy token**
```bash
POST http://localhost:8080/api/auth/login
{
  "emailOrCode": "doctor@familymed.vn",
  "password": "password"
}
```

### **3. Kiểm tra trong browser console**
```javascript
// Check token
localStorage.getItem('token')

// Check user info
JSON.parse(localStorage.getItem('user'))

// Clear và login lại nếu cần
localStorage.clear()
location.reload()
```

### **4. Xem logs để debug**
Khi truy cập endpoint, backend sẽ log:
```
Processing JWT token for: /api/patients/doctor/list
Token details - Username: doctor@familymed.vn, Role: DOCTOR, Type: access
✓ Authentication set for user: doctor@familymed.vn with authority: ROLE_DOCTOR
```

Nếu lỗi, sẽ thấy:
```
Invalid or expired JWT token for: /api/patients/doctor/list
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Token Expiration**: Token có thời hạn (mặc định 24h). Hết hạn phải login lại.

2. **Refresh Token**: Hệ thống có refresh token để gia hạn session mà không cần login lại.

3. **CORS**: CORS đã được cấu hình cho phép frontend (localhost:5173) truy cập backend.

4. **Case Sensitivity**: Role names phân biệt hoa/thường:
   - ✅ "DOCTOR", "ADMIN", "NURSE"  
   - ❌ "doctor", "Doctor", "admin"

5. **Rate Limiting**: Có rate limiting filter để chống brute force attacks.

6. **Default Role**: Nếu token không có role, mặc định là `ROLE_USER` (quyền hạn chế).

---

## 📝 Checklist Fix Lỗi 403

- [x] Fix double ROLE_ prefix bug
- [x] Thêm @PreAuthorize cho PatientController
- [x] Thêm @PreAuthorize cho FormController
- [x] Thêm @PreAuthorize cho SubmissionController
- [x] Kiểm tra tất cả controllers khác
- [x] Rebuild backend thành công
- [ ] Restart backend và test
- [ ] Verify frontend có thể truy cập các endpoints
- [ ] Test với các roles khác nhau (ADMIN, DOCTOR, NURSE)

---

**Tạo bởi:** GitHub Copilot  
**Ngày:** 21/02/2026  
**Phiên bản:** 1.0
