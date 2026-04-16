"use client";

import { ReactElement, useEffect } from "react";
import { useRouter } from "next/navigation";

// PROJECT IMPORTS
import { useAuth } from "@/contexts/hooks/useAuth";
import { Loader } from "@/components/ui-components";

/* ============================== AUTH GUARD ============================== */

const AuthGuard = ({ children }: { children: ReactElement | null }) => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return <Loader />;

  return <>{children}</>;
};
export default AuthGuard;
