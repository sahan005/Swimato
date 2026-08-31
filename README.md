# 🧾 OrderWars — Friend-Group Food-Order Tracker & Leaderboard

**OrderWars** is a full-stack web application designed for friend groups to track food delivery orders (Zomato, Swiggy, local takeaway, Blinkit/Instamart) and compete on a monthly canteen-style scoreboard.

Built with a bespoke **canteen tally board & thermal receipt** visual identity — featuring tactile order punches, literal SVG tally marks, perforated receipt edges, and real-time friend feeds.

---

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack, TypeScript)
- **Database ORM**: Prisma ORM
- **Database Engine**: SQLite locally (`dev.db`), 1-line swap to PostgreSQL in production (Neon / Supabase / Railway)
- **Authentication**: Auth.js (NextAuth v5) Credentials Provider with bcrypt password hashing
- **Styling**: Tailwind CSS with custom font tokens and thermal receipt motifs
- **Typography**:
  - `Barlow Condensed` (Google Font): Bold scoreboard numbers and headers
  - `Space Mono` (Google Font): Monospace printed receipt totals and line items
  - `Inter`: Clean humanist sans for user interactions
- **Charts & Visuals**: Recharts (Platform breakdown pie chart, monthly spend distribution) & canvas-confetti

---

## 🎨 Design Palette

- `#1B1B1B` **Ink** — Dark surface and printed text
- `#F5F2EC` **Paper** — Thermal receipt cards and punchcard surfaces
- `#C1432E` **Chili** — #1 Rank, hot streaks, tactile "+ Log an Order" punch button
- `#E3A008` **Turmeric** — #2 / #3 Ranks, awards, and Big Spender badges
- `#5B6B4F` **Betel** — Local deliveries and budget badges

---

## ⚡ Core Features

1. **Auth & Instant Demo Accounts**:
   - Secure sign-up and login with custom food avatar emoji picker.
   - 1-tap demo logins for instant testing (`kandy`, `rohan`, `priya`, `arjun`).
2. **< 10-Second Fast Order Logger**:
   - Giant 1-tap platform selectors: **Zomato** 🍕, **Swiggy** 🍔, **Local** 🥡, **Other** 📦.
   - Monospace numeric currency input (`₹`) auto-focused on launch.
   - Quick date switcher (Today, Yesterday, Custom).
   - Expandable note field.
   - Tactile buzzer/punch animation with optimistic UI updates.
3. **Centerpiece Thermal Receipt Leaderboard**:
   - Perforated torn paper edge and dotted thermal separators.
   - Giant scoreboard rank digits (`#1`, `#2`, `#3`) with medal badges.
   - Dynamic monthly titles: **"Foodie of the Month"** (👑 #1 count) & **"Big Spender"** (💸 #1 spend).
   - Literal SVG tally marks (5-stroke clusters with diagonal strike).
   - Per-person platform breakdown chips (`🍕 Zomato: 4 · 🍔 Swiggy: 2 · 🥡 Local: 1`).
   - Month dropdown archive & toggle between **Order Count** and **Amount Spent**.
4. **Personal History & Management**:
   - Quick stats: current rank, monthly spend, monthly count tally, and active daily streak record.
   - Full edit and delete controls for personal orders.
   - CSV export download.
5. **Canteen Dispatch Wire (Live Feed)**:
   - Live activity stream across all squad members with relative timestamps.
   - Interactive emoji reactions (`🔥`, `🤤`, `💸`, `🍕`, `💀`, `❤️`) with live counts.
6. **Hall of Fame & Analytics**:
   - Monthly trophies archive.
   - Interactive Recharts visualization for platform market share and squad member spend distribution.

---

## 🛠️ Getting Started Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="orderwars-super-secret-jwt-key-2025-leaderboard"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Push Database & Seed Demo Data
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Logins

| Username | Password | Avatar | Role |
| :--- | :--- | :--- | :--- |
| `kandy` | `password123` | 🍛 | Foodie of the Month (#1 Count) |
| `rohan` | `password123` | 🍕 | Big Spender (#1 Spend) |
| `priya` | `password123` | 🍔 | Cafe & Dessert Enthusiast |
| `arjun` | `password123` | 🥟 | Budget Master & Chai Addict |

---

## 🌐 Production Deployment (Vercel + PostgreSQL)

To deploy to Vercel with a managed Postgres instance (e.g. Neon, Supabase):

1. In `prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In your Vercel Project Settings / Environment Variables:
   - `DATABASE_URL`: `postgresql://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require`
   - `AUTH_SECRET`: Generate a random 32-character string (`openssl rand -base64 32`)
   - `NEXTAUTH_URL`: `https://your-app.vercel.app`
3. Set the build command in Vercel:
   ```bash
   npx prisma db push && next build
   ```
