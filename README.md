# Vigilance

Vigilance is Kenya's smartest workforce platform, connecting clients with verified local professionals for daily, weekly, or monthly jobs.

## 🚀 Key Features

- **Three Dedicated Portals**: Separate applications for `client`, `worker`, and `admin` to ensure isolated, clear feature sets and specialized dashboards for each role.
- **Live GPS Tracking**: Workers can toggle an "On Duty" status to automatically broadcast their live GPS location to the Supabase backend. Clients can see their assigned worker's location updating in real time on an embedded OpenStreetMap.
- **Real-Time Job Broadcasting**: New jobs requested by clients are instantly broadcasted via Supabase websockets to all available online workers.
- **Modern, Mobile-First UI**: A fully custom design system using the modern `Inter` font, responsive flex/grid layouts that degrade perfectly into scrollable stacks on mobile, and interactive bottom navigation bars built exactly like native mobile apps.
- **Dark & Light Mode**: Complete theme syncing across the platform, including forms, badges, modals, and toasts.

## 📁 Project Structure

```bash
vigilance/
├── client/          # Vite + React app for Clients (booking jobs, viewing workers)
├── worker/          # Vite + React app for Workers (accepting jobs, radar tracking)
├── admin/           # Vite + React app for Admins (managing platform, RLS policies)
└── README.md
```

## 🛠️ Tech Stack
- **Frontend**: React (Vite), React Router DOM
- **Backend & Auth**: Supabase (Postgres, Real-Time Subscriptions, Storage, Auth)
- **Maps**: OpenStreetMap embedded via iframe
- **Styling**: Vanilla CSS with a tailored CSS Variables Design System

## 💻 Getting Started

1. **Install Dependencies**
Run `npm install` inside each of the respective application folders (`/client`, `/worker`, `/admin`).

2. **Supabase Environment**
Make sure your `.env` files in each app directory contain:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **Start Development Servers**
Run `npm run dev` in each directory:
- Worker portal usually targets `http://localhost:5173`
- Client portal usually targets `http://localhost:5174`
- Admin portal usually targets `http://localhost:5175`

## 📦 Database Requirements (Supabase)
To ensure everything runs smoothly, your `profiles` table must include these columns:
- `id` (uuid references auth.users)
- `role` (text)
- `full_name` (text)
- `avatar_url` (text)
- `latitude` (float8) — For GPS
- `longitude` (float8) — For GPS
- `last_seen_at` (timestamptz) — For GPS timeout indicators

Note: Run `gps_migration.sql` to add the required tracking columns to an existing setup.
