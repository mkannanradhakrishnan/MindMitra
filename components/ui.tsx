import { cn } from "@/lib/utils";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
} from "react";
export function Button({
  className = "",
  variant = "primary",
  ...p
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[.98] disabled:opacity-50",
        variant === "primary" && "bg-ink text-white hover:opacity-90",
        variant === "secondary" && "bg-mint text-ink hover:bg-[#d0f0df]",
        variant === "ghost" && "hover:bg-black/5",
        variant === "danger" && "bg-coral text-white",
        className,
      )}
      {...p}
    />
  );
}
export function Card({ className = "", ...p }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/5 bg-white p-5 shadow-soft",
        className,
      )}
      {...p}
    />
  );
}
export function Input({
  className = "",
  ...p
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-sage focus:ring-4 focus:ring-mint",
        className,
      )}
      {...p}
    />
  );
}
