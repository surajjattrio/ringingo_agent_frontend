import { useMemo } from "react";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { useAppSelector } from "../hooks";

import {
    getTenantPersonalize
} from "../services/tenantService";

  
export const getTenantPersonalization = createAsyncThunk(
    "tenant/tenantpersonalization",
    async (domain: string) => {
      return await getTenantPersonalize(domain);
    }
);