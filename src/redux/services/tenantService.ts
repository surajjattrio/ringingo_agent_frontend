// PROJECT IMPORTS
import { TENANT_PERSONALIZE } from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

/* ============================== TENANT SERVICES ============================== */

export const createTenantPersonalize = (payload: any) => {
  return apiInstance.post(TENANT_PERSONALIZE, payload);
};

export const getTenantPersonalize = (domain: string) => {
  return apiInstance.get(TENANT_PERSONALIZE + `/${domain}`);
};