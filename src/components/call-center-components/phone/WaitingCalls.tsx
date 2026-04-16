"use client";
import React, { useEffect } from "react";
import Legacy from "next/legacy/image";
import { useAppDispatch } from "@/redux/hooks";
import { getCallWaitingCount, useWaitingCount } from "@/redux/slice/chatSlice";

// ASSETS
const call_inbond = "/assets/icons/call/call-inbond.svg";
const call_outbound = "/assets/icons/call/call-outbound.svg";

/* ============================== WAITING CALLS BOX ============================== */

let interval: any;

const WaitingCalls = () => {
  const dispatch = useAppDispatch();
  const waitingCount = useWaitingCount();

  useEffect(() => {
    interval = setInterval(() => {
      dispatch(getCallWaitingCount()).unwrap();
    }, 10 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="h-[17vh] rounded-[10px]">
        <div className="bg-layout 3xl:px-6 3xl:py-2.5 py-1.5 px-3 h-[5.7vh] flex">
          <span className="3xl:text-base text-xs text-heading font-bold flex items-center">
            Waiting Calls
          </span>
        </div>
<div className="flex flex-row gap-3 w-full pt-3">
  {/* Outbound Call - Left */}
  <div className="flex items-center border border-dark-800 bg-white rounded-lg drop-shadow-lg h-[9vh] w-full">
    <div className="3xl:p-2 p-1.5 bg-[#33F48A] bg-opacity-20 rounded-lg h-full flex items-center w-[35%] justify-center">
      <div className="relative 3xl:h-[24px] 3xl:w-[24px] 5xl:h-[24px] 5xl:w-[24px] w-[18px] h-[18px]">
        <Legacy src={call_outbound} alt="call_outbound" layout="fill" />
        <span className="absolute top-6 left-1/2 -translate-x-1/2 5xl:text-[13px] 4xl:text-[11px] 3xl:text-[10px] 2xl:text-[9px] xl:text-[8px] text-[7px] font-bold text-black leading-none">
          Outbound
        </span>
      </div>
    </div>
    <div className="pl-4 flex flex-col">
      <span className="text-heading 5xl:text-[25px] 4xl:text-[23px] 3xl:text-[22px] 2xl:text-[21px] xl:text-[20px] text-[19px]">
       {waitingCount?.outbound_count ?? 0}
      </span>
    </div>
  </div>

  {/* Inbound Call - Right */}
  <div className="flex items-center border border-dark-800 bg-white rounded-lg drop-shadow-lg h-[9vh] w-full">
    <div className="3xl:p-2 p-1.5 bg-[#2C99FE] bg-opacity-20 rounded-lg h-full flex items-center w-[35%] justify-center">
      <div className="relative 3xl:h-[24px] 3xl:w-[24px] w-[18px] h-[18px]">
        <Legacy src={call_inbond} alt="call_inbond" layout="fill" />
        <span className="absolute top-6 left-1/2 -translate-x-1/2 5xl:text-[13px] 4xl:text-[11px] 3xl:text-[10px] 2xl:text-[9px] xl:text-[8px] text-[7px] font-bold text-black leading-none">
          Inbound
        </span>
      </div>
    </div>
    <div className="pl-4 flex flex-col">
      <span className="text-heading 5xl:text-[25px] 4xl:text-[23px] 3xl:text-[22px] 2xl:text-[21px] xl:text-[20px] text-[19px]">
          {waitingCount?.inbound_count ?? 0}
      </span>
    </div>
  </div>
</div>


      </div>
    </>
  );
};

export default WaitingCalls;

