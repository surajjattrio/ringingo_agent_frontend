"use client";
import { ReactElement, useEffect } from "react";
import { useRouter } from "next/navigation";

// PROJECT IMPORTS
import { useAuth } from "@/contexts/hooks/useAuth";
import { Loader } from "@/components/ui-components";

/* ============================== GUEST GUARD ============================== */

const GuestGuard = ({ children }: { children: ReactElement | null }) => {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push(user?.isPbx ? "/pbx/phone" : "call-center/phone");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, router]);

  if (isLoggedIn) return <Loader />;

  return <>{children}</>;
};

export default GuestGuard;
