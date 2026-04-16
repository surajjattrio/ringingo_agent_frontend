import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { useAppSelector } from "../hooks";

// THIRD-PARTY IMPORT
import {
  callQueueGet,
  extensionGet,
  presetGet,
  inBoundCallQueueListGet,
  inBoundIvrListGet,
  inBoundRingGroupListGet,
  ivrGet,
  outBoundCallQueueListGet,
  outBoundIvrListGet,
  outBoundRingGroupListGet,
  ringGroupGet,
  stickyAgent,
  checkDispostion,
  blendedCallQueueListGet,
  blendedIvrListGet,
  blendedRingGroupListGet,
} from "../services/callService";

// TYPES
import { AllListParamsType } from "@/types/filterTypes";
import { GetExtensionTypes } from "@/types/callSliceTypes";
import { GetPresetTypes } from "@/types/presetTypes";


interface InitialState {
  extensionList: any;
  presetList: any;
  callQueueOptionsList: any;
  ivrList: any;
  ringGroupList: any;
}

/* ============================== CALL SLICE ============================== */

const initialState: InitialState = {
  extensionList: [],
  presetList: [],
  callQueueOptionsList: [],
  ivrList: [],
  ringGroupList: [],
};

export const getExtension = createAsyncThunk(
  "extension/list",
  async (params: GetExtensionTypes) => {
    return await extensionGet(params);
  }
);

export const getPreset = createAsyncThunk(
  "preset/list",
  async (params: GetPresetTypes) => {
    return await presetGet(params);
  }
);

export const getCallQueue = createAsyncThunk(
  "call-queue/option-list",
  async (params: AllListParamsType) => {
    return await callQueueGet(params);
  }
);

export const getIvr = createAsyncThunk(
  "ivr/list",
  async (params: AllListParamsType) => {
    return await ivrGet(params);
  }
);

export const getRingGroup = createAsyncThunk(
  "ring-group/list",
  async (params: AllListParamsType) => {
    return await ringGroupGet(params);
  }
);

export const getOutboundCallQueueList = createAsyncThunk(
  "call-queue-call-center/outbound-list",
  async (params: any) => {
    const { campaign_uuid, ...rest } = params;
    return await outBoundCallQueueListGet(campaign_uuid, rest);
  }
);

export const getOutboundIvrList = createAsyncThunk(
  "ivr-call-center/outbound-list",
  async (params: any) => {
    const { campaign_uuid, ...rest } = params;
    return await outBoundIvrListGet(campaign_uuid, rest);
  }
);

export const getOutboundRingGroupList = createAsyncThunk(
  "ring-group-call-center/outbound-list",
  async (params: any) => {
    const { campaign_uuid, ...rest } = params;
    return await outBoundRingGroupListGet(campaign_uuid, rest);
  }
);

export const getInboundCallQueueList = createAsyncThunk(
  "call-queue-call-center/inbound-list",
  async (params: any) => {
    const { campaign_uuid, ...rest } = params;
    return await inBoundCallQueueListGet(campaign_uuid, rest);
  }
);

export const getInboundIvrList = createAsyncThunk(
  "ivr-call-center/inbound-list",
  async (params: any) => {
    const { campaign_uuid, ...rest } = params;
    return await inBoundIvrListGet(campaign_uuid, rest);
  }
);

export const getInboundRingGroupList = createAsyncThunk(
  "ring-group-call-center/inbound-list",
  async (params: any) => {
    const { campaign_uuid, ...rest } = params;
    return await inBoundRingGroupListGet(campaign_uuid, rest);
  }
);

export const getBlendedCallQueueList = createAsyncThunk(
  "call-queue-call-center/blended-list",
  async (params: any) => {
    const { campaign_uuid, ...rest } = params;
    return await blendedCallQueueListGet(campaign_uuid, rest);
  }
);

export const getBlendedIvrList = createAsyncThunk(
  "ivr-call-center/bledned-list",
  async (params: any) => {
    const { campaign_uuid, ...rest } = params;
    return await blendedIvrListGet(campaign_uuid, rest);
  }
);

