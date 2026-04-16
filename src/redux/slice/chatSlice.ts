import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import {
  acceptChatPost,
  // acceptOmniChatPost,
  activeUnreadChatListPost,
  channelListPost,
  chatHistoryPost,
  endChatPost,
  getCallWaitingCountGet,
  queueListGet,
getAgentTodayStatsGet,
  sendFacebookMessagePost,
  sendInstaMessagePost,
  sendMessagePost,
  transferChatPut,
  updateMessagePut,
  whatsAppMessagesListGet,
} from "../services/chatService";
import { useAppSelector } from "../hooks";
import { getMessageFromNumber } from "@/components/helperFunctions";

// WhatsApp Popup Message Type
interface WhatsAppPopupMessage {
  from_number: string;
  phone_number_id: string;
  messageBody: string;
  messageId: string;
  timestamp: string;
  type: string;
}

// Omnichannel Popup Message Type
interface OmnichannelPopupMessage {
  from_number: string;
  phone_number_id: string;
  messageBody: string;
  messageId: string;
  timestamp: string;
  type: string;
  channelType: string
  channelIdentifiers: any
}

interface ChatState {
  whatsAppMessageList: any[];
  activeChatList: any[];
  unReadChatList: any[];
  queueList: any[];
  channelList: any[];
  activeConversation: any;
  newConversation: any;
  campaign_uuid: string;
  chatHistory: any[];
  waitingCount?: any;
   todayStats?: any;
  isActiveChat?: boolean;
  whatsAppPopupMessage?: WhatsAppPopupMessage | null;
  showWhatsAppPopup: boolean;
  omnichannelPopupMessage:OmnichannelPopupMessage | null,
  showOmnichannelPopup:boolean
  isIncomingChannelType:string
}

// TYPES
interface InitialState {
  modeType: string;
  pbx: ChatState;
  call: ChatState;
}

/* ============================== CHAT SLICE ============================== */

const initialState: InitialState = {
  modeType: "pbx",
  pbx: {
    whatsAppMessageList: [],
    activeChatList: [],
    unReadChatList: [],
    queueList: [],
    channelList: [],
    activeConversation: {},
    newConversation: undefined,
    campaign_uuid: "",
    chatHistory: [],
    isActiveChat: false,
    whatsAppPopupMessage: null,
    showWhatsAppPopup: false,
    omnichannelPopupMessage: null,
    showOmnichannelPopup: false,
    isIncomingChannelType:""
  },
  call: {
    whatsAppMessageList: [],
    activeChatList: [],
    unReadChatList: [],
    queueList: [],
    channelList: [],
    activeConversation: {},
    newConversation: undefined,
    campaign_uuid: "",
    chatHistory: [],
    waitingCount: {},
    isActiveChat: false,
    whatsAppPopupMessage: null,
    showWhatsAppPopup: false,
    omnichannelPopupMessage: null,
    showOmnichannelPopup: false,
    isIncomingChannelType: ""
  },
};

export const getCallWaitingCount = createAsyncThunk(
  "call-waiting-count",
  async () => {
    return await getCallWaitingCountGet();
  }
);

export const getActiveUnreadChat = createAsyncThunk(
  "read-unreadsection",
  async (payload: any) => {
    return await activeUnreadChatListPost(payload);
  }
);

export const getWhatsAppMessagesList = createAsyncThunk(
  "whatsapp-messages",
  async (payload: any) => {
    return await whatsAppMessagesListGet(payload);
  }
);

export const getAgentTodayStats = createAsyncThunk(
  "agent-today-stats",
  async (payload: any) => {
    return await getAgentTodayStatsGet(payload);
  }
);

export const aceeptChat = createAsyncThunk("aceept", async (payload: any) => {
  return await acceptChatPost(payload);
});

// export const aceeptOmniChat = createAsyncThunk("aceeptOmni", async (payload: any) => {
//   return await acceptOmniChatPost(payload);
// });

export const endChat = createAsyncThunk("end", async (payload: any) => {
  return await endChatPost(payload);
});

