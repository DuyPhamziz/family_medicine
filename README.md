# 🏥 Family Medicine CDSS

Hệ thống hỗ trợ ra quyết định lâm sàng (Clinical Decision Support System) cho phòng khám gia đình.

---

## 🚀 Quick Start - Đăng nhập ngay

### 🔐 Tài khoản mặc định

**👨‍💼 Admin (Quản trị viên)**
```
Email: admin@familymed.vn
Password: Admin@123456
Quyền: Quản lý toàn bộ hệ thống
```

**👨‍⚕️ Doctor (Bác sĩ)**  
```
Email: doctor@familymed.vn
Password: Doctor@123456
Quyền: Quản lý bệnh nhân, xem báo cáo
```

> 💡 **Tip**: Trang login (`http://localhost:5173/login`) có nút "Click để điền tự động" credentials!

> 📖 **Chi tiết đầy đủ**: Xem file [CREDENTIALS.md](./CREDENTIALS.md) để biết thêm về đăng ký, reset password, tạo user mới.

---

## 🏃‍♂️ Khởi động nhanh

### 1️⃣ Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
✅ Backend chạy tại: `http://localhost:8080`

### 2️⃣ Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend chạy tại: `http://localhost:5173`

### 3️⃣ Truy cập hệ thống
- **Homepage**: `http://localhost:5173` (Public forms)
- **Login**: `http://localhost:5173/login`
- **Admin**: `http://localhost:5173/system/admin` (sau khi login Admin)
- **Dashboard**: `http://localhost:5173/system/dashboard` (sau khi login Doctor)

---

## Overview
Production-ready monorepo with Spring Boot backend and Vite/React frontend.

---

## 📋 Tính năng chính

### Admin Dashboard
- ✅ Quản lý Users (tạo tài khoản Doctor/Nurse)
- ✅ Quản lý Forms (biểu mẫu chẩn đoán động)
- ✅ Quản lý Questions (ngân hàng câu hỏi)
- ✅ Publish Forms public (đưa lên homepage)

### Doctor Dashboard
- ✅ Quản lý bệnh nhân
- ✅ Xem Form Submissions
- ✅ Phân tích nguy cơ (Risk Analysis)
- ✅ Phản hồi kết quả qua Email/Zalo

### Public Homepage
- ✅ Danh sách biểu mẫu công khai
- ✅ Điền form không cần đăng nhập
- ✅ Nhận feedback từ bác sĩ

---

## 📂 Tech Stack

**Backend**: Spring Boot 3.2 + PostgreSQL + JWT  
**Frontend**: React 18 + Vite + Tailwind CSS  
**Docker**: Multi-stage builds với health checks

---

## Local Development

### Backend
1. Create a Postgres DB or use Docker:
   - `docker compose up -d db`
2. Set environment variables (see `.env.example`).
3. Run backend:
   - `cd backend`
   - `./mvnw spring-boot:run`
4. Health check:
   - `http://localhost:8081/actuator/health`

### Frontend
1. Set `VITE_API_BASE_URL` (see `.env.example`).
2. Run frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
3. Open:
   - `http://localhost:5173`

## Production Deployment (Docker)

1. Copy `.env.example` to `.env` and set secrets:
   - `JWT_SECRET`
   - DB credentials
2. Build and start:
   - `docker compose up -d --build`
3. Services:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:8081`
   - DB: `localhost:5432`

## Health Checks
- Backend liveness: `/actuator/health/liveness`
- Backend readiness: `/actuator/health/readiness`
- Frontend: `/healthz`

## Logging
- Console and rolling file logs in `backend/logs`
- Configure log level via `logback-spring.xml`

## Monitoring Readiness
- Actuator endpoints enabled: `health`, `info`, `metrics`
- Extend to Prometheus/Grafana by adding actuator `prometheus` if needed

## Environment Variables
See `.env.example` for required keys.
