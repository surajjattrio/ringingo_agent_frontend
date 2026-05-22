"use client";
import React from "react";
import {
    useStatus,
    useCallScreen,
    useIsShowCallDuration,
    useIsCallHangUp,
} from "@/redux/slice/commonSlice";
import { useCallResume } from "@/redux/slice/campaignSlice";

const AgentStatus = () => {
    const status = useStatus();
    const callScreen = useCallScreen();
    const isShowCallDuration = useIsShowCallDuration();
    const isCallHangUp = useIsCallHangUp();
    const isCallResume = useCallResume();

    const getAgentState = (): "BREAK" | "ACW" | "ONGOING CALL" | "PAUSED" | "IDLE" => {
        if (status === "1" || status === "3") {
            return "BREAK";
        }
        if (isCallHangUp) {
            return "ACW";
        }
        if (callScreen === "LIVE" || isShowCallDuration || callScreen === "INCOMING") {
            return "ONGOING CALL";
        }
        if (isCallResume) {
            return "PAUSED";
        }
        return "IDLE";
    };

    const agentState = getAgentState();

    const getStatusColor = () => {
        switch (agentState) {
            case "ONGOING CALL":
                return "bg-rose-500 animate-pulse";
            case "ACW":
                return "bg-amber-500 animate-pulse";
            case "BREAK":
                return "bg-orange-500";
            case "PAUSED":
                return "bg-rose-500";
            case "IDLE":
            default:
                return "bg-emerald-500";
        }
    };

    const getTextColor = () => {
        switch (agentState) {
            case "ONGOING CALL":
                return "text-rose-500";
            case "ACW":
                return "text-amber-500";
            case "BREAK":
                return "text-orange-500";
            case "PAUSED":
                return "text-rose-500";
            case "IDLE":
            default:
                return "text-emerald-500";
        }
    };

    const getStatusLabelText = () => {
        switch (agentState) {
            case "ONGOING CALL":
                return "Ongoing Call";
            case "ACW":
                return "ACW";
            case "BREAK":
                return "Break";
            case "PAUSED":
                return "Paused";
            case "IDLE":
            default:
                return "Idle";
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span
                className={`h-2 w-2 rounded-full ${getStatusColor()}`}
            />
            <span className="text-xs text-[#6B7280] font-medium">Status:</span>
            <span
                className={`text-[10px] font-bold uppercase ${getTextColor()}`}
            >
                {getStatusLabelText()}
            </span>
        </div>
    );
};

export default AgentStatus;
