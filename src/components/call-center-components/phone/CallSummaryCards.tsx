"use client";
import React, { useEffect, useCallback } from "react";
import Legacy from "next/legacy/image";
import { useAppDispatch } from "@/redux/hooks";
import Icon from "@/components/ui-components/Icon";
import { getAgentTodayStats, useTodayStats } from "@/redux/slice/chatSlice";
import { useAuth } from "@/contexts/hooks/useAuth";

// ASSETS
const call_inbond = "/assets/icons/call/call-inbond.svg";
const call_outbound = "/assets/icons/call/call-outbound.svg";
const total_call = "/assets/icons/gray/call.svg";

/* ============================== CALL SUMMARY CARDS ============================== */

const CallSummaryCards = () => {
    const dispatch = useAppDispatch();
    const todayStats = useTodayStats();
    const { user } = useAuth();

    const fetchData = useCallback(() => {
        const detectedUuid = user?.agent_detail?.uuid;
        if (detectedUuid) {
            dispatch(getAgentTodayStats({
                uuid: detectedUuid,
                timezone: user?.timezone || "Asia/Kolkata"
            }));
        } else {
            console.warn("CallSummaryCards: No UUID detected in user object. Dispatch skipped.");
        }
    }, [user, dispatch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats = todayStats?.data || { total: 0, inbound: 0, outbound: 0 };

    return (
        <div className="h-full rounded-[10px]">
            <div className="bg-layout 3xl:px-6 3xl:py-2.5 py-1.5 px-3 h-[5.7vh] flex items-center justify-between">
                <span className="3xl:text-base text-xs text-heading font-bold flex items-center uppercase tracking-wider">
                    Today's Overview
                </span>
                <button
                    onClick={fetchData}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors group"
                    title="Refresh Stats"
                >
                    <Icon
                        name="Refresh"
                        width={16}
                        height={16}
                        className="text-heading group-active:rotate-180 transition-transform duration-300"
                    />
                </button>
            </div>
            <div className="flex flex-row gap-3 w-full pt-3">
                {/* Total Call */}
                <div className="flex items-center border border-dark-800 bg-white rounded-lg drop-shadow-lg h-[9vh] w-full">
                    <div className="3xl:p-2 p-1.5 bg-[#FFB020] bg-opacity-20 rounded-lg h-full flex items-center w-[35%] justify-center">
                        <div className="relative 3xl:h-[24px] 3xl:w-[24px] w-[18px] h-[18px]">
                            <Legacy src={total_call} alt="total_call" layout="fill" />
                            <span className="absolute top-6 left-1/2 -translate-x-1/2 5xl:text-[13px] 4xl:text-[11px] 3xl:text-[10px] 2xl:text-[9px] xl:text-[8px] text-[7px] font-bold text-black leading-none text-center">
                                Total
                            </span>
                        </div>
                    </div>
                    <div className="pl-4 flex flex-col">
                        <span className="text-heading 5xl:text-[23px] 4xl:text-[21px] 3xl:text-[20px] 2xl:text-[19px] xl:text-[18px] text-[17px] font-extrabold">
                            {stats.total}
                        </span>
                    </div>
                </div>

                {/* Outbound Call */}
                <div className="flex items-center border border-dark-800 bg-white rounded-lg drop-shadow-lg h-[9vh] w-full">
                    <div className="3xl:p-2 p-1.5 bg-[#33F48A] bg-opacity-20 rounded-lg h-full flex items-center w-[35%] justify-center">
                        <div className="relative 3xl:h-[24px] 3xl:w-[24px] w-[18px] h-[18px]">
                            <Legacy src={call_outbound} alt="call_outbound" layout="fill" />
                            <span className="absolute top-6 left-1/2 -translate-x-1/2 5xl:text-[13px] 4xl:text-[11px] 3xl:text-[10px] 2xl:text-[9px] xl:text-[8px] text-[7px] font-bold text-black leading-none text-center">
                                Outbound
                            </span>
                        </div>
                    </div>
                    <div className="pl-4 flex flex-col">
                        <span className="text-heading 5xl:text-[23px] 4xl:text-[21px] 3xl:text-[20px] 2xl:text-[19px] xl:text-[18px] text-[17px] font-extrabold">
                            {stats.outbound}
                        </span>
                    </div>
                </div>

                {/* Inbound Call */}
                <div className="flex items-center border border-dark-800 bg-white rounded-lg drop-shadow-lg h-[9vh] w-full">
                    <div className="3xl:p-2 p-1.5 bg-[#2C99FE] bg-opacity-20 rounded-lg h-full flex items-center w-[35%] justify-center">
                        <div className="relative 3xl:h-[24px] 3xl:w-[24px] w-[18px] h-[18px]">
                            <Legacy src={call_inbond} alt="call_inbond" layout="fill" />
                            <span className="absolute top-6 left-1/2 -translate-x-1/2 5xl:text-[13px] 4xl:text-[11px] 3xl:text-[10px] 2xl:text-[9px] xl:text-[8px] text-[7px] font-bold text-black leading-none text-center">
                                Inbound
                            </span>
                        </div>
                    </div>
                    <div className="pl-4 flex flex-col">
                        <span className="text-heading 5xl:text-[23px] 4xl:text-[21px] 3xl:text-[20px] 2xl:text-[19px] xl:text-[18px] text-[17px] font-extrabold">
                            {stats.inbound}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallSummaryCards;

