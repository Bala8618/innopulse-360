# InnoPulse 360 - From Vision to Victory

Production-ready monorepo for an innovation event operations platform.

## Stack

- Frontend: React, Vite, Tailwind, React Router, Chart.js
- Backend: Node.js, Express, MongoDB (Mongoose), JWT (http-only cookie), bcrypt, Nodemailer
- Repo layout: npm workspaces
- SaaS module: React + Recharts + React Flow + Node/Express + MySQL

## Active Roles

The app is now restricted to:

1. `admin`
2. `participant`
3. `mentor`
4. `management`

## Project Structure

```txt
InnoPulse 360/
  package.json
  packages/
    backend/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
      validators/
      app.js
      server.js
    frontend/
      src/
        components/
        hooks/
        layouts/
        pages/
        routes/
        services/
        styles/
      index.html
```

## Local Run

From repo root:

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/api/health`

## SaaS Module (MySQL)

New SaaS admin UI route:

- `http://localhost:5173/saas`

Menu:

1. Dashboard
2. Event Creation
3. Event Management
4. Event Flow Diagram
5. Participant Approval

### MySQL setup

1. Create DB/tables:
   - Run `packages/backend/scripts/mysql_schema.sql`
2. Insert sample rows:
   - Run `packages/backend/scripts/mysql_sample_data.sql`
3. Add backend env values in `packages/backend/.env`:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=innopulse_saas
```

### SaaS APIs

- `POST /api/events`
- `GET /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/events/:id/flow`
- `POST /api/participants`
- `GET /api/participants`
- `PUT /api/participants/:id/approve`
- `PUT /api/participants/:id/reject`
- `GET /api/dashboard/stats`

## Core Workflow (Hardened)

Participant process is enforced in backend:

1. Register for event (pending)
2. Admin approves registration
3. Participant submits mentor approval request
4. Mentor approves request
5. Participant can apply Travel/Accommodation/Food
6. Management approves/rejects logistics
7. Post-event report and activity/reward requests proceed by status rules

## Environment Variables

### Backend (`packages/backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
COOKIE_NAME=innopulse_token
CLIENT_URL=http://localhost:5173
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

### Frontend (`packages/frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## Deploy (Vercel + Render)

## 1. Push to GitHub

```bash
git add .
git commit -m "InnoPulse 360 release"
git push
```

## 2. Deploy backend on Render

1. Push this repo to GitHub
2. Create a new Render Blueprint or Web Service from your repo
3. If using the included `render.yaml`, Render will detect:
   - Root directory: `packages/backend`
   - Build command: `npm install`
   - Start command: `npm run start`
4. Add the required backend env vars in Render
5. Set `CLIENT_URL` to your Vercel frontend URL
6. Deploy and copy URL (example: `https://innopulse360-api.onrender.com`)

## 3. Deploy frontend on Vercel

1. Import the same repo into Vercel
2. Set Root Directory to `packages/frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. The included `packages/frontend/vercel.json` keeps React Router routes working in production
6. Add env var:
   - `VITE_API_URL=https://<your-render-url>/api`
7. Deploy and copy URL (example: `https://innopulse360.vercel.app`)

## 4. Final Public Link

Your production app link is the Vercel URL:

- `https://<your-vercel-project>.vercel.app`

## What Was Updated in This Phase

1. Role scope reduced to admin/participant/mentor/management only
2. UI shell polished for cleaner commercial look (public + dashboard + module cards/tables)
3. Workflow gate added:
   - Travel/Accommodation/Food now require mentor approval after admin registration approval
4. Mentor approval request is upserted for cleaner request lifecycle
