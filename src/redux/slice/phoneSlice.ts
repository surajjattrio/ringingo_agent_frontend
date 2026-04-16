import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import {
  callStatisticGet,
  leadSearch,
  missedCallListGet,
  voicemailListGet,
  blackList,
} from "../services/phoneService";
import { useAppSelector } from "../hooks";

// THIRD-PARTY IMPORT
import { intervalToDuration, formatDistanceStrict } from "date-fns";

// TYPES
interface InitialState {
  callStatisticDetails: any;
  isCallLoading: boolean;
  missedCallDetails: any;
  isMissedCallLoading: boolean;
  voicemailDetails: any;
  isVoicemailLoading: boolean;
  missedCallCount: number;
  showInfo: any;
}

/* ============================== PHONE SLICE ============================== */

const initialState: InitialState = {
  callStatisticDetails: {},
  isCallLoading: false,
  missedCallDetails: [],
  isMissedCallLoading: false,
  voicemailDetails: [],
  isVoicemailLoading: false,
  missedCallCount: 0,
  showInfo: null,
};

export const getCallStatistic = createAsyncThunk(
  "phone/call-statistic",
  async () => {
    return await callStatisticGet();
  }
);

export const getMissedCallDetails = createAsyncThunk(
  "phone/missed-call",
  async () => {
    return await missedCallListGet();
  }
);

export const getMissedCallCount = createAsyncThunk(
  "phone/missed-call-base",
  async () => {
    return await missedCallListGet();
  }
);

export const getVoicemailDetails = createAsyncThunk(
  "phone/voicemail",
  async () => {
    return await voicemailListGet();
  }
);

export const leadDetailsSearch = createAsyncThunk(
  "phone/lead-search",
  async (params: any) => {
    return await leadSearch(params);
  }
);

export const blackListCallCenter = createAsyncThunk(
  "agent-call-center/add-blacklist-entry",
  async (payload: any) => {
return await blackList(payload);
  }
);

const phoneSlice = createSlice({
  name: "phone",
  initialState,
  reducers: {
    onSetShowInfo(state, action: PayloadAction<any>) {
      state.showInfo = action.payload;
    },
    clearPhoneSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getCallStatistic.pending,
        (state, action: PayloadAction<any>) => {
          state.isCallLoading = true;
        }
      )
      .addCase(
        getCallStatistic.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (typeof action.payload.data === "string") {
            state.callStatisticDetails = action.payload.data;
            state.isCallLoading = false;
          } else {
            const newData = action.payload.data;
            newData?.top10Records.length &&
              newData?.top10Records?.map((val: any) => {
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
                val?.lead_details[0]
                  ? (val.fullName = val?.lead_details[0].first_name
                    ? val?.lead_details[0].first_name +
                    " " +
                    (val?.lead_details[0].last_name || "")
                    : "")
                  : null;
                val?.lead_details[0]
                  ? (val.lead_management_uuid =
                    val?.lead_details[0].lead_management_uuid)
                  : null;
              });
            const avTalktime: any = intervalToDuration({
              start: 0,
              end: newData.acd * 1000,
            });
            state.callStatisticDetails = {
              ...newData,
              acd: `${(avTalktime?.minutes > 9
                  ? avTalktime.minutes
                  : "0" + avTalktime.minutes) +
                ":" +
                (avTalktime?.seconds > 9
                  ? avTalktime.seconds
                  : "0" + avTalktime.seconds)
                }`,
            };
            state.isCallLoading = false;
          }
        }
      )
      .addCase(
        getCallStatistic.rejected,
        (state, action: PayloadAction<any>) => {
          state.isCallLoading = false;
        }
      );
    builder
      .addCase(
        getMissedCallDetails.pending,
        (state, action: PayloadAction<any>) => {
          state.isMissedCallLoading = true;
        }
      )
      .addCase(
        getMissedCallDetails.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (typeof action.payload.data === "string") {
            state.missedCallDetails = [];
            state.isMissedCallLoading = false;
          } else {
            const newData = action.payload.data;
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
              (val.takeTime = `${(newTime?.hours > 9 ? newTime.hours : "0" + newTime.hours) +
                ":" +
                (newTime?.minutes > 9
                  ? newTime.minutes
                  : "0" + newTime.minutes) +
                ":" +
                (newTime?.seconds > 9 ? newTime.seconds : "0" + newTime.seconds)
                }`),
                (val.day = `${day === "0 days"
                    ? "Today"
                    : day === "1 days"
                      ? "Yesterday"
                      : day + " ago"
                  }`);
              val.lead_management_uuid = val?.lead_uuid ? val?.lead_uuid : "";
            });
            state.missedCallDetails = newData;
            state.isMissedCallLoading = false;
          }
        }
      )
      .addCase(
        getMissedCallDetails.rejected,
        (state, action: PayloadAction<any>) => {
          state.isMissedCallLoading = false;
        }
      );
    builder
      .addCase(
        getVoicemailDetails.pending,
        (state, action: PayloadAction<any>) => {
          state.isVoicemailLoading = true;
        }
      )
      .addCase(
        getVoicemailDetails.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (typeof action.payload.data === "string") {
            state.voicemailDetails = [];
            state.isVoicemailLoading = false;
          } else {
            const newData = action.payload.data;
            newData?.map((val: any) => {
              let newTime: any = intervalToDuration({
                start: 0,
                end: val.messageLen * 1000,
              });
              let day: any = formatDistanceStrict(
                new Date(),
                new Date(val.created_epoch),
                { unit: "day" }
              );
              val.isPlay = false;
              val.duration = `${(newTime?.minutes > 9
                  ? newTime.minutes
                  : "0" + newTime.minutes) +
                ":" +
                (newTime?.seconds > 9 ? newTime.seconds : "0" + newTime.seconds)
                }`;
              val.day = `${day === "0 days"
                  ? "Today"
                  : day === "1 days"
                    ? "Yesterday"
                    : day + " ago"
                }`;
            });
            state.voicemailDetails = newData.reverse();
            state.isVoicemailLoading = false;
          }
        }
      )
      .addCase(
        getVoicemailDetails.rejected,
        (state, action: PayloadAction<any>) => {
          state.isVoicemailLoading = false;
        }
      );
    builder.addCase(
      getMissedCallCount.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (typeof action.payload.data === "string") {
          state.missedCallCount = 0;
        } else {
          const newData = action.payload.data;
          let idsArray: any = [];
          for (let index = 0; index < newData.length; index++) {
            idsArray.push(newData[index].custom_callid);
          }
          let newIdsArray: any = [];
          state.missedCallDetails.map((val: any) => {
            if (idsArray.includes(val.custom_callid)) {
              newIdsArray.push(val.custom_callid);
            }
          });
          state.missedCallCount = idsArray.length - newIdsArray.length;
        }
      }
    );
  },
});

