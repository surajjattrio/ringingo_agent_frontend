"use client";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useCallStatistic } from "@/redux/slice/phoneSlice";

// ASSETS
const call_total = "/assets/icons/call/call-total.svg";
const call_inbond = "/assets/icons/call/call-inbond.svg";
const call_outbound = "/assets/icons/call/call-outbound.svg";
// const call_average = "/assets/icons/call/call-average.svg";
const callGreen = "/assets/icons/green/call.svg";
const call_talktime = "/assets/icons/call/call-talktime.svg";

/* ============================== STATIC DETAILS PAGE ============================== */

const StaticDetails = () => {
    const callStatisticDetails = useCallStatistic();

    return (
        <>
            <div className="grid grid-cols-5 gap-4 2lg:grid-cols-3 lg:grid-cols-3 smd:grid-cols-2">
                <div className="flex items-center 3xl:px-2 3xl:py-[8px] px-1.5 py-[4px] border border-dark-800 bg-white rounded-lg drop-shadow-lg">
                    <div className="3xl:p-2 p-1.5 bg-[#F5C61D] bg-opacity-20 rounded-lg">
                        <div className="relative 3xl:h-[24px] 3xl:w-[24px] w-[18px] h-[18px]">
                            <Legacy src={call_total} alt="total-call" layout="fill" />
                        </div>
                    </div>
                    <div className="pl-1.5 flex flex-col">
                        <span className="font-normal 3xl:text-xs text-[11px] text-txt-primary">
                            Total Calls
                        </span>
                        <span className="text-heading font-bold 3xl:text-sm text-xs">
                            {callStatisticDetails?.totalCalls || 0}
                        </span>
                    </div>
                </div>
                <div className="flex items-center px-2 py-[8px] border border-dark-800 bg-white rounded-lg drop-shadow-lg">
                    <div className="3xl:p-2 p-1.5 bg-[#33F48A] bg-opacity-20 rounded-lg">
                        <div className="relative 3xl:h-[24px] 3xl:w-[24px] w-[18px] h-[18px]">
                            <Legacy src={call_outbound} alt="call_outbound" layout="fill" />
                        </div>
                    </div>
                    <div className="pl-1.5 flex flex-col">
                        <span className="font-normal 3xl:text-xs text-[11px] text-txt-primary">
                            Outbound Calls
                        </span>
                        <span className="text-heading font-bold 3xl:text-sm text-xs">
                            {callStatisticDetails?.outboundCalls || 0}
                        </span>
                    </div>
                </div>
                <div className="flex items-center px-2 py-[8px] border border-dark-800 bg-white rounded-lg drop-shadow-lg">
                    <div className="3xl:p-2 p-1.5 bg-[#2C99FE] bg-opacity-20 rounded-lg">
                        <div className="relative 3xl:h-[24px] 3xl:w-[24px] w-[18px] h-[18px]">
                            <Legacy src={call_inbond} alt="call_inbond" layout="fill" />
                        </div>
                    </div>
                    <div className="pl-1.5 flex flex-col">
                        <span className="font-normal 3xl:text-xs text-[11px] text-txt-primary">
                            Inbound Calls
                        </span>
                        <span className="text-heading font-bold 3xl:text-sm text-xs">
                            {callStatisticDetails?.inboundCalls || 0}
                        </span>
                    </div>
                </div>
                <div className="flex items-center px-2 py-[8px] border border-dark-800 bg-white rounded-lg drop-shadow-lg">
                    <div className="3xl:p-2 p-1.5 bg-[#88d6b2] bg-opacity-20 rounded-lg">
                        <div className="relative 3xl:h-[24px] 3xl:w-[24px] w-[18px] h-[18px]">
                            <Legacy src={callGreen} alt="callGreen" layout="fill" />
                        </div>
                    </div>
                    <div className="pl-1.5 flex flex-col">
                        <span className="font-normal 3xl:text-xs text-[11px] text-txt-primary">
                            Answer calls
                        </span>
                        <span className="text-heading font-bold 3xl:text-sm text-xs">
                            {callStatisticDetails?.answeredCalls || 0}
                        </span>
                    </div>
                </div>
                <div className="flex items-center px-2 py-[8px] border border-dark-800 bg-white rounded-lg drop-shadow-lg">
                    <div className="3xl:p-2 p-1.5 bg-[#9D4ADE] bg-opacity-20 rounded-lg">
                        <div className="relative 3xl:h-[24px] 3xl:w-[24px] w-[18px] h-[18px]">
                            <Legacy src={call_talktime} alt="call_talktime" layout="fill" />
                        </div>
                    </div>
                    <div className="pl-1.5 flex flex-col">
                        <span className="font-normal 3xl:text-xs text-[11px] text-txt-primary">
                            Average Talktime
                        </span>
                        <span className="text-heading font-bold 3xl:text-sm text-xs">
                            {callStatisticDetails?.acd || 0}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StaticDetails;
