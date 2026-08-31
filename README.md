# Our Ears Are Open

A **listening-support platform** connecting people (18+) in need of emotional support with trained listeners via scheduled phone conversations and live text chat. Includes community rooms, crisis resources, donations, and multi-role administrative portals.

> **Status:** Frontend UI prototype built; backend (Supabase + Stripe + Twilio) in active development. Build progress tracked in [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md).

## Features

- **Booking** — Schedule 15-min phone or chat sessions with a listener (preferences: gender, religion, language, orientation)
- **Open Chat Queue** — Join a live queue (min $1 donation); next available listener is assigned in realtime
- **Realtime Sessions** — In-session text chat and listener-initiated voice calls
- **Donations & Payments** — One-off donations and session payments via Stripe
- **Community** — Support rooms (Wins & Milestones, Anxiety & Stress, Depression, Relationships, Grief & Loss, LGBTQ+ Safe Space, and more)
- **Crisis Resources** — 988 and emergency hotline links
- **Multi-role Portals** — Team member, Admin, and Super Admin dashboards

## User Roles

| Role | Purpose |
|------|---------|
| **Guest** | Browse public pages, donate, view crisis resources |
| **Customer** | Book/manage sessions, join queue, session history |
| **Listener** | Handle queue + scheduled sessions, availability, notes |
| **Admin** | Manage listeners, sessions, content, reports, refunds |
| **Super Admin** | Platform config, feature flags, billing, audit logs |

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Realtime, Storage) + Next.js API routes for Stripe/Twilio glue
- **Payments:** Stripe
- **Voice:** Twilio / LiveKit (listener-initiated)
- **Deployment:** Vercel + managed Supabase

## Getting Started

```bash
# install dependencies
pnpm install

# set up environment variables
cp .env.example .env.local

# run the dev server
pnpm dev
```

## Project Structure

```
app/          # Next.js pages + API routes (route groups for portals)
components/   # UI components, shadcn/ui primitives, dashboards
hooks/        # React hooks (use-auth, use-toast, ...)
lib/          # site config, nav config, Supabase clients, utils
docs/         # Scope of Work, UI checklist
supabase/     # Migrations, config
```

## Documentation

- [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md) — Module-by-module build tracker (our system design)
- [`docs/SCOPE_OF_WORK.md`](docs/SCOPE_OF_WORK.md) — Full original technical specification
