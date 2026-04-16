import React, { useState } from "react";

// PROJECT IMPORTS
import { Button } from "@/components/forms";
import TransferChat from "@/components/modals/TransferChat";
import Icon from "@/components/ui-components/Icon";
import StartConversation from "@/components/modals/StartConversation";
import { useSingleChatLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";

interface ConversationTitleProps {
  conversationData: any;
  extensionList: Array<any>;
  getChatHistory: Function;
}

/* ============================== CONVERSATION TITLE ============================== */

const ConversationTitle = ({
  conversationData,
  extensionList,
  getChatHistory,
}: ConversationTitleProps) => {
  const [isTransferChat, setIsTransferChat] = useState<boolean>(false);
  const [isStartConversation, setisStartConversation] =
    useState<boolean>(false);
  const singleChatLeadDetails = useSingleChatLeadDetails();

  return (
    <div className="border-b border-dark-800 bg-white h-[9vh] p-1.5 flex items-center">
      <div className="flex justify-between w-[100%]">
        <div className="flex">
          <div className="bg-[#adadb6] text-[#313349] font-bold 5xl:text-[18px] 4xl:text-[15px] text-[14px] 5xl:w-[32px] 4xl:w-[30px] 5xl:h-[32px] 4xl:h-[30px] h-[28px] w-[28px] rounded-[50%] flex justify-center items-center m-2 capitalize">
            {singleChatLeadDetails?.first_name?.charAt(0)}
            {/* {conversationData?.name?.charAt(0) || singleChatLeadDetails?.first_name?.charAt(0)} */}
          </div>
          <div className="p-1 flex items-center">
            <div className="font-bold 5xl:text-[16px] 4xl:text-[14px] text-[12px] capitalize">
              {singleChatLeadDetails?.first_name}
              {/* {conversationData?.name || singleChatLeadDetails?.first_name} */}
            </div>
            <div className="5xl:text-[13px] 4xl:text-[11px] text-[9px] text-[#646567]">
              {/* Session time: {"1:00"} */}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div
            className="cursor-pointer px-2"
            onClick={() => {
              getChatHistory();
            }}
          >
            <Icon name={"ChatHistory"} width={20} height={20} />
          </div>
          <div
            className="cursor-pointer"
            onClick={() => {
              setisStartConversation(true);
            }}
          >
            <Icon name={"Setting"} width={20} height={20} />
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
          <div className="m-2">
            <Button
              // text="Transfer Chat"
              loaderClass="!border-primary-green !border-t-transparent"
              style="secondary-outline"
              icon="transfer-gray"
              className="px-2 py-1 border-[#D8D8D8] border-[1px] font-normal"
              onClick={() => {
                setIsTransferChat(true);
              }}
            />
          </div>
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
  );
};

export default ConversationTitle;
