import { useEffect, useState } from "react";

// PROJECT IMPORTS
import {
    callQueueInbound,
    getCampaign,
    getCampaignList,
    getCampaignOption,
    pauseCampaign,
    setCallResume,
    updateAgentCampaign,
    updateLiveAgentEntry,
    useCallResume,
} from "@/redux/slice/campaignSlice";
import { useAppDispatch } from "@/redux/hooks";
import { onAddLeadNoteId, onSelectCampaign, onSelectCampaignDetails, onSelectCampaignMode, onSetAddNoteId, onSetCampaignType, onSetDialType, onShowCallModal, onShowLeadInfo, setIsInboundCampaign, setNumberMasking, setPredictiveData, useCampaignMode, useCampaignType, useIsCallHangUp, useUserEntry } from "@/redux/slice/commonSlice";
import { Danger } from "@/redux/services/toasterService";
import { Button } from "../forms";
import Modal from "./Modal";
import { Chip, Loader } from "../ui-components";
import InlineSwitch from "../forms/InlineSwitch";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/hooks/useAuth";
import { clearLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { userAgentUnRegistration } from "../pbx-components/calling/CallingModal";

// RADIO OPTIONS
const options = [
    { label: "Log In", value: "0", isDisabled: false },
    //{ label: "Break", value: "1", isDisabled: false },
    { label: "Log Out", value: "2", isDisabled: false },
];

interface CampaignModalProps {
    campaignModalOpen: boolean;
    setCamoaignModalOpen: any;
    selectedCampaign: any;
}

/* ============================== CAMPAIGN MODEL ============================== */

const CampaignModal = (props: CampaignModalProps) => {
    const { campaignModalOpen, setCamoaignModalOpen, selectedCampaign } = props;
    const { switchRole, user, } = useAuth();
    const dispatch = useAppDispatch();
    const userEntry = useUserEntry();
    const isCallHangUp = useIsCallHangUp();
    const isCallResume = useCallResume();
    const campaignMode = useCampaignMode();
    const campaignType = useCampaignType();

    const [initialValues, setInitialValues] = useState<any>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState<boolean>(false);
    const [campaignInboundDetails, setCampaignInboundDetails] = useState<any>([]);
    const [campaignBlendedDetails, setCampaignBlendedDetails] = useState<any>([]);
    const [campaignOutboundDetails, setCampaignOutboundDetails] = useState<any>(
        []
    );

    // SET CALL QUEUE

    const onCallQueueOutbound = async (e: any) => {
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
    // GET CAMPAIGN OPTIONS
    const onGetCampaign = async () => {
        setIsLoading(true);
        try {
            const response: any = await dispatch(getCampaignList()).unwrap();
            const res: any = await dispatch(getCampaign({ list: "all" })).unwrap();
            if (res && res?.statusCode === 200) {
                let newObj = {};
                let newData: any = [];
                let inboundData =
                    res?.data?.inbound_campaign && res?.data?.inbound_campaign.length
                        ? res?.data?.inbound_campaign.map((x: any) => {
                            return {
                                ...x,
                                dataType: "inbound",
                            };
                        })
                        : [];
                let outboundData =
                    res?.data?.outbound_campaign && res?.data?.outbound_campaign.length
                        ? res?.data?.outbound_campaign.map((x: any) => {
                            return {
                                ...x,
                                dataType: "outbound",
                            };
                        })
                        : [];
                let blendedData =
                    res?.data?.blended_campaign && res?.data?.blended_campaign.length
                        ? res?.data?.blended_campaign.map((x: any) => {
                            return {
                                ...x,
                                dataType: "blended",
                            };
                        })
                        : [];
                let prepareData = [...inboundData, ...outboundData, ...blendedData];

                prepareData.forEach((val: any) => {
                    if (response?.data?.length) {
                        response.data?.forEach((value: any) => {
                            if (value._id.campaign_uuid === val.uuid) {
                                newObj = {
                                    ...newObj,
                                    [val.uuid]: value?.login_status,
                                };
                                newData.push({
                                    ...val,
                                    options: getOptions(value?.login_status) || [],
                                });
                            }
                        });
                    } else {
                        newObj = { ...newObj, [val.uuid]: "2" };
                        newData.push({
                            ...val,
                            options: getOptions("2") || [],
                        });
                    }
                });
                let Ids: any = [];
                newData?.map((x: any) => {
                    Ids.push(x.uuid);
                });
                prepareData.map((val: any) => {
                    if (!Ids.includes(val.uuid)) {
                        newObj = { ...newObj, [val.uuid]: "2" };
                        newData.push({
                            ...val,
                            options: getOptions("2") || [],
                        });
                    }
                });
                setInitialValues(newObj);
                setCampaignOutboundDetails(
                    newData?.length
                        ? newData?.filter((x: any) => x.dataType === "outbound")
                        : []
                );
                setCampaignInboundDetails(
                    newData?.length
                        ? newData?.filter((x: any) => x.dataType === "inbound")
                        : []
                );
                setCampaignBlendedDetails(
                    newData?.length
                        ? newData?.filter((x: any) => x.dataType === "blended")
                        : []
                );
                setIsLoading(false);
            }
        } catch (error: any) {
            console.log("Get campaign list Err ---->", error?.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (campaignModalOpen) {
            onGetCampaign();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignModalOpen]);
    // SET CALL RESUME
    const onSetCallResumeMode = async () => {
        try {
            let payload: any = {
                campaign_uuid: selectedCampaign.value,
                campaign_mode: campaignMode,
            };
            dispatch(setCallResume(true));
            await dispatch(pauseCampaign(payload)).unwrap();
        } catch (error: any) {
            console.log("set call resume err --->", error?.message);
        }
    };
    // GET CAMPAIGN OPTIONS
    const onGetCampaignOption = async () => {
        try {
            await dispatch(getCampaignOption({ list: "all" })).unwrap();
        } catch (error: any) {
            console.log("Get campaign list Err ---->", error?.message);
        }
    };
    // SET CALL QUEUE
    const onCallQueueInbound = async () => {
        try {
            let payload: any = {
                extension: user?.agent_detail?.extension_details[0].username,
                campaign_uuid: selectedCampaign.value,
                feature: "logout",
                campaign_type:
                    campaignType === "inbound"
                        ? ""
                        : campaignType === "outbound"
                            ? "0"
                            : "2",
            };
            if (
                campaignType === "inbound" ||
                campaignType === "outbound" ||
                campaignMode === "1" ||
                campaignMode === "3"
            ) {
                payload["pause"] = "true";
            }
            await dispatch(callQueueInbound(payload)).unwrap();
        } catch (error: any) {
            console.log("call queue err -->", error?.message);
        }
    };
    const liveChatOption = (flag: any) => {
        const e: any = selectedCampaign;
        ondeleteLiveAgentEntry();
        selectedCampaign && onCallQueueInbound();
        if (e && (e?.campaign === "outbound" || e?.campaign === "blended")) {
            onCallQueueOutbound(e);
        }
        if (!isCallResume) {
            onSetCallResumeMode();
        }
        dispatch(clearLeadDetails());
        dispatch(onAddLeadNoteId(null));
        dispatch(onSetAddNoteId(null));
        dispatch(onSelectCampaignMode(null));
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
                if (flag == 1) {
                    dispatch(onShowCallModal("true"));
                }
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
            if (flag == 1) {
                dispatch(onShowCallModal("true"));
            }
            dispatch(onSetDialType("leadDial"));
            if (e?.campaign === "inbound") {
                dispatch(setIsInboundCampaign(true));
                userAgentUnRegistration();
            }
        }

    }
    const onSubmit = async () => {
        setIsUpdateLoading(true);
        try {
            let payload: any = {
                campaigns_details: [],
                feature: userEntry ? userEntry : "login-entry",
            };
            Object.entries(initialValues)?.map(([key, val]: any) => {
                let obj: any = {
                    campaign_uuid: key,
                    login_status: val,
                };
                payload["campaigns_details"].push(obj);
            });
            let res: any = await dispatch(updateAgentCampaign(payload)).unwrap();
            if (res && res.statusCode === 200) {
                // Success(res.data);
                setCamoaignModalOpen(false);
                onGetCampaignOption();
                Cookies.set("campaign_modal", "1", { expires: 1 });
                setIsUpdateLoading(false);
                liveChatOption(1);
            }
        } catch (error: any) {
            console.log("update campaign status Err ---->", error?.message);
            setIsUpdateLoading(false);
        }
    };

    const getOptions = (status: string) => {
        if (status === "0") {
            return options;
        } else if (status === "1") {
            let newOption = options.map((x) => {
                return {
                    ...x,
                    isDisabled: x.value === "2" ? true : false,
                };
            });
            return newOption;
        } else if (status === "2") {
            let newOption = options.map((x) => {
                return {
                    ...x,
                    isDisabled: x.value === "1" ? true : false,
                };
            });
            return newOption;
        } else {
            return options;
        }
    };

    const ondeleteLiveAgentEntry = async () => {
        try {
            let payload = {
                status: "6",
                campaign_uuid: false,
                type: "hangup",
            };
            await dispatch(updateLiveAgentEntry(payload)).unwrap();
        } catch (error: any) {
            console.log("Agent Entry err --->", error?.message);
        }
    };

    const onRoleChange = () => {
        ondeleteLiveAgentEntry();
        switchRole();
        setCamoaignModalOpen(false);
        Cookies.set("campaign_modal", "1", { expires: 1 });
    };

    return (
        <Modal
            isLoading={isUpdateLoading}
            visible={campaignModalOpen}
            title="Select Campaign"
            doneText="Save Changes"
            onCancleClick={() => {
                setCamoaignModalOpen(false);
                Cookies.set("campaign_modal", "1", { expires: 1 });
            }}
            onDoneClick={() => {
                if (
                    isCallHangUp ||
                    Cookies.get("is_call_start") === "0" ||
                    !isCallResume
                ) {
                    Danger("You are not able to make changes of campaign");
                } else {
                    onSubmit();
                }
            }}
        >
            <div className="h-[calc(100vh-265px)] overflow-y-auto scrollbar-hide">
                {isLoading ? (
                    <div className="h-[calc(100vh-265px)] w-full">
                        <Loader />
                    </div>
                ) : (
                    <>
                        {(campaignInboundDetails.length > 0 ||
                            campaignOutboundDetails.length > 0 ||
                            campaignBlendedDetails.length > 0) && (
                                <div className="flex">
                                    {/* Inbound Campaigns */}
                                    {campaignInboundDetails.length > 0 && (
                                        <div className="w-1/3 border-r border-gray-200 px-4">
                                            <span className="text-sm font-bold text-heading">
                                                Inbound Campaign
                                            </span>
                                            <div className="w-full pb-4 pt-2">
                                                {campaignInboundDetails.map(
                                                    (val: any, index: number) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between pb-[12px]"
                                                        >
                                                            <label className="text-xs text-heading font-semibold">
                                                                {val.name}
                                                            </label>
                                                            <InlineSwitch
                                                                trueName="Login"
                                                                falseName="Logout"
                                                                checked={
                                                                    initialValues[val.uuid] !== "2"
                                                                }
                                                                onChange={(e: any) => {
                                                                    setInitialValues({
                                                                        ...initialValues,
                                                                        [val.uuid]: e.target.checked
                                                                            ? "0"
                                                                            : "2",
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* Outbound Campaigns */}
                                    {campaignOutboundDetails.length > 0 && (
                                        <div className="w-1/3 border-r border-gray-200 px-4">
                                            <span className="text-sm font-bold text-heading">
                                                Outbound Campaign
                                            </span>
                                            <div className="w-full pb-4 pt-2">
                                                {campaignOutboundDetails.map(
                                                    (val: any, index: number) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between pb-[12px]"
                                                        >
                                                            <label className="text-xs text-heading font-semibold">
                                                                {val.name}
                                                            </label>
                                                            <InlineSwitch
                                                                trueName="Login"
                                                                falseName="Logout"
                                                                checked={
                                                                    initialValues[val.uuid] !== "2"
                                                                }
                                                                onChange={(e: any) => {
                                                                    setInitialValues({
                                                                        ...initialValues,
                                                                        [val.uuid]: e.target.checked
                                                                            ? "0"
                                                                            : "2",
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* Blended Campaigns */}
                                    {campaignBlendedDetails.length > 0 && (
                                        <div className="w-1/3 px-4">
                                            <span className="text-sm font-bold text-heading">
                                                Blended Campaign
                                            </span>
                                            <div className="w-full pb-4 pt-2">
                                                {campaignBlendedDetails.map(
                                                    (val: any, index: number) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between pb-[12px]"
                                                        >
                                                            <label className="text-xs text-heading font-semibold">
                                                                {val.name}
                                                            </label>
                                                            <InlineSwitch
                                                                trueName="Login"
                                                                falseName="Logout"
                                                                checked={
                                                                    initialValues[val.uuid] !== "2"
                                                                }
                                                                onChange={(e: any) => {
                                                                    setInitialValues({
                                                                        ...initialValues,
                                                                        [val.uuid]: e.target.checked
                                                                            ? "0"
                                                                            : "2",
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        {/* No Campaigns Found */}
                        {campaignInboundDetails.length === 0 &&
                            campaignOutboundDetails.length === 0 &&
                            campaignBlendedDetails.length === 0 && (
                                <div className="h-[calc(100vh-265px)] flex justify-center items-center">
                                    <div className="flex flex-col items-center gap-y-4">
                                        <Chip title="No Campaigns Found" />
                                        <Button
                                            text="Back to PBX mode"
                                            icon="backIcon"
                                            className="px-2 py-1 rounded-md"
                                            style="primary-outline"
                                            onClick={onRoleChange}
                                        />
                                    </div>
                                </div>
                            )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default CampaignModal;
