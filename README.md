# Family Medicine CDSS

He thong ho tro ra quyet dinh lam sang (Clinical Decision Support System) cho phong kham gia dinh.

## Quick Start

### Tai khoan mac dinh

#### Admin (Quan tri vien)

```text
Email: admin@familymed.vn
Password: Admin@123456
Quyen: Quan ly toan bo he thong
```

#### Doctor (Bac si)

```text
Email: doctor@familymed.vn
Password: Doctor@123456
Quyen: Quan ly benh nhan, xem bao cao
```

> Trang login `http://localhost:5173/login` co nut tu dong dien credentials.

## Khoi dong nhanh

### 1. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Backend chay tai `http://localhost:8080`.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend chay tai `http://localhost:5173`.

### 3. Truy cap he thong

- Homepage: `http://localhost:5173` (Public forms)
- Login: `http://localhost:5173/login`
- Admin: `http://localhost:5173/system/admin` (sau khi login Admin)
- Dashboard: `http://localhost:5173/system/dashboard` (sau khi login Doctor)

## Overview

Production-ready monorepo with Spring Boot backend and Vite/React frontend.

## Tinh nang chinh

### Admin Dashboard

- Quan ly Users (tao tai khoan Doctor/Nurse)
- Quan ly Forms (bieu mau chan doan dong)
- Quan ly Questions (ngan hang cau hoi)
- Publish Forms public (dua len homepage)

### Doctor Dashboard

- Quan ly benh nhan
- Xem Form Submissions
- Phan tich nguy co (Risk Analysis)
- Phan hoi ket qua qua Email/Zalo

### Public Homepage

- Danh sach bieu mau cong khai
- Dien form khong can dang nhap
- Nhan feedback tu bac si

## Tech Stack

- Backend: Spring Boot 3.2 + PostgreSQL + JWT
- Frontend: React 18 + Vite + Tailwind CSS
- Docker: Multi-stage builds voi health checks

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

For detailed deployment instructions, see [docs/deployment/HUONG_DAN_DEPLOY_24_7.md](./docs/deployment/HUONG_DAN_DEPLOY_24_7.md).

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

- Railway: Auto-deploy from GitHub, set env vars
- Vercel (Frontend): Connect repo, configure build
- AWS: Use ECS or Elastic Beanstalk
- Heroku: Standard deployment with buildpacks

See [docs/deployment/HUONG_DAN_DEPLOY_24_7.md](./docs/deployment/HUONG_DAN_DEPLOY_24_7.md) for step-by-step guides.

## Project Structure

### Core Application

- `backend/`: Spring Boot API, business logic, persistence, resources
- `frontend/`: React application, UI, client-side state and routing

### Internal Structure Highlights

- `frontend/src/shared/api/`: shared HTTP clients and service facades; legacy `src/service/` paths are compatibility shims
- `frontend/src/features/`: feature-based slices for incremental migration (non-breaking)
- `backend/src/main/resources/db/migration/`: versioned Flyway migrations
- `backend/src/main/resources/db/seed/`: reusable bootstrap and sample data SQL
- `backend/src/main/resources/db/manual/`: manual repair and maintenance SQL

### Documentation

- `docs/deployment/`: deployment and production operation guides
- `docs/forms/`: form builder, public publish workflow, advanced question type guides
- `docs/testing/`: publish workflow and manual test guides
- `docs/architecture/`: reference structure snapshots and architecture notes

### Support Files

- `scripts/testing/`: helper scripts for local test and verification workflows
- `logs/`: runtime logs and generated output files
- `backup_full.sql`: database backup kept at project root to avoid accidental data path changes
- `database/`: index and notes for database-related assets and conventions

### Compatibility Notes

- `docker-compose.yml` and `docker-compose.prod.yml` intentionally remain at project root
- `backend/src/main/resources/schema.sql` intentionally remains at resource root because current Spring SQL init behavior can depend on the default location

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

## Recent Improvements

### Deployment Ready

- Production configuration files added
- Docker Compose for both dev and prod
- GitHub Actions CI/CD pipeline
- Comprehensive deployment documentation

### Bug Fixes

- Fixed Git merge conflicts in application.properties
- Resolved AnalyticsRepository JPA entity issue
- Cleaned up unused imports and code
- Backend now starts successfully

### Security

- Environment-based configuration
- Secure cookie settings for production
- CORS properly configured
- JWT secrets externalized

## Support and Troubleshooting

### Quick Fixes

#### Backend won't start?

- Check database connection
- Verify environment variables
- Review logs: `docker-compose logs backend`

#### Frontend can't connect?

- Verify `VITE_API_BASE_URL`
- Check CORS settings
- Inspect browser console

#### Docker issues?

- Ensure Docker Desktop is running
- Check port conflicts (80, 8080, 5432)
- Try: `docker-compose down && docker-compose up -d`

For more help, see [docs/README.md](./docs/README.md).

## Status

Production ready. Last updated: March 2026.
