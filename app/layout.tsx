import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "MindMitra — Student Wellbeing",
  description: "Private wellbeing check-ins and early peer support for students.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