export const transferChat = createAsyncThunk(
  "transfer",
  async (payload: any) => {
    return await transferChatPut(payload);
  }
);

export const senMessage = createAsyncThunk("send", async (payload: any) => {
  return await sendMessagePost(payload);
});
export const senInstaMessage = createAsyncThunk("send_Insta", async (payload: any) => {
  return await sendInstaMessagePost(payload);
});
export const senFacebookMessage = createAsyncThunk("send_facebook", async (payload: any) => {
  return await sendFacebookMessagePost(payload);
});

export const queueList = createAsyncThunk("queue-list", async () => {

  //console.log("queueList", await queueListGet());
  return await queueListGet();
});

export const channelList = createAsyncThunk(
  "channel-list",
  async (payload: any) => {
    return await channelListPost(payload);
  }
);

export const updateChannel = createAsyncThunk(
  "update-channel",
  async (payload: any) => {
    return await updateMessagePut(payload);
  }
);

export const chatHistory = createAsyncThunk(
  "chat-history",
  async (payload: any) => {
    return await chatHistoryPost(payload);
  }
);

const getChatState = (state: InitialState) => {
  return state.modeType === "pbx" ? state.pbx : state.call;
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    changeModle: (state, action: PayloadAction<any>) => {
      state.modeType = action.payload;
    },
    onUnSelectCampaign: (state) => {
      getChatState(state).activeChatList = [];
      getChatState(state).unReadChatList = [];
      getChatState(state).campaign_uuid = "";
    },
    onRecieveUnReadChat: (state, action: PayloadAction<any>) => {
      if (getChatState(state).campaign_uuid) {
        if (action.payload?.notification_type) {
          if (
            getChatState(state).activeConversation?.[
            getChatState(state).campaign_uuid
            ]?.[
            getMessageFromNumber(
              getChatState(state).activeConversation?.[
              getChatState(state).campaign_uuid
              ]
            )
            ] === action.payload?.[getMessageFromNumber(action.payload)] &&
            getChatState(state).activeConversation?.[
              getChatState(state).campaign_uuid
            ]?.messages?.length
          ) {
            const messageIndex = getChatState(state).activeConversation?.[
              getChatState(state).campaign_uuid
            ]?.messages.findIndex(
              (msg: any) => {
                const messageId = msg.message_id?.split(',')?.[0];
                return action.payload.message_id === messageId;
              }
            );
            if (
              messageIndex !== -1 &&
              getChatState(state).activeConversation[
                getChatState(state).campaign_uuid
              ]?.messages
            ) {
              getChatState(state).activeConversation[
                getChatState(state).campaign_uuid
              ].messages[messageIndex]["notification_type"] =
                action.payload?.notification_type;
            }
          }
        } else {
          const chatType =
            action.payload?.unread === "1"
              ? "activeChatList"
              : "unReadChatList";
          const messageIndex = getChatState(state)[chatType]?.findIndex(
            (message: any) =>
              message?.[getMessageFromNumber(message)] ===
              action.payload?.[getMessageFromNumber(action.payload)]
          );
          if (messageIndex === undefined || messageIndex === -1) {
            getChatState(state)[chatType] = [
              ...(getChatState(state)[chatType] ?? []),
              ...[action.payload],
            ];
          } else {
            getChatState(state)[chatType][messageIndex] = action.payload;
            if (
              chatType === "activeChatList" &&
              getChatState(state).activeConversation?.[
              getChatState(state).campaign_uuid
              ]?.[
              getMessageFromNumber(
                getChatState(state).activeConversation?.[
                getChatState(state).campaign_uuid
                ]
              )
              ] === action.payload?.[getMessageFromNumber(action.payload)] &&
              getChatState(state).activeConversation[
              getChatState(state).campaign_uuid
              ]
            ) {
              let messages =
                getChatState(state).activeConversation?.[
                  getChatState(state).campaign_uuid
                ]?.messages ?? [];
              messages.push(action.payload);
              getChatState(state).activeConversation[
                getChatState(state).campaign_uuid
              ].messages = messages;
            }
          }
        }
      }
    },
    onRemoveUnReadChat: (state, action: PayloadAction<any>) => {
      if (getChatState(state).campaign_uuid) {
        if (action.payload?.notification_type === "remove") {
          const findUnReadChatItem = getChatState(
            state
          ).unReadChatList?.findIndex(
            (item: any) => item.from_number === action.payload?.from_number
          );
          getChatState(state).unReadChatList?.splice(findUnReadChatItem, 1);
        }
      }
    },
    onRejectUnReadChat: (state, action: PayloadAction<any>) => {
      getChatState(state).unReadChatList.splice(action.payload);
    },
    setIsActiveChat: (state, action: PayloadAction<any>) => {
      getChatState(state).isActiveChat = action.payload;
    },
    setIncomingChannelType: (state, action: PayloadAction<string>) => {
      getChatState(state).isIncomingChannelType = action.payload;
    },
    setActiveConversation: (state, action: PayloadAction<any>) => {
      getChatState(state).newConversation = undefined;
      if (getChatState(state).campaign_uuid) {
        getChatState(state).activeConversation[getChatState(state).campaign_uuid] = action.payload;
        if (action.payload) {
          getChatState(state).isActiveChat = true;
        } else {
          getChatState(state).isActiveChat = false;
        }
      }
    },
    onStartConversation: (state, action: PayloadAction<any>) => {
      if (getChatState(state).campaign_uuid)
        getChatState(state).activeConversation[
          getChatState(state).campaign_uuid
        ] = undefined;
      getChatState(state).newConversation = action.payload;
    },

    // WhatsApp Popup Actions
    setWhatsAppPopupMessage: (state, action: PayloadAction<WhatsAppPopupMessage>) => {
      getChatState(state).whatsAppPopupMessage = action.payload;
      getChatState(state).showWhatsAppPopup = true;
    },
    hideWhatsAppPopup: (state) => {
      getChatState(state).showWhatsAppPopup = false;
      getChatState(state).whatsAppPopupMessage = null;
    },
    onReceiveWhatsAppMessage: (state, action: PayloadAction<WhatsAppPopupMessage>) => {
      // Set the message and show popup when messageId is provided
      if (action.payload.messageId) {
        getChatState(state).whatsAppPopupMessage = action.payload;
        getChatState(state).showWhatsAppPopup = true;
      }
    },
   // Omnichannel Popup Actions
    setOmniChannelPopupMessage: (state, action: PayloadAction<OmnichannelPopupMessage>) => {
      getChatState(state).omnichannelPopupMessage = action.payload;
      getChatState(state).showOmnichannelPopup = true;
    },
    hideOmniChannelPopup: (state) => {
      getChatState(state).showOmnichannelPopup = false;
      getChatState(state).omnichannelPopupMessage = null;
    },
    onReceiveOmniChannelMessage: (state, action: PayloadAction<OmnichannelPopupMessage>) => {
      // Set the message and show popup when messageId is provided
      if (action.payload.messageId) {
        getChatState(state).omnichannelPopupMessage = action.payload;
        getChatState(state).showOmnichannelPopup = true;
      }
    },

    clearChatSlice: () => initialState,
  },
 // extraReducers: (builder) => {
	    extraReducers: (builder) => {
    builder.addCase(
      getAgentTodayStats.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload || {};
        state.call.todayStats = data;
      }
    );
    builder.addCase(getActiveUnreadChat.fulfilled, (state, action: any) => {
      const chatList = action?.payload?.data;
      //console.log("chatListchatList",chatList);
      getChatState(state).campaign_uuid =
        action?.meta?.arg?.[
        state.modeType === "pbx" ? "user_uuid" : "campaign_uuid"
        ];
      getChatState(state).activeChatList =
        chatList?.active?.map((message: any) => {
          // message.latest_message.chat_user_id = message.from_number;
          message.latest_message.unread_message_count =
            message.unread_message_count;
          return message.latest_message;
        }) ?? [];
      if (!getChatState(state).activeChatList?.length) {
        getChatState(state).activeConversation = {};
      }
      getChatState(state).unReadChatList =
        chatList.unread?.map((message: any) => {
          // message.latest_message.chat_user_id = message.from_number;
          message.latest_message.unread_message_count =
            message.unread_message_count;
          return message.latest_message;
        }) ?? [];
    });
    builder.addCase(
      getWhatsAppMessagesList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const messagesList = action?.payload?.data;
        getChatState(state).whatsAppMessageList = messagesList ?? [];
      }
    );
    builder.addCase(
      aceeptChat.fulfilled,
      (state, action: PayloadAction<any>) => {
        const findUnReadChatItem = getChatState(
          state
        ).unReadChatList?.findIndex(
          (item: any) =>
            item.phone_number_id === action.payload?.phone_number_id
        );
        getChatState(state).unReadChatList?.splice(findUnReadChatItem, 1);
      }
    );
    builder.addCase(endChat.fulfilled, (state, action: PayloadAction<any>) => {
      const findActiveChatItem = getChatState(state).activeChatList?.findIndex(
        (item: any) =>
          item.phone_number_id ===
          getChatState(state).activeConversation?.[
            getChatState(state).campaign_uuid
          ]?.phone_number_id
      );
      getChatState(state).activeChatList?.splice(findActiveChatItem, 1);
      if (getChatState(state).campaign_uuid)
        getChatState(state).activeConversation[
          getChatState(state).campaign_uuid
        ] = undefined;
      getChatState(state).whatsAppMessageList = [];
    });
    builder.addCase(
      transferChat.fulfilled,
      (state, action: PayloadAction<any>) => {
        const findActiveChatItem = getChatState(
          state
        ).activeChatList?.findIndex(
          (item: any) =>
            item.phone_number_id ===
            getChatState(state).activeConversation?.[
              getChatState(state).campaign_uuid
            ]?.phone_number_id
        );
        getChatState(state).activeChatList?.splice(findActiveChatItem, 1);
        if (getChatState(state).campaign_uuid)
          getChatState(state).activeConversation[
            getChatState(state).campaign_uuid
          ] = undefined;
        getChatState(state).whatsAppMessageList = [];
      }
    );
    builder.addCase(
      queueList.fulfilled,
      (state, action: PayloadAction<any>) => {
        getChatState(state).channelList = [];
        const data = action.payload?.data || [];
        getChatState(state).queueList = data?.map((val: any) => ({
          label: val.name,
          value: val.uuid,
        }));
      }
    );
    builder.addCase(
      channelList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload?.data || [];
        getChatState(state).channelList = data?.map((val: any) => ({
          label: val.name,
          value: val.uuid,
        }));
      }
    );
    builder.addCase(
      getCallWaitingCount.fulfilled,
      (state, action: PayloadAction<any>) => {
        const data = action.payload || {};
        state.call.waitingCount = data;
      }
    );
  },
});

