import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { useAppSelector } from "../hooks";
import { countryGet } from "../services/countryService";

// TYPES
import { AllListParamsType } from "@/types/filterTypes";
interface InitialState {
  countryList: any;
}

/* ============================== COUNTRY SLICE ============================== */

const initialState: InitialState = {
  countryList: [],
};

export const getCountryList = createAsyncThunk(
  "country/list",
  async (params: AllListParamsType) => {
    return await countryGet(params);
  }
);

const countrySlice = createSlice({
  name: "country",
  initialState,
  reducers: {
    clearCountrySlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(
      getCountryList.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (typeof action.payload.data === "string") {
          state.countryList = action.payload.data;
        } else {
          const newData = action.payload.data;
          state.countryList = newData.map((val: any) => ({
            value: val.uuid,
            label: val.nicename,
          }));
        }
      }
    );
  },
});

export default countrySlice.reducer;
export const { clearCountrySlice } = countrySlice.actions;

export const selectCountryList = (state: RootState) =>
  state.country.countryList;
export const useCountryList = () => {
  const countryList = useAppSelector(selectCountryList);
  return useMemo(() => countryList, [countryList]);
};
