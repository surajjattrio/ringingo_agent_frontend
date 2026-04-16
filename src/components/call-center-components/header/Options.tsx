import { useEffect } from "react";

// PROJECT IMPORTS
import {
    onAddLeadNoteId,
    onSelectCampaign,
    onSelectCampaignDetails,
    onSelectCampaignMode,
    onSetAddNoteId,
    onSetCampaignType,
    onSetDialType,
    onShowCallModal,
    onShowLeadInfo,
    setIsInboundCampaign,
    setNumberMasking,
    setPredictiveData,
    useCampaignMode,
    useCampaignType,
    useIsCallHangUp,
    useSelectedCampaign,
} from "@/redux/slice/commonSlice";
import {
    addLiveAgentEntry,
    callQueueInbound,
    deleteLiveAgentEntry,
    getCampaignOption,
    pauseCampaign,
    setCallResume,
    updateLiveAgentEntry,
    useCallResume,
    useCampaignOptions,
} from "@/redux/slice/campaignSlice";
import { Select } from "@/components/forms";
import { useAppDispatch } from "@/redux/hooks";
import { clearLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { useAuth } from "@/contexts/hooks/useAuth";
import { Danger } from "@/redux/services/toasterService";
import { userAgentUnRegistration } from "@/components/pbx-components/calling/CallingModal";

// THIRD-PARTY IMPORT
import { StylesConfig } from "react-select";
import Cookies from "js-cookie";

// CUSTOM STYLE
const customStyles: StylesConfig<any> = {
    control: (styles: any) => {
        return {
            ...styles,
            height: "28px",
            minHeight: "28px",
            borderColor: "#646567",
            borderWidth: "0 0 1px 0",
            borderRadius: "0",
            boxShadow: "none",
            padding: "0px 3px",
            color: "#646567",
            fontWeight: "600",

            ":hover": {
                borderColor: "#646567",
            },
        };
    },
    input: (styles: any) => {
        return {
            ...styles,
            margin: "0",
        };
    },
    placeholder: (styles: any) => {
        return {
            ...styles,
            color: "#B2B3B5",
        };
    },
    valueContainer: (styles: any) => {
        return {
            ...styles,
            padding: "0px",
        };
    },
    dropdownIndicator: (styles: any) => {
        return {
            ...styles,
            padding: "0px 6px",
            color: "#D8D8D8",
        };
    },
    indicatorSeparator: (styles: any) => {
        return {
            ...styles,
            display: "none",
        };
    },
    clearIndicator: (styles: any) => {
        return {
            ...styles,
            padding: "0px",
        };
    },
    groupHeading: (styles: any) => {
        return {
            ...styles,
            color: "#13151F",
            fontWeight: 700,
            fontSize: "10px",
        };
    },
    option: (styles: any, state) => {
        return {
            ...styles,
            backgroundColor: state.isSelected
                ? "#E6FFF4"
                : state.isFocused
                    ? "#E6FFF4"
                    : "white",
            fontWeight: state.isSelected ? 700 : 400,
            color: state.isSelected ? "#66A286" : "#646567",
            ":active": {
                backgroundColor: "#E6FFF4",
            },
        };
    },
    menuList: (styles: any) => {
        return {
            ...styles,
            borderColor: "white",
            borderWidth: "0",
            borderRadius: "6px",
            padding: "0",
        };
    },
    menu: (styles: any) => {
        return {
            ...styles,
            borderColor: "white",
        };
    },
};

/* ============================== CALL CENTER OPTIONS ============================== */

const Options = () => {
    const dispatch = useAppDispatch();
    const campaignOptions = useCampaignOptions();
    const selectedCampaign = useSelectedCampaign();
    const isCallResume = useCallResume();
    const isCallHangUp = useIsCallHangUp();
    const campaignMode = useCampaignMode();
    const campaignType = useCampaignType();

    const { user } = useAuth();

    // GET CAMPAIGN OPTIONS
    const onGetCampaign = async () => {
        try {
            await dispatch(getCampaignOption({ list: "all" })).unwrap();
        } catch (error: any) {
            console.log("Get campaign list Err ---->", error?.message);
        }
    };

    useEffect(() => {
        onGetCampaign();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        let browser_token =  user?.agent_detail?.browserToken;
    }, [user]);

    // ADD ENTRY IN LIVE REPORT
    const onAddLiveAgentEntry = async (data: any,browser_token: string) => {
        try {
            let payload = {
                status:
                    data?.campaign === "inbound" ||
                        data?.dial_method === "1" ||
                        data?.dial_method === "3"
                        ? "4"
                        : "0",
                campaign_uuid: data?.value,
                campaign_name: data?.label,
                campaign_type: data?.campaign_type ? data?.campaign_type : "1",
                type: "hangup",
                browserToken: browser_token,
            };
            await dispatch(updateLiveAgentEntry(payload)).unwrap();
        } catch (error: any) {
            console.log("Agent Entry err --->", error?.message);
        }
    };

    // // ADD ENTRY IN LIVE REPORT
    // const onAddLiveAgentEntry = async (data: any) => {
    //     try {
    //         let payload = {
    //             agent_status: "0",
    //             campaign_uuid: data?.value,
    //             campaign_name: data?.label,
    //             agent_name: user?.agent_detail?.username,
    //             extension_uuid: user?.agent_detail?.extension_details?.[0].uuid,
    //             extension_name: user?.agent_detail?.extension_details?.[0].username,
    //             // phone_number: "123",
    //             campaign_type: data?.campaign_type ? data?.campaign_type : "1"
    //         };
    //         await dispatch(addLiveAgentEntry(payload)).unwrap();
    //     } catch (error: any) {
    //         console.log("Agent Entry err --->", error?.message);
    //     }
    // };

    const onDeleteLiveAgentEntry = async (data:any) => {
        try {
            let payload = {
                extension: user?.agent_detail?.extension_details[0].username,
                status: "0",
                campaign_uuid: false,
                type: "hangup",
            };
            await dispatch(updateLiveAgentEntry(payload)).unwrap();
            if(data){
                const browser_token = user?.agent_detail?.browserToken;
                onAddLiveAgentEntry(data,browser_token)
            }
        } catch (error: any) {
            console.log("Delete Agent Entry err --->", error?.message);
        }
    };

    // DELETE ENTRY IN LIVE REPORT
    // const onDeleteLiveAgentEntry = async () => {
    //     try {
    //         await dispatch(deleteLiveAgentEntry(user?.agent_detail?.uuid)).unwrap();
    //     } catch (error: any) {
    //         console.log("Delete Agent Entry err --->", error?.message);
    //     }
    // };

    // SET CALL RESUME
    const onSetCallResumeMode = async () => {
        try {
            let payload: any = {
                campaign_uuid: selectedCampaign,
                campaign_mode: campaignMode,
            };
            dispatch(setCallResume(true));
            await dispatch(pauseCampaign(payload)).unwrap();
        } catch (error: any) {
            console.log("set call resume err --->", error?.message);
        }
    };

    // SET CALL QUEUE
    const onCallQueueInbound = async () => {
        try {
            let payload: any = {
                extension: user?.agent_detail?.extension_details[0].username,
                campaign_uuid: selectedCampaign,
                feature: 'logout',
                pause: "true",
                campaign_type: campaignType === "inbound" ? "" : campaignType === "outbound" ? '0' : "2",
            };
            await dispatch(callQueueInbound(payload)).unwrap();
        } catch (error: any) {
            console.log("call queue err -->", error?.message);
        }
    };

    const onCallQueueOutbound = async (e:any) => {
        try {
            let payload: any = {
                extension: user?.agent_detail?.extension_details[0].username,
                campaign_uuid: e?.value,
                feature: 'resume',
                pause: "true",
                campaign_type: e?.campaign_type,
            };
            await dispatch(callQueueInbound(payload)).unwrap();
        } catch (error: any) {
            console.log("call queue err -->", error?.message);
        }
    };

    
    return (
        <>
            <Select
                name="callCenter"
                options={campaignOptions}
                isShowLabel={false}
                className="w-full"
                placeholder="Select Campaign"
                styles={customStyles}
                isClearable
                value={selectedCampaign}
                isManual
                isGroup
                onChange={(e: any) => {
                    if (
                        isCallHangUp ||
                        Cookies.get("is_call_start") === "0" ||
                        !isCallResume
                    ) {
                        Danger(
                            !isCallResume
                              ? "You can't change the campaign without pausing the campaign"
                              : "You can't change the campaign without finishing the lead"
                          );
                    } else {
                        onDeleteLiveAgentEntry(e);
                        selectedCampaign && onCallQueueInbound();
                        if(e && (e?.campaign === "outbound" || e?.campaign === "blended")){
                            onCallQueueOutbound(e);
                        }
                        if (!isCallResume) {
                            onSetCallResumeMode();
                        }
                        console.log("data is it working???");                       
                        dispatch(clearLeadDetails());
                        dispatch(onAddLeadNoteId(null));
                        dispatch(onSetAddNoteId(null));
                        // dispatch(onSelectCampaignMode(null));    
                        dispatch(onShowLeadInfo(true));
                        dispatch(setIsInboundCampaign(false));
                        dispatch(setPredictiveData({}));
                        dispatch(onSelectCampaign(e ? e?.value : e));
                        dispatch(onSelectCampaignDetails(e));

                        // if (e) onAddLiveAgentEntry(e);
                        dispatch(
                            setNumberMasking(
                                e ? (e?.number_masking === "0" ? true : false) : false
                            )
                        );
                        dispatch(onSetCampaignType(e?.campaign));
                        Cookies.set("isRecording", e?.recording);

                        if (e?.campaign === "outbound" || e?.campaign === "blended") {
                            Cookies.set("lead_information", "0");
                            dispatch(setIsInboundCampaign(false));
                            if (e?.dial_method === "3") {
                                dispatch(
                                    setPredictiveData({
                                        current_dial_level: e?.current_dial_level,
                                        target_drop_percent: e?.target_drop_percent,
                                        max_dial_level: e?.max_dial_level,
                                        minimum_calls: e?.minimum_calls,
                                    })
                                );
                            } else {
                                dispatch(setPredictiveData({}));
                            }
                            dispatch(onSelectCampaignMode(e?.dial_method));
                            if (e?.dial_method === "1" || e?.dial_method === "3") {
                                dispatch(onSetDialType("leadDial"));
                                dispatch(onShowCallModal("true"));
                            } else {
                                dispatch(onSetDialType("manualDial"));
                            }
                            if (
                                e?.dial_method === "0" ||
                                e?.dial_method === "1" ||
                                e?.dial_method === "3"
                            ) {
                                dispatch(onShowLeadInfo(false));
                            } else {
                                dispatch(onShowLeadInfo(true));
                            }
                        } else if (e?.campaign === "inbound") {
                            dispatch(setPredictiveData({}));
                            dispatch(onShowCallModal("true"));
                            dispatch(onSetDialType("leadDial"));
                            if (e?.campaign === "inbound") {
                                dispatch(setIsInboundCampaign(true));
                                userAgentUnRegistration();
                            }
                        }
                    }
                }}
            />
        </>
    );
};

export default Options;
