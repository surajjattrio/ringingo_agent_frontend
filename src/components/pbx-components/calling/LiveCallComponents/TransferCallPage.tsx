import Cookies from "js-cookie";
import Legacy from "next/legacy/image";
import { useState } from "react";

// ASSETS
const call_end = "/assets/icons/white/call_end.svg";
const unmute = "/assets/icons/microphone.svg";
const mute = "/assets/icons/mute-microphone.svg";
const speaker = "/assets/icons/speaker.svg";
const speaker_up = "/assets/icons/speaker-plus.svg";
const speaker_down = "/assets/icons/speaker-minus.svg";
const hangUp = "/assets/icons/hang-up.svg";
const leave3way = "/assets/icons/leave3way.svg";
const conference = "/assets/icons/conference.svg";
const lineHangup = "/assets/icons/line-hangup.svg";
const dtmf = "/assets/icons/dtmf.svg";
const swap = "/assets/icons/refresh.svg";

interface TransferCallPageProps {
    setPage: any;
    showVolume: boolean;
    setShowVolume: any;
    volume: any;
    setVolume: any;
    isMuted: boolean;
    hangupCall: any;
    unMuteMediaSession: any;
    muteMediaSession: any;
    confmuteMediaSession: any,
    confunMuteMediaSession :any,
    controlVolume: any;
    showConferenceBtn: boolean;
}

/* ============================== QUEUE CALL PAGE ============================== */

