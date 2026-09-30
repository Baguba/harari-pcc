# MCIT Professional Competence Certificate Portal (Monorepo)

A production-ready, bilingual (Amharic/English) web portal for the **Ministry of Communication and Information Technology (MCIT)** of the Federal Democratic Republic of Ethiopia, designed specifically for the **Harari Region**.

The project is structured as an **npm workspaces Monorepo** featuring decoupled **Frontend** and **Backend** applications.

---

## Monorepo Architecture

```
mcit-portal/
├── package.json              # Root workspace orchestrator
├── backend/                  # REST API Server (@mcit/backend)
│   ├── src/
│   │   ├── server.ts         # Express.js application
│   │   ├── routes/           # REST endpoints (/api/auth, /api/applications, etc.)
│   │   ├── middleware/       # Auth & rate-limiting middleware
│   │   └── lib/              # Database (Prisma), password, audit utilities
│   ├── prisma/               # Prisma schema and PostgreSQL models
│   ├── uploads/              # Static file storage (documents, stamps, signatures)
│   └── scripts/seed.ts       # Database seeder
└── frontend/                 # Client Application (@mcit/frontend)
    ├── src/
    │   ├── app/              # Next.js 16 App Router pages and global CSS
    │   ├── components/       # Admin, Portal, and shadcn/ui components
    │   └── lib/              # State management (Zustand), i18n, portal types
    ├── public/               # Logos, hero images, static assets
    └── next.config.ts        # Next.js config with API & upload rewrites to backend
```

---

## Quick Start

### 1. Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL database (or Neon cloud database configured in `backend/.env`)

### 2. Install Dependencies
Run from the repository root to install and link all workspaces:
```bash
npm install
```

### 3. Generate Database Client & Seed
```bash
npm run db:generate
npm run seed
```

### 4. Run Development Servers
Start both the Express backend and Next.js frontend concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## Workspace Scripts

Run commands from the repository root:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs backend (:5000) and frontend (:3000) concurrently |
| `npm run dev:frontend` | Runs only the Next.js frontend |
| `npm run dev:backend` | Runs only the Express backend |
| `npm run build` | Builds both frontend and backend packages |
| `npm run build:frontend` | Builds production Next.js bundle |
| `npm run build:backend` | Compiles backend TypeScript to JavaScript |
| `npm run db:generate` | Generates Prisma client in backend workspace |
| `npm run db:push` | Pushes Prisma schema changes to database |
| `npm run db:migrate` | Runs database migrations |
| `npm run seed` | Seeds default admin and initial portal data |

---

## Tech Stack

### Frontend (`@mcit/frontend`)
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui + Lucide icons
- **State Management**: Zustand
- **Visualizations**: Recharts
- **Fonts**: Geist Sans + Noto Sans Ethiopic (for Amharic rendering)

### Backend (`@mcit/backend`)
- **Runtime & Server**: Node.js + Express.js + TypeScript
- **ORM & Database**: Prisma ORM with PostgreSQL (Neon)
- **Security**: PBKDF2 with salt password hashing, account lockout protection, in-memory IP rate limiting
- **Static Assets**: Direct serving for uploaded applicant documents and admin stamps/signatures

---

## Credentials

- **Super Admin**: `superadmin@mcit.gov.et` / `SuperAdmin1`
- **Harari Region Admin**: `admin@mcit.gov.et` / `AdminPass1`
