import React, { useState } from "react";

// PROJECT IMPORTS
import { Button } from "@/components/forms";
import TransferChat from "@/components/modals/TransferChat";
import Icon from "@/components/ui-components/Icon";
import StartConversation from "@/components/modals/StartConversation";
import { useSingleChatLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";

interface OmniConversationTitleProps {
  conversationData: any;
  extensionList: Array<any>;
  getChatHistory: Function;
  active: string
}

/* ============================== CONVERSATION TITLE ============================== */

const OmniConversationTitle = ({
  conversationData,
  extensionList,
  getChatHistory,
  active
}: OmniConversationTitleProps) => {
  const [isTransferChat, setIsTransferChat] = useState<boolean>(false);
  const [isStartConversation, setisStartConversation] =
    useState<boolean>(false);
  const singleChatLeadDetails = useSingleChatLeadDetails();
  return (
    <>
      <div
        className={`px-4 py-2 border-b flex items-center gap-3 justify-between ${active === "whatsapp"
            ? "bg-[#E3F5EA] border-[#A8E6BF]"
            : active === "instagram"
              ? "bg-[#F7E6EF] border-pink-500"
              : active === "facebook"
                ? "bg-[#E8F0FE] border-[#2563EB]"
                : "bg-[#e1edfa] border-[#38BDF8]"
          }`}
      >
        <div className="flex gap-3">

          <div className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center  ${active === "whatsapp"
                  ? "bg-emerald-50 text-emerald-500"
                  : active === "instagram"
                    ? "bg-[#f8f3f6] text-pink-500"
                    : active === "facebook"
                      ? "bg-[#f8f3f6] text-[#2563EB]"
                      : "bg-[#f7f8f9] text-[#38BDF8]"
                }`}
            >
              {singleChatLeadDetails?.first_name?singleChatLeadDetails?.first_name?.charAt(0):"U"}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${active === "whatsapp"
                  ? "bg-emerald-500"
                  : active === "instagram"
                    ? "bg-pink-500"
                    : active === "facebook"
                      ? "bg-[#2563EB]"
                      : "bg-[#38BDF8]"
                }`}
            ></span>
          </div>

          <div>
            <h3 className="text-[15px]"> {singleChatLeadDetails?.first_name}</h3>
            <p className="text-[10px] text-muted-foreground capitalize">
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <div
            className="cursor-pointer  "
            onClick={() => {
              getChatHistory();
            }}
          >
            <svg
              width={30}
              height={30}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 1 1 17 0z" />
              <polyline points="12 8 12 12 15 13" />
            </svg>

            {/* <Icon name={"ChatHistory"} width={20} height={20} /> */}
          </div>
          <div
            className="cursor-pointer 0 p-4"
            onClick={() => {
              setisStartConversation(true);
            }}
          >
            {/* <Icon name={"Setting"}  /> */}
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <StartConversation
            id="startNewConversation"
            visible={!!isStartConversation}
            onCancleClick={() => {
              setisStartConversation(false);
            }}
            onDoneClick={() => {
              setisStartConversation(false);
            }}
          />
          <div className="">
            <Button
              // text="Transfer Chat"
              loaderClass="!border-primary-green !border-t-transparent"
              style="secondary-outline"
              icon="transfer-gray"
              className="px-2 py-1 border-[#000] border-[2px] font-normal"
              onClick={() => {
                setIsTransferChat(true);
              }}
            />
          </div>
        </div>


        <TransferChat
          extensionList={extensionList}
          visible={!!isTransferChat}
          onDoneClick={() => {
            setIsTransferChat(false);
          }}
          onCancleClick={() => {
            setIsTransferChat(false);
          }}
        />
      </div>


    </>

  );
};

export default OmniConversationTitle;
