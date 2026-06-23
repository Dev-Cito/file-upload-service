# FileVault

A full-stack file upload and management platform. Upload images and documents, manage your library, and share files instantly with public URLs.

**Live →** https://file-upload-service-chi.vercel.app/

---

## Features

- **Image pipeline** — auto-resize to 1920×1080, WebP conversion, thumbnail generation
- **Document support** — PDF, DOC, DOCX stored as-is
- **Parallel uploads** — independent queue with real progress per file, inline retry
- **JWT authentication** — secure HttpOnly cookie, register & login flows
- **Role-based access** — admin-only file deletion
- **Glassmorphism UI** — animated login panel, navy dark theme, liquid glass cards

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | [NestJS](https://nestjs.com) |
| Language | TypeScript |
| Database | PostgreSQL via [Supabase](https://supabase.com) |
| ORM | TypeORM |
| Storage | Supabase Storage / MinIO |
| Auth | JWT + Passport.js + bcrypt |
| Image Processing | Sharp |
| API Docs | Swagger / OpenAPI |

### Frontend
| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| HTTP | Axios |
| Components | shadcn/ui |
| Fonts | Geist · Caveat (Google Fonts) |
| Drag & Drop | react-dropzone |

### Infrastructure
| | |
|---|---|
| Monorepo | pnpm workspaces |
| Object Storage | MinIO (local) · Supabase (production) |
| Database | PostgreSQL 16 |
| Containerization | Docker Compose |

---

## Project Structure

```
file-upload-service/
├── backend/          # NestJS API (port 3003)
│   └── src/
│       ├── auth/     # JWT auth, guards, strategies
│       ├── files/    # Upload, processing, storage
│       ├── users/    # User entity & service
│       └── minio/    # Storage abstraction layer
├── frontend/         # Next.js app (port 3000)
│   └── src/
│       ├── app/      # Pages (login, dashboard, upload)
│       ├── components/
│       ├── lib/      # Axios instance, icons, utils
│       └── store/    # Zustand auth store
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Docker

### 1. Clone & install
```bash
git clone https://github.com/your-username/file-upload-service.git
cd file-upload-service
pnpm install
```

### 2. Start services
```bash
docker compose up -d   # PostgreSQL + MinIO
```

### 3. Configure environment
```bash
cp backend/.env.example backend/.env
# Fill in DB credentials, JWT secret, storage keys
```

### 4. Run
```bash
pnpm dev:backend    # http://localhost:3003
pnpm dev:frontend   # http://localhost:3000
```

API docs available at `http://localhost:3003/api/docs`

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, receive JWT cookie |
| GET | `/auth/me` | Get current user |
| POST | `/files/upload/image` | Upload & process image |
| POST | `/files/upload/document` | Upload document |
| GET | `/files` | List all files |
| GET | `/files/stats` | Upload statistics |
| DELETE | `/files/:id` | Delete file *(admin only)* |

---

## License

MIT
