# Split Deployment Guide (Public + Admin + API)

This project is now split into three deployable units:

- Public frontend app: `client/`
- Admin frontend app: `admin/`
- Backend API: `server/`

## 1) Backend on Render

Use the existing Render web service and set these values:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node index.js`

Required environment variables:

- `NODE_ENV=production`
- `PORT=5000`
- `JWT_SECRET=<strong-random-secret>`
- `JWT_EXPIRE=7d`
- `ADMIN_JWT_SECRET=<strong-random-secret>`
- `ADMIN_JWT_EXPIRE=1d`
- `ADMIN_EMAIL=<admin-email>`
- `ADMIN_PASSWORD=<admin-password>`
- `SUPABASE_URL=<supabase-project-url>`
- `SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>`
- `SUPABASE_PRODUCTS_BUCKET=products`
- `SUPABASE_CONTENT_BUCKET=content`
- `OTP_PROVIDER=mock` (or `msg91` in production)
- `CLIENT_URL=<public-vercel-url>`
- `ADMIN_URL=<admin-vercel-url>`

Health check:

- `https://<render-domain>/api/health`

## 2) Public App on Vercel

Create a separate Vercel project for the public app.

Project settings:

- Root Directory: `client`
- Framework Preset: `Other` (or Vite)

Environment variables:

- `VITE_API_URL=https://<render-domain>`
- `VITE_SUPABASE_URL=<supabase-project-url>`
- `VITE_SUPABASE_ANON_KEY=<supabase-anon-key>`

The file `client/vercel.json` is already included for SPA rewrites.

## 3) Admin App on Vercel

Create another Vercel project for the admin app.

Project settings:

- Root Directory: `admin`
- Framework Preset: `Other` (or Vite)

Environment variables:

- `VITE_API_URL=https://<render-domain>`
- `VITE_PUBLIC_SITE_URL=https://<public-vercel-domain>`

The file `admin/vercel.json` is already included for SPA rewrites.

## 4) Post-deploy wiring

After both Vercel deployments finish:

1. Put public URL into Render `CLIENT_URL`.
2. Put admin URL into Render `ADMIN_URL`.
3. Redeploy Render once.

## 5) Local development

Install all:

```bash
npm run install:all
```

Run all apps (server + public + admin):

```bash
npm run dev
```

Ports:

- Public app: `http://localhost:5173`
- Admin app: `http://localhost:5174/admin/login`
- API: `http://localhost:5000`