export default chatSlice.reducer;
export const {
  clearChatSlice,
  onRecieveUnReadChat,
  onRemoveUnReadChat,
  onRejectUnReadChat,
  setActiveConversation,
  onStartConversation,
  onUnSelectCampaign,
  changeModle,
  setIsActiveChat,
  setWhatsAppPopupMessage,
  hideWhatsAppPopup,
  onReceiveWhatsAppMessage,
  onReceiveOmniChannelMessage,
  hideOmniChannelPopup,
  setIncomingChannelType,   
} = chatSlice.actions;

export const selectWhatsAppMessages = (state: RootState) =>
  getChatState(state.chat).whatsAppMessageList;
export const useWhatsAppMessages = () => {
  const whatsAppMessageList = useAppSelector(selectWhatsAppMessages);
  return useMemo(() => whatsAppMessageList, [whatsAppMessageList]);
};

export const selectActiveChats = (state: RootState) =>
  getChatState(state.chat).activeChatList;
export const useActiveChats = () => {
  const activeChatList = useAppSelector(selectActiveChats);
  return useMemo(() => activeChatList, [activeChatList]);
};

export const selecUnReadChats = (state: RootState) =>
  getChatState(state.chat).unReadChatList;
export const useUnReadChats = () => {
  const unReadChatList = useAppSelector(selecUnReadChats);
  return useMemo(() => unReadChatList, [unReadChatList]);
};

