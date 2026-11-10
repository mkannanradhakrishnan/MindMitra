export const DEMO_USER_ID = "demo-user-local";

export function isDemoSession() {
  return typeof document !== "undefined" && document.cookie.split(";").some((cookie) => cookie.trim() === "mindmitra_demo=1");
}
