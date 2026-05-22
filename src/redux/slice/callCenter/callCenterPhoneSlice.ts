import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks";

// THIRD-PARTY IMPORT
import { intervalToDuration, formatDistanceStrict, format } from "date-fns";
import {
  addReport,
  allHangupCauseGet,
  allLeadsGet,
  allNotesGet,
  hangupLeadDial,
  manualDial,
  skipLeadDial,
  top10RecordsGet,
  blackList,
  getCallwaitingCount,
  getParentDisposition,
} from "@/redux/services/callCenter/callCenterPhoneService";
import Cookies from "js-cookie";
import { singleLeadGet } from "@/redux/services/leadListService";
import { getSingleLeadInfo } from "@/redux/slice/leadListSlice";

// TYPES
interface InitialState {
  top10CdrsDetails: any;
  isCdrsLoading: boolean;
  allNotesDetails: any;
  isAllNotesLoading: boolean;
  allLeadsDetails: any;
  isAllLeadsLoading: boolean;
  allHangupCause: any;
  singleLeadDetails: any;
  singleChatLeadDetails: any;
  leadUuid: string | null;
  callWaitingCount: any;
  customCallId: string | null;
  pollingSessionId: string | null;
}

/* ============================== PHONE SLICE ============================== */

const initialState: InitialState = {
  top10CdrsDetails: [],
  isCdrsLoading: false,
  allNotesDetails: [],
  isAllNotesLoading: false,
  allLeadsDetails: [],
  isAllLeadsLoading: false,
  allHangupCause: [],
  singleLeadDetails: {},
  singleChatLeadDetails: {},
  leadUuid: null,
  callWaitingCount: {},
  customCallId: null,
  pollingSessionId: null,
};

export const getTop10Records = createAsyncThunk(
  "phone/top10 Records",
  async (params: any) => {
    return await top10RecordsGet(params);
  }
);

export const getAllNotes = createAsyncThunk(
  "phone/all-notes",
  async (params: any) => {
    return await allNotesGet(params);
  }
);

export const getAllLeads = createAsyncThunk(
  "phone/all-leads",
  async (params: any, thunkAPI) => {
    const { signal, getState } = thunkAPI;
    const isPollingMode = params.campaign_mode === "2";
    const sessionId = Date.now().toString();

    // ✅ Track this specific polling session
    if (isPollingMode) {
      thunkAPI.dispatch(setPollingSessionId(sessionId));
    }

    const delay = (ms: number) =>
      new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, ms);
        signal.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new Error("Aborted"));
        }, { once: true });
      });

    while (!signal.aborted) {
      // ✅ If a new polling session has started elsewhere, terminate this one
      const currentSessionId = (getState() as any).callCenterPhone.pollingSessionId;
      if (isPollingMode && currentSessionId !== sessionId) {
        return;
      }

      try {
        const response: any = await allLeadsGet(params);
        // Success: Found a lead
        if (response?.statusCode === 200 && response?.data) {
          return response;
        }

        // If not in polling mode, return whatever we got immediately
        if (!isPollingMode) return response;
      } catch (error: any) {
        if (signal.aborted) throw error;

        const errorResponse = error?.response?.data;
        // Termination condition: Specifically handle the 404 error response
        if (
          errorResponse?.statusCode === 404 &&
          errorResponse?.data === "No more lead found from this campaign"
        ) {
          return errorResponse;
        }

        // If not in polling mode, rethrow the error
        if (!isPollingMode) throw error;

        console.error("Lead polling error, retrying...", error?.message || error);
      }

      thunkAPI.dispatch(setAllLeadsLoading(false));

      // Wait 10 seconds before next poll (only for Mode 2)
      await delay(10000);

      if (!signal.aborted) {
        thunkAPI.dispatch(setAllLeadsLoading(true));
      }
    }

    throw new Error("Polling aborted");
  }
);

export const getSingleLead = createAsyncThunk(
  "phone/single-lead",
  async (id: string) => {
    return await singleLeadGet(id);
  }
);

export const getSingleChatLead = createAsyncThunk(
  "chat/single-lead",
  async (id: string) => {
    return await singleLeadGet(id);
  }
);

