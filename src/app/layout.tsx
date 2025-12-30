import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { PermissionProvider } from "@/context/PermissionContext";
import ProgressProvider from "./ProgressProvider";
import Providers from "./Providers";
import PublicHeader from "@/components/header/PublicHeader";
import PublicFooter from "@/components/footer/PublicFooter";
import { getPublicSettings } from "@/modules/settings/public-api";

export async function generateMetadata() {
  const s = await getPublicSettings();

  // canonical base اگر معتبر بود
  let metadataBase: URL | undefined;
  try {
    if (s.canonicalBaseUrl) metadataBase = new URL(s.canonicalBaseUrl);
  } catch { }

  return {
    metadataBase,
    title: {
      default: s.defaultMetaTitle || s.storeName,
      template: `%s | ${s.storeName}`,
    },
    description: s.defaultMetaDescription || undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const s = await getPublicSettings();

  return (
    <html lang="fa" dir="rtl">
      <body className="dark:bg-gray-900">
        <Providers>
          <ThemeProvider>
            <AuthProvider>
              <PermissionProvider>
                <SidebarProvider>
                  <PublicHeader storeName={s.storeName} logoUrl={s.logoUrl} />
                  <ProgressProvider>{children}</ProgressProvider>
                  <PublicFooter settings={s} />
                </SidebarProvider>
              </PermissionProvider>
            </AuthProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
