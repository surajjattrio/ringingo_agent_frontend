import { useEffect } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAuth } from "@/contexts/hooks/useAuth";
import { useAppDispatch } from "@/redux/hooks";
import {
    callQueueInbound,
    pauseCampaign,
    resumeCampaign,
    setCallResume,
    updateDialLevel,
    updateLiveAgentEntry,
    useCallResume,
} from "@/redux/slice/campaignSlice";
import {
    setIsCallHangUp,
    setIsInboundCampaign,
    useCampaignMode,
    useCampaignType,
    useIsCallHangUp,
    usePredictiveData,
    useSelectedCampaign,
} from "@/redux/slice/commonSlice";
import { agentEntryAdd } from "@/redux/slice/authSlice";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";
import { userAgentUnRegistration } from "../CallingModal";

// ASSETS
const play_circle = "/assets/icons/red/play-circle.svg";
const pause_circle = "/assets/icons/red/pause-circle.svg";

interface LeadDialPageProps {
    setErrorMessage: any;
}

/* ============================== LEAD DIAL PAGE ============================== */

const LeadDialPage = (props: LeadDialPageProps) => {
    const { setErrorMessage } = props;

    const isCallResume = useCallResume();
    const selectedCampaign = useSelectedCampaign();
    const predictiveData = usePredictiveData();
    const campaignMode = useCampaignMode();
    const isCallHangUp = useIsCallHangUp();
    const campaignType = useCampaignType();
    console.log(isCallHangUp,'isCallHangUp from leadDialPage');
    
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    const onCallQueueInbound = async (feature: string, pause?: boolean) => {
        try {
            let payload: any = {
                extension: user?.agent_detail?.extension_details[0].username,
                campaign_uuid: selectedCampaign
                    ? selectedCampaign
                    : Cookies.get("selectedCampaign")
                        ? Cookies.get("selectedCampaign")
                        : "",
                feature: feature,
                campaign_type: campaignType === "inbound" ? "" : "2",
            };
            if (campaignType == "blended" || campaignType == "outbound") {
                payload['campaign_flag'] = campaignType
            }
            if (pause) {
                payload["pause"] = "true";
            }
            await dispatch(callQueueInbound(payload)).unwrap();
        } catch (error: any) {
            console.log("call queue err -->", error?.message);
        }
    };

    const onCallTypeChange = async () => {
        try {
            let payload: any = {
                campaign_uuid: selectedCampaign
                    ? selectedCampaign
                    : Cookies.get("selectedCampaign")
                        ? Cookies.get("selectedCampaign")
                        : "",
                sip_uri: "https://test.com/",
                username: user?.agent_detail?.extension_details[0].username,
                campaign_mode: campaignMode,
                campaign_flag: campaignType
            };
            if (isCallResume) {
                console.log("iscall is call resumeeee", isCallResume)
                dispatch(setCallResume(false));
                onUpdateLiveAgentEntry("0");
                dispatch(agentEntryAdd({ login_status: "3" }));
                const call_status = Cookies.get("call_status");
                //if(call_status == "pause"){
                Cookies.set("call_status", "play");
                //}else{
                //    Cookies.set("call_status", "pause");
                //}

                Cookies.set("is_call_start", "1");
                // if (campaignType === "inbound") {
                //     onCallQueueInbound("resume");
                //     if (campaignType === "inbound") {
                //         setTimeout(() => {
                //             dispatch(setIsInboundCampaign(false));
                //         }, 3000);
                //     }
                // } else {
                //     if (Cookies.get("campaignMode") === "3" || campaignMode === "3") {
                //         onUpdateDialLevel();
                //     }
                //     await dispatch(resumeCampaign(payload)).unwrap();l
                // }
                if (campaignType === "blended") {
                    if (Cookies.get("campaignMode") === "3" || campaignMode === "3") {
                        onUpdateDialLevel();
                    }
                    await dispatch(resumeCampaign(payload)).unwrap();
                    onCallQueueInbound("resume");
                    //console.log("is inbound onCallQueueInbound resume on click")
                    dispatch(setIsInboundCampaign(false));
                }
                if (campaignType === "outbound") {
                    if (Cookies.get("campaignMode") === "3" || campaignMode === "3") {
                        onUpdateDialLevel();
                    }
                    await dispatch(resumeCampaign(payload)).unwrap();
                }
                if (campaignType === "inbound") {
                    onCallQueueInbound("resume");
                    if (campaignType === "inbound") {
                        setTimeout(() => {
                            dispatch(setIsInboundCampaign(false));
                        }, 3000);
                    }
                }
            } else {
                console.log("iscall else condtion on the is call resume");
                Cookies.set("call_status", "pause");
                delete payload["sip_uri"];
                delete payload["username"];
                dispatch(setCallResume(true));
                onUpdateLiveAgentEntry("4");
                dispatch(agentEntryAdd({ login_status: "4" }));
                if (campaignType === "inbound"||campaignType==="blended") {
                    onCallQueueInbound("hang-up", true);
                    if (campaignType === "inbound") {
                        dispatch(setIsInboundCampaign(true));
                        setTimeout(() => {
                            userAgentUnRegistration();
                        }, 3000);
                    }
                    console.log("iscall user un resgistereddddddd")
                } else {
                    await dispatch(pauseCampaign(payload)).unwrap();
                }
            }
        } catch (error: any) {
            console.log("Call Type changes Err --->", error?.message);
        }
    };

    const onUpdateDialLevel = async () => {
        try {
            let payload: any = {
                campaign_uuid: selectedCampaign
                    ? selectedCampaign
                    : Cookies.get("selectedCampaign")
                        ? Cookies.get("selectedCampaign")
                        : "",
                current_dial_level: predictiveData?.current_dial_level || "",
                target_drop_percent: predictiveData?.target_drop_percent || "",
                max_dial_level: predictiveData?.max_dial_level || "",
                minimum_calls: predictiveData?.minimum_calls || "",
                campaignType: campaignType
            };
            await dispatch(updateDialLevel(payload)).unwrap();
        } catch (error: any) {
            console.log("dial lavel change Err --->", error?.message);
        }
    };

    const onUpdateLiveAgentEntry = async (status: string) => {
        try {
            let payload = {
                status: status,
                campaign_uuid: selectedCampaign
                    ? selectedCampaign
                    : Cookies.get("selectedCampaign")
                        ? Cookies.get("selectedCampaign")
                        : "",
                type: "hangup",
            };
            await dispatch(updateLiveAgentEntry(payload)).unwrap();
        } catch (error: any) {
            console.log("Agent Entry err --->", error?.message);
        }
    };

    const onResumeCall = async () => {
        if (Cookies.get("campaignMode") === "3" || campaignMode === "3") {
            onUpdateDialLevel();
        }
        try {
            let payload: any = {
                campaign_uuid: selectedCampaign
                    ? selectedCampaign
                    : Cookies.get("selectedCampaign")
                        ? Cookies.get("selectedCampaign")
                        : "",
                sip_uri: "https://test.com/",
                username: user?.agent_detail?.extension_details[0].username,
                campaign_mode: campaignMode,
                campaign_flag: campaignType
            };
            await dispatch(resumeCampaign(payload)).unwrap();
        } catch (error: any) {
            console.log("Call resume changes Err --->", error?.message);
        }
    };

    useEffect(() => {
        let interval = setInterval(() => {
            if (
                // !user?.isPbx &&
                campaignType !== "blended" &&
                selectedCampaign &&
                (campaignMode === "1" || campaignMode === "3") &&
                !isCallResume &&
                !isCallHangUp &&
                Cookies.get("is_call_start") === "1"
            ) {
                Cookies.set("call_status", "play");
                onResumeCall();
            }
            else if (
                // !user?.isPbx &&
                campaignType === "blended" &&
                selectedCampaign &&
                (campaignMode === "1" || campaignMode === "3") &&
                !isCallResume &&
                !isCallHangUp &&
                Cookies.get("is_call_start") === "1"
            ) {
                Cookies.set("call_status", "play");
                onResumeCall();
                onCallQueueInbound("resume");
            } else {
                if (
                    // !user?.isPbx &&
                    selectedCampaign &&
                    (campaignType === "inbound") &&
                    !isCallResume &&
                    !isCallHangUp &&
                    Cookies.get("is_call_start") === "1"
                ) {
                    dispatch(setIsCallHangUp(false));
                    Cookies.set("call_status", "play");
                    // onResumeCall();
                } else {
                    Cookies.set("call_status", "pause");
                }
            }
        }, 30000);
        return () => {
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCallResume, isCallHangUp]);

    useEffect(() => {
        if (
            // !user?.isPbx &&
            selectedCampaign &&
            (campaignMode === "1" || campaignMode === "3") &&
            !isCallResume &&
            !isCallHangUp &&
            Cookies.get("is_call_start") === "1"
        ) {
            console.log("coming for status change2");
            Cookies.set("call_status", "play");
        } else {
            if (
                // !user?.isPbx &&
                selectedCampaign &&
                (campaignType === "inbound") &&
                !isCallResume &&
                !isCallHangUp &&
                Cookies.get("is_call_start") === "1"
            ) {
                dispatch(setIsCallHangUp(false));
                Cookies.set("call_status", "play");
                // onResumeCall();
            } else {
                Cookies.set("call_status", "pause");
            }
        }

    });

    return (
        <>
            <div className="3xl:h-[83%] h-[85%] px-2 select-none flex justify-center items-center flex-col h-full pb-6 gap-6 mt-14 ">
                <div
                    className="relative w-[75px] h-[75px] 3xl:w-[85px] 3xl:h-[85px] cursor-pointer"
                    onClick={() => {
                        console.log("iscall ahng upppppp:::", isCallHangUp)
                        console.log("iscall startrttt:::", Cookies.get("is_call_start"))
                        if (isCallHangUp || Cookies.get("is_call_start") === "0") {
                            setErrorMessage(
                                `You can't change the mode without finishing the lead`
                            );
                        } else {
                            console.log("iscall else condtionnn")
                            onCallTypeChange();
                        }
                    }}
                >
                    <Legacy
                        src={isCallResume ? play_circle : pause_circle}
                        alt="play"
                        layout="fill"
                    />
                </div>

                <label className="font-bold  text-heading leading-none text-center text-[15px] whitespace-wrap">
                    {isCallResume
                        ? campaignType === "inbound"
                            ? "Press Resume button to receiving calls"
                            : "Press Resume button to start calls"
                        : "Press Pause button to stop calls"}
                </label>
            </div>
        </>
    );
};
export default LeadDialPage;
