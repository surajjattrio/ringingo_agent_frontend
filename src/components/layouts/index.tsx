// PROJECT IMPORTS
import { LAYOUT } from "@/config/constant";
import AuthGuard from "@/utils/route-guard/AuthGuard";
import GuestGuard from "@/utils/route-guard/GuestGuard";
import MainLayout from "./MainLayout";
import MinimalLayout from "./MinimalLayout";
import RoleGuard from "@/utils/route-guard/RoleGuard";

// TYPES
interface LayoutProps {
  variant?: "main" | "minimal";
  children: React.ReactNode;
}

/* ============================== LAYOUT ============================== */

const Layout = (porps: LayoutProps) => {
  const { variant = LAYOUT.main, children } = porps;
  switch (variant) {
    case LAYOUT.minimal:
      return (
        <GuestGuard>
          <MinimalLayout>{children}</MinimalLayout>
        </GuestGuard>
      );

    default:
      return (
        <AuthGuard>
          <RoleGuard>
            <MainLayout>{children}</MainLayout>
          </RoleGuard>
        </AuthGuard>
      );
  }
};

export default Layout;
