// PROJECT IMPORTS
import {
  CALL_QUEUE,
  EXTENSION,
  IVR,
  RING_GROUP,
  STICKY_AGENT,
  OUTBOUND_TRANSFER_LIST,
  INBOUND_TRANSFER_LIST,
  PRESET,
  DISPOSTION_CAUSE,
  BLENDED_TRANSFER_LIST,
} from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

// TYPES
import { AllListParamsType } from "@/types/filterTypes";
import { GetExtensionTypes } from "@/types/callSliceTypes";
import { GetPresetTypes } from "@/types/presetTypes";

/* ============================== CALL SERVICES ============================== */

export const extensionGet = (params: GetExtensionTypes) => {
  return apiInstance.get(EXTENSION, { params });
};

export const presetGet = (params: GetPresetTypes) => {
  return apiInstance.get(PRESET, { params });
};

export const callQueueGet = (params: AllListParamsType) => {
  return apiInstance.get(CALL_QUEUE, { params });
};

export const ivrGet = (params: AllListParamsType) => {
  return apiInstance.get(IVR, { params });
};

export const ringGroupGet = (params: AllListParamsType) => {
  return apiInstance.get(RING_GROUP, { params });
};

export const outBoundCallQueueListGet = (id: string, params: any) => {
  return apiInstance.get(OUTBOUND_TRANSFER_LIST + "/call-queue" + `/${id}`, {
    params,
  });
};

export const outBoundIvrListGet = (id: string, params: any) => {
  return apiInstance.get(OUTBOUND_TRANSFER_LIST + "/ivr" + `/${id}`, {
    params,
  });
};

export const outBoundRingGroupListGet = (id: string, params: any) => {
  return apiInstance.get(OUTBOUND_TRANSFER_LIST + "/ring-group" + `/${id}`, {
    params,
  });
};

export const inBoundCallQueueListGet = (id: string, params: any) => {
  return apiInstance.get(INBOUND_TRANSFER_LIST + "/call-queue" + `/${id}`, {
    params,
  });
};

export const inBoundIvrListGet = (id: string, params: any) => {
  return apiInstance.get(INBOUND_TRANSFER_LIST + "/ivr" + `/${id}`, { params });
};

export const inBoundRingGroupListGet = (id: string, params: any) => {
  return apiInstance.get(INBOUND_TRANSFER_LIST + "/ring-group" + `/${id}`, {
    params,
  });
};

export const blendedCallQueueListGet = (id: string, params: any) => {
  return apiInstance.get(BLENDED_TRANSFER_LIST + "/call-queue" + `/${id}`, {
    params,
  });
};

export const blendedIvrListGet = (id: string, params: any) => {
  return apiInstance.get(BLENDED_TRANSFER_LIST + "/ivr" + `/${id}`, { params });
};

export const blendedRingGroupListGet = (id: string, params: any) => {
  return apiInstance.get(BLENDED_TRANSFER_LIST + "/ring-group" + `/${id}`, {
    params,
  });
};

export const stickyAgent = (payload: any) => {
  return apiInstance.post(STICKY_AGENT, payload);
};

export const checkDispostion = (payload: any) => {
  return apiInstance.post(DISPOSTION_CAUSE, payload);
};

