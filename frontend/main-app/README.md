# Frontend (main-app)

## What Is This For
- Next.js app for the AI HR Mentor UI.
- Lets users edit CV content, manage vacancies/stages, and view ranked matches.
- Talks to backend through the gateway URL configured in environment variables.

## Folder Structure
```text
main-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout, global wrappers
│   │   ├── page.tsx           # Home page
│   │   ├── my-cv/page.tsx     # CV page route
│   │   ├── vacancies/page.tsx # Vacancies page route
│   │   └── matching/page.tsx  # Ranking/matching route
│   ├── components/
│   │   ├── common/            # Reusable UI (Button, Modal, RichEditor, Preloader, icons)
│   │   ├── layout/            # App shell components (Header, Sidebar, Container)
│   │   └── features/          # Feature modules (my-cv, vacancies, ranking)
│   ├── services/              # API clients (cv/vacancy/ranking)
│   ├── stores/                # Zustand state stores
│   ├── types/                 # Shared frontend types
│   └── utils/                 # Small utilities
├── .env.example               # Frontend env template
├── package.json               # Scripts and dependencies
└── pnpm-lock.yaml             # Lockfile
```

## Environment
Create local env file from template:

```bash
cp .env.example .env
```

Main variable:

- `NEXT_PUBLIC_API_URL` (gateway base URL, e.g. `http://localhost:8001`)

## Run
```bash
cd frontend/main-app
pnpm install
pnpm dev
```

## Build
```bash
pnpm build
pnpm start
```
