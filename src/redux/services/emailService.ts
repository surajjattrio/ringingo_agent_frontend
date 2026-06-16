import { ALLOWED_TEMPLATES, SEND_EMAIL, SEND_API_EMAIL } from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

/* ============================== EMAIL SERVICES ============================== */

export const allowedTemplatesGet = (config_uuid: string) => {
    return apiInstance.get(`${ALLOWED_TEMPLATES}/${config_uuid}`);
};

export const sendEmailPost = (payload: any) => {
    return apiInstance.post(SEND_EMAIL, payload);
};

export const sendApiEmailPost = (payload: any) => {
    return apiInstance.post(SEND_API_EMAIL, payload);
};

export const apiConfigGet = (uuid: string) => {
    return apiInstance.get(`/api-configuration/${uuid}`);
};