# Hướng dẫn tích hợp API Authentication với Spring Boot Backend

## Tổng quan

Frontend đã được cấu hình sẵn để tích hợp với Spring Boot backend. Dưới đây là các endpoint và format dữ liệu mà backend cần cung cấp.

## Base URL

Cấu hình trong file `.env`:
```
VITE_API_BASE_URL=http://localhost:8081
```

## API Endpoints

### 1. Login - POST `/api/auth/login`

**Request Body:**
```json
{
  "emailOrCode": "doctor@familymed.vn",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here", // Optional
  "user": {
    "id": 1,
    "email": "doctor@familymed.vn",
    "fullName": "BS. Nguyễn Văn An",
    "name": "Nguyễn Văn An",
    "role": "DOCTOR",
    "employeeCode": "NV001",
    "department": "Khoa Nội",
    "specialization": "Bác sĩ chuyên khoa"
  }
}
```

**Response Error (401):**
```json
{
  "message": "Email hoặc mật khẩu không đúng",
  "error": "Unauthorized"
}
```

### 2. Logout - POST `/api/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "message": "Đăng xuất thành công"
}
```

**Note:** Endpoint này là optional. Nếu không có, frontend vẫn sẽ clear localStorage.

### 3. Refresh Token - POST `/api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response Success (200):**
```json
{
  "token": "new_jwt_token_here"
}
```

### 4. Get Current User - GET `/api/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "id": 1,
  "email": "doctor@familymed.vn",
  "fullName": "BS. Nguyễn Văn An",
  "name": "Nguyễn Văn An",
  "role": "DOCTOR",
  "employeeCode": "NV001",
  "department": "Khoa Nội",
  "specialization": "Bác sĩ chuyên khoa"
}
```

## Roles được hỗ trợ

Frontend hỗ trợ các roles sau (định nghĩa trong `src/constants/roles.js`):

- `ADMIN` - Quản trị viên
- `DOCTOR` - Bác sĩ
- `NURSE` - Y tá
- `DATA_ENTRY` - Nhập liệu
- `PHARMACIST` - Dược sĩ
- `RECEPTIONIST` - Lễ tân

## Permissions

Mỗi role có các permissions tương ứng. Xem chi tiết trong file `src/constants/roles.js`.

## Error Handling

### 401 Unauthorized
- Token hết hạn hoặc không hợp lệ
- Frontend sẽ tự động clear localStorage và redirect về `/login`

### 403 Forbidden
- User không có quyền truy cập resource
- Frontend sẽ log error và có thể redirect

## JWT Token Format

Frontend expect JWT token trong format:
```
Authorization: Bearer {token}
```

Token được lưu trong `localStorage` với key `token`.

## Cấu trúc User Object

User object từ backend nên có các field sau:

```typescript
{
  id: number;
  email: string;
  fullName?: string;      // Tên đầy đủ (ưu tiên)
  name?: string;          // Tên ngắn gọn
  role: string;           // Một trong các ROLES
  employeeCode?: string;  // Mã nhân viên
  department?: string;    // Khoa/phòng ban
  specialization?: string; // Chuyên khoa
}
```

## Ví dụ Spring Boot Controller

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Validate credentials
        // Generate JWT token
        // Return token + user info
        
        return ResponseEntity.ok(LoginResponse.builder()
            .token(jwtToken)
            .user(userDTO)
            .build());
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // Invalidate token if needed
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        // Return current user info
        return ResponseEntity.ok(userDTO);
    }
}
```

## Testing

Để test mà không cần backend, bạn có thể mock API response trong `authService.js` hoặc sử dụng tools như MSW (Mock Service Worker).

## Lưu ý

1. **CORS**: Đảm bảo Spring Boot backend cho phép CORS từ frontend origin
2. **Security**: Token nên có expiration time hợp lý
3. **Refresh Token**: Nên implement refresh token mechanism để tránh user phải login lại thường xuyên
4. **Error Messages**: Backend nên trả về error messages bằng tiếng Việt để hiển thị cho user