export const getSingleParentDisposition = createAsyncThunk(
  "parent-dispositon/single",
  async (id: string) => {
    return await getParentDisposition(id);
  }
);

export const getAllHangupCause = createAsyncThunk(
  "phone/all-hangup-cause",
  async (params: any) => {
    return await allHangupCauseGet(params);
  }
);

export const onSkipLeadDial = createAsyncThunk(
  "phone/skip-lead",
  async (payload: any) => {
    const data = { ...payload };
    const lead_management_uuid = data?.lead_management_uuid;
    delete data["lead_management_uuid"];
    return skipLeadDial(lead_management_uuid, data);
  }
);

export const leadHangup = createAsyncThunk(
  "phone/hangup-lead",
  async (payload: any) => {
    const { lead_management_uuid, ...rest } = payload;
    return hangupLeadDial(lead_management_uuid, rest);
  }
);

export const reportAdd = createAsyncThunk(
  "Agent/report-add",
  async (payload: any) => {
    const { feature, operation } = payload;
    return addReport(feature, operation);
  }
);

export const dialManual = createAsyncThunk(
  "phone/manual-dial",
  async (payload: any) => {
    return manualDial(payload);
  }
);

export const blackListCallCenter = createAsyncThunk(
  "agent-call-center/add-blacklist-entry",
  async (payload: any) => {
    return await blackList(payload);
  }
);

// Create async thunk to fetch call waiting count data
export const fetchCallWaitingCount = createAsyncThunk(
  "realtime-report/fetchCallWaitingCount",
  async (params: any) => {
    return await getCallwaitingCount(params);
  }
);

