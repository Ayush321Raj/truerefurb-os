# TrueRefurb OS — System Architecture Overview

TrueRefurb OS is an industrial-grade operating system engineered for enterprise consumer electronics refurbishment facilities, reverse logistics providers, and re-commerce marketplaces.

## Monorepo Architecture

```
truerefurb-os/
├── apps/
│   ├── web/                 # Next.js 14 App Router, Glassmorphism Dashboard
│   └── api/                 # NestJS 10 Modular REST Microservices + Swagger
│
├── packages/
│   ├── shared-types/        # Domain entities, grading enums, diagnostic checklists
│   ├── validation/          # Zod validation schemas and DTO contracts
│   └── config/              # Grading standards, constants, and global tokens
│
├── prisma/
│   ├── schema.prisma        # PostgreSQL Schema with relations & audit trails
│   └── migrations/          # Version-controlled migrations
│
├── docs/
│   ├── architecture/        # System diagrams and technical specifications
│   ├── domain/              # Refurbishment workflows & CTA-2053 grading matrix
│   └── api/                 # Endpoint documentation & integration specs
│
└── docker/                  # Docker Compose, PostgreSQL 16, Redis, Multi-stage builds
```

## Core Technology Stack

- **Frontend**: Next.js 14 (App Router), Vanilla CSS Design System with custom tokens, dark mode glassmorphism, responsive CSS Grid.
- **Backend API**: NestJS 10, TypeScript, Swagger/OpenAPI documentation, validation pipes.
- **Data Layer**: Prisma ORM 5 with PostgreSQL 16 (relational schema, cascades, and indexes).
- **Tooling & Orchestration**: Turborepo pipeline, npm workspaces, Docker Compose.
