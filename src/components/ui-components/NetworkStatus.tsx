"use client";
import React, { useEffect, useState, useRef } from "react";
import { Success, Danger, Warning } from "@/redux/services/toasterService";

const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [connectionType, setConnectionType] = useState<string>("");
    const lastEffectiveType = useRef<string>("");

    useEffect(() => {

        const updateConnectionInfo = () => {
            if (typeof navigator === "undefined") return;
            setIsOnline(navigator.onLine);
            const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
            if (connection) {
                const currentType = connection.effectiveType || "";
                setConnectionType(currentType.toUpperCase());

                // Check for slow network (3g or below)
                const slowTypes = ["slow-2g", "2g", "3g"];
                if (navigator.onLine && currentType && slowTypes.includes(currentType)) {
                    // Only show alert if the connection type changed to a slow one
                    if (lastEffectiveType.current !== currentType) {
                        Warning(`Slow network detected (${currentType.toUpperCase()}). Performance might be affected.`);
                    }
                }
                lastEffectiveType.current = currentType;
            }
        };

        updateConnectionInfo();

        const handleOnline = () => {
            setIsOnline(true);
            Success("You are back online!");
            updateConnectionInfo();
        };
        const handleOffline = () => {
            setIsOnline(false);
            setConnectionType("");
            Danger("Network connection lost. Please check your internet.");
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (connection) {
            connection.addEventListener("change", updateConnectionInfo);
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            if (connection) {
                connection.removeEventListener("change", updateConnectionInfo);
            }
        };
    }, []);


    return (
        <div className="flex items-center gap-2">
            <span
                className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <span className="text-xs text-[#6B7280] font-medium">Network:</span>
            <span
                className={`text-[10px] font-bold uppercase ${isOnline ? "text-emerald-500" : "text-red-500"}`}
            >
                {isOnline ? "Online" : "Offline"}
            </span>
            {isOnline && connectionType && (
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 rounded uppercase">
                    {connectionType}
                </span>
            )}
        </div>
    );
};

export default NetworkStatus;
