# 🚀 Deploy Family Medicine Web - 24/7 Production

Hướng dẫn deploy toàn bộ ứng dụng lên internet với **uptime 24/7** không bị tắt giữa chừng.

## 📋 Các công cụ cần thiết

- ✅ GitHub account (đã có repo)
- ✅ Railway account (miễn phí, $5/tháng credit)
- ✅ Docker (để test local trước deploy)

## ⚡ Cách 1: Test 24/7 Local (Dùng Docker Compose)

**Chạy toàn bộ production locally với docker-compose:**

```bash
# Clone repo nếu chưa có
git clone <your-repo> && cd family_medicine

# Build & start tất cả services (DB + Backend + Frontend)
docker-compose up -d

# Kiểm tra status
docker-compose ps

# View logs
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs
docker-compose logs -f db         # Database logs

# Access
# - Frontend: http://localhost:80
# - Backend: http://localhost:8080
# - Database: localhost:5432
```

**Auto-restart nếu bị lỗi:**
- Sửa trong `docker-compose.yml`: `restart: always` ✓ (đã thêm)
- Health checks sẽ tự restart containers nếu không response

**Stop everything:**
```bash
docker-compose down
docker volume rm family_medicine_postgres_data  # Reset DB
```

---

## 🌥️ Cách 2: Deploy lên Railway (Cloud - 24/7 Uptime)

### Step 1️⃣: Setup Railway dashboard

1. Vào https://railway.app
2. **Login bằng GitHub** (dễ nhất)
3. Authorize Railway access to GitHub

### Step 2️⃣: Create New Project

1. Click **+ New Project**
2. Chọn **Deploy from GitHub**
3. Chọn repository `family_medicine`
4. Click **Deploy**

Railway sẽ tự:
- ✅ Detect Dockerfile
- ✅ Build backend từ `./backend/Dockerfile`
- ✅ Build frontend từ `./frontend/Dockerfile` (nếu detect được)
- ✅ Auto-deploy khi push to `main` branch

### Step 3️⃣: Add PostgreSQL Database

1. Click **+ New** → **Add from template**
2. Chọn **PostgreSQL**
3. Railway tự tạo DB instance

Nó sẽ auto-generate:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Step 4️⃣: Config Environment Variables

Ở **Backend service** settings, thêm variables:

```
DB_URL=<DATABASE_URL từ PostgreSQL>
DB_USERNAME=postgres
DB_PASSWORD=<from PostgreSQL>
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRATION=14400000
JWT_REFRESH_EXPIRATION=604800000
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.railway.app
REFRESH_COOKIE_SECURE=true
```

### Step 5️⃣: Config Frontend

Ở **Frontend service** settings, thêm:

```
VITE_API_BASE_URL=https://your-backend-domain.railway.app
```

Railway sẽ tự cấp subdomain formats:
- Backend: `https://family-med-backend.railway.app`
- Frontend: `https://family-med-frontend.railway.app`

### Step 6️⃣: Auto-restart & Health Checks ✓

Mình đã setup trong Dockerfile:
- `HEALTHCHECK` mỗi 30 giây
- `restart: always` trong docker-compose
- Railway sẽ auto-restart nếu pod bị down

---

## 🎯 Kết quả cuối cùng

Sau khi complete:

```
Frontend:  https://family-med-frontend.railway.app
Backend:   https://family-med-backend.railway.app
Database:  PostgreSQL (on Railway)

✅ 24/7 uptime
✅ Auto-restart nếu crash
✅ Auto-deploy mỗi khi push code
✅ Health monitoring
```

---

## 📊 Monitoring & Logs

**Xem logs trên Railway:**
1. Click vào Backend service
2. Click **Logs** tab
3. Thấy live logs

**Health check status:**
- Railway dashboard hiển thị service status
- Green = healthy, Red = crashed

---

## 💰 Chi phí

- **Free tier Railway**: $5/tháng credit
  - Đủ cho DB nhỏ + backend + frontend (dev tier)
  
- **Upgrade nếu cần**: 
  - $0.50/GB RAM/month
  - Pay-as-you-use

---

## 🔧 Troubleshooting

### Backend bị crash liên tục?
```bash
# Xem logs chi tiết
docker-compose logs backend --tail 100

# Kiểm tra health endpoint
curl http://localhost:8080/actuator/health/liveness
```

### Frontend 404 Not Found?
```bash
# Đảm bảo VITE_API_BASE_URL đúng
echo $VITE_API_BASE_URL

# Frontend phải build với arg này
docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 ./frontend
```

### Database tidak bảo tồn data sau restart?
```bash
# Check volumes
docker volume ls | grep postgres

# Đảm bảo trong docker-compose:
# volumes:
#   - postgres_data:/var/lib/postgresql/data
```

---

## 🚨 Important!

**⚠️ Trước deploy lên production:**

1. ✅ Push code lên GitHub
2. ✅ Test local với `docker-compose up`
3. ✅ Kiểm tra `docker-compose ps` - tất cả phải `healthy`
4. ✅ Test login/submit form
5. ✅ Mới deploy lên Railway

**⚠️ 24/7 Availability Checklist:**

- [ ] `restart: always` trong docker-compose ✓
- [ ] `HEALTHCHECK` setup ✓
- [ ] Database backups định kỳ (Railway auto-backup)
- [ ] Monitor logs hàng ngày
- [ ] Update dependencies hàng tháng

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose logs <service-name>`
2. Restart service: `docker-compose restart <service-name>`
3. Rebuild: `docker-compose build --no-cache && docker-compose up -d`
