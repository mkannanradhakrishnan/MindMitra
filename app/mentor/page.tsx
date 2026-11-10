"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Card } from "@/components/ui";
import { MessageCircle, UserRound, Check, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import type { PeerRoom } from "@/lib/database.types";

type RoomWithAlias = PeerRoom & { alias: string };
export default function Mentor() {
  const [rooms, setRooms] = useState<RoomWithAlias[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function loadRooms() {
    const client = supabaseBrowser();
    const { data, error: roomError } = await client.from("peer_rooms").select("*").or("status.eq.waiting,status.eq.active").order("created_at", { ascending: true });
    if (roomError) { setError("We could not load the mentor queue."); return; }
    const rows = (data ?? []) as PeerRoom[];
    const aliases = await Promise.all(rows.map(async (room) => {
      const { data: profile } = await client.from("profiles").select("peer_alias").eq("id", room.student_id).maybeSingle();
      return [room.id, profile?.peer_alias ?? "Anonymous student"] as const;
    }));
    const aliasMap = new Map(aliases);
    setRooms(rows.map((room) => ({ ...room, alias: aliasMap.get(room.id) ?? "Anonymous student" })));
  }
  useEffect(() => { void loadRooms(); }, []);
  async function claim(roomId: string) {
    setBusy(roomId); setError("");
    const { data, error: claimError } = await supabaseBrowser().rpc("claim_peer_room", { requested_room_id: roomId });
    if (claimError || !data?.length) setError("That request was already claimed or is unavailable.");
    await loadRooms(); setBusy("");
  }
  async function close(room: RoomWithAlias) {
    setBusy(room.id); setError("");
    const { error: closeError } = await supabaseBrowser().rpc("close_peer_room", { requested_room_id: room.id });
    if (closeError) setError("We could not close this conversation.");
    await loadRooms(); setBusy("");
  }
  return <Shell><div className="max-w-4xl"><p className="text-sm text-black/45">Mentor workspace</p><h1 className="mt-2 text-3xl font-black">Peer support queue</h1><p className="mt-2 text-sm text-black/55">Use anonymous aliases only. You are a trained peer supporter, not a therapist.</p>{error && <p role="alert" className="mt-5 rounded-xl bg-[#fff0ec] p-3 text-sm text-coral">{error}</p>}<div className="mt-7 space-y-4">{rooms.length === 0 ? <Card>No waiting or active support requests.</Card> : rooms.map((room) => <Card key={room.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-mint p-3"><UserRound size={19} /></div><div><p className="font-bold">{room.alias}</p><p className="text-xs text-black/50">{room.status === "waiting" ? "Waiting for a mentor" : "Active conversation"}</p></div></div><div className="flex gap-2">{room.status === "waiting" && <Button onClick={() => void claim(room.id)} disabled={busy === room.id}><Check size={15} /> {busy === room.id ? "Accepting..." : "Accept"}</Button>}{room.status === "active" && <><a href="/chat"><Button variant="secondary"><MessageCircle size={15} /> Open chat</Button></a><Button variant="danger" onClick={() => void close(room)} disabled={busy === room.id}><X size={15} /> Close</Button></>}</div></Card>)}</div></div></Shell>;
}
