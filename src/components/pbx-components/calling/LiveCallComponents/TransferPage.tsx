import { useEffect } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import {
    getCallQueue,
    getExtension,
    getInboundCallQueueList,
    getInboundIvrList,
    getInboundRingGroupList,
    getIvr,
    getOutboundCallQueueList,
    getOutboundIvrList,
    getOutboundRingGroupList,
    getRingGroup,
    getPreset,
    getBlendedCallQueueList,
    getBlendedIvrList,
    getBlendedRingGroupList,
} from "@/redux/slice/callSlice";
import { useAuth } from "@/contexts/hooks/useAuth";
import {
    useCampaignType,
    useSelectedCampaign,
} from "@/redux/slice/commonSlice";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";

// ASSETS
const call_end = "/assets/icons/white/call_end.svg";
const unmute = "/assets/icons/microphone.svg";
const mute = "/assets/icons/mute-microphone.svg";
const speaker = "/assets/icons/speaker.svg";
const speaker_up = "/assets/icons/speaker-plus.svg";
const speaker_down = "/assets/icons/speaker-minus.svg";
const queue = "/assets/icons/queue-transfer.svg";
const agent = "/assets/icons/agent-transfer.svg";
const ivr = "/assets/icons/ivr-transfer.svg";
const externalTransfer = "/assets/icons/external-transfer.svg";
const back = "/assets/icons/undo.svg";
const ring = "/assets/icons/ring-group.svg";

// TYPES
interface TransferPageProps {
    setPage: any;
    showVolume: boolean;
    setShowVolume: any;
    volume: any;
    setVolume: any;
    isMuted: boolean;
    hangupCall: any;
    unMuteMediaSession: any;
    muteMediaSession: any;
    controlVolume: any;
}

/* ============================== TRANSFER PAGE ============================== */

