# Vercel Single-Application Deployment Guide

This guide explains how to deploy **OpenWA** on [Vercel](https://vercel.com) as a **single application containing both the NestJS Backend API and the React Dashboard Frontend**.

---

## 🏗️ Single-Application Architecture

When deployed on Vercel:

1. **NestJS Backend REST API** (`/api/*`):
   - Handled via Vercel Serverless Function at `api/index.ts`.
   - Initializes the NestJS application serverlessly to handle API routes, authentication, API keys, audit logs, metrics, and webhooks.

2. **Dashboard Frontend SPA** (`/*`):
   - High-performance Vite React SPA served via Vercel's Edge Network / Global CDN.
   - Configured with single-page application routing rewrites in `vercel.json`.

---

## ⚙️ Environment Variables (Required in Vercel)

Set these environment variables in your Vercel Project Settings (**Settings** -> **Environment Variables**):

| Key              | Value Example                                                         | Description                                                                        |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `NODE_ENV`       | `production`                                                          | Enables production security guards and defaults                                    |
| `DATABASE_TYPE`  | `postgres`                                                            | Sets database engine to PostgreSQL                                                 |
| `DATABASE_URL`   | `postgres://user:pass@ep-xyz.postgres.database.azure.com:5432/openwa` | Connection string to your cloud PostgreSQL database (e.g. Supabase, Neon, AWS RDS) |
| `JWT_SECRET`     | `<random-secure-string>`                                              | Secret key used for signing dashboard session tokens                               |
| `API_MASTER_KEY` | `<random-32-char-key>`                                                | Initial master key used for administrative REST API calls                          |

> ⚠️ **Database Note**: Local SQLite files on Vercel's ephemeral `/tmp` filesystem will reset across serverless cold starts. You **must** configure an external PostgreSQL database via `DATABASE_URL`.

---

## 🚀 Deploying via Vercel CLI

Run the following commands in your terminal:

```bash
# 1. Login to Vercel
npx vercel login

# 2. Deploy preview build
npx vercel

# 3. Deploy to production
npx vercel --prod
```

During setup:

- **Directory**: Select root `./`
- **Framework**: Automatically detected via `vercel.json` (`Vite` + `api/index.ts` serverless handler)

---

## 🌐 Deploying via Vercel Web Dashboard (GitHub Integration)

1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to **[vercel.com/new](https://vercel.com/new)** and import your OpenWA repository.
3. Vercel automatically detects `vercel.json`:
   - **Build Command**: `npm run vercel-build` (compiles both NestJS API and Vite Dashboard)
   - **Output Directory**: `dashboard/dist`
   - **Serverless API Function**: `api/index.ts`
4. Add your required environment variables (`DATABASE_TYPE`, `DATABASE_URL`, `JWT_SECRET`).
5. Click **Deploy**.

---

## 💡 Serverless Capabilities & Considerations

- **Unified Single Domain**: Both your Dashboard UI (`https://your-app.vercel.app`) and API (`https://your-app.vercel.app/api/...`) run on the exact same domain name without needing CORS cross-origin configuration.
- **WhatsApp Web Engine Background Execution**: Vercel Serverless Functions have a 60-second maximum request execution limit. If your workflow requires 24/7 background WhatsApp Web engine persistence (headless Chrome Puppeteer or Baileys socket connections), host the gateway process on a persistent runtime (such as Docker, Railway, Render, Fly.io, or VPS).
