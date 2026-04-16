import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { changePassword } from "../services/settingService";

// TYPES
interface InitialState { }

/* ============================== NOTES SLICE ============================== */

const initialState: InitialState = {};

export const passwordChange = createAsyncThunk(
  "setting/change-password",
  async (payload: any) => {
    return await changePassword(payload);
  }
);

const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    clearSettingSlice: () => initialState,
  },
  extraReducers: (builder) => { },
});

export default settingSlice.reducer;
export const { clearSettingSlice } = settingSlice.actions;
