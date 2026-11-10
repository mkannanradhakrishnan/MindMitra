"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartHandshake,
  LayoutDashboard,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  ClipboardCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
const nav = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/check-in", "Daily check-in", ClipboardCheck],
  ["/cbt", "2-min reset", Sparkles],
  ["/chat", "Peer support", MessageCircle],
  ["/crisis", "Get urgent help", ShieldAlert],
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  async function signOut() {
    if (document.cookie.split(";").some((cookie) => cookie.trim() === "mindmitra_demo=1")) {
      await fetch("/auth/demo/logout");
    } else {
      await supabaseBrowser().auth.signOut();
    }
    window.location.assign("/auth");
  }
  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 hidden w-64 border-r border-black/5 bg-white p-5 md:block">
        <Link
          href="/dashboard"
          className="mb-8 flex items-center gap-2 font-bold text-lg"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">
            <HeartHandshake size={18} />
          </span>
          MindMitra
        </Link>
        <nav className="space-y-1">
          {nav.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${path === href ? "bg-mint text-ink" : "text-black/60 hover:bg-black/[.03]"}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-black/60 hover:bg-black/[.03]"
          >
            <Settings size={18} />
            Settings
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-black/60 hover:bg-black/[.03]"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
