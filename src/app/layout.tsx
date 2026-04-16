import { Suspense } from "react";
import localFont from "next/font/local";

// PROJECT IMPORTS
import ProviderWraper from "@/redux/ProviderWraper";
import { Loader } from "@/components/ui-components";
import { AuthProvider } from "@/contexts/AuthContext";

// ASSETS
import "./globals.css";

// META EXPORT
export const metadata = {
  title: `${process.env.TITLE}`,
  description: `${process.env.DESCRIPTION}`,
};

// FONT-FAMILY SETUP
const noto = localFont({
  src: [
    {
      path: "../../public/assets/fonts/NotoSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/NotoSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/NotoSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/NotoSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/NotoSans-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/NotoSans-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  // variable: "--font-noto",
  variable: "--font-inter",

});

/* ============================== MAIN LAYOUT ============================== */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${noto.variable} font-sans`}>
      <body>
        <Suspense fallback={<Loader />}>
          <ProviderWraper>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ProviderWraper>
        </Suspense>
      </body>
    </html>
  );
}
