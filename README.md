# MindMitra — Student Wellbeing

Privacy-first student wellbeing web app built with Next.js, Tailwind CSS, shadcn-style UI primitives, Supabase Auth/Postgres/Realtime and Vercel.

## Included
- Landing + Supabase magic-link authentication with protected routes
- Authenticated dashboard and private check-in history
- Deterministic Wellbeing Support Signal (not a diagnosis)
- Local breathing, grounding and private quick-journal exercises
- Persistent anonymous peer rooms with mentor claiming and Realtime chat
- Mentor queue, reporting, closing and urgent-help escalation
- Supabase schema with RLS, profile provisioning and Realtime publication

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and add Supabase project URL + publishable key. Optionally add a verified institution number as `NEXT_PUBLIC_CAMPUS_COUNSELLING_PHONE`.
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Enable Email OTP/magic links in Supabase Auth and allow redirects to your local and deployed `/auth/callback` URLs.
5. `npm run dev`
6. `npm run build`

## Local demo login

In development, the login page includes **Continue with Demo Account**. It creates a local `mindmitra_demo` cookie and opens the dashboard without Supabase, email, or SMTP. Demo check-ins and chat stay local to the browser and are not written to Supabase. The route refuses to create this session in production.

To remove the demo later, delete `app/auth/demo/`, `lib/demo.ts`, the demo branch in `middleware.ts`, and the demo-only branches/button in `app/auth/page.tsx`, `app/dashboard/page.tsx`, `app/check-in/page.tsx`, `app/chat/page.tsx`, `app/settings/page.tsx`, and `components/shell.tsx`.

## Supabase configuration

- In Authentication > Providers, enable Email and configure the email template for magic links.
- Supabase's built-in email service is rate-limited and is intended for testing. If sign-in requests return an email rate-limit error, wait for the provider quota to reset and stop retrying the same address. For reliable Gmail delivery, configure a verified custom SMTP provider under Project Settings > Authentication > SMTP Settings; the SMTP credentials stay in Supabase and are never added to this app.
- In Authentication > URL Configuration, add `http://localhost:3000/auth/callback` and the deployed callback URL.
- Run the complete schema file after creating the project. It creates RLS policies, the auth profile trigger, the atomic mentor-claim RPC, and adds `peer_messages` to Realtime.
- After a user is created, promote approved mentors by updating their `profiles.role` to `mentor` in a controlled admin workflow. Never trust a client-side role check.
- Use only the publishable/anon key in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; never expose a service-role key.

## Deployment

1. Import the repository into Vercel and select the Next.js preset.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the optional campus phone environment variable.
3. Add the Vercel `/auth/callback` URL to Supabase Auth redirect URLs.
4. Deploy and verify magic-link sign-in, RLS, Realtime, and the mentor role in the deployed environment.

## Important product safeguards
MindMitra does not diagnose students. It detects changes in self-reported wellbeing patterns and provides early support. Do not use the support signal to label students, make disciplinary decisions, or infer a clinical condition. Before production, establish trained-mentor moderation/escalation procedures and complete a privacy/legal review.
