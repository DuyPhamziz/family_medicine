# Family Medicine EMR

## Overview
Production-ready monorepo with Spring Boot backend and Vite/React frontend.

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
