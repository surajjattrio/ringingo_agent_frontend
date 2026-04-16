// PROJECT IMPORTS
import {
  LOGIN_LOGOUT_ENTRIES,
  LOGIN_LOGOUT_REPORT,
  LOGIN_LOGOUT_REPORT_SEARCH,
} from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

// TYPES
import { FilterTypes } from "@/types/filterTypes";

/* ============================== LOGIN / LOGOUT REPORT SERVICES ============================== */

export const loginLogoutReportGet = (params: FilterTypes) => {
  return apiInstance.get(LOGIN_LOGOUT_REPORT, { params });
};

export const loginLogoutReportSearch = (payload: any) => {
  return apiInstance.post(LOGIN_LOGOUT_REPORT_SEARCH, payload);
};

export const loginLogoutEntries = (params: any) => {
  return apiInstance.get(LOGIN_LOGOUT_ENTRIES, { params });
};
