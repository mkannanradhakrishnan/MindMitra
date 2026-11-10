"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Button, Card } from "@/components/ui";
import { Flag, MessageCircle, Send, ShieldCheck, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import type { PeerMessage, PeerRoom } from "@/lib/database.types";
import { DEMO_USER_ID, isDemoSession } from "@/lib/demo";

const MAX_MESSAGE_LENGTH = 2000;
const BOT_ID = "mindmitra-local-support";
const CRISIS_MESSAGE =
  "I'm really glad you reached out. You deserve immediate support from a real person. Please use MindMitra's Urgent Help option or contact your local emergency/crisis support service. If you're in immediate danger, seek emergency help now.";

const responseRules: Array<{ keywords: string[]; response: string }> = [
  { keywords: ["kill myself", "suicide", "want to die", "hurt myself", "self harm", "end my life"], response: CRISIS_MESSAGE },
  { keywords: ["stress", "stressed", "pressure", "overwhelmed", "workload"], response: "That sounds like a lot to handle right now. You don't have to solve everything at once. Would you like to talk about what's causing the most pressure?" },
  { keywords: ["exam", "exams", "test", "studying", "study", "marks", "grades", "assignment"], response: "Academic pressure can feel overwhelming. Try breaking your work into one small task at a time. What's the biggest thing worrying you about your studies?" },
  { keywords: ["lonely", "alone", "isolated", "nobody", "no one"], response: "Feeling alone can be difficult, and I'm glad you reached out. You can talk here without judgment. What's been on your mind?" },
  { keywords: ["sleep", "sleeping", "insomnia", "tired", "can't sleep", "cannot sleep"], response: "A busy mind can make it difficult to rest. Try taking a few slow breaths and giving yourself a quiet moment. What's making it difficult to sleep?" },
  { keywords: ["sad", "unhappy", "crying", "depressed", "hopeless"], response: "I'm sorry you're going through a difficult moment. You don't have to handle everything by yourself. Would you like to tell me a little more about what you're feeling?" },
  { keywords: ["anxiety", "anxious", "nervous", "panic", "worried", "worry"], response: "That sounds difficult. Let's slow things down for a moment. Take one slow breath and focus on what you can control right now. What is making you feel most anxious?" },
  { keywords: ["motivation", "motivated", "lazy", "useless", "can't focus", "cannot focus", "focus"], response: "It's okay to have days when motivation is low. Try starting with something very small rather than trying to finish everything at once. What are you trying to get done?" },
  { keywords: ["friend", "friendship", "relationship", "breakup", "boyfriend", "girlfriend", "family"], response: "Relationships can have a big impact on how we feel. I'm here to listen without judging. Tell me what happened if you'd like to talk about it." },
  { keywords: ["hi", "hello", "hey"], response: "Hey! I'm here to listen. What's been on your mind today?" },
];

function getLocalResponse(message: string) {
  const normalized = message.toLowerCase();
  return responseRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)))?.response ??
    "Thanks for sharing that with me. I'm here to listen. Can you tell me a little more about what's been going on?";
}

function createMessage(roomId: string, senderId: string, body: string): PeerMessage {
  return { id: `${senderId}-${Date.now()}-${Math.random().toString(36).slice(2)}`, room_id: roomId, sender_id: senderId, body, created_at: new Date().toISOString() };
}

