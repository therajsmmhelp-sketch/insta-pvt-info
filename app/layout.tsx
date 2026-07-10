import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Instagram User Lookup Pro",
  description:
    "Search any public Instagram username and instantly explore every field returned by the API — followers, bio, business info, media stats and more, rendered automatically.",
  keywords: [
    "Instagram lookup",
    "Instagram user finder",
    "Instagram API",
    "Instagram info",
    "Instagram OSINT",
  ],
  authors: [{ name: "Instagram User Lookup Pro" }],
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08080c" },
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen text-slate-900 dark:text-slate-100 selection:bg-fuchsia-500/30">
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            className: "font-sans",
          }}
        />
      </body>
    </html>
  );
}