export default phoneSlice.reducer;
export const { clearPhoneSlice, onSetShowInfo } = phoneSlice.actions;

export const selectCallStatistic = (state: RootState) =>
  state.phone.callStatisticDetails;
export const useCallStatistic = () => {
  const callStatisticDetails = useAppSelector(selectCallStatistic);
  return useMemo(() => callStatisticDetails, [callStatisticDetails]);
};

export const selectMissedCallDetails = (state: RootState) =>
  state.phone.missedCallDetails;
export const useMissedCallDetails = () => {
  const missedCallDetails = useAppSelector(selectMissedCallDetails);
  return useMemo(() => missedCallDetails, [missedCallDetails]);
};

export const selectVoicemailDetails = (state: RootState) =>
  state.phone.voicemailDetails;
export const useVoicemailDetails = () => {
  const voicemailDetails = useAppSelector(selectVoicemailDetails);
  return useMemo(() => voicemailDetails, [voicemailDetails]);
};

export const selectIsCallLoading = (state: RootState) =>
  state.phone.isCallLoading;
export const useIsCallLoading = () => {
  const isCallLoading = useAppSelector(selectIsCallLoading);
  return useMemo(() => isCallLoading, [isCallLoading]);
};

export const selectIsMissedCallLoading = (state: RootState) =>
  state.phone.isMissedCallLoading;
export const useIsMissedCallLoading = () => {
  const isMissedCallLoading = useAppSelector(selectIsMissedCallLoading);
  return useMemo(() => isMissedCallLoading, [isMissedCallLoading]);
};

export const selectIsVoiceMailLoading = (state: RootState) =>
  state.phone.isVoicemailLoading;
export const useIsVoicemailLoading = () => {
  const isVoicemailLoading = useAppSelector(selectIsVoiceMailLoading);
  return useMemo(() => isVoicemailLoading, [isVoicemailLoading]);
};

export const selectMissedCallCount = (state: RootState) =>
  state.phone.missedCallCount;
export const useMissedCallCount = () => {
  const missedCallCount = useAppSelector(selectMissedCallCount);
  return useMemo(() => missedCallCount, [missedCallCount]);
};

export const selectShowInfo = (state: RootState) => state.phone.showInfo;
export const useShowInfo = () => {
  const showInfo = useAppSelector(selectShowInfo);
  return useMemo(() => showInfo, [showInfo]);
};
