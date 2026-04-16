import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { breakOptionListGet, goToInBreak } from "../services/breakService";
import { useAppSelector } from "../hooks";

// TYPES
interface InitialState {
  breakOptions: any[];
}

/* ============================== SLICE SLICE ============================== */

const initialState: InitialState = {
  breakOptions: [],
};

export const getBreakOptions = createAsyncThunk("", async () => {
  return await breakOptionListGet();
});

export const goInBreak = createAsyncThunk("inbreak", async (payload: any) => {
  return await goToInBreak(payload);
});

const breakSlice = createSlice({
  name: "break",
  initialState,
  reducers: {
    clearBreakSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(
      getBreakOptions.fulfilled,
      (state, action: PayloadAction<any>) => {
        const breakCodes = action?.payload?.data;
        let breakOptions = [];
        if (breakCodes) {
          for (let index = 0; index < breakCodes.length; index++) {
            breakOptions.push({
              label:`${breakCodes[index].break_code} - ${breakCodes[index].name} (${breakCodes[index].duration})`,
              value: breakCodes[index].uuid,
              option: breakCodes[index],
            });
          }
        }
        state.breakOptions = breakOptions;
      }
    );
  },
});

export default breakSlice.reducer;
export const { clearBreakSlice } = breakSlice.actions;

export const seletBreakOptions = (state: RootState) => state.break.breakOptions;
export const useBreakOptions = () => {
  const breakOptions = useAppSelector(seletBreakOptions);
  return useMemo(() => breakOptions, [breakOptions]);
};
