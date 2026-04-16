import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { useAppSelector } from "../hooks";
import { cdrReportGet, searchCdrReport } from "../services/cdrReportService";

// THIRD-PARTY IMPORT
import { intervalToDuration } from "date-fns";
import { FilterTypes } from "@/types/filterTypes";

// TYPES
interface InitialState {
  cdrReportDetails: any;
  isLoading: boolean;
}

/* ============================== CDR REPORT SLICE ============================== */

const initialState: InitialState = {
  cdrReportDetails: [],
  isLoading: false,
};

export const getCdrReport = createAsyncThunk(
  "cdr-report/list",
  async (params: FilterTypes) => {
    return await cdrReportGet(params);
  }
);

export const cdrReportSearch = createAsyncThunk(
  "cdr-report/search",
  async (payload: any) => {
    return await searchCdrReport(payload);
  }
);
// const toSeconds = (t: any) => {
//   // if already number-like: "12" -> 12
//   if (t === null || t === undefined) return 0;
//   if (typeof t === "number") return Number.isFinite(t) ? t : 0;

//   const s = String(t).trim();

//   // "HH:MM:SS"
//   if (s.includes(":")) {
//     const parts = s.split(":").map((x) => parseInt(x, 10));
//     if (parts.some((n) => Number.isNaN(n))) return 0;

//     // supports MM:SS also
//     if (parts.length === 3) {
//       const [hh, mm, ss] = parts;
//       return hh * 3600 + mm * 60 + ss;
//     }
//     if (parts.length === 2) {
//       const [mm, ss] = parts;
//       return mm * 60 + ss;
//     }
//     return 0;
//   }

//   const n = Number(s);
//   return Number.isFinite(n) ? n : 0;
// };

const cdrReportSlice = createSlice({
  name: "cdrReport",
  initialState,
  reducers: {
    clearReportSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCdrReport.pending, (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      })
      .addCase(getCdrReport.fulfilled, (state, action: PayloadAction<any>) => {
        console.log(action?.payload,'action payloadaction.payload');
        
        const newData =
          typeof action.payload === "string" ? [] : action.payload;
        console.log(newData,'action newDatanewData');
        
        newData?.data.map((val: any) => {
          console.log(val,'valvalvalval');
          // const bs = toSeconds(val?.billsecond);
          // let newTime: any = intervalToDuration({
          //   start: 0,
          //   // end: val.billsecond * 1000,
          //     end: bs * 1000,

          // });
          // console.log(newTime,'newTimenewTime');
          
          // val.duration = `${(newTime?.hours > 9 ? newTime.hours : "0" + newTime.hours) +
          //   ":" +
          //   (newTime?.minutes > 9 ? newTime.minutes : "0" + newTime.minutes) +
          //   ":" +
          //   (newTime?.seconds > 9 ? newTime.seconds : "0" + newTime.seconds)
          //   }`;
          val.date = val.callstart;
          val.PhoneNumber =
            val?.direction === "outbound"
              ? val?.destination_number.replace("\\", "").replace("+", "")
              : val?.caller_id_number;
          val.destination_number = val.destination_number
            .replace("\\", "")
            .replace("+", "");
          val.call_mode_name =
            val?.call_mode === "0"
              ? "PBX"
              : val?.call_mode === "1"
                ? "Call Center"
                : "";
        });
        console.log("haaloo");
        
        console.log(newData,'action state.cdrReportDetailsstate.cdrReportDetails');
        state.cdrReportDetails = newData;
        state.isLoading = false;
        
      })
      .addCase(getCdrReport.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
      });
    builder
      .addCase(cdrReportSearch.pending, (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      })
      .addCase(
        cdrReportSearch.fulfilled,
        (state, action: PayloadAction<any>) => {
          const newData =
            typeof action.payload === "string" ? [] : action.payload;

          newData?.data.map((val: any) => {
            let newTime: any = intervalToDuration({
              start: 0,
              end: val.billsecond * 1000,
            });
            val.duration = `${(newTime?.hours > 9 ? newTime.hours : "0" + newTime.hours) +
              ":" +
              (newTime?.minutes > 9 ? newTime.minutes : "0" + newTime.minutes) +
              ":" +
              (newTime?.seconds > 9 ? newTime.seconds : "0" + newTime.seconds)
              }`;
            val.date = val.callstart;
            val.PhoneNumber =
              val?.direction === "outbound"
                ? val?.destination_number.replace("\\", "").replace("+", "")
                : val?.caller_id_number;
            val.destination_number = val.destination_number
              .replace("\\", "")
              .replace("+", "");
            val.call_mode_name =
              val?.call_mode === "0"
                ? "PBX"
                : val?.call_mode === "1"
                  ? "Call Center"
                  : "";
          });

          state.cdrReportDetails = newData;
          state.isLoading = false;
        }
      )
      .addCase(
        cdrReportSearch.rejected,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
        }
      );
  },
});

export default cdrReportSlice.reducer;
export const { clearReportSlice } = cdrReportSlice.actions;

export const selectCdrReportDetails = (state: RootState) =>
  state.cdrReport.cdrReportDetails;
export const useCdrReportDetails = () => {
  const cdrReportDetails = useAppSelector(selectCdrReportDetails);
  return useMemo(() => cdrReportDetails, [cdrReportDetails]);
};

export const selectIsLoading = (state: RootState) => state.cdrReport.isLoading;
export const useIsLoading = () => {
  const isLoading = useAppSelector(selectIsLoading);
  return useMemo(() => isLoading, [isLoading]);
};
