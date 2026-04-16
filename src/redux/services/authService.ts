// PROJECT IMPORTS
import { ADD_AGENT_ENTRY, ALLOWED_CAMPAIGNS } from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

/* ============================== AUTH SERVICES ============================== */

  export const addAgentEntry = (payload: any) => {
    return apiInstance.post(ADD_AGENT_ENTRY, payload);
  };

  export const allowedCampaignsList = (payload: any) => {
    return apiInstance.get(ALLOWED_CAMPAIGNS, payload);
  };
  