import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "../forms";
import { useAppDispatch } from "@/redux/hooks";
import {
  useOmnichannelPopupMessage,
  useShowOmnichannelPopup,
  hideOmniChannelPopup,
  setActiveConversation,
  setIncomingChannelType,
  // clearSingleChatLeadDetails,
} from "@/redux/slice/chatSlice";
import { useAuth } from "@/contexts/hooks/useAuth";
import {
  clearSingleChatLeadDetails as clearSingleChatLeadDetailsLocal,
  clearSingleLeadDetails,
} from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { getSocket } from "@/config/socket";
import { useRouter } from "next/navigation";

// ASSETS
const closeIcon = "/assets/icons/close.svg";

interface WhatsAppMessage {
  from_number: string;
  phone_number_id: string;
  messageBody: string;
  messageId: string;
  timestamp: string;
  type: string;
  channelType: string;
  channelIdentifiers: object;
}

interface OmniChannelServiceStandaloneProps {
  onAccept?: (messageId: string) => void;
  onDecline?: (messageId: string) => void;
}

const OmniChannelServiceStandalone = (props: OmniChannelServiceStandaloneProps) => {
  const { onAccept = () => { }, onDecline = () => { } } = props;
  const dispatch = useAppDispatch();
  const omniMessage = useOmnichannelPopupMessage();
  const visible = useShowOmnichannelPopup();
  const { user } = useAuth();
  const router = useRouter();

  // const baseUrl: any = process.env.BASE_URL;
  // const socketConnection = io(baseUrl);
  const socketConnection = getSocket(user);

  // fallback/mock message when nothing present
  const mockMessage: WhatsAppMessage = {
    messageId: "test-123",
    from_number: "+1234567890",
    messageBody:
      "Hello! I need help with my order. Can someone assist me please? This is a longer message to test how the popup handles text wrapping and display.",
    timestamp: Math.floor(Date.now() / 1000).toString(),
    phone_number_id: "phone_123",
    type: "text",
    channelType: "",
    channelIdentifiers: {},
  };

  const displayMessage = (omniMessage as WhatsAppMessage) || mockMessage;

  // Accept handler: ensure connected then emit safely
  const handleAccept = async () => {
    dispatch(clearSingleChatLeadDetailsLocal());
    dispatch(clearSingleLeadDetails());
    onAccept(displayMessage.messageId);
    router.push(`/call-center/message`);
    
    const initialMessage = {
      message_id: displayMessage.messageId || "",
      text_content: displayMessage.messageBody,
      timestamp: displayMessage.timestamp,
      message_type: "1",
      from_number: displayMessage.from_number || "",
      phone_number_id: displayMessage.phone_number_id || "",
      unread: "0",
      notification_type: undefined,
    };
    console.log(displayMessage,"displayMessage");
    dispatch(setIncomingChannelType(displayMessage?.channelType?.toLowerCase()));
    // set active conversation in redux
    await dispatch(
      setActiveConversation({
        channel_type: displayMessage?.channelType,
        senderName: "Test",
        from_number: displayMessage.from_number,
        phone_number_id: displayMessage.phone_number_id,
        tenant_uuid: user?.agent_detail?.tenant_uuid,
        text_content: displayMessage?.messageBody,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.9).toISOString(),
        user_uuid: user?.agent_detail?.uuid,
        message_type: "1",
        whatsapp_messaging_channel_uuid:
          user?.agent_detail?.whatsapp_messaging_channel_uuid,
        unread_message_count: 0,
        messages: [initialMessage],
        channel_identifiers:displayMessage?.channelIdentifiers
      })
    );

    try {
      socketConnection.emit("om:accept", {
        messageId: displayMessage?.messageId || "",
        tenant_uuid: user?.agent_detail?.tenant_uuid,
        agent_uuid: user?.agent_detail?.uuid,
        browserToken: user?.agent_detail?.browserToken,
        channel_identifiers: displayMessage?.channelIdentifiers,
        from_number: displayMessage?.from_number,
        phone_number_id: displayMessage?.phone_number_id,
        user_uuid: user?.agent_detail?.uuid,
        channel_type: displayMessage?.channelType,
      });
    } catch (err) {
      console.warn("[omni-socket] emit error:", err);
    }
  };

  const handleDecline = () => {
    onDecline(displayMessage.messageId);
    dispatch(hideOmniChannelPopup());
  };

  const handleClose = () => {
    // close the omni popup (keeps socket alive so other components can reuse if needed)
    dispatch(hideOmniChannelPopup());
  };

  const formatTime = (timestamp: string) => {
    // timestamp might be seconds; normalize to ms if short
    const tsNum = Number(timestamp);
    const d = new Date(tsNum < 1e12 ? tsNum * 1000 : tsNum);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const truncateMessage = (text: string, maxLength = 120) =>
    text?.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  if (!visible) return null;

  // const isIg = (omniMessage as any)?.channelType === "instagram";
  // const headerGradient = isIg
  //   ? "bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400"
  //   : "bg-gradient-to-r from-green-500 to-green-600";
  // const messageBorder = isIg ? "border-pink-500" : "border-green-500";
  // const bottomAccent = isIg
  //   ? "from-pink-400 via-rose-500 to-yellow-500"
  //   : "from-green-400 via-blue-500 to-purple-600";

  const channelColors: any = {
  whatsapp: {
    header: "bg-gradient-to-r from-green-500 to-green-600",
    border: "border-green-500",
    bottom: "from-green-400 via-blue-500 to-purple-600",
  },
  instagram: {
    header: "bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400",
    border: "border-pink-500",
    bottom: "from-pink-400 via-rose-500 to-yellow-500",
  },
  facebook: {
    header: "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700",
    border: "border-blue-600",
    bottom: "from-blue-400 via-blue-500 to-indigo-500",
  },
};
const channel = (omniMessage as any)?.channelType?.toLowerCase(); 
const colors = channelColors[channel] || channelColors["whatsapp"];
const headerGradient = colors.header;
const messageBorder = colors.border;
const bottomAccent = colors.bottom;

const channelIconMap: Record<string, string> = {
  whatsapp: "/assets/icons/Whatsapp.svg",
  instagram: "/assets/icons/insta-icon.svg",
  facebook: "/assets/icons/facebook-icon.svg",
};
const channelIcon =
 channel && channelIconMap[channel] 
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 ease-out scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${headerGradient} px-6 py-4 relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full shadow-md">
                <Image
                  src={channelIcon}
                  alt={channel}
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {channel ? `${channel} Message` : "New Omnichannel Message"}
                </h3>
                <p className="text-green-100 text-sm">Incoming customer inquiry</p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="text-white hover:text-green-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <Image src={closeIcon} alt="Close" width={20} height={20} className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {displayMessage?.from_number && (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {displayMessage?.from_number?.charAt(1)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800 text-lg">Unknown Customer</p>
                <p className="text-gray-500 text-sm">{displayMessage?.from_number}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Received</p>
              <p className="text-sm font-medium text-gray-600">
                {formatTime(displayMessage?.timestamp)}
              </p>
            </div>
          </div>

          <div className={`bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-6 border-l-4 ${messageBorder}`}>
            <p className="text-gray-700 leading-relaxed">
              "{truncateMessage(displayMessage?.messageBody)}"
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              text="Decline"
              onClick={handleDecline}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-xl"
            />
            <Button
              text="Accept"
              onClick={handleAccept}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl"
            />
          </div>
        </div>

        <div className={`h-1 bg-gradient-to-r ${bottomAccent}`}></div>
      </div>
    </div>
  );
};

export default OmniChannelServiceStandalone;
