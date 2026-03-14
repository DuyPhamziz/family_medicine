# 🚀 HƯỚNG DẪN DEPLOY WEB 24/7 - KHÔNG BỊ LỖI LOCAL

> **Mục tiêu**: Deploy web Family Medicine chạy ổn định 24/7, môi trường production hoàn toàn độc lập với máy local

---

## 📋 MỤC LỤC

1. [So sánh các phương án](#so-sánh-các-phương-án)
2. [Phương án 1: VPS Việt Nam - KHUYÊN DÙNG](#phương-án-1-vps-việt-nam-rẻ-nhất)
3. [Phương án 2: Railway Hobby Plan - DỄ NHẤT](#phương-án-2-railway-hobby-plan-dễ-nhất)
4. [Phương án 3: DigitalOcean - CÂN BẰNG](#phương-án-3-digitalocean-cân-bằng)
5. [Cấu hình bắt buộc](#cấu-hình-bắt-buộc)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 SO SÁNH CÁC PHƯƠNG ÁN

### ⚠️ Điều kiện bắt buộc: CHẠY 24/7

| Phương án | Chi phí/tháng | Uptime | Tốc độ VN | Độ khó | Phù hợp |
|-----------|---------------|--------|-----------|--------|---------|
| **VPS Việt Nam (AZDIGI)** | **60,000đ** | 99.9% | ⭐⭐⭐⭐⭐ | Khó | **RẺ NHẤT + NHANH NHẤT** |
| Railway Hobby Plan | $5 (~125,000đ) | 99.9% | ⭐⭐⭐ | Dễ | **DỄ DÙNG NHẤT** |
| DigitalOcean Droplet | $4 (~100,000đ) | 99.99% | ⭐⭐⭐ | TB | **ỔN ĐỊNH NHẤT** |
| AWS Lightsail | $3.5 (~90,000đ) | 99.95% | ⭐⭐⭐⭐ | TB | **GLOBAL TỐT** |

### ❌ CÁC PHƯƠNG ÁN KHÔNG DÙNG (Không đủ 24/7)

| Phương án | Giới hạn | Tại sao không dùng |
|-----------|----------|--------------------|
| Railway Free | 500h/tháng | ❌ Chỉ ~16h/ngày, không đủ 24/7 |
| Render Free | Sleep after 15min | ❌ Cold start 30-60s, trải nghiệm tệ |
| Heroku Free | Đã ngừng | ❌ Không còn |

---

## 🏆 PHƯƠNG ÁN 1: VPS VIỆT NAM (RẺ NHẤT)

### 💰 Chi phí: **60,000đ/tháng**

### ✅ Ưu điểm

- 🥇 **RẺ NHẤT** - Chỉ 60k/tháng
- 🚀 **NHANH NHẤT** cho người dùng Việt Nam (server VN)
- ♾️ **KHÔNG GIỚI HẠN** - Chạy 24/7 không lo
- 🔒 **HOÀN TOÀN ĐỘC LẬP** - Không bị ảnh hưởng bởi máy local
- 🔧 **FULL CONTROL** - Cài đặt bất cứ thứ gì bạn muốn

### ❌ Nhược điểm

- 📚 Cần kiến thức Linux cơ bản
- ⏰ Setup ban đầu mất thời gian (~2-3 giờ)
- 🛡️ Phải tự quản lý bảo mật, backup

---

### 📦 NHÀ CUNG CẤP KHUYÊN DÙNG

#### 🏆 Top 1: AZDIGI (Khuyên dùng nhất)
- **Gói**: VPS SSD 1
- **Cấu hình**: 1GB RAM, 1 CPU, 20GB SSD
- **Giá**: 60,000đ/tháng
- **Link**: https://azdigi.com/dich-vu/vps-gia-re
- **Ưu điểm**: Rẻ, ổn định, hỗ trợ tốt

#### 🥈 Top 2: VinaHost
- **Gói**: Cloud VPS 1
- **Cấu hình**: 1GB RAM, 1 CPU, 25GB SSD
- **Giá**: 79,000đ/tháng
- **Link**: https://vinahost.vn

#### 🥉 Top 3: MatBao
- **Gói**: VPS Linux 1
- **Cấu hình**: 1GB RAM, 1 CPU, 20GB SSD  
- **Giá**: 89,000đ/tháng
- **Link**: https://matbao.net

---

### 🚀 HƯỚNG DẪN DEPLOY CHI TIẾT

#### ⏱️ THỜI GIAN: ~2-3 giờ (lần đầu), ~30 phút (lần sau)

---

### BƯỚC 1: MUA VPS VÀ SETUP CƠ BẢN (15 phút)

#### 1.1. Đăng ký và mua VPS

1. Vào https://azdigi.com → Đăng ký tài khoản
2. Chọn **VPS SSD 1** (60k/tháng)
3. Chọn hệ điều hành: **Ubuntu 22.04 LTS**
4. Thanh toán và đợi email kích hoạt

#### 1.2. Nhận thông tin VPS

Email từ AZDIGI sẽ chứa:
```
IP Address: 103.xxx.xxx.xxx
Username: root
Password: ************
```

#### 1.3. Kết nối SSH

**Trên Windows (dùng PowerShell hoặc CMD):**
```bash
ssh root@103.xxx.xxx.xxx
# Nhập password khi được hỏi
# Gõ yes khi hỏi về fingerprint
```

**Trên Mac/Linux:**
```bash
ssh root@103.xxx.xxx.xxx
```

✅ **Thành công**: Bạn thấy prompt `root@vps-xxx:~#`

---

### BƯỚC 2: CÀI ĐẶT MÔI TRƯỜNG (30 phút)

Copy và paste từng khối lệnh sau (nhấn Enter sau mỗi khối):

#### 2.1. Cập nhật hệ thống
```bash
apt update && apt upgrade -y
```

#### 2.2. Cài Java 17 (cho Backend)
```bash
apt install openjdk-17-jdk -y
java -version
```
✅ Phải thấy: `openjdk version "17.0.x"`

#### 2.3. Cài PostgreSQL 15 (Database)
```bash
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql
systemctl status postgresql
```
✅ Phải thấy: `active (running)`
Nhấn `q` để thoát

#### 2.4. Cài Node.js 18 (build Frontend)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node -v
npm -v
```
✅ Phải thấy version Node 18.x

#### 2.5. Cài Nginx (Web server)
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

✅ **Test**: Mở browser vào `http://103.xxx.xxx.xxx` → Thấy trang Nginx = OK

#### 2.6. Cài Git & Maven
```bash
apt install git maven -y
```

#### 2.7. Setup Firewall
```bash
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 8080/tcp # Backend (tạm thời)
ufw --force enable
```

---

### BƯỚC 3: TẠO DATABASE (10 phút)

```bash
# Vào PostgreSQL
sudo -u postgres psql
```

Trong PostgreSQL shell, chạy từng lệnh:

```sql
-- Tạo database
CREATE DATABASE family_medicine;

-- Tạo user (THAY MẬT KHẨU)
CREATE USER fmuser WITH ENCRYPTED PASSWORD 'MatKhauManh123!@#XYZ';

-- Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE family_medicine TO fmuser;

-- Kết nối vào DB
\c family_medicine

-- Cấp quyền schema (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO fmuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fmuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fmuser;

-- Thoát
\q
```

✅ **Test kết nối**:
```bash
psql -h localhost -U fmuser -d family_medicine
# Nhập password → Vào được = OK
\q
```

---

### BƯỚC 4: PUSH CODE LÊN GITHUB (10 phút)

**Trên máy local Windows (H:\family_medicine)**:

```powershell
# Tại thư mục dự án
cd H:\family_medicine

# Init git (nếu chưa có)
git init
git add .
git commit -m "Initial commit for deployment"

# Tạo repo trên GitHub: https://github.com/new
# Tên repo: family-medicine

# Push lên GitHub (THAY YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/family-medicine.git
git branch -M main
git push -u origin main
```

---

### BƯỚC 5: CLONE CODE VÀ BUILD (20 phút)

**Quay lại terminal SSH của VPS**:

```bash
# Tạo thư mục app
mkdir -p /opt/family-medicine
cd /opt/family-medicine

# Clone code (THAY YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/family-medicine.git
cd family-medicine

# Build Backend
cd backend
mvn clean package -DskipTests

# Kiểm tra file JAR đã build
ls -lh target/*.jar
```

✅ Phải thấy file `.jar` (~50MB)

---

### BƯỚC 6: TẠO FILE CẤU HÌNH (5 phút)

```bash
# Tạo JWT secret (copy kết quả)
openssl rand -base64 64

# Tạo file cấu hình
cat > /opt/family-medicine/backend.env << 'EOF'
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/family_medicine
SPRING_DATASOURCE_USERNAME=fmuser
SPRING_DATASOURCE_PASSWORD=MatKhauManh123!@#XYZ
JWT_SECRET=PASTE_KET_QUA_OPENSSL_RAND_O_DAY
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
ALLOWED_ORIGINS=http://103.xxx.xxx.xxx,https://yourdomain.com
SPRING_PROFILES_ACTIVE=prod
PORT=8080
EOF

# Sửa file (QUAN TRỌNG - Thay các giá trị)
nano /opt/family-medicine/backend.env
```

**Sửa các dòng sau**:
- `SPRING_DATASOURCE_PASSWORD`: Thay bằng password DB bạn đã tạo
- `JWT_SECRET`: Paste kết quả lệnh `openssl rand -base64 64`
- `ALLOWED_ORIGINS`: Thay `103.xxx.xxx.xxx` bằng IP VPS thật

Nhấn `Ctrl+X`, `Y`, `Enter` để lưu

---

### BƯỚC 7: TẠO SERVICE TỰ ĐỘNG CHẠY (10 phút)

```bash
# Tạo systemd service
cat > /etc/systemd/system/family-medicine.service << 'EOF'
[Unit]
Description=Family Medicine Backend
After=postgresql.service network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/family-medicine/family-medicine/backend
EnvironmentFile=/opt/family-medicine/backend.env
ExecStart=/usr/bin/java -Xmx512m -jar target/demo-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Kích hoạt service
systemctl daemon-reload
systemctl start family-medicine
systemctl enable family-medicine

# Kiểm tra
systemctl status family-medicine
```

✅ Phải thấy: `active (running)`

✅ **Test Backend**: Mở browser `http://103.xxx.xxx.xxx:8080/actuator/health`
→ Thấy `{"status":"UP"}` = Thành công! 🎉

---

### BƯỚC 8: BUILD VÀ DEPLOY FRONTEND (15 phút)

```bash
cd /opt/family-medicine/family-medicine/frontend

# Tạo file .env (THAY IP_VPS)
cat > .env << 'EOF'
VITE_API_BASE_URL=http://IP_VPS:8080
EOF

# Build
npm install
npm run build

# Copy sang Nginx
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

# Set quyền
chown -R www-data:www-data /var/www/html
```

---

### BƯỚC 9: CẤU HÌNH NGINX (15 phút)

```bash
# Tạo config Nginx
cat > /etc/nginx/sites-available/family-medicine << 'EOF'
server {
    listen 80;
    server_name IP_VPS;
    root /var/www/html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /actuator/health {
        proxy_pass http://localhost:8080/actuator/health;
    }
}
EOF

# Sửa IP_VPS
nano /etc/nginx/sites-available/family-medicine
# Thay IP_VPS bằng IP thật
# Ctrl+X, Y, Enter để lưu

# Enable site
rm /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/family-medicine /etc/nginx/sites-enabled/

# Test config
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

### BƯỚC 10: KIỂM TRA HỆ THỐNG (5 phút)

1. **Kiểm tra Backend**:
   ```bash
   systemctl status family-medicine
   curl http://localhost:8080/actuator/health
   ```

2. **Kiểm tra Frontend**:
   Mở browser: `http://103.xxx.xxx.xxx`
   - Phải thấy trang đăng nhập
   - Đăng nhập: `admin` / `admin123`

3. **Test tạo bệnh nhân**: Thử tạo 1 bệnh nhân mới

✅ **Nếu mọi thứ OK** → CHÚC MỪNG! Web đã chạy 24/7! 🎉

---

### BƯỚC 11: CÀI SSL MIỄN PHÍ (TÙY CHỌN - 10 phút)

**Nếu bạn có tên miền (domain)**:

```bash
# Cài Certbot
apt install certbot python3-certbot-nginx -y

# Tạo SSL (THAY yourdomain.com)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot sẽ hỏi email → Nhập email
# Chọn redirect HTTP → HTTPS → Yes

# Test auto-renew
certbot renew --dry-run
```

**Cập nhật CORS**:
```bash
nano /opt/family-medicine/backend.env
# Sửa ALLOWED_ORIGINS=https://yourdomain.com
systemctl restart family-medicine
```

---

### 🔄 CẬP NHẬT CODE SAU NÀY (5 phút)

Khi bạn sửa code và muốn deploy lại:

```bash
# SSH vào VPS
ssh root@103.xxx.xxx.xxx

# Pull code mới
cd /opt/family-medicine/family-medicine
git pull origin main

# Update Backend
cd backend
mvn clean package -DskipTests
systemctl restart family-medicine

# Update Frontend
cd ../frontend
npm install
npm run build
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

# Done!
```

---

## 🏃 PHƯƠNG ÁN 2: RAILWAY HOBBY PLAN (DỄ NHẤT)

### 💰 Chi phí: **$5/tháng (~125,000đ)**

### ✅ Ưu điểm
- 🎯 **DỄ NHẤT** - Setup < 20 phút
- ♾️ **KHÔNG GIỚI HẠN GIỜ** - Chạy 24/7
- 🚀 **TỰ ĐỘNG DEPLOY** - Push Git là deploy
- 🔒 **SSL MIỄN PHÍ**
- 📊 **MONITORING BUILT-IN**

### ❌ Nhược điểm
- 💰 Đắt hơn VPS (~125k vs 60k)
- 🌍 Server nước ngoài (chậm hơn VPS VN)

---

### 🚀 HƯỚNG DẪN DEPLOY (20 phút)

#### BƯỚC 1: Đăng ký Railway Hobby

1. Vào https://railway.app
2. Đăng nhập bằng GitHub
3. Click **Settings** → **Billing**
4. Chọn **Hobby Plan** ($5/tháng)
5. Thêm thẻ tín dụng

#### BƯỚC 2: Deploy Database

1. Dashboard → **New Project** → **Provision PostgreSQL**
2. DB được tạo tự động
3. Click vào PostgreSQL → Tab **Variables**
4. Copy `DATABASE_URL` (dạng `postgresql://...`)

#### BƯỚC 3: Deploy Backend

1. Trong Project → **New** → **GitHub Repo**
2. Chọn repo `family-medicine`
3. Railway tự detect Spring Boot
4. **Settings**:
   - Root Directory: `backend`
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/*.jar`

5. Tab **Variables** → Add:
   ```env
   SPRING_DATASOURCE_URL=<paste DATABASE_URL từ bước 2>
   JWT_SECRET=<openssl rand -base64 64>
   ALLOWED_ORIGINS=https://your-frontend.up.railway.app
   SPRING_PROFILES_ACTIVE=prod
   ```

6. **Settings** → **Networking** → **Generate Domain**
7. Copy URL Backend (VD: `https://backend-xxx.up.railway.app`)

✅ Test: `https://backend-xxx.up.railway.app/actuator/health`

#### BƯỚC 4: Deploy Frontend

1. Project → **New** → **GitHub Repo** (chọn lại repo)
2. **Settings**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: `npx serve dist -l $PORT`

3. Tab **Variables**:
   ```env
   VITE_API_BASE_URL=https://backend-xxx.up.railway.app
   ```

4. **Settings** → **Networking** → **Generate Domain**
5. Copy URL Frontend (VD: `https://frontend-xxx.up.railway.app`)

#### BƯỚC 5: Cập nhật CORS

1. Vào Backend service → **Variables**
2. Sửa `ALLOWED_ORIGINS`:
   ```
   https://frontend-xxx.up.railway.app
   ```
3. Backend tự động redeploy

#### BƯỚC 6: Test

Mở `https://frontend-xxx.up.railway.app`
- Đăng nhập: `admin` / `admin123`
- Thử tạo bệnh nhân

✅ **XONG!** Web chạy 24/7, không cần quản lý server! 🎉

---

## ⚖️ PHƯƠNG ÁN 3: DIGITALOCEAN (CÂN BẰNG)

### 💰 Chi phí: **$4/tháng (~100,000đ)**

### ✅ Ưu điểm
- 💪 **ỔN ĐỊNH NHẤT** - Uptime 99.99%
- 🌏 **DATACENTER SINGAPORE** - Gần VN, nhanh
- 📷 **SNAPSHOT MIỄN PHÍ** - Backup dễ dàng
- 📖 **TÀI LIỆU TỐT**

### Hướng dẫn tương tự VPS Việt Nam, chỉ khác cách đăng ký:

1. Đăng ký: https://www.digitalocean.com
2. Tạo Droplet: Ubuntu 22.04, Basic Plan $4/tháng, Singapore datacenter
3. Làm theo hướng dẫn VPS Việt Nam từ Bước 1

---

## 🛠️ CẤU HÌNH BẮT BUỘC

### 1. Tạo JWT Secret mạnh

```bash
# Linux/Mac/VPS
openssl rand -base64 64

# Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2. File application-prod.properties (đã có sẵn)

Đảm bảo file `backend/src/main/resources/application-prod.properties` có:

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
jwt.secret=${JWT_SECRET}
allowed.origins=${ALLOWED_ORIGINS}
```

---

## 🚨 TROUBLESHOOTING

### ❌ Backend không start

```bash
# Xem logs
journalctl -u family-medicine -n 100 --no-pager

# Thường lỗi database connection
# → Kiểm tra password trong backend.env
nano /opt/family-medicine/backend.env
```

### ❌ CORS Error

```bash
# Cập nhật ALLOWED_ORIGINS
nano /opt/family-medicine/backend.env
# Thêm domain frontend vào ALLOWED_ORIGINS
systemctl restart family-medicine
```

### ❌ Database connection refused

```bash
# Kiểm tra PostgreSQL chạy chưa
systemctl status postgresql

# Kiểm tra password user
sudo -u postgres psql
\du
ALTER USER fmuser WITH PASSWORD 'PasswordMoi';
\q
```

### ❌ Frontend blank/trắng

```bash
# Check Nginx logs
tail -n 50 /var/log/nginx/error.log

# Rebuild frontend
cd /opt/family-medicine/family-medicine/frontend
rm -rf dist node_modules
npm install
npm run build
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/
```

### ❌ VPS hết RAM

```bash
# Tạo SWAP (2GB)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Giảm RAM Java dùng
nano /etc/systemd/system/family-medicine.service
# Sửa ExecStart thành:
# ExecStart=/usr/bin/java -Xmx400m -jar target/demo-0.0.1-SNAPSHOT.jar
systemctl daemon-reload
systemctl restart family-medicine
```

---

## 📊 MONITORING VÀ BẢO TRÌ

### Kiểm tra hệ thống

```bash
# Status các service
systemctl status family-medicine
systemctl status postgresql
systemctl status nginx

# Xem logs realtime
journalctl -u family-medicine -f

# Check RAM/CPU
htop

# Check disk space
df -h
```

### Backup Database (Tự động)

```bash
# Tạo script backup
cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U fmuser -d family_medicine > $BACKUP_DIR/db_$DATE.sql
# Xóa backup cũ hơn 7 ngày
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/backup-db.sh

# Tạo cron job (mỗi ngày 2h sáng)
crontab -e
# Thêm dòng:
0 2 * * * /opt/backup-db.sh
```

---

## ✅ CHECKLIST SAU KHI DEPLOY

- [ ] Backend health check OK (`/actuator/health`)
- [ ] Frontend hiển thị trang đăng nhập
- [ ] Đăng nhập được bằng admin/admin123
- [ ] Tạo được bệnh nhân mới
- [ ] Tạo được form khám
- [ ] Database có dữ liệu mới
- [ ] Logs không có lỗi critical
- [ ] Đã đổi password admin mặc định
- [ ] Đã setup firewall (ufw)
- [ ] Đã tạo backup script
- [ ] Đã test reboot VPS (nếu dùng VPS)

---

## 💡 KHUYẾN NGHỊ

### 🎓 Cho người mới:
→ Dùng **Railway Hobby Plan** ($5/tháng)
- Không cần biết Linux
- Setup 20 phút
- Không lo quản lý server

### 💰 Cho người tiết kiệm:
→ Dùng **VPS AZDIGI** (60k/tháng)
- Rẻ nhất
- Nhanh nhất (VN)
- Cần học Linux cơ bản

### 🏢 Cho dự án thật có khách:
→ Dùng **DigitalOcean** ($4/tháng)
- Ổn định nhất
- Singapore datacenter
- Snapshot backup miễn phí

---

## 🎯 KẾT LUẬN

**Web đã chạy 24/7, hoàn toàn độc lập với máy local!**

- ✅ Backend chạy trên VPS/Railway
- ✅ Frontend chạy trên Nginx/Railway  
- ✅ Database PostgreSQL riêng
- ✅ Không bị lỗi local ảnh hưởng
- ✅ Có thể tắt máy local, web vẫn chạy

**Chúc bạn deploy thành công!** 🚀

Có vấn đề? Check lại [Troubleshooting](#troubleshooting) hoặc xem logs!
