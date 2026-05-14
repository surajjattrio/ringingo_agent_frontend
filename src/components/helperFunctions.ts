// PROJECT IMPORTS
import { clearCallCenterPhoneSlice } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { clearCallSlice } from "@/redux/slice/callSlice";
import { clearCampaignSlice } from "@/redux/slice/campaignSlice";
import { clearReportSlice } from "@/redux/slice/cdrReportSlice";
import { clearCommonSlice } from "@/redux/slice/commonSlice";
import { clearCountrySlice } from "@/redux/slice/countrySlice";
import { clearFollowUpSlice } from "@/redux/slice/followUpSlice";
import { clearLeadListSlice } from "@/redux/slice/leadListSlice";
import { clearLoginLogoutSlice } from "@/redux/slice/loginLogoutSlice";
import { clearNoteSlice } from "@/redux/slice/noteSlice";
import { clearPhoneSlice } from "@/redux/slice/phoneSlice";
import { clearRecordingSlice } from "@/redux/slice/recordingSlice";
import { clearSettingSlice } from "@/redux/slice/settingSlice";
import { clearRealtimeReport } from "@/redux/slice/callCenter/realtimeReportSlice";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";
import { clearChatSlice } from "@/redux/slice/chatSlice";
import { isValid } from "date-fns";

/* ============================== DOWNLOAD FILE ============================== */

export const downloadFile = (src: string, name: string) => {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      const blobUrl = window.URL.createObjectURL(xmlHttp.response);
      const e = document.createElement("a");
      e.href = blobUrl;
      e.download = name;
      document.body.appendChild(e);
      e.click();
      document.body.removeChild(e);
    }
  };
  xmlHttp.responseType = "blob";
  xmlHttp.open("GET", src, true);
  xmlHttp.send(null);
};

/* ============================== CLEAR ALL REDUX DATA ============================== */

export const clearAllData = (dispatch: any) => {
  /* COMMON SLICE */
  dispatch(clearCommonSlice());
  dispatch(clearCampaignSlice());

  /* PBX MODE SLICE */
  dispatch(clearCallSlice());
  dispatch(clearReportSlice());
  dispatch(clearLeadListSlice());
  dispatch(clearCountrySlice());
  dispatch(clearNoteSlice());
  dispatch(clearPhoneSlice());
  dispatch(clearRecordingSlice());
  dispatch(clearSettingSlice());
  dispatch(clearFollowUpSlice());
  dispatch(clearLoginLogoutSlice());

  /* CALL-CENTER MODE SLICE */
  dispatch(clearRealtimeReport());
  dispatch(clearCallCenterPhoneSlice());

  dispatch(clearChatSlice());
};

/* ============================== CLEAR ALL COOKIES DATA ============================== */

export const RemoveCookiesData = () => {
  const removeCookies = [
    "user_agent",
    "logout_count",
    "authenticated",
    "logout",
    "statuscardToKeypadSider",
    "keypadSiderToStatuscard",
    "username",
    "password",
    "domain",
    "callId",
    "campaign_modal",
    "showModal",
    "lead_uuid",
    "lead_information",
    "is_call_start",
    "call_stick_status",
    "phone_number",
    "selectedCampaign",
    "isCallResume",
    "isReceivedDirect",
    "isRecording",
    "isRejected",
    "campaignMode",
  ];

  for (let index = 0; index < removeCookies.length; index++) {
    Cookies.remove(removeCookies[index]);
  }
};

export const getMessageFromNumber = (message: any) => {
  return message?.message_type === "0" ? "to" : "from_number";
}

export const isWhatsAppEnabled = (user: any) => {
  return user?.permission?.whatsapp === "0" || user?.permission?.instagram === "0" || user?.permission?.facebook === "0";
}

export const getValidTime = (date: string) => {
  const isDateValid = isValid(new Date(date));
  if (isDateValid) {
    return new Date(date);
  }
  return new Date();
};

export const truncateName = (name: string, limit: number = 12) => {
  if (name && name.length > limit) {
    return name.substring(0, limit) + "..";
  }
  return name || "";
};