const TransferPage = (props: TransferPageProps) => {
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
        controlVolume,
    } = props;
    const dispatch = useAppDispatch();
    const selectedCampaign = useSelectedCampaign();
    const campaignType = useCampaignType();
    const { user } = useAuth();

    // GET EXTENSION LIST
    const onGetExtension = async () => {
        try {
            await dispatch(
                getExtension({
                    list: "all",
                    extension_uuid: user?.agent_detail?.extension_details[0]?.uuid,
                })
            ).unwrap();
        } catch (error: any) {
            console.log("Get Extension list Err ---->", error?.message);
        }
    };

       // GET PRESET LIST
    const onGetPreset = async () => {
        try {
            await dispatch(getPreset(
                { 
                list: "all", 
               campaign_uuid: selectedCampaign,
             })).unwrap();
        } catch (error: any) {
            console.log("Get Preset list Err ---->", error?.message);
        }
    };

    // GET CALL QUEUE LIST
    const onGetCallQueue = async () => {
        try {
            await dispatch(getCallQueue({ list: "all" })).unwrap();
        } catch (error: any) {
            console.log("Get Call Queue list Err ---->", error?.message);
        }
    };

    // GET IVR LIST
    const onGetIvr = async () => {
        try {
            await dispatch(getIvr({ list: "all" })).unwrap();
        } catch (error: any) {
            console.log("Get IVR list Err ---->", error?.message);
        }
    };

    // GET RING GROUP LIST
    const onGetRingGroup = async () => {
        try {
            await dispatch(getRingGroup({ list: "all" })).unwrap();
        } catch (error: any) {
            console.log("Get ring-group list Err ---->", error?.message);
        }
    };

    // GET CALL QUEUE LIST
    const onGetOutboundCallQueueList = async () => {
        try {
            await dispatch(
                getOutboundCallQueueList({
                    list: "all",
                    campaign_uuid: selectedCampaign,
                })
            ).unwrap();
        } catch (error: any) {
            console.log("Get Call Queue list Err ---->", error?.message);
        }
    };

    // GET IVR LIST
    const onGetOutboundIvrList = async () => {
        try {
            await dispatch(
                getOutboundIvrList({ list: "all", campaign_uuid: selectedCampaign })
            ).unwrap();
        } catch (error: any) {
            console.log("Get IVR list Err ---->", error?.message);
        }
    };

    // GET RING GROUP LIST
    const onGetOutboundRingGroupList = async () => {
        try {
            await dispatch(
                getOutboundRingGroupList({
                    list: "all",
                    campaign_uuid: selectedCampaign,
                })
            ).unwrap();
        } catch (error: any) {
            console.log("Get ring-group list Err ---->", error?.message);
        }
    };

    // GET CALL QUEUE LIST
    const onGetInboundCallQueueList = async (campaign_type: string) => {
        try {
            await dispatch(
                getInboundCallQueueList({
                    list: "all",
                    campaign_uuid: selectedCampaign,
                    campaign_type: campaign_type,
                })
            ).unwrap();
        } catch (error: any) {
            console.log("Get Call Queue list Err ---->", error?.message);
        }
    };

    // GET IVR LIST
    const onGetInboundIvrList = async (campaign_type: string) => {
        try {
            await dispatch(
                getInboundIvrList({
                    list: "all",
                    campaign_uuid: selectedCampaign,
                    campaign_type: campaign_type,
                })
            ).unwrap();
        } catch (error: any) {
            console.log("Get IVR list Err ---->", error?.message);
        }
    };

    // GET RING GROUP LIST
    const onGetInboundRingGroupList = async (campaign_type: string) => {
        try {
            await dispatch(
                getInboundRingGroupList({
                    list: "all",
                    campaign_uuid: selectedCampaign,
                    campaign_type: campaign_type,
                })
            ).unwrap();
        } catch (error: any) {
            console.log("Get ring-group list Err ---->", error?.message);
        }
    };
    
    // GET CALL QUEUE LIST
    const onGetBlendedCallQueueList = async (campaign_type: string) => {
        try {
            await dispatch(
                getBlendedCallQueueList({
                    list: "all",
                    campaign_uuid: selectedCampaign,
                    campaign_type: campaign_type,
                })
            ).unwrap();
        } catch (error: any) {
            console.log("Get Call Queue list Err ---->", error?.message);
        }
    };

    // GET IVR LIST
    const onGetBlendedIvrList = async (campaign_type: string) => {
        try {
            await dispatch(
                getBlendedIvrList({
                    list: "all",
                    campaign_uuid: selectedCampaign,
                    campaign_type: campaign_type,
                })
            ).unwrap();
        } catch (error: any) {
            console.log("Get IVR list Err ---->", error?.message);
        }
    };

    // GET RING GROUP LIST
    const onGetBlendedRingGroupList = async (campaign_type: string) => {
        try {
            await dispatch(
                getBlendedRingGroupList({
                    list: "all",
                    campaign_uuid: selectedCampaign,
                    campaign_type: campaign_type,
                })
            ).unwrap();
        } catch (error: any) {
            console.log("Get ring-group list Err ---->", error?.message);
        }
    };

    useEffect(() => {
        if (user?.isPbx) {
            onGetExtension();
            onGetCallQueue();
            onGetIvr();
            onGetRingGroup();
            onGetPreset();
        } else {
            if (campaignType === "outbound") {
                onGetExtension();
                 onGetPreset();
                onGetOutboundCallQueueList();
                onGetOutboundIvrList();
                onGetOutboundRingGroupList();
            } else if (campaignType === "inbound") {
                onGetExtension();
                 onGetPreset();
                onGetInboundCallQueueList("");
                onGetInboundIvrList("");
                onGetInboundRingGroupList("");
            } else if (campaignType === "blended") {
                onGetExtension();
                onGetBlendedCallQueueList("2");
                onGetBlendedIvrList("2");
                onGetBlendedRingGroupList("2");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div 
            className="flex flex-col gap-8 justify-between h-full"
            >
                <div className="grid grid-cols-2 3xl:gap-2 gap-1.5">
                    <div
                        className="bg-white py-1 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                        onClick={() => {
                            setPage("QUEUE_TRANSFER");
                            Cookies.remove("secondCall");
                        }}
                    >
                        <div className="relative 3xl:w-[18px] 3px:h-[20px] w-[16px] h-[16px]">
                            <Legacy src={queue} alt="queue" layout="fill" />
                        </div>
                        <span className="3xl:text-sm text-[11px] font-semibold pt-1 ">
                            Queue Transfer
                        </span>
                    </div>
                    <div
                        className="bg-white py-1 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                        onClick={() => {
                            setPage("AGENT_TRANSFER");
                            Cookies.remove("secondCall");
                        }}
                    >
                        <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[16px] h-[16px]">
                            <Legacy src={agent} alt="agent" layout="fill" />
                        </div>
                        <span className="3xl:text-xs text-[11px] font-semibold pt-1">
                            User Transfer
                        </span>
                    </div>
                    <div
                        className="bg-white py-1 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                        onClick={() => {
                            setPage("EXTERNAL_TRANSFER");
                            Cookies.remove("secondCall");
                        }}
                    >
                        <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[16px] h-[16px]">
                            <Legacy
                                src={externalTransfer}
                                alt="externalTransfer"
                                layout="fill"
                            />
                        </div>
                        <span className="3xl:text-xs text-[11px] font-semibold pt-1">
                            External Transfer
                        </span>
                    </div>
                    <div
                        className="bg-white py-1 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                        onClick={() => {
                            setPage("IVR_TRANSFER");
                            Cookies.remove("secondCall");
                        }}
                    >
                        <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[16px] h-[16px]">
                            <Legacy src={ivr} alt="ivr" layout="fill" />
                        </div>
                        <span className="3xl:text-xs text-[11px] font-semibold pt-1">
                            IVR Transfer
                        </span>
                    </div>
                    <div
                        className="bg-white py-1 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                        onClick={() => {
                            setPage("RING_GROUP_TRANSFER");
                            Cookies.remove("secondCall");
                        }}
                    >
                        <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[16px] h-[16px]">
                            <Legacy src={ring} alt="ring" layout="fill" />
                        </div>
                        <span className="3xl:text-xs text-[11px] font-semibold pt-1">
                            Ring Group
                        </span>
                    </div>
                    <div
                        className="bg-white py-1 border-2 border-dark-800 rounded-md drop-shadow-sm flex flex-col justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                        onClick={() => setPage("")}
                    >
                        <div className="relative 3xl:w-[20px] 3px:h-[20px] w-[16px] h-[16px]">
                            <Legacy src={back} alt="back" layout="fill" />
                        </div>
                        <span className="3xl:text-xs text-[11px] font-semibold pt-1">
                            Back
                        </span>
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

export default TransferPage;
