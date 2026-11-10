import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const authError = params.error_code ?? params.error;

  if (typeof authError === "string") {
    redirect(`/auth?error=${encodeURIComponent(authError)}`);
  }

  return (
    <main className="min-h-screen bg-[#f7fbf8] px-5 py-6 text-[#10231d]">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2 text-[23px] font-black leading-none">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#10231d] text-white">
            <HeartHandshake size={18} />
          </span>
          <span className="font-black">MindMitra</span>
        </div>

        <Link
          href="/auth"
          className="rounded-xl bg-[#10231d] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto mt-8 max-w-6xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#e5f3eb] px-3 py-1.5 text-xs font-semibold text-[#10231d]">
          <ShieldCheck size={14} />
          Private by design
        </div>

        <h1 className="max-w-3xl text-4xl font-black tracking-[-0.04em] md:text-6xl">
          Notice wellbeing shifts early.
        </h1>

        <p className="mt-5 max-w-4xl text-[15px] leading-7 text-black/65 md:text-[19px] md:leading-8">
          A student wellbeing space for tiny daily check-ins, two-minute resets,
          and human peer support — before stress becomes a crisis.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-xl bg-[#10231d] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Start privately <ArrowRight size={16} />
          </Link>
          <a href="#how" className="text-sm font-semibold text-[#10231d] underline decoration-black/20 underline-offset-4">
            How it works
          </a>
        </div>

        <div className="mt-12 space-y-8">
          <FeatureRow
            icon={CheckCircle2}
            title="Today"
            meta="2 min"
            subtitle="Support signal"
            note="Private"
          />
          <FeatureRow
            icon={LockKeyhole}
            title="Private check-ins"
            subtitle="A support signal. Not a diagnosis."
            note="Private"
          />
          <FeatureRow
            icon={MessageCircle}
            title="Human support"
            subtitle="Peer support and guidance when it matters."
            note="Available"
          />
          <FeatureRow
            icon={HeartHandshake}
            title="5-second check-in"
            subtitle="Capture mood, sleep and workload without long forms."
            note="Quick"
          />
          <FeatureRow
            icon={CheckCircle2}
            title="2-minute reset"
            subtitle="Use breathing, grounding and reflection exercises when pressure spikes."
            note="Gentle"
          />
          <FeatureRow
            icon={ShieldCheck}
            title="Escalation when needed"
            subtitle="Make urgent campus and emergency support easy to reach."
            note="Safe"
          />
        </div>
      </section>
    </main>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  subtitle,
  note,
  meta,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  subtitle?: string;
  note?: string;
  meta?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-black/20 text-black/70">
          <Icon className="text-current" size={14} />
        </span>
        <div>
          <div className="text-[16px] font-black leading-6 md:text-[18px]">{title}</div>
          {subtitle && <div className="mt-1 text-sm leading-6 text-black/55">{subtitle}</div>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {meta && <span className="rounded-full bg-[#e5f3eb] px-2.5 py-1 text-[11px] font-semibold text-[#10231d]">{meta}</span>}
        {note && <span className="text-sm font-medium text-black/55">{note}</span>}
      </div>
    </div>
  );
}
