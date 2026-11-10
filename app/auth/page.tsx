"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartHandshake, LockKeyhole } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase";

const RESEND_COOLDOWN_SECONDS = 60;
const RATE_LIMIT_COOLDOWN_SECONDS = 10 * 60;
const cooldownStorageKey = (email: string) => `mindmitra-auth-cooldown:${email}`;

export default function Auth() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const savedEmail = window.localStorage.getItem("mindmitra-auth-email");
    if (savedEmail) {
      setEmail(savedEmail);
      const expiresAt = Number(window.localStorage.getItem(cooldownStorageKey(savedEmail)) ?? 0);
      setCooldown(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    }
  }, []);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (authError === "otp_expired") {
      setMsg("This secure link has expired or has already been used. Request the newest link and open it once.");
    } else if (authError === "access_denied") {
      setMsg("Supabase could not verify this secure link. Request a new link and open the newest email once.");
    } else if (authError === "callback") {
      setMsg("That sign-in link is invalid or expired. Request a new secure link.");
    } else if (authError === "missing_config") {
      setMsg("Deployment setup required: Supabase environment variables are missing on the hosting platform. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your Vercel/Netlify dashboard.");
    }
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || cooldown > 0) return;
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMsg("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const sb = supabaseBrowser();
      if (process.env.NODE_ENV !== "production") {
        console.info("[MindMitra Auth] login requested");
        console.info("[MindMitra Auth] redirect URL:", `${window.location.origin}/auth/callback`);
      }
      const { error } = await sb.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      if (process.env.NODE_ENV !== "production") {
        console.info("[MindMitra Auth] Supabase accepted magic-link request");
      }
      const expiresAt = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
      window.localStorage.setItem("mindmitra-auth-email", normalizedEmail);
      window.localStorage.setItem(cooldownStorageKey(normalizedEmail), String(expiresAt));
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setMsg("Secure link sent. Check your inbox and spam folder.");
    } catch (err) {
      const authError = err as Error & { code?: string; status?: number };
      const message = authError.message?.toLowerCase() ?? "";
      const errorCode = authError.code?.toLowerCase() ?? "";
      const isRateLimited =
        authError.status === 429 ||
        errorCode.includes("rate") ||
        errorCode.includes("limit") ||
        message.includes("rate") ||
        message.includes("too many") ||
        message.includes("limit") ||
        message.includes("once every") ||
        message.includes("email frequency");
      const isEmailProviderFailure =
        errorCode === "unexpected_failure" ||
        message.includes("error sending magic link email") ||
        message.includes("error sending email");

      if (process.env.NODE_ENV !== "production") {
        console.warn("[MindMitra Auth] Supabase request failed", {
          status: authError.status,
          code: authError.code,
          name: authError.name,
        });
      }
      if (
        message.includes("configuration is missing") ||
        message.includes("configuration is invalid") ||
        message.includes(".env.local") ||
        message.includes("environment variable")
      ) {
        setMsg("Supabase authentication is not configured. Check .env.local and restart the dev server.");
      } else if (isRateLimited) {
        const expiresAt = Date.now() + RATE_LIMIT_COOLDOWN_SECONDS * 1000;
        window.localStorage.setItem("mindmitra-auth-email", normalizedEmail);
        window.localStorage.setItem(cooldownStorageKey(normalizedEmail), String(expiresAt));
        setCooldown(RATE_LIMIT_COOLDOWN_SECONDS);
        setMsg("Supabase has temporarily limited email delivery for this address. Wait several minutes before requesting another link. For reliable delivery, configure custom SMTP in Supabase.");
      } else if (isEmailProviderFailure) {
        setMsg("Supabase could not send the email. Configure and verify an SMTP provider in Supabase Authentication settings, then try again.");
      } else {
        setMsg("Supabase rejected the sign-in request. Check the Supabase Auth email provider and try again later.");
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="grid-bg min-h-screen p-5">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center">
        <Card className="w-full p-8">
          <Link href="/" className="mb-8 flex items-center gap-2 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">
              <HeartHandshake size={18} />
            </span>
            MindMitra
          </Link>
          <h1 className="text-3xl font-black">A quieter check-in.</h1>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Use a magic link. No password to remember.
          </p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                College email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="you@college.edu"
              />
            </div>
            <Button className="w-full" disabled={busy || cooldown > 0}>
              {busy ? "Sending…" : cooldown > 0 ? `Try again in ${cooldown}s` : "Send secure link"}
            </Button>
          </form>
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-4">
              <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-black/40">Development only</p>
              <a href="/auth/demo" className="block rounded-xl border border-black/10 px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-mint">
                Continue with Demo Account
              </a>
            </div>
          )}
          {msg && <p className="mt-4 rounded-xl bg-mint p-3 text-sm">{msg}</p>}
          <div className="mt-7 flex gap-2 rounded-xl bg-cream p-3 text-xs leading-5 text-black/55">
            <LockKeyhole size={16} className="shrink-0" />
            Your wellbeing responses are private and are never shown publicly.
          </div>
        </Card>
      </div>
    </main>
  );
}