export const selectActiveConversation = (state: RootState) =>
  getChatState(state.chat).campaign_uuid
    ? getChatState(state.chat).activeConversation[
    getChatState(state.chat).campaign_uuid
    ]
    : undefined;
export const useActiveConversation = () => {
  const activeConversation = useAppSelector(selectActiveConversation);
  return useMemo(() => activeConversation, [activeConversation]);
};

export const selectNewConversation = (state: RootState) =>
  getChatState(state.chat).newConversation;
export const useNewConversation = () => {
  const newConversation = useAppSelector(selectNewConversation);
  return useMemo(() => newConversation, [newConversation]);
};

export const selectQueueList = (state: RootState) =>
  getChatState(state.chat).queueList;
export const useQueueList = () => {
  const queueList = useAppSelector(selectQueueList);
  return useMemo(() => queueList, [queueList]);
};

export const selectChannelList = (state: RootState) =>
  getChatState(state.chat).channelList;
export const useChannelList = () => {
  const channelList = useAppSelector(selectChannelList);
  return useMemo(() => channelList, [channelList]);
};

// WhatsApp Popup Selectors
export const selectWhatsAppPopupMessage = (state: RootState) =>
  getChatState(state.chat).whatsAppPopupMessage;
export const useWhatsAppPopupMessage = () => {
  const whatsAppPopupMessage = useAppSelector(selectWhatsAppPopupMessage);
  return useMemo(() => whatsAppPopupMessage, [whatsAppPopupMessage]);
};

