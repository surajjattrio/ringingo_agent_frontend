// PROJECT IMPORTS
import {
  CREATE_LEAD,
  FOLLOW_UP,
  LEAD_GROUP,
  LEAD_MANAGEMENT,
  LEAD_MANAGEMENT_INFORMATION,
  LEAD_MANAGEMENT_SEARCH,
  LEAD_STATUS,
  LEAD_MANAGEMENT_CUSTOM_FIELDS,
  UNALLOCATED_LEAD_MANAGEMENT
} from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

// TYPES
import { AllListParamsType, FilterTypes } from "@/types/filterTypes";

/* ============================== LEAD LIST SERVICES ============================== */

export const leadListGet = (params: FilterTypes) => {
  return apiInstance.get(LEAD_MANAGEMENT, { params });
};

export const singleLeadGet = (id: string) => {
  return apiInstance.get(LEAD_MANAGEMENT + `/${id}`);
};

export const leadStatusGetAll = (params: AllListParamsType) => {
  return apiInstance.get(LEAD_STATUS, { params });
};

export const leadGroupGetAll = (params: AllListParamsType) => {
  return apiInstance.get(LEAD_GROUP, { params });
};

export const leadListGetAll = (params: AllListParamsType) => {
  return apiInstance.get(LEAD_MANAGEMENT, { params });
};

export const unAllocatedLeadGet = (params: FilterTypes) => {
  return apiInstance.get(UNALLOCATED_LEAD_MANAGEMENT, { params });
};

export const newLeadCreate = (payload: any) => {
  return apiInstance.post(CREATE_LEAD, payload);
};

export const leadEdit = (id: string, payload: any) => {
  return apiInstance.put(CREATE_LEAD + `/${id}`, payload);
};

export const searchLead = (payload: any) => {
  return apiInstance.post(LEAD_MANAGEMENT_SEARCH, payload);
};

export const singleLeadInfo = (id: string) => {
  return apiInstance.get(LEAD_MANAGEMENT_INFORMATION + `/${id}`);
};

export const singleLeadCustomFields = (id: string) => {
  return apiInstance.get(LEAD_MANAGEMENT_CUSTOM_FIELDS + `/${id}`);
};