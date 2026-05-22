"use client";
import React from "react";
import { useWebRtcStatus } from "@/redux/slice/commonSlice";

const WebRtcStatus = () => {
    const status = useWebRtcStatus();

    const getStatusColor = () => {
        switch (status) {
            case "CONNECTED":
                return "bg-emerald-500";
            case "CONNECTING":
                return "bg-amber-500 animate-pulse";
            case "DISCONNECTED":
                return "bg-red-500";
            case "ERROR":
                return "bg-rose-600";
            default:
                return "bg-gray-400";
        }
    };

    const getStatusText = () => {
        switch (status) {
            case "CONNECTED":
                return "WebRTC: Connected";
            case "CONNECTING":
                return "WebRTC: Connecting";
            case "DISCONNECTED":
                return "WebRTC: Disconnected";
            case "ERROR":
                return "WebRTC: Error";
            default:
                return `WebRTC: ${status}`;
        }
    };

    const getTextColor = () => {
        switch (status) {
            case "CONNECTED":
                return "text-emerald-500";
            case "CONNECTING":
                return "text-amber-600";
            case "DISCONNECTED":
                return "text-red-500";
            case "ERROR":
                return "text-rose-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span
                className={`h-2 w-2 rounded-full ${getStatusColor()}`}
            />
            <span className="text-xs text-[#6B7280] font-medium">WebRTC:</span>
            <span
                className={`text-[10px] font-bold uppercase ${getTextColor()}`}
            >
                {status || "Disconnected"}
            </span>
        </div>
    );
};

export default WebRtcStatus;
