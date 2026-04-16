import React from "react";
import Image from "next/image";

// PROJECT IMPORTS
import { Button } from "../forms";
import { useAppDispatch } from "@/redux/hooks";
import {
  useWhatsAppPopupMessage,
  useShowWhatsAppPopup,
  hideWhatsAppPopup,
  onStartConversation,
  setActiveConversation,
  aceeptChat,
} from "@/redux/slice/chatSlice";
// import { io } from "socket.io-client";
import { useAuth } from "@/contexts/hooks/useAuth";
import {
  clearSingleChatLeadDetails,
  clearSingleLeadDetails,
} from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { getSocket } from "@/config/socket";

// TYPES
interface WhatsAppMessage {
  from_number: string;
  phone_number_id: string;
  messageBody: string;
  messageId: string;
  timestamp: string;
  type: string;
}

interface WhatsAppServiceStandaloneProps {
  onAccept?: (messageId: string) => void;
  onDecline?: (messageId: string) => void;
}

// ASSETS
const whatsappIcon = "/assets/icons/Whatsapp.svg";
const closeIcon = "/assets/icons/close.svg";

/* ============================== WHATSAPP SERVICE STANDALONE POPUP ============================== */

const WhatsAppServiceStandalone = (props: WhatsAppServiceStandaloneProps) => {
  const {
    onAccept = () => {},
    onDecline = () => {},
  } = props;
  const dispatch = useAppDispatch();
  const whatsAppMessage = useWhatsAppPopupMessage();
  const { user } = useAuth();
  // const baseUrl: any = process.env.BASE_URL;
  // const socketConnection = io(baseUrl);
  const socketConnection = getSocket(user);
  // console.log(whatsAppMessage, user, "whatsAppMessage");
  const showPopup = useShowWhatsAppPopup();

  // Mock message for testing when no message is provided
  const mockMessage: WhatsAppMessage = {
    messageId: "test-123",
    from_number: "+1234567890",
    messageBody:
      "Hello! I need help with my order. Can someone assist me please? This is a longer message to test how the popup handles text wrapping and display.",
    timestamp: Math.floor(Date.now() / 1000).toString(),
    phone_number_id: "phone_123",
    type: "text",
  };

  const displayMessage = whatsAppMessage || mockMessage;
  const visible = showPopup;

  const handleAccept = async () => {
    dispatch(clearSingleChatLeadDetails());
    dispatch(clearSingleLeadDetails());
    onAccept(displayMessage.messageId);

    // Create the initial message object for the messages array
    const initialMessage = {
      message_id: displayMessage.messageId,
      text_content: displayMessage.messageBody,
      timestamp: displayMessage.timestamp,
      message_type: "1", // Incoming message
      from_number: displayMessage.from_number,
      phone_number_id: displayMessage.phone_number_id,
      unread: "0", // Mark as read since we're accepting it
      notification_type: undefined,
    };

    await dispatch(
      setActiveConversation({
        from_number: displayMessage.from_number,
        phone_number_id: displayMessage.phone_number_id,
        tenant_uuid: user?.agent_detail?.tenant_uuid,
        text_content: displayMessage.messageBody,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.9).toISOString(),
        user_uuid: user?.agent_detail?.uuid,
        message_type: "1",
        whatsapp_messaging_channel_uuid:
          user?.agent_detail?.whatsapp_messaging_channel_uuid,
        unread_message_count: 0,
        messages: [initialMessage], // Include the messages array with the initial message
      })
    );

    // dispatch(hideWhatsAppPopup());

    // Uncomment these when ready to use socket connection and chat acceptance
    socketConnection.emit("wa:accept", {
      messageId: displayMessage.messageId,
      tenant_uuid: user?.agent_detail?.tenant_uuid,
      agent_uuid: user?.agent_detail?.uuid,
      browserToken: user?.agent_detail?.browserToken,
      from_number: displayMessage.from_number,
      phone_number_id: displayMessage.phone_number_id,
      user_uuid: user?.agent_detail?.uuid,
    });
    // await dispatch(
    //   onStartConversation({
    //     channel: user?.agent_detail?.whatsapp_messaging_channel_uuid,
    //   })
    // );
  };

  const handleDecline = () => {
    onDecline(displayMessage.messageId);
    dispatch(hideWhatsAppPopup());
  };

  const handleClose = () => {
    dispatch(hideWhatsAppPopup());
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateMessage = (text: string, maxLength: number = 120) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 ease-out scale-100 animate-pulse-once"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with WhatsApp branding */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full shadow-md">
                <Image
                  src={whatsappIcon}
                  alt="WhatsApp"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  New WhatsApp Message
                </h3>
                <p className="text-green-100 text-sm">
                  Incoming customer inquiry
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="text-white hover:text-green-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <Image
                src={closeIcon}
                alt="Close"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Message Content */}
        <div className="px-6 py-5">
          {/* Customer Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {displayMessage.from_number.charAt(1)}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-lg">
                  Unknown Customer
                </p>
                <p className="text-gray-500 text-sm">
                  {displayMessage.from_number}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Received</p>
              <p className="text-sm font-medium text-gray-600">
                {formatTime(displayMessage.timestamp)}
              </p>
            </div>
          </div>

          {/* Message Preview */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-6 border-l-4 border-green-500">
            <p className="text-gray-700 leading-relaxed">
              "{truncateMessage(displayMessage.messageBody)}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              text="Decline"
              onClick={handleDecline}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            />
            <Button
              text="Accept"
              onClick={handleAccept}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            />
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
      </div>
    </div>
  );
};

export default WhatsAppServiceStandalone;
