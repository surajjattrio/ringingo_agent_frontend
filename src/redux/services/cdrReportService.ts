// PROJECT IMPORTS
import { CDRS, CDRS_SEARCH } from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

// TYPES
import { FilterTypes } from "@/types/filterTypes";

/* ============================== CDR REPORT SERVICES ============================== */

export const cdrReportGet = (params: FilterTypes) => {
  return apiInstance.get(CDRS, { params });
};

export const searchCdrReport = (payload: any) => {
  return apiInstance.post(CDRS_SEARCH, payload);
};