const TransferCallPage = (props: TransferCallPageProps) => {
    const {
        setPage,
        showVolume,
        setShowVolume,
        volume,
        setVolume,
        isMuted,
        hangupCall,
        unMuteMediaSession,
        muteMediaSession,
        confmuteMediaSession,
        confunMuteMediaSession,
        controlVolume,
        showConferenceBtn,
    } = props;

    const [muted1, setMuted1] = useState<boolean>(false);
    const [muted2, setMuted2] = useState<boolean>(false);

    const [swap1, setSwap1] = useState<boolean>(false);
    const [swap2, setSwap2] = useState<boolean>(false);

    return (
        <>
            <div className="flex flex-col justify-between h-full">
                <div>
                    {!showConferenceBtn ? (
                        <div className="pb-1">
                            <p className="text-[10px] font-medium">Conference Call</p>
                            <div className="flex justify-between items-center w-full pt-0.5 pb-2">
                                <div className="flex gap-2 items-center">
                                    <div className="h-6 w-6 rounded-full bg-secondary-v10 flex items-center justify-center">
                                        <span className="text-[11px] text-heading font-bold">
                                            {Cookies?.get("phone_number")
                                                ? Cookies.get("phone_number")?.slice(0, 1).toUpperCase()
                                                : ""}
                                        </span>
                                    </div>
                                    <label className="3xl:text-sm text-xs font-bold">
                                        {Cookies.get("phone_number")}
                                    </label>
                                </div>
                                <div
                                    onClick={() => {
                                        const phoneNumber = Cookies.get("phone_number");
                                        // confunMuteMediaSession(phoneNumber);
                                        muted1 ? confunMuteMediaSession(phoneNumber) : confmuteMediaSession(phoneNumber);
                                        setMuted1(!muted1);
                                    }}
                                >
                                    <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                                        <Legacy
                                            src={muted1 ? mute : unmute}
                                            alt="microphone"
                                            layout="fill"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full pb-1">
                                <div className="flex gap-2 items-center">
                                    <div className="h-6 w-6 rounded-full bg-secondary-v10 flex items-center justify-center">
                                        <span className="text-[11px] text-heading font-bold">
                                            {Cookies.get("secondCall")
                                                ? Cookies?.get("secondCall")?.slice(0, 1).toUpperCase()
                                                : ""}
                                        </span>
                                    </div>
                                    <label className="3xl:text-sm text-xs font-bold">
                                        {Cookies.get("secondCall")}
                                    </label>
                                </div>
                                <div
                                    onClick={() => {
                                        muted2 ? unMuteMediaSession() : muteMediaSession();
                                        setMuted2(!muted2);
                                    }}
                                >
                                    <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                                        <Legacy
                                            src={muted2 ? mute : unmute}
                                            alt="microphone"
                                            layout="fill"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-center w-full pb-0.5">
                                <div className="flex gap-2 items-center">
                                    <div className="h-6 w-6 rounded-full bg-secondary-v10 flex items-center justify-center">
                                        <span className="text-[11px] text-heading font-bold">
                                            {Cookies?.get("phone_number")
                                                ? Cookies.get("phone_number")?.slice(0, 1).toUpperCase()
                                                : ""}
                                        </span>
                                    </div>
                                    <label className="3xl:text-sm text-xs font-bold">
                                        {Cookies.get("phone_number")}
                                    </label>
                                </div>
                                <div
                                    onClick={() => {
                                        hangupCall("SWAP_CALL");
                                        setSwap1(!swap1);
                                    }}
                                >
                                    <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                                        <Legacy src={swap} alt="swap" layout="fill" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full pb-0.5">
                                <div className="flex gap-2 items-center">
                                    <div className="h-6 w-6 rounded-full bg-secondary-v10 flex items-center justify-center">
                                        <span className="text-[11px] text-heading font-bold">
                                            {Cookies.get("secondCall")
                                                ? Cookies?.get("secondCall")?.slice(0, 1).toUpperCase()
                                                : ""}
                                        </span>
                                    </div>
                                    <label className="3xl:text-sm text-xs font-bold">
                                        {Cookies.get("secondCall")}
                                    </label>
                                </div>
                                <div
                                    onClick={() => {
                                        hangupCall("SWAP_CALL");
                                        setSwap2(!swap2);
                                    }}
                                >
                                    <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                                        <Legacy src={swap} alt="swap" layout="fill" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 3xl:gap-2 gap-1.5">
                        <div
                            className="bg-white py-1.5 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                            onClick={() => {
                                hangupCall("HANGUP_BOTH_LINE");
                                Cookies.remove("secondCall");
                            }}
                        >
                            <div className="relative 3xl:w-[22px] 3px:h-[22px] w-[18px] h-[18px]">
                                <Legacy src={hangUp} alt="hangUp" layout="fill" />
                            </div>
                            <span className="3xl:text-xs text-[11px] font-semibold pt-1">
                                Hang-up both lines
                            </span>
                        </div>
                        <div
                            className="bg-white py-1.5 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                            onClick={() => {
                                hangupCall("LEAVE_3_WAY");
                                Cookies.remove("secondCall");
                            }}
                        >
                            <div className="relative 3xl:w-[22px] 3px:h-[22px] w-[18px] h-[18px]">
                                <Legacy src={leave3way} alt="agent" layout="fill" />
                            </div>
                            <span className="3xl:text-xs text-[11px] font-semibold pt-1">
                                Leave 3-way
                            </span>
                        </div>
                        <div
                            className={`${showConferenceBtn
                                    ? ""
                                    : "3xl:mr-[-80px] 3xl:ml-[70px] mr-[-70px] ml-[60px]"
                                } bg-white py-1.5 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer`}
                            onClick={() => {
                                hangupCall("LINE_HANG_UP");
                                Cookies.remove("secondCall");
                            }}
                        >
                            <div className="relative 3xl:w-[22px] 3px:h-[22px] w-[18px] h-[18px]">
                                <Legacy src={lineHangup} alt="lineHangup" layout="fill" />
                            </div>
                            <span className="3xl:text-xs text-[11px] font-semibold pt-1">
                                Xfer line hang-up
                            </span>
                        </div>
                        {showConferenceBtn ? (
                            <div
                                className="bg-white py-1.5 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                                onClick={() => {
                                    hangupCall("CONFERENCE_3_WAY");
                                }}
                            >
                                <div className="relative 3xl:w-[22px] 3px:h-[24px] w-[18px] h-[20px]">
                                    <Legacy src={conference} alt="conference" layout="fill" />
                                </div>
                                <span className="3xl:text-xs text-[11px] font-semibold pt-1">
                                    Conference 3-way
                                </span>
                            </div>
                        ) : null}
                        {showConferenceBtn ? (
                            <div
                                className="3xl:mr-[-80px] 3xl:ml-[70px] mr-[-70px] ml-[60px] bg-white py-1.5 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                                onClick={() => setPage("DMTF_TRANSFER")}
                            >
                                <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                                    <Legacy src={dtmf} alt="dtmf" layout="fill" />
                                </div>
                                <span className="3xl:text-xs text-[11px] font-semibold 3xl:pt-1 pt-0.5">
                                    DTMF
                                </span>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="flex justify-center items-center relative gap-3">
                    {showVolume && (
                        <div className="flex items-center bg-white 3xl:py-2 py-1 border-2 border-dark-700 drop-shadow-sm rounded-lg -rotate-90 3xl:w-[115px] w-[90px] absolute 3xl:top-[-78px] top-[-60px] 3xl:left-[3px] left-[22px]">
                            <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                                <Legacy
                                    src={speaker_down}
                                    alt="speaker_down"
                                    className="rotate-90"
                                    layout="fill"
                                />
                            </div>
                            <input
                                className="bg-dark-800 3xl:w-full w-[70%] h-1 focus:outline-none outline-none accent-primary hover:accent-primary"
                                type="range"
                                min="1"
                                max="100"
                                step="1"
                                value={volume}
                                onMouseUp={(e: any) => {
                                    setVolume(e.target.value);
                                    controlVolume(e);
                                }}
                                onChange={(e: any) => {
                                    setVolume(e.target.value);
                                    controlVolume(e);
                                }}
                            />
                            <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                                <Legacy
                                    src={speaker_up}
                                    alt="speaker_up"
                                    className="rotate-90"
                                    layout="fill"
                                />
                            </div>
                        </div>
                    )}
                    <div
                        className="3xl:w-[38px] w-[30px] 3xl:h-10 h-8 drop-shadow-sm border-2 border-dark-700 flex justify-center items-center rounded-lg cursor-pointer"
                        onClick={() => setShowVolume(!showVolume)}
                    >
                        <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                            <Legacy src={speaker} alt="speaker" layout="fill" />
                        </div>
                    </div>
                    <div
                        className="3xl:mx-4 mx-2 bg-error 3xl:w-[85px] w-[70px] 3xl:h-10 h-8 drop-shadow-sm flex justify-center items-center rounded-md hover:bg-opacity-80 cursor-pointer"
                        onClick={() => {
                            Cookies.remove("secondCall");
                            hangupCall();
                            setPage("");
                        }}
                    >
                        <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                            <Legacy src={call_end} alt="call_end" layout="fill" />
                        </div>
                    </div>
                    <div
                        className="3xl:w-[38px] w-[30px] 3xl:h-10 h-8 drop-shadow-sm border-2 border-dark-700 flex justify-center items-center rounded-lg hover:bg-opacity-80 cursor-pointer"
                        onClick={() => {
                            isMuted ? unMuteMediaSession() : muteMediaSession();
                        }}
                    >
                        <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                            <Legacy
                                src={isMuted ? mute : unmute}
                                alt="microphone"
                                layout="fill"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default TransferCallPage;