export default function Chat() {
  const [room, setRoom] = useState<PeerRoom | null>(null);
  const [messages, setMessages] = useState<PeerMessage[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const client = supabaseBrowser();
    async function loadRoom() {
      if (isDemoSession()) {
        const now = new Date().toISOString();
        setUserId(DEMO_USER_ID);
        setRoom({ id: "demo-room-local", student_id: DEMO_USER_ID, mentor_id: "demo-mentor-local", status: "active", created_at: now, closed_at: null, updated_at: now });
        setMessages([createMessage("demo-room-local", "demo-mentor-local", "Welcome to the demo peer-support space. This conversation is local and is not sent to a mentor.")]);
        setLoading(false);
        return;
      }
      const { data: { user } } = await client.auth.getUser();
      if (!user) { setError("Your session has expired. Please sign in again."); setLoading(false); return; }
      setUserId(user.id);
      const { data, error: roomError } = await client.from("peer_rooms").select("*").or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`).in("status", ["waiting", "active"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (roomError) setError("We could not load your support request.");
      else if (data) setRoom(data as PeerRoom);
      setLoading(false);
    }
    void loadRoom();
    return () => { if (responseTimer.current) clearTimeout(responseTimer.current); };
  }, []);

  useEffect(() => {
    if (!room || room.status !== "active" || isDemoSession()) return;
    const client = supabaseBrowser();
    const roomId = room.id;
    let mounted = true;
    async function loadMessages() {
      const { data, error: messageError } = await client.from("peer_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true });
      if (messageError) setError("We could not load this conversation.");
      else if (mounted) setMessages((data ?? []) as PeerMessage[]);
    }
    void loadMessages();
    const channel = client.channel(`peer-room-${roomId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "peer_messages", filter: `room_id=eq.${roomId}` }, (payload) => {
      const next = payload.new as PeerMessage;
      setMessages((current) => current.some((message) => message.id === next.id) ? current : [...current, next]);
    }).subscribe((status) => { if (status === "CHANNEL_ERROR") setError("Live updates are unavailable. Refresh to check for new messages."); });
    return () => { mounted = false; void client.removeChannel(channel); };
  }, [room]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  async function requestSupport() {
    setBusy(true); setError("");
    const { data, error: insertError } = await supabaseBrowser().from("peer_rooms").insert({ student_id: userId }).select("*").single();
    if (insertError) setError("We could not create a support request. Please try again.");
    else setRoom(data as PeerRoom);
    setBusy(false);
  }

  async function addBotResponse(roomId: string, body: string) {
    setTyping(true);
    responseTimer.current = setTimeout(async () => {
      setMessages((current) => [...current, createMessage(roomId, BOT_ID, getLocalResponse(body))]);
      setTyping(false);
      setBusy(false);
    }, 700);
  }

  async function send() {
    const body = text.trim();
    if (!room || room.status !== "active" || !body || body.length > MAX_MESSAGE_LENGTH || busy) return;
    setBusy(true); setError(""); setText("");
    const temporary = createMessage(room.id, userId, body);
    setMessages((current) => [...current, temporary]);

    if (isDemoSession()) {
      await addBotResponse(room.id, body);
      return;
    }

    const { data, error: sendError } = await supabaseBrowser().from("peer_messages").insert({ room_id: room.id, sender_id: userId, body }).select("*").single();
    if (sendError) {
      setMessages((current) => current.filter((message) => message.id !== temporary.id));
      setError("Your message could not be sent.");
      setBusy(false);
      return;
    }
    setMessages((current) => current.map((message) => message.id === temporary.id ? data as PeerMessage : message));
    await addBotResponse(room.id, body);
  }

  async function closeRoom() {
    if (!room) return;
    if (isDemoSession()) { setRoom({ ...room, status: "closed", closed_at: new Date().toISOString() }); return; }
    const { data, error: closeError } = await supabaseBrowser().rpc("close_peer_room", { requested_room_id: room.id });
    if (closeError || !data?.length) setError("We could not close this conversation."); else setRoom({ ...room, status: "closed" });
  }

  async function report() {
    if (!room) return;
    const reason = window.prompt("What would you like the support team to review?")?.trim();
    if (!reason) return;
    if (isDemoSession()) { setError("Demo reports stay local and are not sent to the support team."); return; }
    const { error: reportError } = await supabaseBrowser().from("peer_reports").insert({ room_id: room.id, reporter_id: userId, reason: reason.slice(0, 500) });
    setError(reportError ? "We could not submit the report." : "Report submitted to the support team.");
  }

  return <Shell>
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-medium text-black/60">Anonymous peer support</p>
      <h1 className="mt-2 text-3xl font-black">You do not have to carry it alone.</h1>
      <p className="mt-2 text-sm leading-6 text-black/65">MindMitra provides supportive conversation, not medical diagnosis or emergency care.</p>
      {error && <p role="alert" className="mt-5 rounded-xl bg-[#fff0ec] p-3 text-sm font-medium text-[#a33a27]">{error}</p>}
      {loading ? <Card className="mt-6 text-black/65">Loading your support space...</Card> : !room || room.status === "closed" ? <Card className="mt-6 p-8 text-center"><MessageCircle className="mx-auto text-sage" size={34} /><h2 className="mt-4 text-xl font-black text-ink">Connect with a trained peer mentor</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/65">Your peer alias is used in support conversations. Mentors are trained peer supporters, not therapists.</p><Button className="mt-5" onClick={requestSupport} disabled={busy || !userId}>{busy ? "Requesting..." : "Get peer support"}</Button></Card> : <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.32fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-black/5 p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-mint"><MessageCircle size={18} /></div><div><p className="font-bold">Peer mentor</p><p className="text-xs text-emerald-600">Active support conversation</p></div></div><Button variant="ghost" onClick={closeRoom} aria-label="Close conversation"><X size={17} /></Button></div>
          <div className="h-[390px] space-y-3 overflow-y-auto bg-cream p-4">{messages.map((message) => <div key={message.id} className={`flex ${message.sender_id === userId ? "justify-end" : ""}`}><div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${message.sender_id === userId ? "bg-ink text-white" : "border border-black/10 bg-white text-ink"}`}>{message.body}</div></div>)}{typing && <div className="w-fit rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-black/60">MindMitra is typing...</div>}<div ref={bottom} /></div>
          <div className="border-t border-black/5 p-3"><div className="flex gap-2"><textarea value={text} maxLength={MAX_MESSAGE_LENGTH} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Write anonymously..." aria-label="Message" rows={2} className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-sage focus:ring-4 focus:ring-mint" /><Button onClick={() => void send()} disabled={busy || !text.trim()} aria-label="Send"><Send size={16} /></Button></div><p className="mt-2 text-right text-[11px] text-black/40">{text.length}/{MAX_MESSAGE_LENGTH}</p></div>
        </Card>
        <Card className="h-fit"><ShieldCheck className="text-sage" /><h2 className="mt-4 font-bold text-ink">Safety first</h2><p className="mt-2 text-xs leading-5 text-black/65">Do not share passwords, addresses, or identifying details. For immediate danger, use urgent help.</p><div className="mt-4 space-y-2"><Button variant="secondary" className="w-full" onClick={() => void report}><Flag size={15} /> Report conversation</Button><Link href="/crisis" className="block"><Button variant="danger" className="w-full">Urgent help</Button></Link></div></Card>
      </div>}
    </div>
  </Shell>;
}
