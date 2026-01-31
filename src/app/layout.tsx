import "./globals.css";
import { Suspense } from "react";
import PublicShell from "./PublicShell.server";
import ClientProviders from "./ClientProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <ClientProviders>
          <Suspense fallback={<div>{children}</div>}>
            <PublicShell>{children}</PublicShell>
          </Suspense>
        </ClientProviders>
      </body>
    </html>
  );
}
