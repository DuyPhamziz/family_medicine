# 🟢 QUICK START: Deploy 24/7 Production

## Bước 1: Test Local (5 phút)

```bash
# Clone & navigate
cd family_medicine

# Start tất cả (DB + Backend + Frontend)
docker-compose up -d

# Wait 30 giây cho services startup
sleep 30

# Check status (tất cả phải HEALTHY)
docker-compose ps

# Test truy cập
# - Frontend: http://localhost:80
# - Backend API: http://localhost:8080/api/auth/login
# - Database: localhost:5432

# Xem logs nếu có lỗi
docker-compose logs backend
```

✅ **Nếu mọi thứ ok, chuyển sang bước 2**

---

## Bước 2: Deploy lên Railway (5 phút)

### 2.1 Tạo Railway account
- Vào https://railway.app
- Click **Login → GitHub** 
- Authorize

### 2.2 Tạo Project
- Click **+ New Project**
- Chọn **Deploy from GitHub repo**
- Chọn `family_medicine` repo
- Chọn branch: `main`
- Click **Deploy** → Wait ~3-5 phút

### 2.3 Add Database
- Ở Railway dashboard, click **+ New**
- Chọn **Add from template → PostgreSQL**
- Railway tự tạo database

### 2.4 Config Environment Variables

**Ở Backend service** (click vào service):
1. Click **Variables** tab
2. Thêm các biến:
```
DB_URL=<lấy từ PostgreSQL service - DATABASE_URL>
DB_USERNAME=postgres
DB_PASSWORD=<password từ PostgreSQL>
JWT_SECRET=your-super-secret-key-that-is-at-least-32-chars-long
JWT_EXPIRATION=14400000
JWT_REFRESH_EXPIRATION=604800000
CORS_ALLOWED_ORIGINS=https://<your-frontend-url>.railway.app
REFRESH_COOKIE_SECURE=true
```

**Ở Frontend service**:
1. Click **Variables** tab
2. Thêm:
```
VITE_API_BASE_URL=https://<your-backend-url>.railway.app
```

### 2.5 Wait for Deploy
- Status sẽ thành **green** khi ready
- Railway sẽ build & deploy tự động
- Takes ~3-5 phút

### 2.6 Get Your URLs
- Click vào Backend service → Copy **Public URL**
- Click vào Frontend service → Copy **Public URL**
- Sử dụng URLs này để access từ internet

---

## ✅ Hoàn thành!

Giờ web bạn sẽ:
- ✅ **Chạy 24/7** - không bị tắt
- ✅ **Auto-restart** - nếu bị lỗi sẽ tự khởi động
- ✅ **Auto-deploy** - mỗi lần push code sẽ tự cập nhật
- ✅ **Health monitoring** - Railway giám sát & alert

Web của bạn = **Production ready** 🎉

---

## 📊 Monitoring & Logs

**Xem logs real-time:**
```bash
# Local
docker-compose logs -f backend

# Railway
- Vào Backend service 
- Click **Logs** tab
- Xem live logs
```

**Check status:**
- Railway dashboard: xanh = ok, đỏ = error
- Nếu error, check logs để debug

---

## 💰 Cost

- **Railway free tier**: $5/tháng credit (đủ cho dev)
- **Pay-as-you-use** nếu scale up
- **PostgreSQL**: free tier có sẵn

---

## 🆘 Ối! Có lỗi?

### Backend bị crash?
```
1. Railway dashboard → Backend service → Logs
2. Xem error message cuối cùng
3. Fix code locally, test docker-compose
4. Push to GitHub
5. Railway auto-redeploy
```

### Frontend hiển thị "Cannot connect to API"?
```
1. Check VITE_API_BASE_URL variable
2. Đảm bảo match Backend URL chính xác
3. Xem frontend logs xem có error gì
```

### Database error?
```
1. Check DATABASE_URL variable
2. Đảm bảo DB_USERNAME/DB_PASSWORD match
3. Railway logs → PostgreSQL service
```

---

## 🎯 Done!

Website của bạn đang chạy **24/7 trên production** 🚀

### Next steps:
- [ ] Mua custom domain (tùy chọn)
- [ ] Setup monitoring alerts
- [ ] Backup database hàng tuần
- [ ] Monitor performance hàng ngày

Bất cứ lúc nào cần help, check [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) chi tiết hơn.
