// PROJECT IMPORTS
import { CHANGE_PASSWORD } from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

/* ============================== SETTING SERVICES ============================== */

export const changePassword = (payload: any) => {
  return apiInstance.post(CHANGE_PASSWORD, payload);
};
