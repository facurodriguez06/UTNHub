import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Preloader } from "@/components/Preloader";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

// Lazy load non-critical components to dramatically reduce First Load JS & TBT
const InteractiveBackground = dynamic(() => import("@/components/InteractiveBackground").then(mod => mod.InteractiveBackground));
const CustomCursor = dynamic(() => import("@/components/CustomCursor").then(mod => mod.CustomCursor));
const AnnouncementModal = dynamic(() => import("@/components/AnnouncementModal").then(mod => mod.AnnouncementModal));
const ImagePopupModal = dynamic(() => import("@/components/ImagePopupModal").then(mod => mod.ImagePopupModal));
const MetricsTracker = dynamic(() => import("@/components/MetricsTracker").then(mod => mod.MetricsTracker));
const AntiDevtools = dynamic(() => import("@/components/AntiDevtools").then(mod => mod.AntiDevtools));

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFBF7",
};

export const metadata: Metadata = {
  title: "UTNHub",
  description: "Relajá tu semestre. La comunidad definitiva de resúmenes.",
  openGraph: {
    title: "UTNHub",
    description: "Relajá tu semestre. La comunidad definitiva de resúmenes.",
    type: "website",
    url: "https://www.utnhub.com",
    locale: "es_AR",
    siteName: "UTNHub",
  },
  icons: {
    icon: "/iconNeo-v2.png",
    apple: "/iconNeo-v2.png",
  },
};

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${playfair.variable} min-h-screen flex flex-col bg-[#F7F5F0] text-[#18181B] w-full m-0 p-0 relative font-sans`}>
        <AntiDevtools />
        <ToastProvider>
          <MetricsTracker />
          <Preloader />
          <CustomCursor />
          <AnnouncementModal />
          <ImagePopupModal />
          <AuthProvider>
            <InteractiveBackground />
            <Header />
            <main className="relative z-10 flex-1 flex flex-col w-full overflow-x-clip">{children}</main>

            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
