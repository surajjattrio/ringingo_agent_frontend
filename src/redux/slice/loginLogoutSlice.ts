import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { useAppSelector } from "../hooks";
import {
  loginLogoutEntries,
  loginLogoutReportGet,
  loginLogoutReportSearch,
} from "../services/loginLogoutService";

// TYPES
import { FilterTypes } from "@/types/filterTypes";
interface InitialState {
  loginLogoutList: any;
}

/* ============================== LOGIN / LOGOUT REPORT SLICE ============================== */

const initialState: InitialState = {
  loginLogoutList: {},
};

export const getLoginLogoutReport = createAsyncThunk(
  "login-logout-report/list",
  async (params: FilterTypes) => {
    return await loginLogoutReportGet(params);
  }
);

export const searchLoginLogoutReport = createAsyncThunk(
  "login-logout-report/search",
  async (payload: any) => {
    return await loginLogoutReportSearch(payload);
  }
);

export const getLoginLogoutEntries = createAsyncThunk(
  "login-logout-report/get-entry",
  async (params: any) => {
    return await loginLogoutEntries(params);
  }
);

const loginLogoutSlice = createSlice({
  name: "loginLogout",
  initialState,
  reducers: {
    clearLoginLogoutSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(
      getLoginLogoutReport.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (typeof action.payload.data === "string") {
          state.loginLogoutList = {};
        } else {
          const newData = action.payload;
          state.loginLogoutList = newData;
        }
      }
    );
    builder.addCase(
      searchLoginLogoutReport.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (typeof action.payload.data === "string") {
          state.loginLogoutList = {};
        } else {
          const newData = action.payload;
          state.loginLogoutList = newData;
        }
      }
    );
  },
});

export default loginLogoutSlice.reducer;
export const { clearLoginLogoutSlice } = loginLogoutSlice.actions;

export const selectLoginLogout = (state: RootState) =>
  state.loginLogout.loginLogoutList;
export const useLoginLogoutList = () => {
  const loginLogoutList = useAppSelector(selectLoginLogout);
  return useMemo(() => loginLogoutList, [loginLogoutList]);
};
