# MindMitra — Deployment Guide & File Architecture

MindMitra is a modern, lightweight, **zero-dependency static web application** built strictly with **HTML5, CSS3, and JavaScript**. It requires **no MERN stack, no Node.js runtime, no Python backend, and no external database server**.

All user accounts, daily check-in histories, CBT notes, and peer mentor tickets are persisted entirely in the browser's `localStorage`.

---

## 📁 File Structure & Organization

The codebase is split into clean, modular folders for easy maintenance and deployment:

```
student-wellbeing-app/
├── index.html                  # Main Landing Page with interactive score preview
├── vercel.json                 # Vercel deployment routes & clean URLs config
├── netlify.toml                # Netlify deployment redirects & headers config
├── start.bat                   # 1-click local launcher for Windows
│
├── pages/                      # Application views & user pages
│   ├── auth.html               # Dual-tab Login & Create Account (No demo accounts)
│   ├── login.html              # Quick alias redirecting to auth.html
│   ├── dashboard.html          # Main student dashboard with SVG trend graph
│   ├── check-in.html           # 5-second check-in with live score calculation
│   ├── cbt.html                # 2-minute reset with animated box-breathing
│   ├── chat.html               # Mitra AI Assistant (Gemini API + Offline engine)
│   ├── mentor.html             # Peer mentor support queue & response triage
│   ├── crisis.html             # Emergency contacts & 24/7 helplines (112, 14416)
│   └── settings.html           # Privacy controls, Gemini API key config, JSON export
│
├── css/
│   └── style.css               # Design system, CSS custom properties & components
│
├── js/
│   ├── storage.js              # LocalStorage repository (auth, check-ins, tickets)
│   ├── wellbeing.js            # Wellbeing score formula & trend analytics
│   ├── ai-assistant.js         # Dual-engine AI (Gemini 1.5 Flash + Local Cognitive)
│   ├── chat-bot.js             # Chat controller, prompt chips & auto-scroll
│   └── app.js                  # Navigation shell, mobile drawer & route guards
│
├── assets/                     # Icons, logos, and graphic assets
│
└── deploy/                     # Self-contained, production-ready static bundle
    ├── index.html
    ├── pages/
    ├── css/
    ├── js/
    ├── assets/
    ├── vercel.json
    ├── netlify.toml
    └── start.bat
```

---

## 🚀 Deployment Methods

### Method 1: Netlify Drop (Fastest — 10 Seconds, No CLI Needed)
1. Open your browser and navigate to [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `deploy` folder from this repository into the upload box.
3. Netlify will instantly provide a live, production HTTPS URL with global CDN caching.

---

### Method 2: Vercel

#### Using Vercel CLI:
```bash
# Navigate to the deploy folder
cd deploy

# Deploy directly with zero configuration
vercel --prod
```

#### Using Git Integration (GitHub / GitLab / Bitbucket):
1. Push this repository to GitHub.
2. In the Vercel Dashboard, import the repository.
3. In **Build and Output Settings**:
   - **Framework Preset**: `Other`
   - **Root Directory**: `deploy` (or leave as root; `vercel.json` handles rewrites automatically)
   - **Build Command**: Leave blank / disabled
   - **Output Directory**: Leave blank / disabled
4. Click **Deploy**.

---

### Method 3: GitHub Pages

1. Push this repository to GitHub.
2. Open your repository on GitHub and click **Settings**.
3. Under the **Code and automation** section in the left sidebar, click **Pages**.
4. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `master` (or `main`)
   - **Folder**: `/ (root)`
5. Click **Save**. Within 1–2 minutes, your site will be live at:
   `https://<your-github-username>.github.io/<repository-name>/`

---

### Method 4: Firebase Hosting

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting
# - Choose your Firebase project
# - What do you want to use as your public directory? -> deploy
# - Configure as a single-page app? -> No
# - Set up automatic builds and deploys with GitHub? -> No

# Deploy
firebase deploy --only hosting
```

---

### Method 5: Local Execution (No Web Server Needed)

You don't need `npm`, `node`, `python`, or `http-server` to run MindMitra.
1. Double-click `start.bat` on Windows.
2. Or open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).

---

## 🤖 Mitra AI Assistant Configuration

Mitra operates in **Dual-Engine Mode**:
1. **Local Cognitive Assistant (Default, 100% Free & Offline)**:
   - Responds to student queries regarding exam stress, burnout, insomnia, imposter syndrome, CBT techniques, and campus resources.
   - Operates with zero network latency and works offline.
2. **Google Gemini API (Cloud AI)**:
   - To connect Gemini, open **Settings** (`pages/settings.html`), paste your Gemini API key, and click **Save Key**.
   - MindMitra calls Google's `gemini-1.5-flash` model directly from the client without exposing credentials or requiring a server.

---

## 🔑 Resolving Supabase Authentication Deployment Errors

If you encountered errors with Supabase Authentication when deploying, here is why it occurs and how to resolve each:

### 1. Missing Environment Variables on Vercel / Netlify
- **Why it happens**: Your `.env.local` file is listed in `.gitignore` for security. When Vercel or Netlify deploys, it does not have your Supabase keys, causing `middleware.ts` or page loads to return a **500 Server Error** or fail with `missing NEXT_PUBLIC_SUPABASE_URL`.
- **How to fix**:
  1. Go to your **Vercel** or **Netlify** project dashboard.
  2. Navigate to **Settings** → **Environment Variables**.
  3. Add the following keys:
     - `NEXT_PUBLIC_SUPABASE_URL`: `https://khtxtnnyzvxvcjhydgta.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_6bnKhtgfsREi9gVSejYtGw_E9A8aLZI`
     - `NEXT_PUBLIC_CAMPUS_COUNSELLING_PHONE`: `9042700663`
  4. Trigger a **Redeploy**.

---

### 2. "redirect_uri_not_allowed" or Magic Link Redirecting to `localhost:3000`
- **Why it happens**: Supabase enforces strict URL whitelisting for auth redirects. In development, the default is `http://localhost:3000`. On a deployed domain (e.g. `https://your-app.vercel.app`), Supabase will reject the login or redirect to localhost.
- **How to fix**:
  1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/khtxtnnyzvxvcjhydgta).
  2. Navigate to **Authentication** → **URL Configuration**.
  3. Change **Site URL** to your deployed URL:
     `https://<your-project-name>.vercel.app` (or custom domain).
  4. In **Redirect URLs**, add:
     - `https://<your-project-name>.vercel.app/**`
     - `https://<your-project-name>.vercel.app/auth/callback`
     - `http://localhost:3000/**` (keeps local testing working)
  5. Click **Save**.

---

### 3. Vercel Auto-Building Next.js Instead of the Pure Static App
- **Why it happens**: If you deploy the whole repository to Vercel, Vercel detects `package.json` and runs `next build`. If Supabase keys aren't configured, the build/middleware fails.
- **How to fix**:
  - **Option A (Zero-Build Netlify Drop)**: Simply drag and drop the `deploy/` folder to [app.netlify.com/drop](https://app.netlify.com/drop). No build step, no Node server, no Supabase errors.
  - **Option B (Vercel Root Directory)**: In Vercel Project Settings → General, set **Root Directory** to `deploy`.
  - **Option C (HTML/CSS/JS with Supabase)**: The `pages/auth.html` page now has built-in Supabase JS SDK integration with automatic local fallback. It authenticates directly against Supabase in the browser without needing a Node server!

