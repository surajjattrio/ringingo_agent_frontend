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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 transition-all duration-300">
            <div className="relative flex h-2.5 w-2.5">
                <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"
                        } opacity-75`}
                ></span>
                <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? "bg-green-500" : "bg-red-500"
                        }`}
                ></span>
            </div>
            <div className="flex items-center gap-1.5">
                <span
                    className={`text-xs font-semibold ${isOnline ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {isOnline ? "Network: Online" : "Network: Offline"}
                </span>
                {isOnline && connectionType && (
                    <>
                        <div className="w-[1px] h-3 bg-gray-200" />
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 rounded uppercase">
                            {connectionType}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

export default NetworkStatus;
