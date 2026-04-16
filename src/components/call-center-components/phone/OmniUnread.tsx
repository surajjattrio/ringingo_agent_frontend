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
import Image from "next/image";

interface OmniUnreadListProps {
  sectionClass: string;
  sectionBodyClass: string;
  sectionName?: string;
}

/* ============================== UNREAD LIST BOX ============================== */
const channelColors: any = {
  whatsapp: "bg-green-500",
  instagram: "bg-pink-500",
  facebook: "bg-blue-600",
};
const OmniUnreadList = ({
  sectionClass,
  sectionBodyClass,
  sectionName,
}: OmniUnreadListProps) => {
  const dispatch = useAppDispatch();
  const unReadChatList = useUnReadChats();
  const selectedCampaign = useSelectedCampaign();
  const { user } = useAuth();
  const chatModeType = useChatMode();
  const campaignType = useCampaignType();
  console.log(unReadChatList, 'sss');

  //   const dataa:any=[
  //     {
  //         "_id": "25623649780601196",
  //         "latest_message": {
  //             "_id": "69592f81fb26206fb35a85bf",
  //             "provider_message_id": "m_qraMtSpALq1Rbt5zMU7PqzfT1NT_h7Hue0cnhWCjq9Iz6R2yh4vb0cNR0FsKX9-kWCMr-FEbF36qJVkt98-UXw",
  //             "__v": 0,
  //             "channel_identifiers": {
  //                 "facebook_page_id": "893977843793634"
  //             },
  //             "channel_type": "facebook",
  //             "channel_uuid": "64d69e5c-5e39-41e1-bfd5-ff4c9349b791",
  //             "createdAt": "2026-01-03T15:02:25.585Z",
  //             "direction": "inbound",
  //             "document_url": [],
  //             "from_number": "25623649780601196",
  //             "image_url": [],
  //             "is_unread": true,
  //             "message_type": "1",
  //             "messaging_channel_uuid": "64d69e5c-5e39-41e1-bfd5-ff4c9349b791",
  //             "notification_type": "0",
  //             "raw_payload": {
  //                 "sender": {
  //                     "id": "25623649780601196"
  //                 },
  //                 "recipient": {
  //                     "id": "893977843793634"
  //                 },
  //                 "timestamp": 1767452544231,
  //                 "message": {
  //                     "mid": "m_qraMtSpALq1Rbt5zMU7PqzfT1NT_h7Hue0cnhWCjq9Iz6R2yh4vb0cNR0FsKX9-kWCMr-FEbF36qJVkt98-UXw",
  //                     "text": "asdfghj"
  //                 }
  //             },
  //             "status": "received",
  //             "tenant_uuid": "791fbf08-a827-475a-97fb-fff00971d638",
  //             "text_content": "asdfghj",
  //             "text_type": "text",
  //             "timestamp": "Sat Jan 03 2026 15:02:24 GMT+0000 (Coordinated Universal Time)",
  //             "to": "893977843793634",
  //             "unread_message": "1",
  //             "updatedAt": "2026-01-03T15:02:25.585Z",
  //             "user_uuid": "",
  //             "uuid": "feb085f8-fc9f-4165-9301-de3083c758f0"
  //         }
  //     },
  //       {
  //         "_id": "2562364978060119s6",
  //         "latest_message": {
  //             "_id": "69592f81fb26206fb35a85bf",
  //             "provider_message_id": "m_qraMtSpALq1Rbt5zMU7PqzfT1NT_h7Hue0cnhWCjq9Iz6R2yh4vb0cNR0FsKX9-kWCMr-FEbF36qJVkt98-UXw",
  //             "__v": 0,
  //             "channel_identifiers": {
  //                 "facebook_page_id": "893977843793634"
  //             },
  //             "channel_type": "instagram",
  //             "channel_uuid": "64d69e5c-5e39-41e1-bfd5-ff4c9349b791",
  //             "createdAt": "2026-01-03T15:02:25.585Z",
  //             "direction": "inbound",
  //             "document_url": [],
  //             "from_number": "25623649780601196",
  //             "image_url": [],
  //             "is_unread": true,
  //             "message_type": "1",
  //             "messaging_channel_uuid": "64d69e5c-5e39-41e1-bfd5-ff4c9349b791",
  //             "notification_type": "0",
  //             "raw_payload": {
  //                 "sender": {
  //                     "id": "25623649780601196"
  //                 },
  //                 "recipient": {
  //                     "id": "893977843793634"
  //                 },
  //                 "timestamp": 1767452544231,
  //                 "message": {
  //                     "mid": "m_qraMtSpALq1Rbt5zMU7PqzfT1NT_h7Hue0cnhWCjq9Iz6R2yh4vb0cNR0FsKX9-kWCMr-FEbF36qJVkt98-UXw",
  //                     "text": "asdfghj"
  //                 }
  //             },
  //             "status": "received",
  //             "tenant_uuid": "791fbf08-a827-475a-97fb-fff00971d638",
  //             "text_content": "asdfghj",
  //             "text_type": "text",
  //             "timestamp": "Sat Jan 03 2026 15:02:24 GMT+0000 (Coordinated Universal Time)",
  //             "to": "893977843793634",
  //             "unread_message": "1",
  //             "updatedAt": "2026-01-03T15:02:25.585Z",
  //             "user_uuid": "",
  //             "uuid": "feb085f8-fc9f-4165-9301-de3083c758f0"
  //         }
  //     },
  //          {
  //         "_id": "2562364978060119s6",
  //         "latest_message": {
  //             "_id": "69592f81fb26206fb35a85bf",
  //             "provider_message_id": "m_qraMtSpALq1Rbt5zMU7PqzfT1NT_h7Hue0cnhWCjq9Iz6R2yh4vb0cNR0FsKX9-kWCMr-FEbF36qJVkt98-UXw",
  //             "__v": 0,
  //             "channel_identifiers": {
  //                 "facebook_page_id": "893977843793634"
  //             },
  //             "channel_type": "whatsapp",
  //             "channel_uuid": "64d69e5c-5e39-41e1-bfd5-ff4c9349b791",
  //             "createdAt": "2026-01-03T15:02:25.585Z",
  //             "direction": "inbound",
  //             "document_url": [],
  //             "from_number": "25623649780601196",
  //             "image_url": [],
  //             "is_unread": true,
  //             "message_type": "1",
  //             "messaging_channel_uuid": "64d69e5c-5e39-41e1-bfd5-ff4c9349b791",
  //             "notification_type": "0",
  //             "raw_payload": {
  //                 "sender": {
  //                     "id": "25623649780601196"
  //                 },
  //                 "recipient": {
  //                     "id": "893977843793634"
  //                 },
  //                 "timestamp": 1767452544231,
  //                 "message": {
  //                     "mid": "m_qraMtSpALq1Rbt5zMU7PqzfT1NT_h7Hue0cnhWCjq9Iz6R2yh4vb0cNR0FsKX9-kWCMr-FEbF36qJVkt98-UXw",
  //                     "text": "asdfghj"
  //                 }
  //             },
  //             "status": "received",
  //             "tenant_uuid": "791fbf08-a827-475a-97fb-fff00971d638",
  //             "text_content": "asdfghj",
  //             "text_type": "text",
  //             "timestamp": "Sat Jan 03 2026 15:02:24 GMT+0000 (Coordinated Universal Time)",
  //             "to": "893977843793634",
  //             "unread_message": "1",
  //             "updatedAt": "2026-01-03T15:02:25.585Z",
  //             "user_uuid": "",
  //             "uuid": "feb085f8-fc9f-4165-9301-de3083c758f0"
  //         }
  //     }
  // ]
  const onAcceptChat = async (unReadItem: any) => {
    console.log(unReadItem,'unReadItens');
    await dispatch(
      aceeptChat({
        phone_number_id: unReadItem.phone_number_id,
        from_number: unReadItem?.[getMessageFromNumber(unReadItem)],
        user_uuid: user?.agent_detail?.uuid,
        browserToken: user?.agent_detail?.browserToken,
        channel_type: unReadItem?.channel_type
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
      socketConnection.emit("om:accept", {
        // accepted_browser: user?.agent_detail?.browserToken,
        // all_browser: unReadItem.browser_token,
        // message_data: unReadItem,
        messageId: unReadItem.messageId,
        tenant_uuid: unReadItem.tenant_uuid,
        agent_uuid: user?.agent_detail?.uuid,
        browserToken: user?.agent_detail?.browserToken,
        channel_identifiers: unReadItem?.channelIdentifiers,
        from_number: unReadItem.from_number,
        phone_number_id: unReadItem.phone_number_id,
        user_uuid: user?.agent_detail?.uuid,
        channel_type: unReadItem?.channelType,
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
          messages: [initialMessage], 
          channel_identifiers:unReadItem?.channelIdentifiers,
          channel_type:unReadItem?.channel_type
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

  const channelConfig: any = {
    whatsapp: {
      color: "bg-green-500",
      label: "WhatsApp",
    },
    facebook: {
      color: "bg-blue-600",
      label: "Facebook",
    },
    instagram: {
      color: "bg-pink-400",
      label: "Instagram",
    },
  };
  const channelIconMap: Record<string, string> = {
    whatsapp: "/assets/icons/Whatsapp.svg",
    instagram: "/assets/icons/insta-icon.svg",
    facebook: "/assets/icons/facebook-icon.svg",
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto divide-y bg-white">
        {unReadChatList?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            <NoRecordFound title="No Unread Message"
              description={""}
              topImageClass="p-0"
              imageClass="!h-24 !w-24" />
          </div>
        ) : (

          unReadChatList?.map((item: any) => {
            const channel = channelConfig[item?.channel_type];
            const channelLetter = item?.channel_type?.charAt(0)?.toUpperCase();
            const channelIcon =
              channel && channelIconMap[item?.channel_type]
            return (
              <div
                key={item.id}
                className="group flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full border-[2px] border-amber-500 flex items-center justify-center font-semibold text-amber-500 
                  `}>
                    {item?.name?.charAt(0) || "U"}
                  </div>

                  {/* Channel Letter Badge */}
                  {channel && (
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold bg-white`}
                    >
                      <Image
                        src={channelIcon}
                        alt={channel}
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      {/* {channelLetter} */}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item?.name || "Unknown"}
                    </p>

                    {/* Channel Badge */}
                    {channel && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full text-white ${channel?.color}`}
                      >
                        {channel?.label}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 truncate">
                    {item?.text_content || "No message"}
                  </p>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[15px] ">
                      {format(
                        getValidTime(
                          item?.timestamp ?? item?.createdAt
                        ),
                        "dd/MM/yyyy"
                      )}
                    </span>

                    {item?.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        {item?.unread}
                      </span>
                    )}
                  </div>


                  {/* Accept Button */}
                  <button
                    onClick={() => onAcceptChat(item)}
                    className="
                      transition
                      text-xs font-semibold
                      px-3 py-1.5 rounded-md
                      bg-primary text-white
                      hover:bg-primary"
                  >
                    Accept
                  </button>
                </div>
              </div>
            );
          })

        )}
      </div>
      {/* <div className={`bg-white rounded-bl ${sectionClass}`}>
        <div className="bg-layout 3xl:px-6 3xl:py-2.5 py-1.5 px-4 h-[5.8vh]">
          <span className="3xl:text-base text-xs text-heading font-bold">
            Unread
          </span>
        </div>
        <div
          className={`bg-white flex rounded-md flex-col overflow-y-auto scrollbar-hide ${sectionBodyClass}`}
        >
          {dataa?.length ? (
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
      </div> */}

    </>
  );
};

export default OmniUnreadList;
