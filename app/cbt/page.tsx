"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Card } from "@/components/ui";
import { Eye, Pause, PenLine, Play, RotateCcw, TimerReset, Wind } from "lucide-react";

const exercises = [
  {
    title: "Box breathing",
    time: "2 min",
    icon: Wind,
    steps: ["Inhale for 4", "Hold for 4", "Exhale for 4", "Hold for 4"],
    desc: "A simple paced breathing exercise to help you pause.",
  },
  {
    title: "5-4-3-2-1 grounding",
    time: "2 min",
    icon: Eye,
    steps: ["5 things you see", "4 things you can touch", "3 things you hear", "2 things you smell", "1 thing you taste"],
    desc: "Bring attention back to what is happening around you.",
  },
  {
    title: "Quick journal",
    time: "2 min",
    icon: PenLine,
    steps: ["What is taking most of my energy?", "What is one thing I can make smaller?", "Who could make today 5% easier?"],
    desc: "Short prompts for getting thoughts out of your head.",
  },
];

const EXERCISE_SECONDS = 120;

export default function Cbt() {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [journal, setJournal] = useState("");
  const [remaining, setRemaining] = useState(EXERCISE_SECONDS);
  const [running, setRunning] = useState(false);
  const exercise = exercises[active];

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, remaining]);

  useEffect(() => {
    if (!running || remaining <= 0 || exercise.steps.length === 0) return;
    const stepLength = EXERCISE_SECONDS / exercise.steps.length;
    setStep(Math.min(exercise.steps.length - 1, Math.floor((EXERCISE_SECONDS - remaining) / stepLength)));
  }, [remaining, running, exercise.steps.length]);

  function selectExercise(index: number) {
    setActive(index);
    setStep(0);
    setRemaining(EXERCISE_SECONDS);
    setRunning(false);
  }

  function reset() {
    setStep(0);
    setRemaining(EXERCISE_SECONDS);
    setRunning(false);
  }

  function formatTime(seconds: number) {
    return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  }

  return (
    <Shell>
      <div>
        <p className="text-sm font-medium text-black/60">2-minute reset</p>
        <h1 className="mt-2 text-3xl font-black">Two minutes can be enough.</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-black/65">These are short self-care exercises, not a replacement for professional care.</p>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {exercises.map((item, index) => {
            const Icon = item.icon;
            return <button type="button" key={item.title} onClick={() => selectExercise(index)} aria-pressed={index === active} className={`rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-4 focus:ring-mint ${index === active ? "border-sage bg-mint" : "border-black/10 bg-white hover:border-sage"}`}>
              <Icon size={20} className="text-ink" />
              <h2 className="mt-5 font-bold text-ink">{item.title}</h2>
              <p className="mt-1 text-xs font-medium text-black/60">{item.time}</p>
            </button>;
          })}
        </div>
        <Card className="mt-5 max-w-2xl">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-medium text-black/60">{exercise.time} guided reset</p><h2 className="mt-1 text-2xl font-black text-ink">{exercise.title}</h2></div>
            <TimerReset className="text-sage" />
          </div>
          <p className="mt-3 text-sm leading-6 text-black/65">{exercise.desc}</p>
          <div className="mt-6 rounded-2xl bg-cream p-6 text-center">
            <p className="text-4xl font-black tracking-wide text-ink" aria-live="polite">{formatTime(remaining)}</p>
            <div className="mx-auto mt-4 h-2 max-w-sm overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-sage transition-all" style={{ width: `${((EXERCISE_SECONDS - remaining) / EXERCISE_SECONDS) * 100}%` }} /></div>
            <p className="mt-5 text-xs font-medium text-black/60">Step {step + 1} of {exercise.steps.length}</p>
            <p className="mt-3 text-xl font-bold text-ink">{remaining === 0 ? "You completed this reset." : exercise.steps[step]}</p>
          </div>
          {active === 2 && <textarea value={journal} onChange={(event) => setJournal(event.target.value)} maxLength={2000} className="mt-4 min-h-28 w-full rounded-xl border border-black/10 bg-white p-3 text-sm text-ink outline-none placeholder:text-black/45 focus:border-sage focus:ring-4 focus:ring-mint" placeholder="Write privately on this device..." aria-label="Private journal" />}
          <div className="mt-5 flex gap-3">
            <Button className="flex-1" onClick={() => setRunning((value) => !value)} disabled={remaining === 0}>{running ? <Pause size={16} /> : <Play size={16} />}{running ? "Pause" : "Start reset"}</Button>
            <Button variant="secondary" onClick={reset} aria-label="Restart reset"><RotateCcw size={16} /> Restart</Button>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
