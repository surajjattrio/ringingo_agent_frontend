import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { useAppSelector } from "../hooks";
import {
    agentCampaignUpdate,
    agentStatusUpdate,
    callQueueListGet,
    campaignGet,
    campaignListGet,
    campaignOptionGet,
    campaignResume,
    campaignWebFormGet,
    blendedcampaignWebFormGet,
    inboundcampaignWebFormGet,
    campaigPause,
    dialLevelUpdate,
    inboundCallQueue,
    leadStatusUpdate,
    liveAgentEntryAdd,
    liveAgentEntryDelete,
    liveAgentEntryUpdate,
    webformSendPost,
} from "../services/campaignService";

// TYPES
import { AllListParamsType } from "@/types/filterTypes";
import {
    PauseCampaignTypes,
    ResumeCampaignTypes,
} from "@/types/campaignSliceTypes";

interface InitialState {
    campaignDetails: any;
    campaignOptions: any;
    campaignList: any;
    isCallResume: boolean;
    callQueueList: any;
    campaignWebformList: any;
}

/* ============================== CAMPAIGN SLICE ============================== */

const initialState: InitialState = {
    campaignDetails: [],
    campaignOptions: [],
    campaignList: [],
    isCallResume: true,
    callQueueList: [],
    campaignWebformList: []
};

export const getCampaign = createAsyncThunk(
    "outbound-campaign/list",
    async (params: AllListParamsType) => {
        return await campaignGet(params);
    }
);

export const getCampaignList = createAsyncThunk(
    "outbound-campaign/status-list",
    async () => {
        return await campaignListGet();
    }
);

export const updateAgentCampaign = createAsyncThunk(
    "outbound-campaign/status-update",
    async (payload: any) => {
        const { feature, ...rest } = payload;
        return await agentCampaignUpdate(feature, rest);
    }
);

export const getCampaignOption = createAsyncThunk(
    "outbound-campaign/Options",
    async (params: AllListParamsType) => {
        return await campaignOptionGet(params);
    }
);

export const resumeCampaign = createAsyncThunk(
    "auto-campaign/resume",
    async (payload: ResumeCampaignTypes) => {
        return await campaignResume(payload);
    }
);

export const pauseCampaign = createAsyncThunk(
    "auto-campaign/pause",
    async (payload: PauseCampaignTypes) => {
        return await campaigPause(payload);
    }
);

export const updateAgentStatus = createAsyncThunk(
    "auto-campaign/agent-status",
    async (payload: any) => {
        return await agentStatusUpdate(payload);
    }
);

export const addLiveAgentEntry = createAsyncThunk(
    "agent/add-entry-live-report",
    async (payload: any) => {
        return await liveAgentEntryAdd(payload);
    }
);

export const updateLiveAgentEntry = createAsyncThunk(
  "agent/edit-entry-live-report",
  async (payload: any) => {
    // const campaign_uuid = payload?.campaign_uuid || localStorage.getItem("campaign_uuid");
    const campaign_uuid = payload?.campaign_uuid;
    const { ...rest } = payload;

    return await liveAgentEntryUpdate(campaign_uuid, {
      ...rest,
      campaign_uuid
    });
  }
);


export const deleteLiveAgentEntry = createAsyncThunk(
    "agent/delete-entry-live-report",
    async (id: string) => {
        return await liveAgentEntryDelete(id);
    }
);

export const getCallQueueList = createAsyncThunk(
    "call-queue/list",
    async (params: any) => {
        const { id, ...rest } = params
        return await callQueueListGet(id, rest);
    }
);

export const updateLeadStatus = createAsyncThunk(
    "call-center/lead-status-update",
    async (payload: any) => {
        return await leadStatusUpdate(payload);
    }
);

export const updateDialLevel = createAsyncThunk(
    "predictive-call/dial-level-update",
    async (payload: any) => {
        const { campaign_uuid, campaignType, ...rest } = payload;
        return await dialLevelUpdate(campaign_uuid, campaignType, rest);
    }
);

export const callQueueInbound = createAsyncThunk(
    "inbound/call-queue",
    async (payload: any) => {
        const { feature, ...rest } = payload;
        return await inboundCallQueue(feature, rest);
    }
);

export const sendWebform = createAsyncThunk(
    "webform/send",
    async (payload: any) => {
        return await webformSendPost(payload);
    }
);

export const campaignWebForms = createAsyncThunk(
    "feature/campaign",
    async (payload: any) => {
        return await campaignWebFormGet(payload);
    }
);

export const blendedcampaignWebForms = createAsyncThunk(
    "feature/campaign",
    async (payload: any) => {
        return await blendedcampaignWebFormGet(payload);
    }
);

