"use client";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { Card, Button } from "@/components/ui";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import { isDemoSession } from "@/lib/demo";
import { calculateSupportSignal } from "@/lib/wellbeing";

const moods = ["😞", "😕", "😐", "🙂", "😄"];
const labels = ["Rough", "Low", "Okay", "Good", "Great"];

export default function CheckIn() {
  const [mood, setMood] = useState(2);
  const [sleep, setSleep] = useState(3);
  const [work, setWork] = useState(2);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Single shared source of truth for the wellbeing support signal.
  const score = calculateSupportSignal(mood, sleep, work);

  async function saveCheckIn() {
    setBusy(true);
    setError("");
    if (isDemoSession()) {
      setDone(true);
      setBusy(false);
      return;
    }
    const client = supabaseBrowser();
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      setError("Your session has expired. Please sign in again.");
      setBusy(false);
      return;
    }
    const { error: insertError } = await client.from("check_ins").insert({
      user_id: user.id,
      mood,
      sleep_quality: sleep,
      academic_load: work,
      support_signal: score,
    });
    if (insertError) {
      setError(`We could not save this check-in. ${insertError.message || "Please try again."}`);
    } else {
      setDone(true);
      window.dispatchEvent(new Event("mindmitra:checkin-saved"));
    }
    setBusy(false);
  }

  return (
    <Shell>
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-black/45">Daily check-in · about 5 seconds</p>
        <h1 className="mt-2 text-3xl font-black">How are you doing today?</h1>
        <p className="mt-2 text-sm text-black/55">There are no right answers. This is for noticing patterns, not judging you.</p>
        {done ? (
          <Card className="mt-8 p-10 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={42} />
            <h2 className="mt-5 text-2xl font-black">Check-in saved</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/55">
              Your Wellbeing Support Signal is <b>{score}/100</b>. This is a support signal, not a diagnosis. Trust your own experience.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/dashboard"><Button>Back to dashboard</Button></Link>
              <Link href="/cbt"><Button variant="secondary">Try a 2-minute reset</Button></Link>
            </div>
          </Card>
        ) : (
          <Card className="mt-8 space-y-8">
            <Question title="Mood">
              <div className="grid grid-cols-5 gap-2">
                {moods.map((m, i) => (
                  <button type="button" key={m} onClick={() => setMood(i)} aria-label={labels[i]} aria-pressed={mood === i}
                    className={`rounded-xl p-3 text-2xl ${mood === i ? "bg-mint ring-2 ring-sage" : "bg-cream"}`}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center text-xs text-black/40">{labels[mood]}</div>
            </Question>
            <Question title="Sleep quality"><Scale value={sleep} setValue={setSleep} labels={["Poor", "Okay", "Restful"]} /></Question>
            <Question title="Academic load"><Scale value={work} setValue={setWork} labels={["Light", "Manageable", "Heavy"]} /></Question>
            <div className="flex items-start gap-2 rounded-xl bg-cream p-3 text-xs leading-5 text-black/50">
              <LockKeyhole size={15} /> Only you can access your check-in history. MindMitra does not diagnose medical conditions.
            </div>
            {error && <p role="alert" className="rounded-xl bg-[#fff0ec] p-3 text-sm text-coral">{error}</p>}
            <Button className="w-full" onClick={saveCheckIn} disabled={busy}>
              {busy ? "Saving..." : "Save check-in"} <ArrowRight size={16} />
            </Button>
          </Card>
        )}
      </div>
    </Shell>
  );
}
function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h2 className="mb-3 font-bold">{title}</h2>{children}</div>;
}
function Scale({ value, setValue, labels }: { value: number; setValue: (n: number) => void; labels: string[] }) {
  return <><input aria-label={labels[1]} className="w-full accent-ink" type="range" min="1" max="3" value={value} onChange={(e) => setValue(Number(e.target.value))} /><div className="flex justify-between text-xs text-black/40"><span>{labels[0]}</span><span>{labels[1]}</span><span>{labels[2]}</span></div></>;
}
