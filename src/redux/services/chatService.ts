// PROJECT IMPORTS
import {
  ACCEPT_CHAT,
  ACTIVE_UNREAD_CHAT_LIST,
  CALL_WAITING_COUNT,
  CHANNEL_LIST,
  AGENT_TODAY_STATS,
  CHAT_HISTORY,
  END_CHAT,
  QUEUE_LIST,
  SEND_FACEBOOK_MESSAGE,
  SEND_INSTA_MESSAGE,
  SEND_MESSAGE,
  TRANSFER_CHAT,
  UPDATE_CHANNEL,
  WHATS_APP_MESSAGE_LIST,
  GENERATE_WABA_SSO_TOKEN,
} from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

/* ============================== CHAT SERVICES ============================== */

export const getCallWaitingCountGet = () => {
  return apiInstance.get(CALL_WAITING_COUNT);
};
export const getAgentTodayStatsGet = (params: any) => {
  return apiInstance.get(AGENT_TODAY_STATS, { params });
};
export const activeUnreadChatListPost = (payload: any) => {
  return apiInstance.post(ACTIVE_UNREAD_CHAT_LIST, payload);
};

export const whatsAppMessagesListGet = (payload: any) => {
  return apiInstance.post(WHATS_APP_MESSAGE_LIST, payload);
};

export const acceptChatPost = (payload: any) => {
   const { channel_type, ...body } = payload;
  return apiInstance.post(`${ACCEPT_CHAT}/${channel_type}`, body);
};

export const endChatPost = (payload: any) => {
  return apiInstance.post(END_CHAT, payload);
};

export const transferChatPut = (payload: any) => {
  return apiInstance.put(TRANSFER_CHAT, payload);
};

export const sendMessagePost = (payload: any) => {
  return apiInstance.post(SEND_MESSAGE, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const sendInstaMessagePost = (payload: any) => {
  return apiInstance.post(SEND_INSTA_MESSAGE, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const sendFacebookMessagePost = (payload: any) => {
  return apiInstance.post( SEND_FACEBOOK_MESSAGE, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const queueListGet = () => {
  return apiInstance.get(QUEUE_LIST);
};

export const channelListPost = (payload: any) => {
  return apiInstance.post(CHANNEL_LIST, payload);
};

export const updateMessagePut = (payload: any) => {
  return apiInstance.put(UPDATE_CHANNEL, payload);
};

export const chatHistoryPost = (payload: any) => {
  return apiInstance.post(CHAT_HISTORY, payload);
};

export const getWabaSsoTokenPost = () => {
  return apiInstance.post(GENERATE_WABA_SSO_TOKEN);
};
