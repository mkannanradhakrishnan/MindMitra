"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Card, Button } from "@/components/ui";
import { LockKeyhole, Bell, EyeOff, Trash2, LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { isDemoSession } from "@/lib/demo";

export default function Settings() {
  const [alias, setAlias] = useState("Loading...");
  const [reminders, setReminders] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setReminders(window.localStorage.getItem("mindmitra-reminders") === "on");
    if (isDemoSession()) {
      setAlias("Demo Student #LOCAL");
      return;
    }
    async function loadProfile() {
      const { data: { user } } = await supabaseBrowser().auth.getUser();
      if (!user) return;
      const { data } = await supabaseBrowser().from("profiles").select("peer_alias").eq("id", user.id).maybeSingle();
      if (data?.peer_alias) setAlias(data.peer_alias);
    }
    void loadProfile();
  }, []);

  function toggleReminders() {
    const next = !reminders;
    setReminders(next);
    window.localStorage.setItem("mindmitra-reminders", next ? "on" : "off");
    setStatus(next ? "Reminder preference enabled on this device." : "Reminder preference disabled.");
  }

  async function deleteData() {
    if (!window.confirm("Delete all of your check-ins and peer-support history? This cannot be undone.")) return;
    if (isDemoSession()) {
      setStatus("Demo data is local only; there is no Supabase wellbeing data to delete.");
      return;
    }
    setBusy(true); setStatus("");
    const client = supabaseBrowser();
    const { data: { user } } = await client.auth.getUser();
    if (!user) { setStatus("Your session has expired. Please sign in again."); setBusy(false); return; }
    const { error: checkInError } = await client.from("check_ins").delete().eq("user_id", user.id);
    const { error: roomError } = await client.from("peer_rooms").delete().eq("student_id", user.id);
    setStatus(checkInError || roomError ? "We could not delete all data. Please try again." : "Your wellbeing and peer-support history was deleted.");
    setBusy(false);
  }

  async function logout() {
    if (isDemoSession()) await fetch("/auth/demo/logout");
    else await supabaseBrowser().auth.signOut();
    window.location.assign("/auth");
  }

  return <Shell><div className="max-w-3xl"><h1 className="text-3xl font-black">Privacy & settings</h1><p className="mt-2 text-sm text-black/55">Keep your support experience under your control.</p>{status && <p role="status" className="mt-5 rounded-xl bg-mint p-3 text-sm">{status}</p>}<div className="mt-7 space-y-4"><Setting icon={LockKeyhole} title="Private wellbeing history" text="Only your signed-in account can read your check-ins." action={<span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold">RLS protected</span>} /><Setting icon={Bell} title="Support reminders" text="This preference stays on this device; MindMitra does not send reminders yet." action={<Button variant="secondary" onClick={toggleReminders}>{reminders ? "Enabled" : "Enable"}</Button>} /><Setting icon={EyeOff} title="Anonymous peer identity" text="Your real name is not shown in peer chat." action={<span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold">{alias}</span>} /><Setting icon={Trash2} title="Delete wellbeing data" text="Remove your check-ins and peer-support history from this app." action={<Button variant="danger" onClick={deleteData} disabled={busy}>{busy ? "Deleting..." : "Delete data"}</Button>} /><Setting icon={LogOut} title="Sign out" text="End this session on the current device." action={<Button variant="secondary" onClick={logout}>Sign out</Button>} /></div></div></Shell>;
}
function Setting({ icon: Icon, title, text, action }: { icon: React.ComponentType<{ size?: number }>; title: string; text: string; action: React.ReactNode }) { return <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><div className="h-fit rounded-xl bg-cream p-3"><Icon size={19} /></div><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-black/50">{text}</p></div></div>{action}</Card>; }
