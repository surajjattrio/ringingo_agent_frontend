// PROJECT IMPORTS
import {
  ADD_REPORT,
  ALL_LEADS,
  ALL_NOTES,
  HANGUP_CAUSE,
  LEAD_HANGUP,
  LEAD_SKIP,
  MANUAL_DIAL,
  TOP_CDRS,
  CALLWAITING_COUNT,
  BLACK_LIST,
  DISPOSITION,
} from "@/API/constAPI";
import { apiInstance } from "@/redux/axiosApi";

/* ============================== PHONE SERVICES ============================== */

export const top10RecordsGet = (params: any) => {
  return apiInstance.get(TOP_CDRS, { params });
};

export const allNotesGet = (params: any) => {
  return apiInstance.get(ALL_NOTES, { params });
};

export const allLeadsGet = (params: any) => {
  return apiInstance.get(ALL_LEADS, { params });
};

export const allHangupCauseGet = (campaign_uuid: any) => {
  return apiInstance.get(HANGUP_CAUSE + `/${campaign_uuid}`, {
    params: { list: "all" },
  });
};

export const getParentDisposition = (uuid: any) => {
  return apiInstance.get(DISPOSITION + `/parent`+`/${uuid}`);
};

export const skipLeadDial = (lead_management_uuid: string, payload: any) => {
  return apiInstance.patch(LEAD_SKIP + `/${lead_management_uuid}`, payload);
};

export const hangupLeadDial = (lead_management_uuid: string, payload: any) => {
  return apiInstance.patch(LEAD_HANGUP + `/${lead_management_uuid}`, payload);
};

export const manualDial = (payload: any) => {
  return apiInstance.post(MANUAL_DIAL, payload);
};

export const addReport = (feature: string, operation: string) => {
  return apiInstance.put(ADD_REPORT + `/${feature}` + `/${operation}`, {});
};

export const getCallwaitingCount = (params: any) => {
  return apiInstance.get(CALLWAITING_COUNT, { params });
};

export const blackList = (payload: any) => {
  return apiInstance.post(BLACK_LIST, payload);
 };