const callCenterPhoneSlice = createSlice({
  name: "callCenterPhone",
  initialState,
  reducers: {
    setPollingSessionId: (state, action: PayloadAction<string | null>) => {
      state.pollingSessionId = action.payload;
    },
    clearCallCenterPhoneSlice: () => initialState,
    changeLeadDetails(state, action) {
      state.allLeadsDetails = action.payload || [];
    },
    clearSingleLeadDetails(state) {
      state.singleLeadDetails = {};
    },
    clearSingleChatLeadDetails(state) {
      state.singleChatLeadDetails = {};
    },
    setAllLeadsLoading: (state, action: PayloadAction<boolean>) => {
      state.isAllLeadsLoading = action.payload;
    },
    clearLeadDetails: (state) => {
      state.allLeadsDetails = [];
      state.singleLeadDetails = {};
      state.leadUuid = null;
    },
    clearLeadUuid(state) {
      state.leadUuid = null;
    },
    clearCustomCallId(state) {
      state.customCallId = null;
    },
    setCustomCallId(state, action) {
      state.customCallId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTop10Records.pending, (state, action: PayloadAction<any>) => {
        state.isCdrsLoading = true;
      })
      .addCase(
        getTop10Records.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (typeof action.payload.data === "string") {
            state.top10CdrsDetails = action.payload.data;
            state.isCdrsLoading = false;
          } else {
            const newData = action.payload.data;
            newData?.length &&
              newData?.map((val: any) => {
                let newTime: any = intervalToDuration({
                  start: 0,
                  end: val.billsecond * 1000,
                });
                let day: any = formatDistanceStrict(
                  new Date(),
                  new Date(val.callstart),
                  { unit: "day" }
                );
                val.takeTime = `${(newTime?.hours > 9 ? newTime.hours : "0" + newTime.hours) +
                  ":" +
                  (newTime?.minutes > 9
                    ? newTime.minutes
                    : "0" + newTime.minutes) +
                  ":" +
                  (newTime?.seconds > 9
                    ? newTime.seconds
                    : "0" + newTime.seconds)
                  }`;
                val.day = `${day === "0 days"
                  ? "Today"
                  : day === "1 days"
                    ? "Yesterday"
                    : day + " ago"
                  }`;
                val.destination_number = val.destination_number
                  .replace("\\", "")
                  .replace("+", "");
              });
            state.top10CdrsDetails = newData;
            state.isCdrsLoading = false;
          }
        }
      )
      .addCase(
        getTop10Records.rejected,
        (state, action: PayloadAction<any>) => {
          state.isCdrsLoading = false;
        }
      );
    builder
      .addCase(getAllNotes.pending, (state, action: PayloadAction<any>) => {
        state.isAllNotesLoading = true;
      })
      .addCase(getAllNotes.fulfilled, (state, action: PayloadAction<any>) => {
        if (typeof action.payload.data === "string") {
          state.allNotesDetails = [];
          state.isAllNotesLoading = false;
        } else {
          const newData = action.payload.data;
          newData?.map((val: any) => {
            let day: any = formatDistanceStrict(
              new Date(),
              new Date(val?.createdAt),
              { unit: "day" }
            );
            (val.day = `${day === "0 days"
              ? "Today"
              : day === "1 days"
                ? "Yesterday"
                : day + " ago"
              }`),
              (val.date = format(new Date(val?.createdAt), "dd/MM/yyyy")),
              (val.time = format(new Date(val?.createdAt), "h:mm a")),
              (val.name = val?.user[0]?.username);
          });
          state.allNotesDetails = newData;
          state.isAllNotesLoading = false;
        }
      })
      .addCase(getAllNotes.rejected, (state, action: PayloadAction<any>) => {
        state.allNotesDetails = [];
        state.isAllNotesLoading = false;
      });
    builder
      .addCase(getAllLeads.pending, (state, action: PayloadAction<any>) => {
        state.isAllLeadsLoading = true;
        state.allLeadsDetails = [];
        state.singleLeadDetails = {};
        state.leadUuid = null;
      })
      .addCase(getAllLeads.fulfilled, (state, action: PayloadAction<any>) => {
        if (typeof action.payload.data === "string") {
          state.allLeadsDetails = [];
          state.allNotesDetails = [];
          Cookies.set("lead_information", "1");
          Cookies.remove("lead_uuid");
          state.leadUuid = null;
          state.isAllLeadsLoading = false;
        } else {
          const newData = action.payload.data?.lead_details;
          const outbound_campaign_details =
            action.payload.data?.outbound_campaign_details;
          Cookies.set("lead_uuid", newData[0]?.lead_management_uuid);
          state.leadUuid = newData[0]?.lead_management_uuid;
          Cookies.set("lead_information", "1");
          newData.map((val: any) => {
            val.number_masking = outbound_campaign_details[0]?.number_masking;
          });
          state.allLeadsDetails = newData;
          state.isAllLeadsLoading = false;
        }
      })
      .addCase(getAllLeads.rejected, (state, action: PayloadAction<any>) => {
        Cookies.remove("lead_uuid");
        state.leadUuid = null;
        state.isAllLeadsLoading = false;
      });
    builder.addCase(
      getAllHangupCause.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (typeof action.payload === "string") {
          state.allHangupCause = [];
        } else {
          const newData = action.payload;
          // console.log("items newDatanewData",newData);

          state.allHangupCause = newData.map((val: any) => ({
            value:
              val.disposition_uuid || val.outbound_campaign_disposition_uuid,
            label: val.name,
            code: val?.code,
            callback: val?.callback,
            has_children: val?.has_children,
            children: val?.children,
          }));
        }
      }
    );
    builder.addCase(
      getSingleLead.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (typeof action.payload === "string") {
          state.singleLeadDetails = {};
        } else {
          const newData = action.payload.data;
          state.singleLeadDetails = newData;
        }
      }
    );
    builder.addCase(
      getSingleChatLead.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (typeof action.payload === "string") {
          state.singleChatLeadDetails = {};
        } else {
          const newData = action.payload.data;
          state.singleChatLeadDetails = newData;
        }
      }
    );
    // Add case to handle fulfilled action of fetching call waiting count data
    builder.addCase(
      fetchCallWaitingCount.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.callWaitingCount = action.payload;
      });
    builder.addCase(
      getSingleLeadInfo.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action.payload && action.payload.statusCode === 200) {
          const cdrs = action.payload.data?.[1]?.cdrs_and_notes || [];
          if (cdrs.length > 0) {
            state.customCallId = cdrs[0]?.cdrs_info?.custom_callid || null;
          }
        }
      }
    );
  },
});

