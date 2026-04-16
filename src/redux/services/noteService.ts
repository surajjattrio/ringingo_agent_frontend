// PROJECT IMPORTS
import { NOTES } from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

/* ============================== NOTE SERVICES ============================== */

export const notesGet = (uuid: string) => {
  return apiInstance.get(NOTES + `/${uuid}`);
};

export const noteCreate = (payload: any) => {
  return apiInstance.post(NOTES, payload);
};
