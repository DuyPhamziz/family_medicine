# 📋 Deployment Checklist - Family Medicine

## ✅ Backend Configuration (Fixed Issues)

### 🔴 Issues Found & Fixed:

| Issue | Problem | Solution |
|-------|---------|----------|
| **Database URL Format** | `jdbc:${DATABASE_URL}` sai format | ✅ Changed to `jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}` |
| **CORS localhost** | Hardcoded `http://localhost:5173` | ✅ Use env var `CORS_ALLOWED_ORIGINS` |
| **Logging too verbose** | DEBUG level trên production | ✅ Created `application-prod.properties` with INFO level |
| **Swagger exposed** | Swagger UI enabled on prod | ✅ Disabled by default, enable via `SWAGGER_ENABLED` |
| **Actuator endpoints open** | All endpoints exposed | ✅ Limited to `health` only |
| **JWT default secret** | Weak default secret | ⚠️ MUST set `JWT_SECRET` in production |

---

## 🚀 Deployment Steps

### 1. **Prepare Environment Variables**

```bash
# Copy example and fill in values
cp .env.example .env

# Fill in production values in .env:
DB_HOST=your-postgres-server.com
DB_PORT=5432
DB_NAME=family_medicine_db
DB_USERNAME=your_user
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-key-at-least-32-chars
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
REFRESH_COOKIE_SECURE=true
JPA_DDL_AUTO=validate
SWAGGER_ENABLED=false
```

### 2. **Build Backend**

```bash
cd backend
mvn clean package -DskipTests -Dspring.profiles.active=prod
```

### 3. **Production Profile**

Backend uses `application-prod.properties` automatically when:
```bash
java -jar target/demo-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

Or set environment variable:
```bash
export SPRING_PROFILES_ACTIVE=prod
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

---

## 🔐 Security Checklist

- [ ] **JWT_SECRET** changed from default
- [ ] **DB_PASSWORD** not hardcoded
- [ ] **CORS_ALLOWED_ORIGINS** set to production domain
- [ ] **REFRESH_COOKIE_SECURE=true** on HTTPS
- [ ] **Swagger disabled** (`SWAGGER_ENABLED=false`)
- [ ] **Actuator limited** to `/actuator/health` only
- [ ] **Logging level** set to WARN/INFO
- [ ] **Database DDL** set to `validate` (no auto-schema creation)

---

## 🗄️ Database Setup

### For PostgreSQL on Production:

```sql
-- Create database
CREATE DATABASE family_medicine_db;

-- Create user
CREATE USER family_med_user WITH PASSWORD 'your_secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE family_medicine_db TO family_med_user;
GRANT ALL ON SCHEMA public TO family_med_user;
```

Then in `.env`:
```
DB_HOST=postgres-server
DB_USERNAME=family_med_user
DB_PASSWORD=your_secure_password
DB_NAME=family_medicine_db
JPA_DDL_AUTO=validate
```

---

## 🌐 Frontend Deployment

Change API endpoint in production:

**File: `frontend/src/service/api.js`**

```javascript
// Local dev
const API_URL = process.env.VITE_API_URL || 'http://localhost:8080';

// Production
// Update to your backend domain
// const API_URL = 'https://api.youromain.com';
```

Or use environment variable:
```bash
VITE_API_URL=https://api.your-domain.com npm run build
```

---

## 📊 Health Check Endpoints

After deployment, verify with:

```bash
# Health check
curl https://your-api-domain.com/actuator/health

# Expected response:
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL"
      }
    }
  }
}
```

---

## ⚠️ Common Issues & Solutions

### Issue: Database Connection Failed
```
org.postgresql.util.PSQLException: Connection to localhost:5432 refused
```
**Solution:**
- Check `DB_HOST`, `DB_PORT`, `DB_NAME` are correct
- Verify PostgreSQL is running
- Check firewall allows port 5432

### Issue: JWT Token Invalid
```
JwtException: JWT signature does not match locally computed signature
```
**Solution:**
- Ensure `JWT_SECRET` is same as when token was created
- Don't change JWT_SECRET after deployment (will invalidate all tokens)

### Issue: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Update `CORS_ALLOWED_ORIGINS` to match frontend domain
- Include protocol: `https://domain.com` not just `domain.com`

### Issue: Swagger Not Found
```
404 Not Found: /swagger-ui.html
```
**Solution:**
- This is expected on production (Swagger disabled)
- Access API via `https://api-docs.your-domain.com` if needed

---

## 📝 Environment Variables Reference

| Variable | Default | Production | Notes |
|----------|---------|------------|-------|
| `DB_HOST` | `localhost` | Required | PostgreSQL server |
| `DB_PORT` | `5432` | Port number | PostgreSQL port |
| `DB_NAME` | `family_medicine_db` | Database name | |
| `DB_USERNAME` | `postgres` | Required | DB user |
| `DB_PASSWORD` | `hp12345` | Required | DB password |
| `PORT` | `8080` | `8080` or configured | Server port |
| `JWT_SECRET` | Default (unsafe) | **Required** | ⚠️ MUST CHANGE |
| `JWT_EXPIRATION` | `43200000` | 12 hours | Token lifetime (ms) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | **Required** | Frontend domain |
| `REFRESH_COOKIE_SECURE` | `false` | `true` | Require HTTPS |
| `REFRESH_COOKIE_SAMESITE` | `Strict` | `Strict` | CSRF protection |
| `JPA_DDL_AUTO` | `update` | `validate` | Don't auto-create schema |
| `SWAGGER_ENABLED` | `true` | `false` | Disable API docs on prod |

---

## ✨ Post-Deployment Verification

```bash
# 1. Check logs
docker logs family-medicine-backend

# 2. Test endpoints
curl -X GET https://your-api-domain.com/api/auth/me

# 3. Check database
psql -h your-db-host -U your-user -d family_medicine_db \
  -c "SELECT * FROM users LIMIT 1;"

# 4. Monitor health
watch curl https://your-api-domain.com/actuator/health
```

---

## 📞 Troubleshooting

**Still having issues?** Check:
1. Application logs: `docker logs -f backend`
2. Database logs: `psql ... -c "SELECT * FROM pg_stat_statements;"`
3. Network: `curl http://localhost:8080/actuator/health`
4. Environment: `env | grep -E "DB_|JWT_|CORS"`

---

**Last Updated:** 2026-03-03  
**Version:** 1.0 - Fixed Database URL, CORS, Logging, and Swagger issues
