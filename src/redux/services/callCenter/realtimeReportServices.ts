//PROJECT IMPORT
import {
    CALL_PAUSE,
    CAMPAIGN,
    REALTIME_REPORT,
    REALTIME_REPORT_SEARCH,
} from "@/API/constAPI";
import { apiInstance } from "@/redux/axiosApi";

/* ============================== REAL TIME REPORT SERVICES ============================== */

export const getRealTimeReport = (params: any) => {
    return apiInstance.get(REALTIME_REPORT, { params });
};

export const searchRealTimeReport = (payload: any) => {
    return apiInstance.post(REALTIME_REPORT_SEARCH, payload);
};

export const getCampaign = () => {
    return apiInstance.get(CAMPAIGN);
};

export const callPause = (payload: any) => {
    return apiInstance.post(CALL_PAUSE, payload);
};
