// PROJECT IMPORTS
import { COUNTRY } from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

// TYPES
import { AllListParamsType } from "@/types/filterTypes";

/* ============================== COUNTRY SERVICES ============================== */

export const countryGet = (params: AllListParamsType) => {
  return apiInstance.get(COUNTRY, { params });
};
