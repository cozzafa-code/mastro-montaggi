import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "MASTRO MONTAGGI",
  description: "App montatori — MASTRO Suite",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "MASTRO" },
};

export const viewport: Viewport = {
  themeColor: "#1A1A1C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ margin:0, padding:0, background:"#1A1A1C" }}>
        {children}
      </body>
    </html>
  );
}