export const inboundcampaignWebForms = createAsyncThunk(
    "feature/campaign",
    async (payload: any) => {
        return await inboundcampaignWebFormGet(payload);
    }
);

const campaignSlice = createSlice({
    name: "campaign",
    initialState,
    reducers: {
        setCallResume(state, action: PayloadAction<any>) {
            state.isCallResume = action.payload;
        },
        clearWebFormSlice: (state) => {
            state.campaignWebformList = [];
        },
        clearCampaignSlice: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(
            getCampaignOption.fulfilled,
            (state, action: PayloadAction<any>) => {
                if (typeof action.payload.data === "string") {
                    state.campaignOptions = action.payload.data;
                } else {
                    const newData = action.payload.data;
                    let nData = newData.map((val: any) => {
                        return {
                            value: val?.uuid || "",
                            label: val?.campaign_name || "",
                            dial_method: val?.dial_method || "",
                            campaign_type: val?.campaign_type || "",
                            recording: val?.recording || "1",
                            number_masking: val?.number_masking || "1",
                            current_dial_level: val?.current_dial_level || "",
                            target_drop_percent: val?.target_drop_percent || "",
                            max_dial_level: val?.max_dial_level || "",
                            minimum_calls: val?.minimum_calls || "",
                            wrap_up_time: val?.wrap_up_time || "",
                            wrap_up_disposition: val?.wrap_up_disposition || "",
                            auto_answer: val?.auto_answer || "1",
                            agent_script: val?.agent_script || "1",
                            agent_script_text: val?.agent_script_text || "",
                            email_config_uuid: val?.email_config_uuid || "",
                            api_config_uuid: val?.api_config_uuid || "",
                            email_type: val?.email_type || "none",
                            message_config_uuid: val?.message_config_uuid || "",
                            campaign:
                                val?.campaign_type === "0"
                                    ? "outbound"
                                    : val?.campaign_type === "2"
                                        ? "blended"
                                        : "inbound",
                        };
                    });
                    let group1 = nData?.filter((x: any) => x.campaign === "outbound");
                    let group2 = nData?.filter((x: any) => x.campaign === "inbound");
                    let group3 = nData?.filter((x: any) => x.campaign === "blended");
                    let prepareData: any = [
                        {
                            label: "Outbound",
                            options: [...group1],
                        },
                        {
                            label: "Inbound",
                            options: [...group2],
                        },
                        {
                            label: "Blended",
                            options: [...group3],
                        },
                    ];
                    state.campaignOptions = prepareData || [];
                }
            }
        );
        builder.addCase(
            getCampaign.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.campaignDetails = action.payload.data;
            }
        );
        builder.addCase(
            getCallQueueList.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.callQueueList = action.payload.data || [];
            }
        );
        builder.addCase(
            campaignWebForms.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.campaignWebformList = action.payload?.data?.webform_uuid || [];
            }
        );
    },
});

export default campaignSlice.reducer;
export const { clearCampaignSlice, setCallResume, clearWebFormSlice } = campaignSlice.actions;

export const seletCampaignDetails = (state: RootState) =>
    state.campaign.campaignDetails;
export const useCampaignDetails = () => {
    const campaignDetails = useAppSelector(seletCampaignDetails);
    return useMemo(() => campaignDetails, [campaignDetails]);
};

export const seletCampaignOptions = (state: RootState) =>
    state.campaign.campaignOptions;
export const useCampaignOptions = () => {
    const campaignOptions = useAppSelector(seletCampaignOptions);
    return useMemo(() => campaignOptions, [campaignOptions]);
};

export const seletCampaignList = (state: RootState) =>
    state.campaign.campaignList;
export const useCampaignList = () => {
    const campaignList = useAppSelector(seletCampaignList);
    return useMemo(() => campaignList, [campaignList]);
};

export const selectCallResume = (state: RootState) =>
    state.campaign.isCallResume;
export const useCallResume = () => {
    const isCallResume = useAppSelector(selectCallResume);
    return useMemo(() => isCallResume, [isCallResume]);
};

export const selectCallQueueList = (state: RootState) =>
    state.campaign.callQueueList;
export const useActiveCallQueueList = () => {
    const callQueueList = useAppSelector(selectCallQueueList);
    return useMemo(() => callQueueList, [callQueueList]);
};

export const selectWebformList = (state: RootState) =>
    state.campaign.campaignWebformList;
export const useWebformList = () => {
    const webformListList = useAppSelector(selectWebformList);
    return useMemo(() => webformListList, [webformListList]);
};
