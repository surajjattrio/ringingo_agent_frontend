import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { addAgentEntry, allowedCampaignsList } from "../services/authService";

// TYPES
interface InitialState {}

/* ============================== CALL SLICE ============================== */

const initialState: InitialState = {};

export const agentEntryAdd = createAsyncThunk(
    "agent/add-entry",
    async (params:any) => {
        return await addAgentEntry(params);
    }
);

export const userAllowedCampaign = createAsyncThunk(
    "user/allowed-campign",
    async (params:any) => {
        return await allowedCampaignsList(params);
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => { },
});

export default authSlice.reducer;
