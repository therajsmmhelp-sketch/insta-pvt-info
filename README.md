# Instagram User Lookup Pro

A premium, production-ready Instagram user information finder. Search any public
Instagram username and instantly explore **every single field** the API returns —
followers, bio, media stats, business info, and anything else — rendered
automatically by a fully recursive JSON viewer. No field names are hardcoded in the
renderer, so if the upstream API adds 500 new fields tomorrow, they show up in the UI
with zero code changes.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide
Icons, React Hook Form + Zod, and Sonner — deployable to Vercel with no modification.

---

## ✨ Features

- **Secure API proxy** — the RapidAPI key is read only inside a server route
  (`app/api/user/route.ts`) and is never sent to the browser.
- **Fully recursive JSON renderer** — automatically displays every object, nested
  object, and array the API returns, with no hardcoded field list.
- **Overview / Profile / Media / Business / Raw JSON / Developer tabs.**
- **Beautiful glassmorphism UI** with animated gradient blobs, dark mode by default,
  and a light mode toggle.
- **Search box** with React Hook Form + Zod validation.
- **Recent searches** persisted to `localStorage`, with success/failure indicators.
- **Skeleton loading state** + toast notifications (Sonner).
- **Developer panel** — request URL, response time, HTTP status, headers, payload
  size, and formatted/raw JSON.
- **Expandable/collapsible JSON tree** with expand-all / collapse-all, in-tree search,
  per-field copy, copy-all-JSON, and download-as-JSON.
- **Clickable URLs**, **image previews with a zoom/rotate/download modal**, **boolean
  badges**, **formatted numbers**, and **automatic date detection & formatting**.
- **Responsive** on mobile, tablet and desktop.

---

## 🗂 Project Structure

```
/app
  /api/user/route.ts     Secure server route that proxies RapidAPI (key never exposed)
  layout.tsx              Root layout, fonts, metadata, Toaster
  page.tsx                Main page — search, state, results
  globals.css              Tailwind + custom glassmorphism/JSON styles
  loading.tsx / error.tsx / not-found.tsx
/components               All UI components (search box, tabs, JSON tree, etc.)
/lib                       api.ts (client fetch + overview field resolver), utils.ts, categorize.ts
/hooks                     useLocalStorage, useSearchHistory, useTheme
/types                     instagram.ts — recursive JSON types + overview field hints
/utils                     validation.ts — Zod schema for the search form
/public                    favicon.svg
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your RapidAPI credentials:

```bash
cp .env.example .env.local
```

```env
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=flashapi1.p.rapidapi.com
```

You can get a key by subscribing to the "flashapi1" Instagram Info API on
[RapidAPI](https://rapidapi.com/).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm run start
```

---

## ☁️ Deploying to Vercel

```bash
vercel --prod
```

Or connect the repository in the Vercel dashboard. Either way, before your first
deploy (or right after), add the environment variables in
**Project Settings → Environment Variables**:

| Name            | Value                          | Environments                    |
|-----------------|---------------------------------|----------------------------------|
| `RAPIDAPI_KEY`  | your RapidAPI key               | Production, Preview, Development |
| `RAPIDAPI_HOST` | `flashapi1.p.rapidapi.com`      | Production, Preview, Development |

No other configuration is required — `vercel.json` already declares the Next.js
framework and a 15s max duration for the API route.

---

## 🔒 How the API key stays secret

The frontend **only ever calls** `/api/user?username=...`, a same-origin Next.js
route. That route (`app/api/user/route.ts`) runs exclusively on the server
(`export const runtime = "nodejs"`), reads `process.env.RAPIDAPI_KEY` /
`process.env.RAPIDAPI_HOST`, and attaches them as headers on a server-to-server
`fetch()` call to `https://flashapi1.p.rapidapi.com/ig/info_username/`. The key is
never included in any client bundle, HTML, or network response — you can verify this
yourself by inspecting the Network tab: the browser only ever sees calls to
`/api/user`.

---

## 🧠 How the "no hardcoded fields" renderer works

`components/json-node.tsx` renders any `JsonValue` (string, number, boolean, null,
object, or array) recursively. Objects and arrays render their children by mapping
over `Object.entries()` / array indices — there's no fixed list of expected keys, so
brand-new fields the API might add in the future are automatically displayed with the
correct type-aware formatting (badges for booleans, links for URLs, image previews for
image URLs, locale-formatted numbers, and auto-detected dates).

The **Overview** tab additionally uses `lib/api.ts`'s `resolveOverviewFields()`, which
does a breadth-first search for a curated list of *known field name candidates* (e.g.
`follower_count`, `is_verified`, `external_url`) anywhere in the response — this is
purely a display convenience for a nicer summary card. It never limits or filters what
the recursive tree renders elsewhere; the full response is always fully visible in the
Raw JSON tab (and inline in the Overview tab, below the summary).

The **Profile / Media / Business** tabs use lightweight keyword heuristics
(`lib/categorize.ts`) to group top-level fields for easier browsing — any field that
doesn't match a heuristic still appears (grouped as "Other"), so nothing is ever
hidden.

---

## 🛠 Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, Server Components, Route Handlers)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [Sonner](https://sonner.emilkowal.ski/) (toasts)
- Vercel Serverless Functions (Route Handlers)

---

## ⚠️ Disclaimer

This tool is intended for looking up **publicly available** Instagram profile
information only. Respect Instagram's Terms of Service and applicable law. This
project is not affiliated with, endorsed by, or connected to Instagram or Meta.
