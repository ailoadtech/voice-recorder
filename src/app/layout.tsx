import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { MonitoringConsent } from "@/components/MonitoringConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/Toast";
import { AppProvider } from "@/contexts/AppContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Intelligence App",
  description: "Desktop app for voice recording, transcription, and AI enrichment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors">
        <ErrorBoundary>
          <AppProvider>
            <MonitoringConsent />
            <Navigation />
            {children}
            <ToastContainer />
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
