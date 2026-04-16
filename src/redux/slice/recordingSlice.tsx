import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { useAppSelector } from "../hooks";
import { recordingsGet, searchRecording } from "../services/recordingService";

// THIRD-PARTY IMPORT
import { intervalToDuration } from "date-fns";

// TYPES
import { FilterTypes } from "@/types/filterTypes";
interface InitialState {
  recordingsList: any;
  isLoading: boolean;
}

/* ============================== RECORDING SLICE ============================== */

const initialState: InitialState = {
  recordingsList: [],
  isLoading: false,
};

export const getRecordings = createAsyncThunk(
  "recordings/list",
  async (params: FilterTypes) => {
    return await recordingsGet(params);
  }
);

export const recordingSearch = createAsyncThunk(
  "recordings/search",
  async (payload: any) => {
    return await searchRecording(payload);
  }
);

const recordingSlice = createSlice({
  name: "recordings",
  initialState,
  reducers: {
    clearRecordingSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRecordings.pending, (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      })
      .addCase(getRecordings.fulfilled, (state, action: PayloadAction<any>) => {
        const newData =
          typeof action.payload === "string" ? [] : action.payload;
        newData?.data?.map((val: any) => {
          let newTime: any = intervalToDuration({
            start: 0,
            end: val.billsecond * 1000,
          });
          let fileName = val?.recording_path ? val?.recording_path : "";
          let file = fileName?.split("/");
          val.date = val?.callstart;
          (val.duration = `${newTime?.hours > 0
              ? newTime?.hours +
              " hr " +
              newTime.minutes +
              " min " +
              newTime.seconds +
              " sec"
              : newTime?.minutes > 0
                ? newTime.minutes + " min " + newTime.seconds + " sec"
                : newTime.seconds + " sec"
            }`),
            (val.callerID = val.caller_id_name);
          val.fileName = file?.length ? file[file?.length - 1] : "";
        });
        state.recordingsList = newData;
        state.isLoading = false;
      })
      .addCase(getRecordings.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
      });
    builder
      .addCase(recordingSearch.pending, (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      })
      .addCase(
        recordingSearch.fulfilled,
        (state, action: PayloadAction<any>) => {
          const newData =
            typeof action.payload === "string" ? [] : action.payload;
          newData?.data?.map((val: any) => {
            let newTime: any = intervalToDuration({
              start: 0,
              end: val.billsecond * 1000,
            });
            let fileName = val?.recording_path ? val?.recording_path : "";
            let file = fileName?.split("/");
            val.date = val?.callstart;
            (val.duration = `${newTime?.minutes > 0
                ? newTime.minutes + " min " + newTime.seconds + " sec"
                : newTime.seconds + " sec"
              }`),
              (val.callerID = val.caller_id_name);
            val.fileName = file?.length ? file[file?.length - 1] : "";
          });
          state.recordingsList = newData;
          state.isLoading = false;
        }
      )
      .addCase(
        recordingSearch.rejected,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
        }
      );
  },
});

export default recordingSlice.reducer;
export const { clearRecordingSlice } = recordingSlice.actions;

export const selectRecordingsList = (state: RootState) =>
  state.recordings.recordingsList;
export const useRecordingsList = () => {
  const recordingsList = useAppSelector(selectRecordingsList);
  return useMemo(() => recordingsList, [recordingsList]);
};

export const selectIsLoading = (state: RootState) => state.leadList.isLoading;
export const useIsLoading = () => {
  const isLoading = useAppSelector(selectIsLoading);
  return useMemo(() => isLoading, [isLoading]);
};
