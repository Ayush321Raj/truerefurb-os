# TrueRefurb OS

Enterprise Refurbished Electronics Operations & Device Lifecycle Management Platform.

## Architecture

- **`apps/web`**: Next.js 14 Web Application (App Router, dark-mode glassmorphic interface, interactive pipeline kanban, grading calculator, and multi-channel valuation engine).
- **`apps/api`**: NestJS 10 REST API with OpenAPI/Swagger, validation pipes, and modular controllers.
- **`packages/shared-types`**: TypeScript domain models, grading matrices, diagnostic checklists, and analytics interfaces.
- **`packages/validation`**: Zod validation schemas for device intake and diagnostic audits.
- **`packages/config`**: Grading tiers, CTA-2053 constants, and system configurations.
- **`prisma/`**: Complete PostgreSQL schema with Prisma ORM migrations.
- **`docs/`**: Architecture diagrams, grading standards, API specifications.
- **`docker/`**: Multi-container Docker Compose with PostgreSQL 16, Redis, and multi-stage Dockerfiles.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Next.js Web App
```bash
npm run dev --workspace=@truerefurb/web
# Opens on http://localhost:3000
```

### 3. Run NestJS API
```bash
npm run dev --workspace=@truerefurb/api
# API on http://localhost:4000/api/v1
# Swagger docs on http://localhost:4000/api/docs
```

### 4. Database Setup
```bash
npm run db:push
```

### 5. Docker Full Stack
```bash
npm run docker:up
```
