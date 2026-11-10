# MindMitra — Student Wellbeing (Pure HTML, CSS & JavaScript)

A privacy-first, zero-dependency student wellbeing web application built entirely with **vanilla HTML5, CSS3, and modern JavaScript**.

This implementation requires **no MERN stack** (no MongoDB, no Express, no React, no Node.js backend). It runs directly in any modern browser by double-clicking `index.html` or through any static web server.

---

## 🚀 Quick Start

### Option 1: Direct File Launch (No server required)
- Double-click **`start.bat`** or double-click **`index.html`** in Windows File Explorer.
- The app will open directly in your default browser (`file:///.../index.html`).

### Option 2: Using Any Static Server
```bash
# Python
python -m http.server 8080
# Open http://localhost:8080/index.html

# OR with any Node static server
npx serve .
```

---

## 📱 Included Pages & Features

### 1. Landing Page (`index.html`)
- **Hero & Identity:** Brand headline *"Notice wellbeing shifts early"* with "Private by design" badges.
- **Interactive Live Preview:** Visitors can adjust mood, sleep, and academic load sliders directly on the landing page to preview the real-time Wellbeing Support Signal formula.
- **Feature Showcase:** 6 core pillar breakdowns (Today, Private check-ins, Human support, 5-second check-in, 2-minute reset, Escalation).

### 2. Authentication & Demo Access (`auth.html`)
- **Magic Link Simulation:** College email input with OTP link simulation and cooldown timer.
- **Instant 1-Click Access:** Direct buttons to "Continue with Demo Student Account" or "Sign in as Peer Mentor".
- **Local Isolation:** Privacy guarantee card confirming responses are stored locally.

### 3. Student Wellbeing Dashboard (`dashboard.html`)
- **Personalized Header:** Dynamic date formatting and student greeting.
- **Latest Support Signal Card:** Displays the current score out of 100, visual progress meter, and load status category (*Optimal*, *Moderate Load*, or *High Pressure*).
- **Recent Pattern Indicator:** Battery status icon, baseline shift detector (*Higher*, *Lower*, or *Steady*), and weekly check-in counter.
- **Weekly Trend Interactive SVG Graph:**
  - 7-day spline curve and gradient area fill.
  - Interactive SVG data points with hover tooltips showing score, date, and mood details.
  - 7-day summary metrics: 7-Day Average, Current Score, Trend Delta vs start of week, and Consistency Percentage gauge.
- **Quick Action Cards:** Shortcuts to 2-minute reset, peer chat, and urgent crisis support.
- **Recent Check-in History:** Chronological log of past entries with emoji indicators and breakdown.

### 4. 5-Second Daily Check-in (`check-in.html`)
- **3 Simple Self-Report Inputs:**
  1. *Mood:* 5 interactive emoji buttons (😞 Rough, 😕 Low, 😐 Okay, 🙂 Good, 😄 Great).
  2. *Sleep Quality:* Range slider (Poor, Okay, Restful).
  3. *Academic Load:* Range slider (Light, Manageable, Heavy).
- **Real-Time Score Engine:** Computes the deterministic Support Signal:
  $$\text{Signal} = \text{clamp}(65 - (\text{mood} \times 10) + ((3 - \text{sleep}) \times 12) + (\text{load} \times 10), 5, 95)$$
- **Success Completion Screen:** Clean confirmation view with calculated score and direct links to dashboard or reset.

### 5. 2-Minute Reset & CBT Exercises (`cbt.html`)
- **3 Evidence-Informed Exercises:**
  1. *Box Breathing:* Inhale 4s, Hold 4s, Exhale 4s, Hold 4s with a **pulsing, expanding circular visualizer** synchronized to the timer.
  2. *5-4-3-2-1 Grounding:* Interactive sensory checklist for 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.
  3. *Quick Journal:* 3 reflection prompt pills and an auto-saving private notes area.
- **Integrated Timer:** 120-second countdown with Start, Pause, and Restart controls, plus step progression tracking.

### 6. Mitra AI Wellbeing Assistant (`chat.html`)
- **Dual-Engine AI Architecture:**
  - **Live Google Gemini Integration:** Connects directly via REST API with `gemini-2.5-flash`, `gemini-2.0-flash`, or `gemini-1.5-flash` for state-of-the-art generative, context-aware student support.
  - **Built-in Local Cognitive AI Companion:** Deep client-side empathetic counselor operating 100% offline without needing API keys.
- **Safety & Crisis Escalation Shield:** Detects self-harm or crisis keywords, immediately displays professional support advice, and surfaces emergency call links to **112** and **Tele-MANAS 14416**.
- **Quick Prompt Chips:** One-click topic buttons (e.g. *Overwhelmed by exams*, *Can't sleep*, *Feeling isolated*, *Procrastination guilt*, *Calming reframe*).
- **In-App AI Settings Modal:** Configure your Gemini API key, switch models, or toggle offline local AI mode at any time.
- **Rich Markdown Formatting:** Bold highlights, bullet points, and clean conversational paragraphs.

### 7. Peer Mentor Workspace (`mentor.html`)
- **Student Mentor Queue:** View waiting and active peer support requests.
- **Request Management:** Claim/accept incoming student requests and close completed sessions.
- **Simulation Helper:** "+ Add simulated student request" button to easily test mentor workflows.
- **Role Switcher:** Easily toggle between Student and Peer Mentor personas.

### 8. Urgent Help & Crisis (`crisis.html`)
- **Emergency Alert Card:** Instant one-tap phone links to **112** (National Emergency) and **Tele-MANAS 14416** (24x7 Mental Health Helpline).
- **Campus Wellbeing Center:** Verified campus counseling office location, hours, and direct call action.
- **Immediate Steps ("If it cannot wait"):** Guidelines for safety and staying with trusted friends.

### 9. Privacy & Settings (`settings.html`)
- **Display Name & Alias:** Customize your display name or randomize your anonymous peer alias.
- **Reminders Toggle:** Enable/disable local daily check-in reminders.
- **Data Export:** Download all stored check-ins, journal notes, and profile settings as a structured `.json` file.
- **Data Deletion:** Permanently purge all local check-in records and chat histories with confirmation.
- **Sign Out:** Clear active session and return to sign-in.

---

## 📂 File Architecture

```text
student-wellbeing-app/
├── index.html            # Landing page with live preview
├── auth.html             # Sign in & instant demo accounts
├── dashboard.html        # Main dashboard with SVG trend chart
├── check-in.html         # 5-second daily assessment
├── cbt.html              # 2-minute reset exercises (Breathing, Grounding, Journal)
├── chat.html             # Anonymous peer support chat
├── mentor.html           # Peer mentor request queue
├── crisis.html           # Urgent emergency & campus contacts
├── settings.html         # Privacy controls & JSON data export
├── start.bat             # 1-click launcher for Windows
├── css/
│   └── style.css         # Complete responsive styles, theme, & animations
└── js/
    ├── storage.js        # LocalStorage state management & baseline seeds
    ├── wellbeing.js      # Support signal algorithm & SVG graph generators
    ├── ai-assistant.js   # Dual-Engine AI Assistant (Gemini Flash + Local Cognitive AI)
    ├── chat-bot.js       # Fallback & safety rules
    └── app.js            # Shared shell navigation, mobile drawer & toasts
```

---

## 🔒 Privacy & Safeguards

- **Zero External Server Transmission:** All responses, journal reflections, and chats stay on your local browser.
- **Support Signal, Not a Diagnosis:** MindMitra helps students notice shifts in routine and stress early. It does not provide medical diagnoses or replace licensed clinical care.
