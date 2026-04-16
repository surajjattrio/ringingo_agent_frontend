"use client";
import Legacy from "next/legacy/image";

// ASSETS
const accept = "/assets/icons/green/right.svg";
const denied = "/assets/icons/red/wrong.svg";
const whatsappBlue = "/assets/icons/blue/whatsapp.svg";

import { useAppDispatch } from "@/redux/hooks";
import {
  aceeptChat,
  getActiveUnreadChat,
  onRejectUnReadChat,
  setActiveConversation,
  useChatMode,
  useUnReadChats,
} from "@/redux/slice/chatSlice";
import { NoRecordFound } from "@/components/ui-components";
import { useAuth } from "@/contexts/hooks/useAuth";
import {
  useCampaignType,
  useSelectedCampaign,
} from "@/redux/slice/commonSlice";
import {
  getMessageFromNumber,
  getValidTime,
} from "@/components/helperFunctions";

import { format } from "date-fns";
// import { io } from "socket.io-client";
import { getSocket } from "@/config/socket";

interface UnreadListProps {
  sectionClass: string;
  sectionBodyClass: string;
  sectionName?: string;
}

/* ============================== UNREAD LIST BOX ============================== */

const UnreadList = ({
  sectionClass,
  sectionBodyClass,
  sectionName,
}: UnreadListProps) => {
  const dispatch = useAppDispatch();
  const unReadChatList = useUnReadChats();
  const selectedCampaign = useSelectedCampaign();
  const { user } = useAuth();
  const chatModeType = useChatMode();
  const campaignType = useCampaignType();

  
  const onAcceptChat = async (unReadItem: any) => {
    await dispatch(
      aceeptChat({
        phone_number_id: unReadItem.phone_number_id,
        from_number: unReadItem?.[getMessageFromNumber(unReadItem)],
        user_uuid: user?.agent_detail?.uuid,
        browserToken: user?.agent_detail?.browserToken,
      })
    ).unwrap();
    if (selectedCampaign || sectionName === "pbx") {
      // getActiveUnreadChat({ user_uuid: user.agent_detail.uuid });
      await dispatch(
        getActiveUnreadChat(
          sectionName === "pbx"
            ? { user_uuid: user.agent_detail.uuid }
            : { campaign_uuid: selectedCampaign }
        )
      ).unwrap();
      // const baseUrl: any = process.env.BASE_URL;
      // const socketConnection = io(baseUrl);
      const socketConnection = getSocket(user);

      // socketConnection.emit("message_from_client", {
      //   accepted_browser: user?.agent_detail?.browserToken,
      //   all_browser: unReadItem.browser_token,
      //   message_data: unReadItem,
      // });
      socketConnection.emit("wa:accept", {
        // accepted_browser: user?.agent_detail?.browserToken,
        // all_browser: unReadItem.browser_token,
        // message_data: unReadItem,

        // messageId: unReadItem.messageId,
        tenant_uuid: unReadItem.tenant_uuid,
        agent_uuid: user?.agent_detail?.uuid,
        browserToken: user?.agent_detail?.browserToken,
        from_number: unReadItem.from_number,
        phone_number_id: unReadItem.phone_number_id,
        user_uuid: user?.agent_detail?.uuid,
      });

      // Create the initial message object for the messages array
      const initialMessage = {
        message_id: unReadItem.messageId || "",
        text_content: unReadItem.text_content,
        timestamp: unReadItem.timestamp,
        message_type: "1", // Incoming message
        from_number: unReadItem.from_number,
        phone_number_id: unReadItem.phone_number_id,
        unread: "0", // Mark as read since we're accepting it
        notification_type: undefined,
      };

      await dispatch(
        setActiveConversation({
          from_number: unReadItem.from_number,
          phone_number_id: unReadItem.phone_number_id,
          tenant_uuid: user?.agent_detail?.tenant_uuid,
          text_content: unReadItem.text_content,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.9).toISOString(),
          user_uuid: user?.agent_detail?.uuid,
          message_type: "1",
          whatsapp_messaging_channel_uuid:
            user?.agent_detail?.whatsapp_messaging_channel_uuid,
          unread_message_count: 0,
          messages: [initialMessage], // Include the messages array with the initial message
        })
      );
    }
  };

  const onRejectChat = async (index: number) => {
    await dispatch(onRejectUnReadChat(index));
  };

  const renderWhatsAppItems = () => {
    return (
      <>
        {unReadChatList?.map((activeItem: any, index: number) => {
          return (
            <div
              key={index}
              className={`grid grid-cols-6 items-center pr-2 gap-2 py-1.5 border-b border-dark-800  h-[7.2vh]`}
            >
              <div className="col-span-1 flex justify-center">
                <div className="relative 5xl:w-[26px] 5xl:h-[26px] 4xl:w-[22px] 4xl:-h-[22px] w-[18px] h-[18px]">
                  <Legacy src={whatsappBlue} alt="whatsapp" layout="fill" />
                </div>
              </div>
              <div className="col-span-3 flex flex-col">
                <span className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading capitalize text-ellipsis whitespace-nowrap overflow-hidden">
                  {activeItem?.name}
                </span>
                <span className="5xl:text-[13px] 4xl:text-[12px] text-[10px] text-txt-primary overflow-hidden whitespace-nowrap text-ellipsis">
                  {activeItem?.text_content}
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                <span className="5xl:text-[13px] 4xl:text-[12px] text-[10px] text-txt-primary m-1">
                  {format(
                    getValidTime(
                      activeItem?.timestamp ?? activeItem?.createdAt
                    ),
                    "dd/MM/yyyy"
                  )}
                </span>
                {/* <span
                  className="relative 5xl:w-[19px] 5xl:h-[19px] 4xl:w-[18px] 4xl:h-[18px] w-[16px] h-[16px] m-1 items-center cursor-pointer"
                  onClick={() => onRejectChat(index)}
                >
                  <Legacy src={denied} alt="denied" layout="fill" />
                </span> */}
                <span
                  className="relative 5xl:w-[19px] 5xl:h-[19px] 4xl:w-[18px] 4xl:h-[18px] w-[16px] h-[16px] m-1 items-center cursor-pointer"
                  onClick={() => onAcceptChat(activeItem)}
                >
                  <Legacy src={accept} alt="accept" layout="fill" />
                </span>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      <div className={`bg-white rounded-bl ${sectionClass}`}>
        <div className="bg-layout 3xl:px-6 3xl:py-2.5 py-1.5 px-4 h-[5.8vh]">
          <span className="3xl:text-base text-xs text-heading font-bold">
            Unread
          </span>
        </div>
        <div
          className={`bg-white flex rounded-md flex-col overflow-y-auto scrollbar-hide ${sectionBodyClass}`}
        >
          {unReadChatList?.length ? (
            chatModeType === "pbx" ||
              (selectedCampaign && campaignType === "blended") ? (
              renderWhatsAppItems()
            ) : null
          ) : (
            <NoRecordFound
              title="No Unread Messages"
              description={
                !selectedCampaign
                  ? "Select campaign to view data"
                  : "No more messages found from this campaign"
              }
              topImageClass="p-0"
              imageClass="!h-16 !w-16"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default UnreadList;
