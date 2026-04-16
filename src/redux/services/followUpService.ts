// PROJECT IMPORTS
import {
  FOLLOW_UP,
  FOLLOW_UP_ARCHIVE,
  FOLLOW_UP_SEARCH,
  FOLLOW_UP_SINGLE,
} from "@/API/constAPI";
import { apiInstance } from "../axiosApi";
import { FilterTypes } from "@/types/filterTypes";

/* ============================== FOLLOW UP SERVICES ============================== */

export const followUpListGet = (params: FilterTypes) => {
  return apiInstance.get(FOLLOW_UP, { params });
};

export const followUpGet = (uuid: any) => {
  return apiInstance.get(FOLLOW_UP_SINGLE + `/${uuid}`);
};

export const followUpAdd = (payload: any) => {
  return apiInstance.post(FOLLOW_UP, payload);
};

export const followUpEdit = (uuid: string, payload: any) => {
  return apiInstance.put(FOLLOW_UP + `/${uuid}`, payload);
};

export const followUpSearch = (payload: any) => {
  return apiInstance.post(FOLLOW_UP_SEARCH, payload);
};

export const followUpDelete = (id: string) => {
  return apiInstance.delete(FOLLOW_UP + `/${id}`);
};

export const followUpArchive = (payload: any) => {
  return apiInstance.post(FOLLOW_UP_ARCHIVE, payload);
};

export const followUpMessage = (params: any) => {
  return apiInstance.get(FOLLOW_UP, { params });
};

export const followUpReaded = (uuid: string, payload: any) => {
  return apiInstance.patch(FOLLOW_UP + `/${uuid}`, payload);
};