export const getBlendedRingGroupList = createAsyncThunk(
  "ring-group-call-center/blended-list",
  async (params: any) => {
    const { campaign_uuid, ...rest } = params;
    return await blendedRingGroupListGet(campaign_uuid, rest);
  }
);

export const onStickyAgent = createAsyncThunk(
  "agent/sticky",
  async (payload: any) => {
    return await stickyAgent(payload);
  }
);

export const checkDispostionCause = createAsyncThunk(
  "check-disposition",
  async (payload: any) => {
    return await checkDispostion(payload);
  }
);

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    clearCallSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(
      getExtension.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data || [];
        state.extensionList = data?.map((val: any) => ({
          value: val.username,
          label: val.device_name + " (" + val.username + ")",
        }));
      }
    );

    builder.addCase(
      getPreset.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data || [];
        state.presetList = data?.map((val: any) => ({
          value: val.number,
          label: val.name,
        }));
      }
    );

    builder.addCase(
      getCallQueue.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data || [];
        state.callQueueOptionsList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );

    builder.addCase(getIvr.fulfilled, (state, action: PayloadAction<any>) => {
      const data = action.payload?.data || [];
      state.ivrList = data?.map((val: any) => ({
        value: val.uuid,
        label: val.name,
      }));
    });

    builder.addCase(
      getRingGroup.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data || [];
        state.ringGroupList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );

    builder.addCase(
      getOutboundCallQueueList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data?.allow_call_queue_transfer || [];
        state.callQueueOptionsList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );

    builder.addCase(
      getOutboundIvrList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data?.allow_ivr_transfer || [];
        state.ivrList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );

    builder.addCase(
      getOutboundRingGroupList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data?.allow_ring_group_transfer || [];
        state.ringGroupList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );

    builder.addCase(
      getInboundCallQueueList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data?.allow_call_queue_transfer || [];
        state.callQueueOptionsList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );
    
    builder.addCase(
      getBlendedCallQueueList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data?.allow_call_queue_transfer || [];
        state.callQueueOptionsList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );
    builder.addCase(
      getInboundIvrList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data?.allow_ivr_transfer || [];
        state.ivrList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );
    builder.addCase(
      getBlendedIvrList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data?.allow_ivr_transfer || [];
        state.ivrList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );

    builder.addCase(
      getInboundRingGroupList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data?.allow_ring_group_transfer || [];
        state.ringGroupList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );
     builder.addCase(
      getBlendedRingGroupList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data?.allow_ring_group_transfer || [];
        state.ringGroupList = data?.map((val: any) => ({
          value: val.uuid,
          label: val.name,
        }));
      }
    );
  },
});

export default callSlice.reducer;
export const { clearCallSlice } = callSlice.actions;

export const selectPresetList = (state: RootState) =>
  state.call.presetList;
export const usePresetList = () => {
  const presetList = useAppSelector(selectPresetList);
  return useMemo(() => presetList, [presetList]);
};

export const selectExtensionList = (state: RootState) =>
  state.call.extensionList;
export const useExtensionList = () => {
  const extensionList = useAppSelector(selectExtensionList);
  return useMemo(() => extensionList, [extensionList]);
};

export const selectCallQueueList = (state: RootState) =>
  state.call.callQueueOptionsList;
export const useCallQueueOptionList = () => {
  const callQueueOptionsList = useAppSelector(selectCallQueueList);
  return useMemo(() => callQueueOptionsList, [callQueueOptionsList]);
};

export const selectIvrList = (state: RootState) => state.call.ivrList;
export const useIvrList = () => {
  const ivrList = useAppSelector(selectIvrList);
  return useMemo(() => ivrList, [ivrList]);
};

export const selectRingGroupList = (state: RootState) =>
  state.call.ringGroupList;
export const useRingGroupList = () => {
  const ringGroupList = useAppSelector(selectRingGroupList);
  return useMemo(() => ringGroupList, [ringGroupList]);
};
