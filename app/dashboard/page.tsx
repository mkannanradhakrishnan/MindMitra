"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BatteryMedium,
  BookOpen,
  CalendarDays,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Shell } from "@/components/shell";
import { Button, Card } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase";
import type { CheckIn } from "@/lib/database.types";
import { isDemoSession } from "@/lib/demo";
import { getDemoCheckIns, getWellbeingAnalytics } from "@/lib/wellbeing-data";

export default function Dashboard() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [name, setName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (isDemoSession()) {
        setName("Demo student");
        setCheckIns(getDemoCheckIns());
        setLoading(false);
        return;
      }

      const client = supabaseBrowser();
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        setError("Your session has expired. Please sign in again.");
        setCheckIns(getDemoCheckIns());
        setLoading(false);
        return;
      }

      const [{ data, error: checkInError }, { data: profile }] = await Promise.all([
        client.from("check_ins").select("*").eq("user_id", user.id).order("created_at", { ascending: true }).limit(30),
        client.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      ]);

      if (checkInError) {
        setError("We could not load your private wellbeing history.");
        setCheckIns([]);
      } else {
        setCheckIns((data ?? []) as CheckIn[]);
      }

      if (profile?.display_name) setName(profile.display_name);
      setLoading(false);
    }

    const refresh = () => {
      setLoading(true);
      void loadDashboard();
    };

    void loadDashboard();
    window.addEventListener("mindmitra:checkin-saved", refresh);
    return () => window.removeEventListener("mindmitra:checkin-saved", refresh);
  }, []);

  const latest = checkIns[0];
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const thisWeek = checkIns.filter((item) => new Date(item.created_at) >= weekStart).length;
  const trend = checkIns.length > 1 ? checkIns[0].support_signal - checkIns[1].support_signal : 0;
  const analytics = useMemo(() => getWellbeingAnalytics(checkIns), [checkIns]);
  const trendPath = buildTrendPath(analytics.points);
  const areaPath = buildAreaPath(analytics.points);

  return (
    <Shell>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#52635d]">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="mt-1 text-3xl font-black text-ink">Good to see you, {name}.</h1>
          <p className="mt-2 text-sm leading-6 text-[#52635d]">Notice patterns gently. Your signal is for support, not diagnosis.</p>
        </div>
        <Link href="/check-in"><Button>Daily check-in <ArrowRight size={16} /></Button></Link>
      </header>

      {error && <p role="alert" className="mt-6 rounded-xl bg-[#fff0ec] p-4 text-sm font-medium text-[#a33a27]">{error}</p>}
      {loading ? <Card className="mt-7 text-ink">Loading your private wellbeing summary...</Card> : <>
        <div className="mt-7 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
          <Card className="overflow-hidden !bg-[#10231d] !text-white">
            <p className="text-sm !text-[#d7eee2]">Latest Wellbeing Support Signal</p>
            {latest ? <>
              <div className="mt-2 text-5xl font-black !text-white">{latest.support_signal}<span className="text-lg !text-[#b9d1c4]">/100</span></div>
              <div className="mt-8 h-3 rounded-full bg-white/20"><div className="h-full rounded-full bg-sage" style={{ width: `${latest.support_signal}%` }} /></div>
              <p className="mt-4 text-sm leading-6 !text-[#d7eee2]">Recorded {new Date(latest.created_at).toLocaleDateString("en-IN")}. This reflects self-reported inputs and is not a medical assessment.</p>
            </> : <p className="mt-5 text-sm leading-6 !text-[#d7eee2]">No check-ins yet. A short check-in creates your first private support signal.</p>}
          </Card>
          <Card>
            <div className="flex items-center gap-3"><div className="rounded-xl bg-mint p-3"><BatteryMedium /></div><div><p className="text-xs font-medium text-[#52635d]">Recent pattern</p><p className="font-bold text-ink">{checkIns.length < 2 ? "Building your baseline" : trend > 0 ? "Signal is higher" : trend < 0 ? "Signal is lower" : "Signal is steady"}</p></div></div>
            <p className="mt-5 text-sm leading-6 text-[#52635d]">{thisWeek === 0 ? "No check-ins this week yet." : `${thisWeek} check-in${thisWeek === 1 ? "" : "s"} this week. Consistency can help you notice changes earlier.`}</p>
          </Card>
        </div>

        <Card className="mt-5 overflow-hidden border border-[#d9e7df] bg-[#f4faf5]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#52635d]">Weekly wellbeing trend</p>
              <h2 className="mt-2 text-2xl font-black text-ink">Support signal overview</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#10231d] shadow-soft">
              <TrendingUp size={14} className="text-sage" />
              {analytics.status}
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_0.7fr]">
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#52635d]">7-day view</p>
                  <p className="mt-1 text-sm text-[#52635d]">{analytics.explanation}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.1em] text-[#52635d]">Avg</p>
                  <p className="text-2xl font-black text-ink">{analytics.average}</p>
                </div>
              </div>

              <svg viewBox="0 0 520 180" className="h-48 w-full overflow-visible" role="img" aria-label="Weekly wellbeing support signal trend">
                <defs>
                  <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6FB38B" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6FB38B" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((line) => (
                  <line
                    key={line}
                    x1="0"
                    x2="520"
                    y1={26 + line * 42}
                    y2={26 + line * 42}
                    stroke="#dfe9e6"
                    strokeDasharray="4 8"
                  />
                ))}
                <path d={areaPath} fill="url(#trendFill)" />
                <path d={trendPath} fill="none" stroke="#10231d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {analytics.points.map((point, index) => {
                  const x = 20 + index * 74;
                  const y = 150 - ((point.score - 40) / 70) * 120;
                  return (
                    <g key={`${point.date}-${index}`}>
                      <circle cx={x} cy={y} r={5} fill="#10231d" />
                      <circle cx={x} cy={y} r={10} fill="#6FB38B" opacity="0.15" />
                    </g>
                  );
                })}
              </svg>

              <div className="mt-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-[#52635d]">
                {analytics.points.map((point) => (
                  <div key={point.date}>
                    <div>{point.label}</div>
                    <div className="mt-1 font-bold text-ink">{point.score}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-4 shadow-soft">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#52635d]">Current</p>
                <p className="mt-2 text-3xl font-black text-ink">{analytics.current}</p>
                <p className="mt-1 text-sm text-[#52635d]">{analytics.focus}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-soft">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#52635d]">Change</p>
                <p className={`mt-2 text-2xl font-black ${analytics.delta >= 0 ? "text-emerald-700" : "text-[#a33a27]"}`}>
                  {analytics.delta >= 0 ? "+" : ""}{analytics.delta}
                </p>
                <p className="mt-1 text-sm text-[#52635d]">Compared with the start of the week</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-soft">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#52635d]">Consistency</p>
                <div className="mt-3 h-2.5 rounded-full bg-[#dfe9e6]">
                  <div className="h-full rounded-full bg-sage" style={{ width: `${analytics.consistency}%` }} />
                </div>
                <p className="mt-2 text-xl font-black text-ink">{analytics.consistency}%</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <Quick href="/cbt" icon={BookOpen} title="2-minute reset" text="Breathe, ground, journal." />
          <Quick href="/chat" icon={MessageCircle} title="Talk to a peer" text="Connect anonymously." />
          <Quick href="/crisis" icon={ShieldCheck} title="Need urgent help?" text="See support options." />
        </div>

        <Card className="mt-5">
          <div className="flex items-center gap-2"><CalendarDays size={18} /><h2 className="font-bold text-ink">Recent check-ins</h2></div>
          {checkIns.length === 0 ? <p className="mt-5 text-sm text-[#52635d]">Your check-in history will appear here after your first entry.</p> : <div className="mt-4 space-y-3">{checkIns.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm text-ink"><span>{new Date(item.created_at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span><span className="font-semibold">{item.support_signal}/100 support signal</span></div>)}</div>}
        </Card>
      </>}
    </Shell>
  );
}

function buildTrendPath(points: { score: number }[]) {
  if (points.length === 0) return "";
  const width = 520;
  const height = 180;
  return points
    .map((point, index) => {
      const x = 20 + index * 74;
      const y = height - 20 - ((point.score - 40) / 70) * 120;
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

function buildAreaPath(points: { score: number }[]) {
  if (points.length === 0) return "";
  const width = 520;
  const height = 180;
  const line = buildTrendPath(points).trim();
  if (!line) return "";
  const last = points[points.length - 1];
  const first = points[0];
  const x1 = 20 + 0 * 74;
  const x2 = 20 + (points.length - 1) * 74;
  const y1 = height - 20 - ((first.score - 40) / 70) * 120;
  const y2 = height - 20 - ((last.score - 40) / 70) * 120;
  return `${line} L ${x2} ${height - 20} L ${x1} ${height - 20} Z`;
}

function Quick({ href, icon: Icon, title, text }: { href: string; icon: React.ComponentType<{ size?: number; className?: string }>; title: string; text: string }) {
  return <Link href={href}><Card className="h-full transition hover:-translate-y-0.5"><Icon className="text-sage" /><h3 className="mt-5 font-bold text-ink">{title}</h3><p className="mt-1 text-sm text-[#52635d]">{text}</p></Card></Link>;
}
