"use client";
import { useEffect, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { Success } from "@/redux/services/toasterService";
import {
  clearLeadDetails,
  clearLeadUuid,
  clearSingleLeadDetails,
  getAllLeads,
  getSingleChatLead,
  getSingleLead,
  onSkipLeadDial,
  useAllLeadDetails,
  useSingleChatLeadDetails,
  useSingleLeadDetails,
} from "@/redux/slice/callCenter/callCenterPhoneSlice";
import {
  onAddLeadNoteId,
  onDial,
  onSetAddNoteId,
  onSetNumberMask,
  onShowLeadInfo,
  setIsCallHangUp,
  useCampaignMode,
  useCampaignType,
  useIsCallHangUp,
  useLeadInfo,
  useSelectedCampaign,
} from "@/redux/slice/commonSlice";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";
import { NoRecordFound } from "@/components/ui-components";
import {
  getCallQueueList,
  updateLeadStatus,
  useActiveCallQueueList,
} from "@/redux/slice/campaignSlice";
import { Button } from "@/components/forms";
import {
  onStartConversation,
  setActiveConversation,
  setIsActiveChat,
  useActiveChats,
  useActiveConversation,
  useChatMode,
  useIncomingChannelType,
  useIsActiveChat,
} from "@/redux/slice/chatSlice";
import { format } from "date-fns";
import { getValidTime, isWhatsAppEnabled } from "@/components/helperFunctions";
import { useAuth } from "@/contexts/hooks/useAuth";

// ASSETS
const call_ring = "/assets/icons/yellow/call-ring.svg";
const call_outbound = "/assets/icons/call/call-outbound.svg";
const callGreen = "/assets/icons/green/call.svg";
const next = "/assets/icons/next-play.svg";
const whatsapp = "/assets/icons/green/whatsapp.svg";
const whatsappBlue = "/assets/icons/blue/whatsapp.svg";
const instagram = "/assets/icons/instagram.svg";
const imageIcon = "/assets/images/photo.png";

interface ActiveMessageListProps {
  sectionClass: string;
  sectionBodyClass: string;
  active: string;
}

/* ============================== ACTIVE LIST BOX ============================== */

const ActiveMessageList = ({
  sectionClass,
  sectionBodyClass,
  active,
}: ActiveMessageListProps) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const activeConversation = useActiveConversation();
  const allLeadsDetails = useAllLeadDetails();
  const selectedCampaign = useSelectedCampaign();
  const singleLeadDetails = useSingleLeadDetails();
  const campaignMode = useCampaignMode();
  const leadInfo = useLeadInfo();
  const isCallHangUp = useIsCallHangUp();
  const campaignType = useCampaignType();
  const callQueueList = useActiveCallQueueList();
  const activeChatListData = useActiveChats();
  const singleChatLeadDetails = useSingleChatLeadDetails();

  const chatModeType = useChatMode();
  const isActiveChat = useIsActiveChat();

  const [data, setData] = useState<any>([]);


  /**
 * Robust merge function that normalizes timestamps and picks true last message.
 * Accepts an array of message objects with mixed timestamp fields/formats.
 */
  function mergeChatMessagesWithTimestampFix(messages: any) {
    const chats = {} as any;

    function pickTimestampField(msg: any) {
      // Common fields in your data
      const candidates = [
        msg.timestamp,
        msg.createdAt,
        msg.updatedAt,
        msg.time,
        msg.ts,
        msg.datetime
      ];
      for (const c of candidates) {
        if (c !== undefined && c !== null && String(c).trim() !== "") return String(c).trim();
      }
      return null;
    }

    function parseToEpoch(value: any) {
      if (!value) return null;

      // If it's a number string or number (unix seconds/ms)
      if (/^\d+$/.test(value)) {
        const n = Number(value);
        // guess seconds vs ms: if seconds (10 digits) -> *1000
        if (n < 1e12) return n * 1000;
        return n;
      }

      // Try Date.parse (handles ISO and RFC formats)
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.getTime();

      // Try MM-DD-YYYY or M-D-YYYY with optional comma and time "MM-DD-YYYY, HH:MM:SS"
      // Example: "10-30-2025, 16:04:39" or "10-30-2025 16:04:39"
      const mmddRegex = /^\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s*,?\s*|\s+)(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/;
      const m = value.match(mmddRegex);
      if (m) {
        const month = Number(m[1]);
        const day = Number(m[2]);
        let year = Number(m[3]);
        if (year < 100) year += 2000;
        const hour = Number(m[4]);
        const min = Number(m[5]);
        const sec = m[6] ? Number(m[6]) : 0;
        const dd = new Date(Date.UTC(year, month - 1, day, hour, min, sec)); // parse as UTC to be consistent
        if (!isNaN(dd.getTime())) return dd.getTime();
      }

      // Try "Thu Oct 30 2025 16:03:17 GMT+0000 (Coordinated Universal Time)" style -- Date already covered, but fallback: try removing parenthetical parts
      const stripped = value.replace(/\s*\(.*\)$/, "");
      const d2 = new Date(stripped);
      if (!isNaN(d2.getTime())) return d2.getTime();

      // If all fails, return null
      return null;
    }

    for (const msg of messages) {
      const from = (msg.from_number || msg.from || "").toString().trim();
      const to = (msg.to || msg.to_number || "").toString().trim();
      if (!from || !to) continue;

      // consistent key so (A|B) == (B|A)
      const key = from < to ? `${from}|${to}` : `${to}|${from}`;

      if (!chats[key]) {
        chats[key] = {
          chat_id: key,
          participants: [from, to],
          messages: []
        };
      }

      // find best timestamp text and epoch
      const tsText = pickTimestampField(msg);
      const epoch = parseToEpoch(tsText) ?? (() => {
        // as last resort try updatedAt/createdAt again with Date parse
        const fallback = new Date();
        return fallback.getTime();
      })();

      chats[key].messages.push({
        from,
        to,
        text: msg.text_content ?? msg.text ?? msg.message ?? null,
        rawTimestamp: tsText,
        epoch, // ms since epoch, used for sorting
        isoTimestamp: (epoch ? new Date(epoch).toISOString() : null),
        original: msg
      });
    }

    // Sort and attach last_message properly
    const result = Object.values(chats).map((chat: any) => {
      chat.messages.sort((a: any, b: any) => a.epoch - b.epoch); // oldest -> newest
      const last = chat.messages[chat.messages.length - 1] ?? null;
      chat.last_message = last ? {
        from: last.from,
        to: last.to,
        text: last.text,
        epoch: last.epoch,
        isoTimestamp: last.isoTimestamp,
        rawTimestamp: last.rawTimestamp
      } : null;
      return chat;
    });

    return result;
  }

  const filterByChannelType = (chatList: any[], channelType: string) => {
    if (!Array.isArray(chatList)) return [];
    if (!channelType) return chatList; // return all if no filter applied
    if (channelType == "all") return chatList
    return chatList?.filter(item => item?.channel_type?.toLowerCase() === channelType);
  };

  function processMessages(data: any[]) {
    //console.log("whatsappp isnideee processs emssageage")
    const uniqueMap = new Map();

    data?.forEach((item) => {
      const existing = uniqueMap.get(item.user_uuid);
      //console.log("existingexisting", existing);
      if (!existing) {
        //console.log("not existing", existing, item);
        uniqueMap.set(item.user_uuid, item);
      } else {
        //console.log("existing", item);
        // Prefer the record that has a 'name' field (if existing doesn't have it)
        // if (item.name ) {
        uniqueMap.set(item.user_uuid, item);
        // }
      }
    });
    //console.log("whatsappp isnideee processs emssageage uniquemapppp", uniqueMap)
    // Convert map back to array and keep only those with 'name'
    const filteredMessages =data && Array.from(data)?.filter(
      // const filteredMessages = Array.from(uniqueMap.values()).filter(
      (item) => item.name
    );

    //console.log("whatsappp filtereedddd message ", filteredMessages)
    return data;
    // return filteredMessages;
  }

  //   function processMessages(data: any[]) {
  //     const userMessagesMap = new Map<string, any[]>();

  //     data.forEach((item) => {
  //       if (!userMessagesMap.has(item.user_uuid)) {
  //         userMessagesMap.set(item.user_uuid, []);
  //       }
  //       userMessagesMap.get(item.user_uuid)!.push(item);
  //     });

  //     // Optionally filter messages with 'name'
  //     const grouped = Array.from(userMessagesMap.entries()).map(([user_uuid, messages]) => ({
  //       user_uuid,
  //       name: messages.find((m) => m.name)?.name || null,
  //       messages, // all messages from that user
  //     }));
  // //console.log("grpupeedd",grouped);

  //     return grouped.filter((item) => item.name);
  //   }

  //console.log("whatsappp activeChatListData mmerege", (activeChatListData))
  // Filter messages where from_number === to
  const merged = activeChatListData?.filter(
    (msg1: any, _, arr) => arr.some(msg2 => msg1.from_number === msg2.to)
  );

  //console.log("Last messages per phone megrgegrer:", merged);
  // Group by unique phone number (from_number)
  const groupedByNumber = merged?.reduce((acc: any, msg: any) => {
    const key = msg.from_number;
    if (!acc[key] || new Date(msg.createdAt) > new Date(acc[key].createdAt)) {
      acc[key] = msg; // keep the latest message
    }
    return acc;
  }, {});

  // Convert back to array
  const lastMessages = groupedByNumber && Object.values(groupedByNumber);

  //console.log("Last messages per phone number:", lastMessages);

  const activeChatList = processMessages(activeChatListData);
  console.log(activeChatList,'activeChatList')

  useEffect(() => {
    if (Object.keys(singleLeadDetails).length) {
      let data = [];
      data?.push(singleLeadDetails);
      setData(data);
    } else if (allLeadsDetails.length) {
      setData(allLeadsDetails);
    } else {
      setData([]);
    }
  }, [singleLeadDetails, allLeadsDetails, campaignMode]);

  const onSkipLead = async (lead_management_uuid: string) => {
    try {
      const payload = {
        lead_management_uuid,
        campaign_uuid: selectedCampaign,
      };
      const res: any = await dispatch(onSkipLeadDial(payload)).unwrap();
      if (res && res.statusCode === 200) {
        Success(res.data);
        onGetLeadInfoSkip();
      }
    } catch (error) {
      //console.log("Skip Dial error ----> ", error);
    }
  };

  // GET LEAD INFORMATUON
  const onGetLeadInfoSkip = async () => {
    try {
      const res: any = await dispatch(
        getAllLeads({
          campaign_uuid: selectedCampaign,
          campaign_mode: campaignMode,
        })
      ).unwrap();
      dispatch(clearSingleLeadDetails());
      if (res && res.statusCode === 404) {
        dispatch(clearLeadDetails());
        dispatch(onAddLeadNoteId(null));
        dispatch(onSetAddNoteId(null));
        dispatch(setIsCallHangUp(false));
        dispatch(clearLeadUuid());
      }
    } catch (error: any) {
      console.log("Get lead Info Err--->", error?.message);
    }
  };

  // GET LEAD INFORMATUON
  const onGetLeadInfo = async () => {
    try {
      await dispatch(
        getAllLeads({
          campaign_uuid: selectedCampaign,
          campaign_mode: campaignMode,
        })
      ).unwrap();
    } catch (error: any) {
      console.log("Get lead Info Err--->", error?.message);
    }
  };

  // GET CALL QUEUE
  const onGetCallQueueList = async () => {
    try {
      let params = {
        campaign_type: campaignType === "inbound" ? "" : "2",
        id: selectedCampaign,
      };
      await dispatch(getCallQueueList(params)).unwrap();
    } catch (error: any) {
      console.log("Call queue list get err -->", error?.message);
    }
  };

  // UPDATE LEAD STATUS
  const onUpdateLeadStatus = async (lead_management_uuid: string) => {
    try {
      const payload = {
        campaign_uuid: selectedCampaign,
        lead_management_uuid: lead_management_uuid,
      };
      await dispatch(updateLeadStatus(payload)).unwrap();
    } catch (error: any) {
      console.log("lead status update err -->", error?.message);
    }
  };

  useEffect(() => {
    let interval = setInterval(() => {
      if (
        allLeadsDetails.length === 0 &&
        (campaignType === "outbound" || campaignType === "blended") &&
        isCallHangUp &&
        selectedCampaign &&
        campaignMode &&
        (campaignMode === "0" || campaignMode === "2")
      ) {
        onGetLeadInfo();
      } else if (
        allLeadsDetails.length === 0 &&
        campaignType === "inbound" &&
        isCallHangUp &&
        selectedCampaign
      ) {
        onGetLeadInfo();
      }
    }, 30000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLeadsDetails, activeConversation]);

  useEffect(() => {
    let interval = setInterval(() => {
      if (selectedCampaign && campaignType === "inbound") {
        onGetCallQueueList();
      }
    }, 5000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignType]);

  // SET LEAD INFORMATUON
  const onSetLead = async (lead_uuid: string) => {
    try {
      dispatch(setIsActiveChat(false));
      dispatch(onAddLeadNoteId(lead_uuid));
      await dispatch(getSingleLead(lead_uuid)).unwrap();
    } catch (error: any) {
      console.log("Get lead Info Err--->", error?.message);
      throw error; // Throw the error to handle it elsewhere if needed
    }
  };

  // GET LEAD INFORMATUON
  const onGetSingleChatLeadInfo = async (lead_uuid: string) => {
    try {
      dispatch(setIsCallHangUp(false));
      await dispatch(getSingleChatLead(lead_uuid)).unwrap();
      dispatch(onShowLeadInfo(true));
    } catch (error: any) {
      console.log("Get lead Info Err--->", error?.message);
    }
  };

  const isLeadActive = (activeItem: any) => {
    return singleLeadDetails &&
      singleLeadDetails.lead_management_uuid ===
      activeItem?.lead_management_uuid &&
      !isActiveChat
      ? "bg-[#66A28625]"
      : "";
  };

  const getLatestActiveDetails = (activeItem: any) => {
    return activeConversation?._id === activeItem?._id
      ? activeConversation
      : activeItem;
  };


  const getInitials = (name: any): string => {
    if (!name || typeof name !== "string") return "";

    // Remove extra spaces → split into words
    const parts = name.trim().split(/\s+/);

    // No valid characters
    if (parts.length === 0) return "";

    // If only one word → return first character
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    // Otherwise → first letter of first + last
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);

    return (first + last).toUpperCase();
  };

  const renderWhatsAppItems = () => {
    console.log(filteredActiveData,'filteredWhatsappData  ');
    //console.log("whatsappp active chat list", activeChatList)
    return (
      <>
        {filteredActiveData?.map((activeItem: any, index: number) => {
          console.log(filteredActiveData, "filteredWhatsappData");
          return (
            <>
              <div
                key={index}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer  `}
                //${(activeConversation?._id === activeItem?._id) && isActiveChat? "bg-[#66A28625]": ""}
                onClick={() => {
                  dispatch(setActiveConversation(activeItem));
                  onGetSingleChatLeadInfo(activeItem.lead_management_uuid);
                }}
              >
                {/* Avatar */}
                <div className="relative">
                  <div
                      className={`w-10 h-10 rounded-full  ${
                        active === "whatsapp"
                        ? "bg-emerald-50 text-emerald-500"
                        : active === "instagram"
                          ? "bg-[#f8f3f6] text-pink-500"
                          : active === "facebook"
                            ? "bg-[#f8f3f6] text-[#2563EB]"
                            : "bg-[#f7f8f9] text-[#38BDF8]"
                      } flex items-center justify-center  font-semibold`}
                  >
                    {
                      active === "all"
                        ? activeItem?.channel_type?.charAt(0).toUpperCase()
                        : Object.keys(singleChatLeadDetails || {}).length > 0
                          ? singleChatLeadDetails?.first_name?.charAt(0)
                          :activeItem?.name?.charAt(0)||"U"
                    }
                  </div>

                  {/* Status dot */}
                  <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        "online" == "online"
                        ? active === "whatsapp"
                          ? " bg-emerald-500"
                          : active === "instagram"
                            ? " bg-pink-500"
                            : active === "facebook"
                              ? " bg-[#2563EB]"
                              : " bg-[#38BDF8]"
                        : "bg-yellow-500"
                      }`}
                  ></span>
                </div>

                {/* Name + Message */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">
                      {activeItem?.name}

                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {getLatestActiveDetails(activeItem)?.image_url?.length ? (
                                        <div className="flex items-center">
                                          <div className="relative 5xl:w-[13px] 5xl:h-[13px] 4xl:w-[12px] 4xl:-h-[12px] w-[12px] h-[12px]">
                                            <Legacy src={getLatestActiveDetails(activeItem)?.image_url} alt="photo" layout="fill" />
                                          </div>
                                          <span className="ml-1">Photo</span>
                                        </div>
                                      ) : (
                                        getLatestActiveDetails(activeItem)?.text_content
                                      )}
                                      </p>
                       {/* { getLatestActiveDetails(activeItem)?.text_content||"Photo"} </p> */}
                </div>
                <div className="flex flex-col items-end justify-between py-2 w-[80px] g-4">
                  {/* 🔹 Date aligned naturally to the right */}
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {format(
                      getValidTime(getLatestActiveDetails(activeItem)?.createdAt),
                      "dd/MM/yyyy hh:mm a"
                    )}
                  </span>

                  {/* 🔹 Unread badge placed UNDER the date (no absolute used) */}
                  {activeConversation?.user_uuid !== activeItem.user_uuid &&
                    activeItem?.unread_message_count ? (
                    <span
      className={`mt-1 w-5 h-5 rounded-full ${
        active === "whatsapp"
                          ? "bg-emerald-500"
                          : active === "instagram"
                            ? "bg-pink-500"
                            : active === "facebook"
                              ? "bg-[#2563EB]"
                              : "bg-[#38BDF8]"
                        } text-white text-xs flex items-center justify-center`}
                    >
                      {activeItem?.unread_message_count || 2}
                    </span>
                  ) : null}
                </div>

              </div>
            </>
          );
        })}
      </>
    );
  };

  const renderDataNotFound = () => {
    return (

      <div className="w-full  flex justify-center items-center">
        {/* <div className="{`w-full flex justify-center items-center ${sectionBodyClass}`}"> */}

        <NoRecordFound
          title="No Active Messages"
          description={!selectedCampaign ? "Select campaign to view data" : ""}
          topImageClass="p-0"
          imageClass="!h-24 !w-24"
        />
      </div>
    );
  };

  const renderActiveList = () => {

    return (
      <div className={`${sectionBodyClass} overflow-y-auto scrollbar-hide `}>
        {campaignType === "outbound" || campaignType === "blended" ? (
          <div className="rounded-b-lg">
            {selectedCampaign &&
              (campaignMode === "1" || campaignMode === "3") ? (
              data?.length && leadInfo ? (
                data?.map((val: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-6 items-center pr-2 gap-2 py-1.5 border-b border-dark-800 h-[7.2vh] cursor-pointer ${isLeadActive(
                        val
                      )}`}
                      onClick={() => onSetLead(val.lead_management_uuid)}
                    >
                      <div className="col-span-1 flex justify-center">
                        <div className="relative 5xl:w-[26px] 5xl:h-[26px] 4xl:w-[22px] 4xl:-h-[22px] w-[18px] h-[18px]">
                          <Legacy
                            src={call_outbound}
                            alt="call"
                            layout="fill"
                          />
                        </div>
                      </div>
                      <div className="col-span-4 flex flex-col">
                        <span className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading">
                          {(val?.first_name || "") +
                            " " +
                            (val?.last_name || "")}
                        </span>
                        <span className="5xl:text-[13px] 4xl:text-[12px] text-[10px] text-txt-primary">
                          Outgoing call
                        </span>
                      </div>
                      <div className="col-span-1 flex gap-2 justify-end">
                        <a
                          target="_blank"
                          className="cursor-pointer"
                          href={`https://wa.me/${val?.phone_number}`}
                        >
                          <div className="relative 5xl:w-[26px] 5xl:h-[26px] 4xl:w-[22px] 4xl:-h-[22px] w-[16px] h-[16px]">
                            <Legacy
                              src={whatsapp}
                              alt="whatsapp"
                              layout="fill"
                            />
                          </div>
                        </a>
                        {isCallHangUp && (
                          <div
                            className="relative 5xl:w-[26px] 5xl:h-[26px] 4xl:w-[22px] 4xl:-h-[22px] w-[18px] h-[18px] cursor-pointer"
                            onClick={() => {
                              if (val?.first_name || val?.last_name) {
                                Cookies.set(
                                  "LeadDialName",
                                  (val?.first_name || "") +
                                  " " +
                                  (val?.last_name || "")
                                );
                              }
                              dispatch(
                                onAddLeadNoteId(val?.lead_management_uuid)
                              );
                              dispatch(
                                onDial(
                                  val?.custom_phone_number
                                    ? val?.custom_phone_number
                                    : val?.phone_number
                                )
                              );
                              dispatch(setIsCallHangUp(false));
                              dispatch(clearLeadUuid());
                            }}
                          >
                            <Legacy src={callGreen} alt="call" layout="fill" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <></>
              )
            ) : selectedCampaign && data?.length ? (
              data?.map((val: any, index: number) => {
                return (
                  <div
                    key={index}
                    className={`grid grid-cols-6 items-center pr-2 gap-2 py-1.5 border-b border-dark-800 h-[7.2vh] cursor-pointer ${isLeadActive(
                      val
                    )}`}
                    onClick={() => onSetLead(val.lead_management_uuid)}
                  >
                    <>
                      <div className="col-span-1 flex justify-center">
                        <div className="relative 5xl:w-[26px] 5xl:h-[26px] 4xl:w-[22px] 4xl:-h-[22px] w-[18px] h-[18px]">
                          <Legacy
                            src={call_outbound}
                            alt="call"
                            layout="fill"
                          />
                        </div>
                      </div>
                      {campaignMode === "0" && !leadInfo ? (
                        <div className="col-span-2 flex">
                          <span className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading">
                            Lead Dialing
                          </span>
                        </div>
                      ) : (
                        // <div className="col-span-2 flex flex-col">
                        //   <span className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading">
                        //     {(val?.first_name || "") +
                        //       " " +
                        //       (val?.last_name || "")}
                        //   </span>
                        //   <span className="5xl:text-[13px] 4xl:text-[12px] text-[10px] text-txt-primary">
                        //     Outgoing call
                        //   </span>
                        // </div>
                        <div className="col-span-2 flex">
                          <span className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading">
                            {(val?.first_name || "") +
                              " " +
                              (val?.last_name || "")}
                          </span>
                          <span className="5xl:text-[13px] 4xl:text-[12px] text-[10px] text-txt-primary ml-2">
                            Outgoing call
                          </span>
                        </div>
                      )}
                      <div className="col-span-2 flex justify-end items-center">
                        {campaignMode === "2" ? (
                          <div
                            className="relative 5xl:w-[26px] 5xl:h-[26px] 4xl:w-[22px] 4xl:-h-[22px] w-[18px] h-[18px] cursor-pointer"
                            onClick={() => {
                              onSkipLead(val?.lead_management_uuid);
                              dispatch(setIsCallHangUp(false));
                              dispatch(clearLeadUuid());
                            }}
                          >
                            <Legacy src={next} alt="next" layout="fill" />
                          </div>
                        ) : null}
                      </div>
                      <div className="col-span-1 flex gap-2 justify-end">
                        <a
                          target="_blank"
                          className="cursor-pointer"
                          href={`https://wa.me/${val?.phone_number}`}
                        >
                          <div className="relative 5xl:w-[24px] 5xl:h-[24px] 4xl:w-[20px] 4xl:-h-[20px] w-[16px] h-[16px]">
                            <Legacy
                              src={whatsapp}
                              alt="whatsapp"
                              layout="fill"
                            />
                          </div>
                        </a>
                        <div
                          className="relative 5xl:w-[26px] 5xl:h-[26px] 4xl:w-[22px] 4xl:-h-[22px] w-[18px] h-[18px] cursor-pointer"
                          onClick={() => {
                            if (val?.first_name || val?.last_name) {
                              Cookies.set(
                                "LeadDialName",
                                (val?.first_name || "") +
                                " " +
                                (val?.last_name || "")
                              );
                            }
                            dispatch(
                              onAddLeadNoteId(val?.lead_management_uuid)
                            );
                            onUpdateLeadStatus(val?.lead_management_uuid);
                            dispatch(
                              onDial(
                                val?.custom_phone_number
                                  ? val?.custom_phone_number
                                  : val?.phone_number
                              )
                            );
                            dispatch(setIsCallHangUp(false));
                            dispatch(clearLeadUuid());
                            // dispatch(onSetDialType("leadDial"));
                            dispatch(setActiveConversation(undefined));
                            campaignMode === "0" &&
                              dispatch(onShowLeadInfo(true));
                            val?.number_masking === "0" &&
                              dispatch(onSetNumberMask(true));
                          }}
                        >
                          <Legacy src={callGreen} alt="call" layout="fill" />
                        </div>
                      </div>
                    </>
                  </div>
                );
              })
            ) : (
              <></>
            )}
          </div>
        ) : campaignType === "inbound" ? (
          <div className="rounded-b-lg">
            {selectedCampaign && callQueueList?.length ? (
              callQueueList?.map((val: any, index: number) => {
                return (
                  <div
                    key={index}
                    className={`grid grid-cols-6 items-center pr-2 gap-2 py-1.5 border-b border-dark-800 bg-heading-yellow-v10 h-[7.2vh] cursor-pointer ${isLeadActive(
                      val
                    )}`}
                    onClick={() => onSetLead(val.lead_management_uuid)}
                  >
                    <div className="col-span-1 flex justify-center">
                      <div className="relative 5xl:w-[26px] 5xl:h-[26px] 4xl:w-[22px] 4xl:-h-[22px] w-[18px] h-[18px]">
                        <Legacy
                          src={call_ring}
                          alt="notification"
                          layout="fill"
                        />
                      </div>
                    </div>
                    <div className="col-span-4 flex flex-col">
                      <span className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading">
                        {val.caller_id_name}
                      </span>
                      <span className="5xl:text-[13px] 4xl:text-[12px] text-[10px] text-txt-primary">
                        Queue Call
                      </span>
                    </div>
                    {/* <div className="col-span-1 flex justify-center">
                <div
                  className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px] cursor-pointer"
                  onClick={() => {
                    dispatch(onDial(val?.caller_id));
                    dispatch(setIsCallHangUp(false));
                  }}
                >
                  <Legacy src={callGreen} alt="callGreen" layout="fill" />
                </div>
              </div> */}
                  </div>
                );
              })
            ) : (
              <></>
            )}
          </div>
        ) : (
          <></>
        )}
        {chatModeType === "pbx" ||
          (selectedCampaign && campaignType === "blended")
          ? renderWhatsAppItems()
          : null}
      </div>
    );
  };

const filteredActiveData=filterByChannelType(activeChatList, active);
console.log(filteredActiveData,'filteredActiveData');

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 ">
        <h2 className="text-lg font-semibold text-gray-900">Active</h2>
        {/* {(selectedCampaign && campaignType === "blended")&&
            isWhatsAppEnabled(user) ? (
            <>
               <button
                   className={`flex items-center gap-2 ${
                  active === "whatsapp"
                    ? "bg-emerald-500"
                    : active === "instagram"
                    ? "bg-pink-500"
                    : active === "facebook"
                    ? "bg-[#2563EB]"
                    : "bg-[#38BDF8]"
                } text-white text-sm font-medium px-4 py-2 rounded-[40px]`}
                onClick={async () => {
                  await dispatch(
                    onStartConversation({
                      channel:
                        user?.agent_detail?.whatsapp_messaging_channel_uuid,
                    })
                  );
                  setActiveId("2");
                }}
              >
                <span className="text-xl leading-none">+</span>
                <span>Start Conversation</span>
              </button>
            </>
          ) : null} */}
      </div>
      <div className="flex-1">
               {!filteredActiveData?.length ?(
          <>{  <NoRecordFound
          title="No Active Messages"
          description={!selectedCampaign ? "Select campaign to view data" : ""}
          topImageClass="p-0"
          imageClass="!h-24 !w-24"
        />}</>
        ) : (
          <>
            {
              (selectedCampaign && campaignType === "blended")
                ? renderWhatsAppItems()
                : null}
          </>
        )}

      </div>

    </>
  );
};

export default ActiveMessageList;
