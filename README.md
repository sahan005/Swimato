# Swimato (OrderWars)

A full-stack web application for tracking food delivery transactions, aggregate expenditure, and comparative monthly metrics across peer groups. Built with Next.js App Router, TypeScript, Prisma ORM, and PostgreSQL.

---

## System Architecture

The application is architected around server-side rendering and edge middleware routing, backed by an ORM data layer interfacing with a managed PostgreSQL instance.

### Tech Stack
- **Application Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript 5
- **ORM**: Prisma ORM 6
- **Database Engine**: PostgreSQL (Supabase / Neon / AWS RDS) with PgBouncer connection pooling
- **Authentication**: Auth.js (NextAuth v5) using JWT session strategy with bcrypt credential hashing
- **Edge Layer**: Next.js Edge Middleware for route protection and lightweight token verification
- **Styling**: Tailwind CSS 4 with custom design tokens
- **Data Visualization**: Recharts (aggregation metrics, market share breakdown)

---

## Data Model & Indexing

The relational schema is defined via Prisma (`prisma/schema.prisma`):

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id           String     @id @default(cuid())
  username     String     @unique
  passwordHash String
  displayName  String
  avatarEmoji  String     @default("🍕")
  createdAt    DateTime   @default(now())
  orders       Order[]
  reactions    Reaction[]
}

model Order {
  id        String     @id @default(cuid())
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  platform  String     // "ZOMATO" | "SWIGGY" | "LOCAL" | "OTHER"
  amount    Float
  note      String?
  orderedAt DateTime   @default(now())
  createdAt DateTime   @default(now())
  reactions Reaction[]

  @@index([userId])
  @@index([orderedAt])
}

model Reaction {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emoji     String
  createdAt DateTime @default(now())

  @@unique([orderId, userId, emoji])
  @@index([orderId])
}
```

### Key Performance Indexes:
- `Order(userId)`: Optimizes user-specific ledger queries and streak calculations.
- `Order(orderedAt)`: Optimizes date-range aggregations for monthly leaderboards.
- `Reaction(orderId, userId, emoji)`: Enforces unique constraint per reaction and accelerates batch reaction lookups.

---

## Authentication & Security Architecture

1. **Split Edge Runtime Configuration**:
   - `src/lib/auth.config.ts`: Contains lightweight session verification rules executed within Vercel Edge Middleware (`src/middleware.ts`), strictly isolated from native Node.js binaries.
   - `src/lib/auth.ts`: Houses credential authorization, password verification (`bcryptjs`), and database lookups (`PrismaClient`) on serverless Node.js endpoints.
2. **Session Handling**: Stateless JSON Web Tokens (JWT) with HTTP-only, Secure cookie attributes.
3. **Database Security**: Configured for Row Level Security (RLS) on PostgreSQL, with connection pooling via port 6543 (transaction mode) and direct migrations on port 5432 (session mode).

---

## API Specification

| Endpoint | Method | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `/api/register` | `POST` | Public | Registers a new user account with hashed credentials. |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Public | Auth.js session handling, login, and token exchange. |
| `/api/orders` | `GET` | Required | Retrieves paginated orders filtered by month/year. |
| `/api/orders` | `POST` | Required | Creates a new order entry for the authenticated user. |
| `/api/orders/[id]` | `PUT` | Required | Updates an existing order owned by the user. |
| `/api/orders/[id]` | `DELETE` | Required | Deletes an order owned by the user. |
| `/api/orders/[id]/reactions` | `POST` | Required | Toggles an emoji reaction on a target order. |
| `/api/leaderboard` | `GET` | Required | Computes aggregate spend, order count, and rankings. |
| `/api/export` | `GET` | Required | Streams user order history as a formatted CSV file. |

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm / pnpm / yarn
- PostgreSQL instance (or local SQLite during initial testing)

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/sahan005/Swimato.git
   cd Swimato
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://user:password@host:5432/postgres"
   AUTH_SECRET="generate-via-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Push database schema:
   ```bash
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

---

## Production Deployment

### Vercel Deployment

1. Import the repository into Vercel.
2. Define the following Environment Variables in the project configuration:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL` (optional on Vercel preview/production deployments)
3. Build command:
   ```bash
   next build
   ```
