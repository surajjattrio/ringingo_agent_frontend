import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useAppSelector } from "../hooks";
import { RootState } from "../store";
import { allowedTemplatesGet, sendEmailPost, sendApiEmailPost, apiConfigGet } from "../services/emailService";

export const fetchAllowedTemplates = createAsyncThunk(
    "email/fetchAllowedTemplates",
    async (config_uuid: string) => {
        return await allowedTemplatesGet(config_uuid);
    }
);

export const fetchApiConfig = createAsyncThunk(
    "email/fetchApiConfig",
    async (uuid: string) => {
        return await apiConfigGet(uuid);
    }
);

export const submitSendEmail = createAsyncThunk(
    "email/submitSendEmail",
    async (payload: any) => {
        return await sendEmailPost(payload);
    }
);

export const submitSendApiEmail = createAsyncThunk(
    "email/submitSendApiEmail",
    async (payload: any) => {
        return await sendApiEmailPost(payload);
    }
);

interface EmailState {
    allowedTemplates: any[];
    activeApiConfig: any | null;
    isLoading: boolean;
}

const initialState: EmailState = {
    allowedTemplates: [],
    activeApiConfig: null,
    isLoading: false,
};

const emailSlice = createSlice({
    name: "email",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAllowedTemplates.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchAllowedTemplates.fulfilled, (state, action) => {
            state.isLoading = false;
            state.allowedTemplates = action.payload.data || [];
        });
        builder.addCase(fetchAllowedTemplates.rejected, (state) => {
            state.isLoading = false;
        });
        builder.addCase(fetchApiConfig.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchApiConfig.fulfilled, (state, action) => {
            state.isLoading = false;
            const res = action.payload;
            state.activeApiConfig = res?.data || res || null;
        });
        builder.addCase(fetchApiConfig.rejected, (state) => {
            state.isLoading = false;
            state.activeApiConfig = null;
        });
        builder.addCase(submitSendEmail.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(submitSendEmail.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(submitSendEmail.rejected, (state) => {
            state.isLoading = false;
        });
        builder.addCase(submitSendApiEmail.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(submitSendApiEmail.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(submitSendApiEmail.rejected, (state) => {
            state.isLoading = false;
        });
    }
});

export default emailSlice.reducer;

export const selectAllowedTemplates = (state: RootState) => state.email.allowedTemplates;
export const useAllowedTemplates = () => {
    const templates = useAppSelector(selectAllowedTemplates);
    return useMemo(() => templates, [templates]);
};

export const selectActiveApiConfig = (state: RootState) => state.email.activeApiConfig;
export const useActiveApiConfig = () => {
    const activeApiConfig = useAppSelector(selectActiveApiConfig);
    return useMemo(() => activeApiConfig, [activeApiConfig]);
};

export const selectEmailIsLoading = (state: RootState) => state.email.isLoading;
export const useEmailIsLoading = () => {
    const isLoading = useAppSelector(selectEmailIsLoading);
    return useMemo(() => isLoading, [isLoading]);
};