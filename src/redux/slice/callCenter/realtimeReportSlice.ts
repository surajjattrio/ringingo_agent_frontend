import { useMemo } from "react";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// PROJECT IMPORT
import { RootState } from "../../store";
import { useAppSelector } from "../../hooks";
import {
    callPause,
    getCampaign,
    getRealTimeReport,
    searchRealTimeReport,
} from "@/redux/services/callCenter/realtimeReportServices";

interface InitialState {
    agentsList: any;
    agentsLiveData: any;
    campaignDetails: any;
    campaignOptions: any;
}

const initialState: InitialState = {
    agentsList: [],
    agentsLiveData: {},
    campaignDetails: [],
    campaignOptions: [],
};

export const realTimeReportGet = createAsyncThunk(
    "realtime-report/get",
    async (params: any) => {
        return await getRealTimeReport(params);
    }
);

export const agentCallPause = createAsyncThunk(
    "realtime-report/agent-call-pause",
    async (payload: any) => {
        return await callPause(payload);
    }
);

export const realTimeReportSearch = createAsyncThunk(
    "realtime-report/search",
    async (params: any) => {
        return await searchRealTimeReport(params);
    }
);

export const campaignGet = createAsyncThunk("campaign/list", async () => {
    return await getCampaign();
});

const realtimeReportSlice = createSlice({
    name: "realtimeReport",
    initialState,
    reducers: {
        clearRealtimeReport: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(
            realTimeReportGet.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.agentsLiveData = action.payload?.agents_live_data || {};
                let newAgentsList = action.payload?.agents_list || [];
                newAgentsList?.length &&
                    newAgentsList?.map((x: any) => {
                        x.agent_status =
                            x.status === "0"
                                ? "Idle"
                                : x.status === "1"
                                    ? "On Incoming call"
                                    : x.status === "2"
                                        ? "On Outgoing call"
                                        : x.status === "3"
                                            ? "Break"
                                            : x.status === "4"
                                                ? "Pause"
                                                : x.status === "5"
                                                    ? "ACW"
                                                    : "";
                        x.loginTime = x?.from_last_logged_in ? x?.from_last_logged_in : "";
                        x.background =
                            x.status === "0"
                                ? "#ABFFCA"
                                : x.status === "1"
                                    ? x.from_last_logged_in
                                        ? parseInt(x.from_last_logged_in) < 3
                                            ? "#C8C7FF"
                                            : parseInt(x.from_last_logged_in) > 15
                                                ? "#C7F7FF"
                                                : "#44F43E"
                                        : "#FFFFFF"
                                    : x.status === "3"
                                        ? "#FFA8A8"
                                        : x.status === "4"
                                            ? "#FFFEAB"
                                            : x.status === "5"
                                                ? "#83D5FF"
                                                : "#FFFFFF";
                    });
                let newCampaignDetails = action.payload?.campaign_details || [];
                newCampaignDetails?.length &&
                    newCampaignDetails?.map((x: any) => {
                        x.campaignName = x.campaign_name?.[0] || "";
                        x.campaignType =
                            x.campaign_type === "0"
                                ? "Outbound"
                                : x.campaign_type === "2"
                                    ? "Blended"
                                    : x.campaign_type === "1"
                                        ? "Inbound"
                                        : "Inbound";
                    });
                newCampaignDetails.length &&
                    newCampaignDetails?.sort((a: any, b: any) =>
                        a["campaignName"]?.toLowerCase() < b["campaignName"]?.toLowerCase()
                            ? -1
                            : 1
                    );

                newAgentsList.length &&
                    newAgentsList?.sort((a: any, b: any) =>
                        a["agent_name"]?.toLowerCase() < b["agent_name"]?.toLowerCase()
                            ? -1
                            : 1
                    );

                state.campaignDetails = newCampaignDetails;
                state.agentsList = newAgentsList;
            }
        );
        builder.addCase(
            realTimeReportSearch.fulfilled,
            (state, action: PayloadAction<any>) => {
                let newAgentsList = action.payload?.data || [];
                newAgentsList?.length &&
                    newAgentsList?.map((x: any) => {
                        x.agent_status =
                            x.status === "0"
                                ? "Idle"
                                : x.status === "1"
                                    ? "On Incoming call"
                                    : x.status === "2"
                                        ? "On Outgoing call"
                                        : x.status === "3"
                                            ? "Break"
                                            : x.status === "4"
                                                ? "Pause"
                                                : x.status === "5"
                                                    ? "ACW"
                                                    : "";
                        x.loginTime = x?.from_last_logged_in ? x?.from_last_logged_in : "";
                        x.background =
                            x.status === "0"
                                ? "#ABFFCA"
                                : x.status === "1"
                                    ? x.from_last_logged_in
                                        ? parseInt(x.from_last_logged_in) < 3
                                            ? "#C8C7FF"
                                            : parseInt(x.from_last_logged_in) > 15
                                                ? "#C7F7FF"
                                                : "#44F43E"
                                        : "#FFFFFF"
                                    : x.status === "3"
                                        ? "#FFA8A8"
                                        : x.status === "4"
                                            ? "#FFFEAB"
                                            : x.status === "5"
                                                ? "#83D5FF"
                                                : "#FFFFFF";
                    });

                newAgentsList.length &&
                    newAgentsList?.sort((a: any, b: any) =>
                        a["agent_name"]?.toLowerCase() < b["agent_name"]?.toLowerCase()
                            ? -1
                            : 1
                    );
                state.agentsList = newAgentsList;
            }
        );
        builder.addCase(
            campaignGet.fulfilled,
            (state, action: PayloadAction<any>) => {
                const newData = action.payload.data || [];
                let inboundData = newData?.inbound_campaign || [];
                let outboundData = newData?.outbound_campaign || [];
                let prepareData = [...inboundData, ...outboundData];
                state.campaignOptions = prepareData?.map((val: any) => ({
                    value: val?.uuid,
                    label: val?.name,
                }));
            }
        );
    },
});

export default realtimeReportSlice.reducer;
export const { clearRealtimeReport } = realtimeReportSlice.actions;

export const selectRealtimeAgentsList = (state: RootState) =>
    state.realtimeReport.agentsList;
export const useRealtimeAgentsList = () => {
    const agentsList = useAppSelector(selectRealtimeAgentsList);
    return useMemo(() => agentsList, [agentsList]);
};

export const selectRealtimeLiveData = (state: RootState) =>
    state.realtimeReport.agentsLiveData;
export const useRealtimeLiveData = () => {
    const agentsLiveData = useAppSelector(selectRealtimeLiveData);
    return useMemo(() => agentsLiveData, [agentsLiveData]);
};

export const selectRealtimeCampaignDetails = (state: RootState) =>
    state.realtimeReport.campaignDetails;
export const useRealtimeCampaignDetails = () => {
    const campaignDetails = useAppSelector(selectRealtimeCampaignDetails);
    return useMemo(() => campaignDetails, [campaignDetails]);
};

export const seletCampaignOptions = (state: RootState) =>
    state.realtimeReport.campaignOptions;
export const useCampaignOptions = () => {
    const campaignOptions = useAppSelector(seletCampaignOptions);
    return useMemo(() => campaignOptions, [campaignOptions]);
};
