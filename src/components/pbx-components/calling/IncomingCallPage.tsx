"use client";
import Legacy from "next/legacy/image";

// ASSETS
const call_end = "/assets/icons/white/call_end.svg";
const call = "/assets/icons/white/call_white.svg";

// TYPES
interface CallingPageProps {
    hangupCall: any;
    receiveCall: any;
    callerNumber: string;
    callerName: string;
}

/* ============================== INCOMING CALL PAGE ============================== */

const IncomingCallPage = (props: CallingPageProps) => {
    const { hangupCall, receiveCall, callerNumber, callerName } = props;

    return (
        <>
            <div className="3xl:px-8 px-6 flex flex-col justify-between 3xl:h-[90%] h-[92%]">
                <div className="py-6 flex justify-center">
                    <div className="flex flex-col items-center">
                        <div className="3xl:h-16 3xl:w-16 h-14 w-14 bg-green-200 rounded-full flex items-center justify-center">
                            <span className="text-lg text-heading font-bold">
                                {callerName
                                    ? callerName.slice(0, 1).toUpperCase()
                                    : callerNumber.slice(0, 1).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex flex-col items-center pt-3">
                            <span className="3xl:text-xs text-[11px] text-heading">
                                Incoming Call From
                            </span>
                            {callerName ? (
                                <span className="3xl:text-sm text-xs text-primary-green font-bold">
                                    {callerName}
                                </span>
                            ) : null}
                            <span
                                className={`text-blue-700 ${callerName ? "3xl:text-xs text-[11px] font-medium" : "3xl:text-sm text-xs font-bold"
                                    }`}
                            >
                                {callerNumber}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center 3xl:gap-16 gap-12 py-8">
                    <div
                        className="bg-error 3xl:w-12 3xl:h-12 w-10 h-10 drop-shadow-sm flex justify-center items-center rounded-full hover:bg-opacity-80 cursor-pointer"
                        onClick={() => {
                            hangupCall();
                        }}
                    >
                        <div className="relative w-[18px] h-[18px] 3xl:w-[24px] 3xl:h-[24px]">
                            <Legacy src={call_end} alt="call_end" layout="fill" />
                        </div>
                    </div>
                    <div
                        className="bg-primary-green 3xl:w-12 3xl:h-12 w-10 h-10 drop-shadow-sm flex justify-center items-center rounded-full hover:bg-opacity-80 cursor-pointer"
                        onClick={() => {
                            receiveCall();
                        }}
                    >
                        <div className="relative w-[18px] h-[18px] 3xl:w-[24px] 3xl:h-[24px]">
                            <Legacy src={call} alt="call" layout="fill" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default IncomingCallPage;