export const selectShowWhatsAppPopup = (state: RootState) =>
  getChatState(state.chat).showWhatsAppPopup;
export const useShowWhatsAppPopup = () => {
  const showWhatsAppPopup = useAppSelector(selectShowWhatsAppPopup);
  return useMemo(() => showWhatsAppPopup, [showWhatsAppPopup]);
};
// Omn ichannel Popup Selectors
export const selectOmnichannelPopupMessage = (state: RootState) =>
  getChatState(state.chat).omnichannelPopupMessage;
export const useOmnichannelPopupMessage = () => {
  const omnichannelPopupMessage = useAppSelector(selectOmnichannelPopupMessage);
  return useMemo(() => omnichannelPopupMessage, [omnichannelPopupMessage]);
};

export const selectShowOmnichannelPopup = (state: RootState) =>
  getChatState(state.chat).showOmnichannelPopup;
export const useShowOmnichannelPopup = () => {
  const showOmnichannelPopup = useAppSelector(selectShowOmnichannelPopup);
  return useMemo(() => showOmnichannelPopup, [showOmnichannelPopup]);
};


export const selectChatMode = (state: RootState) => state.chat.modeType;
export const useChatMode = () => {
  const chatMode = useAppSelector(selectChatMode);
  return useMemo(() => chatMode, [chatMode]);
};

export const selectWaitingCount = (state: RootState) => state.chat.call.waitingCount;
export const useWaitingCount = () => {
  const waitingCount = useAppSelector(selectWaitingCount);
  return useMemo(() => waitingCount, [waitingCount]);
};

export const selectIsActiveChat = (state: RootState) => getChatState(state.chat).isActiveChat;
export const useIsActiveChat = () => {
  const isActiveChat = useAppSelector(selectIsActiveChat);
  return useMemo(() => isActiveChat, [isActiveChat]);
};

export const selectIncomingChannelType = (state: RootState) =>
  getChatState(state.chat).isIncomingChannelType;
export const selectTodayStats = (state: RootState) => state.chat.call.todayStats;
export const useTodayStats = () => {
  const todayStats = useAppSelector(selectTodayStats);
  return useMemo(() => todayStats, [todayStats]);
};
export const useIncomingChannelType = () => {
  const isIncomingChannelType = useAppSelector(selectIncomingChannelType);
  return useMemo(() => isIncomingChannelType, [isIncomingChannelType]);
};
