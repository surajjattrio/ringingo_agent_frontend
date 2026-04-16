// PROJECT IMPORTS
import {
  ADD_LIVE_AGENT_ENTRY,
  AGENT_CAMPAIGN,
  AGENT_STATUS,
  CALL_QUEUE_LIST,
  CAMPAIGN_LIST,
  CAMPAIGN_WEBFORMS,
  BLENDED_CAMPAIGN_WEBFORMS,
  INBOUND_CAMPAIGN_WEBFORMS,
  CAMPAIGN_WEBFORM_SEND,
  DELETE_LIVE_AGENT_ENTRY,
  INBOUND_CALL_QUEUE,
  OUTBOUND_CAMPAIGN,
  OUTBOUND_CAMPAIGN_OPTION,
  PAUSE_CAMPAIGN,
  RESUME_CAMPAIGN,
  UPDATE_DIAL_LEVEL,
  UPDATE_LEAD_STATUS,
  UPDATE_LIVE_AGENT_ENTRY,
} from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

// TYPES
import { AllListParamsType } from "@/types/filterTypes";
import {
  PauseCampaignTypes,
  ResumeCampaignTypes,
} from "@/types/campaignSliceTypes";

/* ============================== CAMPAIGN SERVICES ============================== */

export const campaignGet = (params: AllListParamsType) => {
  return apiInstance.get(OUTBOUND_CAMPAIGN, { params });
};

export const campaignOptionGet = (params: AllListParamsType) => {
  return apiInstance.get(OUTBOUND_CAMPAIGN_OPTION, { params });
};

export const campaignListGet = () => {
  return apiInstance.get(CAMPAIGN_LIST);
};

export const campaignResume = (payload: ResumeCampaignTypes) => {
  return apiInstance.post(RESUME_CAMPAIGN, payload);
};

export const campaigPause = (payload: PauseCampaignTypes) => {
  return apiInstance.patch(PAUSE_CAMPAIGN, payload);
};

export const agentStatusUpdate = (payload: any) => {
  return apiInstance.patch(AGENT_STATUS, payload);
};

export const agentCampaignUpdate = (feature: string, payload: any) => {
//  return apiInstance.post(AGENT_CAMPAIGN + `/${feature}`, payload);
    return apiInstance.post(AGENT_CAMPAIGN + `/login-entry`, payload);
};

export const liveAgentEntryAdd = (payload: any) => {
  return apiInstance.post(ADD_LIVE_AGENT_ENTRY, payload);
};

export const liveAgentEntryUpdate = (id: string, payload: any) => {
  return apiInstance.patch(UPDATE_LIVE_AGENT_ENTRY + `/${id}`, payload);
};

export const liveAgentEntryDelete = (id: string) => {
  return apiInstance.delete(DELETE_LIVE_AGENT_ENTRY + `/${id}`);
};

export const callQueueListGet = (id: string, params: any) => {
  return apiInstance.get(CALL_QUEUE_LIST + `/${id}`, { params });
};

export const leadStatusUpdate = (payload: any) => {
  return apiInstance.post(UPDATE_LEAD_STATUS, payload);
};

export const dialLevelUpdate = (id: string, campaignType: string, payload: any) => {
  return apiInstance.put(UPDATE_DIAL_LEVEL + `/${id}/${campaignType}`, payload);
};

export const inboundCallQueue = (feature: string, payload: any) => {
  return apiInstance.post(INBOUND_CALL_QUEUE + `/${feature}`, payload);
};

export const webformSendPost = (payload: any) => {
  return apiInstance.post(CAMPAIGN_WEBFORM_SEND, payload);
};

export const campaignWebFormGet = (params: any) => {
  return apiInstance.get(
    CAMPAIGN_WEBFORMS + `/${params.feature}/${params.campaign_uuid}`);
};

export const blendedcampaignWebFormGet = (params: any) => {
  return apiInstance.get(
    BLENDED_CAMPAIGN_WEBFORMS + `/${params.feature}/${params.campaign_uuid}`);
};

export const inboundcampaignWebFormGet = (params: any) => {
  return apiInstance.get(
    INBOUND_CAMPAIGN_WEBFORMS + `/${params.feature}/${params.campaign_uuid}`);
};
