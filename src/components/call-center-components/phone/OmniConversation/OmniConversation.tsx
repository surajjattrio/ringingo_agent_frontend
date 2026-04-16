import { useEffect, useState } from "react";

// PROJECT IMPORTS
import { platformOptions } from "@/config/options";
import { Button } from "@/components/forms";
import { OptionTypes } from "@/types/formTypes";
import { useAppDispatch } from "@/redux/hooks";
import {
  aceeptChat,
  chatHistory,
  getActiveUnreadChat,
  getWhatsAppMessagesList,
  onRecieveUnReadChat,
  onStartConversation,
  senFacebookMessage,
  senInstaMessage,
  // senInstaMessage,
  senMessage,
  setActiveConversation,
  useActiveConversation,
  useNewConversation,
} from "@/redux/slice/chatSlice";
import { useAuth } from "@/contexts/hooks/useAuth";
import { getExtension } from "@/redux/slice/callSlice";
import { Loader, NoRecordFound } from "@/components/ui-components";
import { getMessageFromNumber } from "@/components/helperFunctions";
import { getSingleChatLead } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { onShowLeadInfo, useSelectedCampaign } from "@/redux/slice/commonSlice";
// import { io } from "socket.io-client";
import { getSocket } from "@/config/socket";
import OmniConversationTitle from "./OmniConversationTitle";
import OmniConversationBody from "./OmniConversationBody";
import OmniConversationFooter from "./OmniConversationFooter";
interface OmniConversationProps {
  active: string;
}

/* ============================== CONVERSATION TAB ============================== */

