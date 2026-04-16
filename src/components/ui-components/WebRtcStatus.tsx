"use client";
import React from "react";
import { useWebRtcStatus } from "@/redux/slice/commonSlice";

const WebRtcStatus = () => {
    const status = useWebRtcStatus();

    const getStatusColor = () => {
        switch (status) {
            case "CONNECTED":
                return "bg-green-500";
            case "CONNECTING":
                return "bg-yellow-500 animate-pulse";
            case "DISCONNECTED":
                return "bg-red-500";
            case "ERROR":
                return "bg-orange-600";
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
                return "text-green-600";
            case "CONNECTING":
                return "text-yellow-700";
            case "DISCONNECTED":
                return "text-red-600";
            case "ERROR":
                return "text-orange-700";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 transition-all duration-300">
            <div className="relative flex h-2.5 w-2.5">
                {status === "CONNECTING" && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${getStatusColor()}`}></span>
            </div>
            <span className={`text-xs font-semibold ${getTextColor()}`}>
                {getStatusText()}
            </span>
        </div>
    );
};

export default WebRtcStatus;