export default callCenterPhoneSlice.reducer;
export const {
  clearCallCenterPhoneSlice,
  clearLeadDetails,
  changeLeadDetails,
  clearLeadUuid,
  clearSingleLeadDetails,
  clearSingleChatLeadDetails,
  clearCustomCallId,
  setAllLeadsLoading,
  setPollingSessionId,
} = callCenterPhoneSlice.actions;

export const selectTop10Cdrs = (state: RootState) =>
  state.callCenterPhone.top10CdrsDetails;
export const useTop10Cdrs = () => {
  const top10CdrsDetails = useAppSelector(selectTop10Cdrs);
  return useMemo(() => top10CdrsDetails, [top10CdrsDetails]);
};

export const selectIsCdrsLoading = (state: RootState) =>
  state.callCenterPhone.isCdrsLoading;
export const useIsCdrsLoading = () => {
  const isCdrsLoading = useAppSelector(selectIsCdrsLoading);
  return useMemo(() => isCdrsLoading, [isCdrsLoading]);
};

export const selectAllNotesDetails = (state: RootState) =>
  state.callCenterPhone.allNotesDetails;
export const useAllNotesDetails = () => {
  const allNotesDetails = useAppSelector(selectAllNotesDetails);
  return useMemo(() => allNotesDetails, [allNotesDetails]);
};

export const selectIsAllNotesLoading = (state: RootState) =>
  state.callCenterPhone.isAllNotesLoading;
export const useIsAllNotesLoading = () => {
  const isAllNotesLoading = useAppSelector(selectIsAllNotesLoading);
  return useMemo(() => isAllNotesLoading, [isAllNotesLoading]);
};

export const selectAllLeadDetails = (state: RootState) =>
  state.callCenterPhone.allLeadsDetails;
export const useAllLeadDetails = () => {
  const allLeadsDetails = useAppSelector(selectAllLeadDetails);
  return useMemo(() => allLeadsDetails, [allLeadsDetails]);
};

export const selectIsAllLeadsLoading = (state: RootState) =>
  state.callCenterPhone.isAllLeadsLoading;
export const useIsAllLeadsLoading = () => {
  const isAllLeadsLoading = useAppSelector(selectIsAllLeadsLoading);
  return useMemo(() => isAllLeadsLoading, [isAllLeadsLoading]);
};

export const selectHangupCause = (state: RootState) =>
  state.callCenterPhone.allHangupCause;
export const useHangupCause = () => {
  const allHangupCause = useAppSelector(selectHangupCause);
  return useMemo(() => allHangupCause, [allHangupCause]);
};

export const selectSingleLead = (state: RootState) =>
  state.callCenterPhone.singleLeadDetails;
export const useSingleLeadDetails = () => {
  const singleLeadDetails = useAppSelector(selectSingleLead);
  return useMemo(() => singleLeadDetails, [singleLeadDetails]);
};

export const selectSingleChatLead = (state: RootState) =>
  state.callCenterPhone.singleChatLeadDetails;
export const useSingleChatLeadDetails = () => {
  const singleChatLeadDetails = useAppSelector(selectSingleChatLead);
  return useMemo(() => singleChatLeadDetails, [singleChatLeadDetails]);
};

export const selectLeadUuid = (state: RootState) =>
  state.callCenterPhone.leadUuid;
export const useLeadUuid = () => {
  const leadUuid = useAppSelector(selectLeadUuid);
  return useMemo(() => leadUuid, [leadUuid]);
};

// Selectors to access call waiting count data from the state
export const selectCallWaitingCount = (state: RootState) =>
  state.callCenterPhone.callWaitingCount;
export const useCallWaitingCount = () =>
  useAppSelector(selectCallWaitingCount);

export const selectCustomCallId = (state: RootState) =>
  state.callCenterPhone.customCallId;
export const useCustomCallId = () => {
  const customCallId = useAppSelector(selectCustomCallId);
  return useMemo(() => customCallId, [customCallId]);
};
