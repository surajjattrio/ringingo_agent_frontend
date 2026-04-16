// PROJECT IMPORTS
import {
  CALL_STATISTIC,
  LEAD_FETCH,
  LEAD_MANAGEMENT,
  MISSED_CALL,
  VOICEMAIL,
  BLACK_LIST,
} from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

/* ============================== PHONE SERVICES ============================== */

export const callStatisticGet = () => {
  return apiInstance.get(CALL_STATISTIC);
};

export const missedCallListGet = () => {
  return apiInstance.get(MISSED_CALL);
};

export const voicemailListGet = () => {
  return apiInstance.get(VOICEMAIL);
};

export const leadSearch = (params: any) => {
  return apiInstance.get(LEAD_FETCH, { params });
};

export const blackList = (payload: any) => {
  return apiInstance.post(BLACK_LIST, payload);
 };