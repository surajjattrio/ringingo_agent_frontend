import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAuth } from "@/contexts/hooks/useAuth";
import { CheckBox } from "@/components/forms";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import Icon, { IconKey } from "../../../ui-components/Icon";
import { onStickyAgent } from "@/redux/slice/callSlice";

// ASSETS
const call_end = "/assets/icons/white/call_end.svg";
const data = "/assets/icons/data.svg";
// callrecording ="/assets/icons/red/callrecording.svg";
const unmute = "/assets/icons/microphone.svg";
const mute = "/assets/icons/mute-microphone.svg";
const speaker = "/assets/icons/speaker.svg";
const speaker_up = "/assets/icons/speaker-plus.svg";
const speaker_down = "/assets/icons/speaker-minus.svg";
const dtmf = "/assets/icons/dtmf.svg";
const hand = "/assets/icons/hand.svg";
const hand_outline = "/assets/icons/hand-outline.svg";

// TYPES
interface DefailtPageProps {
    setPage: any;
    isHold: boolean;
    showVolume: boolean;
    setShowVolume: any;
    volume: any;
    setVolume: any;
    isMuted: boolean;
    hangupCall: any;
    unMuteMediaSession: any;
    muteMediaSession: any;
    onCallUnHold: any;
    onCallHold: any;
    controlVolume: any;
    isShowCallDuration: boolean;
    setSuccessMessage: any;
    icon?: IconKey;

}

/* ============================== DEAFULT PAGE ============================== */

const DefaultPage = (props: DefailtPageProps) => {
    const {
        setPage,
        isHold,
        showVolume,
        setShowVolume,
        volume,
        setVolume,
        isMuted,
        hangupCall,
        unMuteMediaSession,
        muteMediaSession,
        onCallUnHold,
        onCallHold,
        controlVolume,
        isShowCallDuration,
        setSuccessMessage,
    } = props;

    const { user } = useAuth();
    const dispatch = useAppDispatch();

    const [isStickyAgent, setIsStickyAgent] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(
        user?.isPbx ? user?.isRecording : Cookies.get("isRecording") === "0"
    );

    useEffect(() => {
        setIsRecording(
            user?.isPbx ? user?.isRecording : Cookies.get("isRecording") === "0"
        );
    }, [user]);

    const onChangeAgentSticky = async (isSticky: boolean) => {
        setIsStickyAgent(isSticky);
        if (isSticky) {
            try {
                let payload = {
                    phone_number: Cookies.get("phone_number") || "",
                    user_role_uuid: user?.agent_detail?.user_role_uuid || "",
                };
                let res: any = await dispatch(onStickyAgent(payload)).unwrap();
                if (res && res.statusCode === 201) {
                    setSuccessMessage(res?.data);
                } else if (res && res.statusCode === 409) {
                    setSuccessMessage(res?.data);
                }
            } catch (error: any) {
                console.log("sticky agent err -->", error?.message);
            }
        }
    };

    return (
        <>
            <div className="flex flex-col justify-between h-full">
                <div className={`grid grid-cols-2 gap-3 ${!isShowCallDuration && "pointer-events-none opacity-50"}`}>
                    <div className="flex flex-col items-center justify-center space-y-1">
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                            <Icon
                                name={"callrecording"}
                                className="cursor-pointer text-white"
                                width={24}
                                height={24}
                            />
                        </div>
                        <span className="text-xs font-medium text-center">Call Recording</span>
                    </div>

                    <div
                        className="flex flex-col items-center justify-center space-y-1"
                        onClick={() => {
                            isHold ? onCallUnHold() : onCallHold();
                        }}
                    >
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
                            <div className="w-6 h-6 relative">
                                <Legacy
                                    src={isHold ? hand_outline : hand}
                                    alt="hand"
                                    layout="fill"
                                />
                            </div>
                        </div>
                        <span className="text-xs font-medium text-center">
                            {isHold ? "Un-Hold" : "Hold"}
                        </span>
                    </div>

                    <div
                        className="flex flex-col items-center justify-center space-y-1 cursor-pointer"
                        onClick={() => setPage("TRANSFER")}
                    >
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                            <div className="w-6 h-6 relative">
                                <Legacy src={"/assets/icons/gray/transfer.svg"} alt="transfer" layout="fill" />
                            </div>
                        </div>
                        <span className="text-xs font-medium">Transfer</span>
                    </div>

                    <div
                        className="flex flex-col items-center justify-center space-y-1 cursor-pointer"
                        onClick={() => setPage("DMTF")}
                    >
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                            <div className="w-6 h-6 relative">
                                <Legacy src={dtmf} alt="dtmf" layout="fill" />
                            </div>
                        </div>
                        <span className="text-xs font-medium">DTMF</span>
                    </div>

                    {user?.sticky_agent && Cookies.get("call_stick_status") === "0" && (
                        <div
                            className={`flex flex-col items-center justify-center space-y-1 cursor-pointer ${isRecording ? "col-span-2" : ""}`}
                            onClick={() => {
                                onChangeAgentSticky(!isStickyAgent);
                            }}
                        >
                            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                                <div className="w-6 h-6 relative">
                                    <CheckBox readOnly checked={isStickyAgent} />
                                </div>
                            </div>
                            <span className="text-xs font-medium">Sticky Agent</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-center items-center relative mt-6 gap-3 ">
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
                            hangupCall();
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

export default DefaultPage;
