// PROJECT IMPORTS
import { RECORDING, RECORDING_SEARCH } from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

// TYPES
import { FilterTypes } from "@/types/filterTypes";

/* ============================== RECORDING SERVICES ============================== */

export const recordingsGet = (params: FilterTypes) => {
  return apiInstance.get(RECORDING, { params });
};

export const searchRecording = (payload: any) => {
  return apiInstance.post(RECORDING_SEARCH, payload);
};
