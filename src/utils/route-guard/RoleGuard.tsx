"use client";
import { ReactElement, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// PROJECT IMPORTS
import Loader from "@/components/ui-components/Loader";
import { useAuth } from "@/contexts/hooks/useAuth";

/* ============================== ROLE GUARD ============================== */

const RoleGuard = ({ children }: { children: ReactElement | null }) => {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const array = pathname.split("/");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useLayoutEffect(() => {
        if (!user?.urls?.includes("/" + array[1] + "/" + array[2])) {
            if (user?.isPbx === true) {
                router.push("/pbx/phone");
            } else if (user?.isPbx === false) {
                router.push("/call-center/phone");
            } else {
                router.push("/login");
            }
        }
        setIsLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (isLoading) return <Loader />;

    return <>{children}</>;
};

export default RoleGuard;
