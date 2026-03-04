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

## Production Deployment

For detailed deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Quick Deploy with Docker Compose

1. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. Build and start all services:
   ```bash
   docker-compose up -d --build
   ```

3. For production with external database:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. Services:
   - Frontend: `http://localhost`
   - Backend: `http://localhost:8080`
   - Database: `localhost:5432` (development only)

### Platform Deployments

- **Railway**: Auto-deploy from GitHub, set env vars
- **Vercel** (Frontend): Connect repo, configure build
- **AWS**: Use ECS or Elastic Beanstalk
- **Heroku**: Standard deployment with buildpacks

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step guides.

## Health Checks
- Backend liveness: `/actuator/health/liveness`
- Backend readiness: `/actuator/health/readiness`
- Frontend: `/healthz`

## Logging
- Console and rolling file logs in `backend/logs`
- Configure log level via `logback-spring.xml`
- Production: JSON logging with max 10MB per file

## Monitoring Readiness
- Actuator endpoints enabled: `health`, `info`, `metrics`
- Extend to Prometheus/Grafana by adding actuator `prometheus` if needed

## Environment Variables
See `.env.example` for all required configuration keys.

## 🔧 Recent Improvements

### Deployment Ready ✅
- Production configuration files added
- Docker Compose for both dev and prod
- GitHub Actions CI/CD pipeline
- Comprehensive deployment documentation

### Bug Fixes ✅
- Fixed Git merge conflicts in application.properties
- Resolved AnalyticsRepository JPA entity issue
- Cleaned up unused imports and code
- Backend now starts successfully

### Security ✅
- Environment-based configuration
- Secure cookie settings for production
- CORS properly configured
- JWT secrets externalized

## 📞 Support & Troubleshooting

### Quick Fixes

**Backend won't start?**
- Check database connection
- Verify environment variables
- Review logs: `docker-compose logs backend`

**Frontend can't connect?**
- Verify VITE_API_BASE_URL
- Check CORS settings
- Inspect browser console

**Docker issues?**
- Ensure Docker Desktop is running
- Check port conflicts (80, 8080, 5432)
- Try: `docker-compose down && docker-compose up -d`

For more help, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

**Status**: ✅ Production Ready | Last Updated: March 2026