const OmniConversation = ({ active }: OmniConversationProps) => {
  let scrollTimeOut: any;
  const activeConversation = useActiveConversation();
  const selectedCampaign = useSelectedCampaign();
  const newConversation = useNewConversation();
  const { user } = useAuth();
  console.log(newConversation, 'newConversation');

  const dispatch = useAppDispatch();
  const [selectedPlatform, setSelectedPlatform] = useState<OptionTypes>(
    platformOptions[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<number>(-1);
  const [previewImages, setPreviewImages] = useState<Array<any>>([]);
  const [previewFiles, setPreviewFiles] = useState<Array<any>>([]);
  const [conversationData, setConversationData] = useState<any>();
  console.log(conversationData, 'conver form page');

  const [replyMessageId, setReplyMessageId] = useState<number>(-1);
  const [editMessageId, setEditMessageId] = useState<number>(-1);
  const [extensionList, setExtensionList] = useState<Array<any>>([]);
  const [chatHistoryList, setChatHistoryList] = useState<Array<any>>([]);
  console.log(chatHistoryList, 'chatHistoryList')
  // Socket connection for live message updates
  // const baseUrl: any = process.env.BASE_URL;
  // const socketConnection = io(baseUrl, {
  //   query: {
  //     token: user?.access_token,
  //     agent_uuid: user?.agent_detail?.uuid,
  //     browserToken: user?.agent_detail?.browserToken,
  //     user_uuid: user?.agent_detail?.uuid,
  //     user_id: user?.id,
  //     agent_id: user?.agent_detail?.id,
  //   },
  //   auth: {
  //     token: user?.access_token,
  //     browserToken: user?.agent_detail?.browserToken,
  //   },
  //   transports: ["websocket", "polling"],
  //   autoConnect: true,
  //   reconnection: true,
  //   reconnectionAttempts: 5,
  //   reconnectionDelay: 1000,
  //   timeout: 20000,
  // });

  // When switching tabs, clear previous new-conversation state
  useEffect(() => {
    dispatch(onStartConversation({ channel: null }));
  }, [active]);

  const socketConnection = getSocket(user);
  // Listen for live WhatsApp messages and update local conversationData
  useEffect(() => {
    socketConnection.on("whatsapp_message_live", (data: any) => {
      console.log("Received live message in conversation:", data);
      const initialMessage = {
        message_id: data.messageId,
        text_content: data.messageBody,
        timestamp: data.timestamp,
        message_type: "1", // Incoming message
        from_number: data.from_number,
        phone_number_id: data.phone_number_id,
        unread: "0", // Mark as read since we're accepting it
        notification_type: undefined,
        image_url: [],
        document_url: []
      };
      let payload = {
        from_number: data.from_number,
        phone_number_id: data.phone_number_id,
        tenant_uuid: user?.agent_detail?.tenant_uuid,
        text_content: data.messageBody,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.9).toISOString(),
        user_uuid: user?.agent_detail?.uuid,
        message_type: "1",
        whatsapp_messaging_channel_uuid:
          user?.agent_detail?.whatsapp_messaging_channel_uuid,
        unread_message_count: 0,
        messages: [initialMessage],
        image_url: data.image_url,
        document_url: data.document_url
      };
      // Check if this message belongs to the current conversation
      if (conversationData && data) {
        const currentFromNumber =
          conversationData[getMessageFromNumber(conversationData)];
        const messageFromNumber = data[getMessageFromNumber(data)];
        console.log(messageFromNumber, "new data");

        if (currentFromNumber === messageFromNumber) {
          // Add the new message to the current conversation

          const updatedMessages = [
            ...(conversationData.messages || []),
            payload,
          ];
          setConversationData({
            ...conversationData,
            messages: updatedMessages,
          });
          dispatch(setActiveConversation({ ...conversationData, messages: updatedMessages }))
          dispatch(getActiveUnreadChat({ campaign_uuid: selectedCampaign })).unwrap();
          // Scroll to the bottom to show the new message
          scrollToEnd();
        }
      }
    });

    return () => {
      socketConnection.off("whatsapp_message_live");
    };
  }, [conversationData, socketConnection, activeConversation]);

  console.log("logg activeConversationactiveConversation", activeConversation);

  // Cleanup socket connection on unmount
  useEffect(() => {
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, [socketConnection]);

  const getChatHistory = async () => {
    const response = await dispatch(
      chatHistory({
        from_number: conversationData?.[getMessageFromNumber(conversationData)],
      })
    ).unwrap();
    if (response?.data) {
      setChatHistoryList(response.data);
    }
  };

  const getAllMessages = async (payload?: any) => {
    const activeData = payload ? payload : activeConversation;
    console.log(activeData, "getallwhatsdata");
    setIsLoading(true);
    const response = await dispatch(
      getWhatsAppMessagesList({
        phone_number_id: activeData?.phone_number_id,
        instagram_business_account_id: activeData?.channel_identifiers?.instagram_business_account_id,
        from_number: activeData?.[getMessageFromNumber(activeData)],
        channel_type: activeData?.channel_type,
        facebook_page_id: activeData?.channel_identifiers?.facebook_page_id
      })
    ).unwrap();

    const data = {
      ...activeData,
      messages: response?.data ?? [],
    };
    setConversationData({ ...data });
    dispatch(setActiveConversation({ ...data }));
    setChatHistoryList([]);
    setIsLoading(false);
    scrollToEnd();
  };

  // GET EXTENSION LIST
  const onGetExtension = async () => {
    try {
      const response = await dispatch(
        getExtension({
          list: "all",
          extension_uuid: user?.agent_detail?.extension_details[0]?.uuid,
        })
      ).unwrap();
      if (response?.data) {
        const data = response?.data?.map((val: any) => ({
          value: val.user_uuid,
          label: val.username,
        }));
        setExtensionList(data);
      }
    } catch (error: any) {
      console.log("Get Extension list Err ---->", error?.message);
    }
  };

  useEffect(() => {
    if (activeConversation && Object.keys(activeConversation)?.length !== 0) {
      setConversationData({ ...activeConversation });
      if (
        (conversationData &&
          conversationData?.[getMessageFromNumber(conversationData)] !==
          activeConversation?.[getMessageFromNumber(conversationData)]) ||
        !activeConversation?.messages ||
        activeConversation?.messages?.length === 0
      ) {
        getAllMessages();
      }
    } else {
      setChatHistoryList([]);
      setConversationData(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation]);

  // useEffect(() => {
  //   if (
  //     !newConversation &&
  //     activeConversation &&
  //     Object.keys(activeConversation)?.length !== 0
  //   ) {
  //     getAllMessages();
  //   }
  //   onGetExtension();
  //   return () => {
  //     setChatHistoryList([]);
  //     clearTimeout(scrollTimeOut);
  //     scrollTimeOut = undefined;
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const messageSendApi = async (formData: any, messages: any, payload: any) => {
    console.log("message send apii", messages);
    console.log("message send apii payloadd", payload);
    console.log("formData", formData);

    let messageResponse: any;
    if (payload.channelType?.toLowerCase() == "whatsapp") {
      messageResponse = await dispatch(senMessage(formData)).unwrap();
    }
    else if (payload.channelType?.toLowerCase() == "instagram") {
      messageResponse = await dispatch(senInstaMessage(formData)).unwrap();
    }
    else if (payload?.channelType.toLowerCase() == "facebook") {
      messageResponse = await dispatch(senFacebookMessage(formData)).unwrap();
    } else {

    }

    if (messageResponse) {
      messages[messages?.length - 1]["message_id"] =
        messageResponse.message["message_id"];
      setConversationData({
        ...conversationData,
        messages: [...messages],
      });
      dispatch(
        setActiveConversation({
          ...conversationData,
          text_content: payload.text_content,
          image_url: payload.image_url?.length ? payload.image_url : [],
          document_url: payload.document_url?.length
            ? payload.document_url
            : [],
          timestamp: payload.timestamp,
          messages: [...messages],
        })
      );
      dispatch(getActiveUnreadChat({ campaign_uuid: selectedCampaign })).unwrap();
      if (
        messageResponse?.message.lead_management_uuid !==
        conversationData?.lead_management_uuid
      ) {
        onGetSingleChatLeadInfo(messageResponse?.message.lead_management_uuid);
      }
      // onGetSingleChatLeadInfo(messageResponse?.message.lead_management_uuid);
    }
  };

  const pushMessage = async (payload: any, formData: any) => {
    if (editMessageId !== -1) {
      if (conversationData?.messages) {
        conversationData.messages[editMessageId] = payload;
        setConversationData({
          ...conversationData,
          messages: conversationData?.messages,
        });
      }
    } else {

      if (conversationData) {
        let messages = Object.assign(
          [],
          conversationData?.messages ? conversationData?.messages : []
        );
        messages.push(payload);
        setConversationData({
          ...conversationData,
          messages: [...messages],
        });
        scrollToEnd();

        await messageSendApi(formData, messages, payload);
      }
    }
  };

  const scrollToEnd = () => {
    scrollTimeOut = setTimeout(() => {
      let messageBody = document.getElementById("messageBody");
      if (messageBody) {
        messageBody.scrollTop = messageBody.scrollHeight;
      }
    }, 1000);
  };

  const getTextType = (data: any) => {
    if (data?.template_name) {
      return "template";
    } else if (data?.image_url?.length) {
      return "image";
    } else if (data?.document_url?.length) {
      return "document";
    } else {
      return "text";
    }
  };

  // GET LEAD INFORMATUON
  const onGetSingleChatLeadInfo = async (lead_uuid: string) => {
    try {
      await dispatch(getSingleChatLead(lead_uuid)).unwrap();
      dispatch(onShowLeadInfo(true));
    } catch (error: any) {
      console.log("Get lead Info Err--->", error?.message);
    }
  };

  // start conversation
  const onStartNewConversation = async (data: any) => {
    console.log(data, 'dataaaa');

    let response: any;
    const formData = new FormData();
    formData.append("to", `${data?.number}`);
    formData.append("text_content", `${data?.text}`);
    formData.append("campaign_uuid", `${selectedCampaign}`)
    // formData.append(
    //   "whatsapp_messaging_channel_uuid",
    //   newConversation?.channel
    // );
    formData.append("template_language_code", "en_US");
    setIsLoading(true);
    console.log(formData, 'formdata');
    if (newConversation?.channel.toLowerCase() == "whatsapp") {
      response = await dispatch(senMessage(formData)).unwrap();
    }
    else if (newConversation?.channel.toLowerCase() == "instagram") {
      response = await dispatch(senInstaMessage(formData)).unwrap();
    } else if (newConversation?.channel.toLowerCase() == "facebook") {
      response = await dispatch(senFacebookMessage(formData)).unwrap();
    } else {

    }
    // const response: any = await dispatch(senFacebookMessage(formData)).unwrap();
    if (response && response?.message) {
      const payload = {
        ...response?.message,
        unread: "1",
        notification_type: undefined,
      };
      await dispatch(
        aceeptChat({
          whatsapp_messaging_channel_uuid: newConversation?.channel,
          from_number: `${data?.number}`,
          user_uuid: user?.agent_detail?.uuid,
          browserToken: user?.agent_detail?.browserToken,
        })
      ).unwrap();
      await dispatch(onRecieveUnReadChat(payload));
      await dispatch(setActiveConversation(payload));
      getAllMessages(payload);
      onGetSingleChatLeadInfo(response?.message.lead_management_uuid)
    }
  };

  const onSubmit = async (data: any) => {
    console.log(conversationData, 'conver onsubmit');
    console.log(data, 'data')
    if (newConversation?.channel) {
      await onStartNewConversation(data);
    } else {
      let payload = {
        to: conversationData?.[getMessageFromNumber(conversationData)],
        text_content: data?.text,
        text_type: getTextType(data),
        phone_number_id: conversationData?.phone_number_id,
        name: user?.agent_detail?.username,
        timestamp: new Date(),
        message_type: "0",
        image_url: data?.image_url,
        document_url: data?.document_url,
        temp_uuid: new Date().getTime(),
        channelType: conversationData?.channel_type,
      };
      const formData = new FormData();
      formData.append("to", payload.to);
      if (payload.text_content)
        formData.append("text_content", payload.text_content);
      formData.append("text_type", payload.text_type);
      formData.append("phone_number_id", payload.phone_number_id);
      formData.append("campaign_uuid", `${selectedCampaign}`)

      // formData.append("whatsapp_messaging_channel_uuid", user?.agent_detail?.whatsapp_messaging_channel_uuid);

      if (data?.image_url?.length) {
        for (let i = 0; i < data?.image_url.length; i++) {
          formData.append("image_url", data.image_url[i]);
        }
      }

      if (data?.document_url?.length) {
        for (let i = 0; i < data?.document_url.length; i++) {
          formData.append("document_url", data.document_url[i]);
        }
      }

      setSelectedItem(-1);
      setPreviewFiles([]);
      setPreviewImages([]);
      setReplyMessageId(-1);
      await pushMessage(payload, formData);
      setEditMessageId(-1);
    }
  };

  const onImagePreview = (files: any, index: number) => {
    setPreviewImages(files);
    setSelectedItem(index);
  };

  const onFilePreview = (files: any, index: number) => {
    setPreviewFiles(files);
    setSelectedItem(index);
  };

  const closeImagePreview = () => {
    setPreviewImages([]);
    setSelectedItem(-1);
  };

  const closeFilePreview = () => {
    setPreviewFiles([]);
    setSelectedItem(-1);
  };
  return (
    <>
      {conversationData?.user_uuid || newConversation?.channel ? (
        <>
          {conversationData?.user_uuid ? (
            <>
              <OmniConversationTitle
                conversationData={conversationData}
                extensionList={extensionList}
                getChatHistory={getChatHistory}
                active={active}
              />
              <OmniConversationBody
                isLoading={isLoading}
                conversationData={conversationData}
                setConversationData={setConversationData}
                onImagePreview={onImagePreview}
                onFilePreview={onFilePreview}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                previewFiles={previewFiles}
                previewImages={previewImages}
                closeImagePreview={closeImagePreview}
                closeFilePreview={closeFilePreview}
                setReplyMessageId={setReplyMessageId}
                editMessageId={editMessageId}
                setEditMessageId={setEditMessageId}
                chatHistoryList={chatHistoryList}
                active={active}
              />
            </>
          ) : (
            <div
              className={`border border-dark-800 bg-[#f9f9f9] h-[61vh] py-2 scrollbar-hide`}
            >
              {isLoading ? (
                <div className="h-[61vh]">
                  <Loader />
                </div>
              ) : (
                <></>
              )}
            </div>
          )}
          <OmniConversationFooter
            onSubmit={(data: any) => onSubmit(data)}
            onImagePreview={onImagePreview}
            onFilePreview={onFilePreview}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            editMessageId={editMessageId}
            conversationData={conversationData}
            newConversation={newConversation}
            active={active}
          />
        </>
      ) : active?.toLowerCase() !== "all" ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="3xl:text-lg text-base font-bold text-heading pt-2">
            Start Conversation
          </div>
          <div className="3xl:text-sm text-xs text-txt-secondary p-2 max-w-[300px] text-center">
            Try to start a new conversation or select active conversation from
            “Active” panel.
          </div>
          <button
            className={`flex items-center gap-2 ${active === "whatsapp"
              ? "bg-emerald-500"
              : active === "instagram"
                ? "bg-pink-500"
                : active === "facebook"
                  ? "bg-[#2563EB]"
                  : "bg-[#38BDF8]"
              } text-white text-sm font-medium px-4 py-2 rounded-[10px]`}
            onClick={async () => {
              await dispatch(
                onStartConversation({
                  channel: active,
                })
              );
            }}
          >
            <span className="text-xl leading-none">+</span>
            <span>Start Conversation</span>
          </button>

        </div>
      ) : <NoRecordFound
        title="No Active Conversation"
        description={!selectedCampaign ? "Select campaign to view data" : ""}
        topImageClass="p-0"
        imageClass="!h-24 !w-24"
      />}
    </>
  );
};

export default OmniConversation;
