"use client";
import { useEffect, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { Success, Danger } from "@/redux/services/toasterService";
import { getWabaSsoTokenPost } from "@/redux/services/chatService";
import {
  clearLeadDetails,
  clearLeadUuid,
  clearSingleLeadDetails,
  getAllLeads,
  getSingleChatLead,
  getSingleLead,
  onSkipLeadDial,
  useAllLeadDetails,
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
  useIsActiveChat,
} from "@/redux/slice/chatSlice";
import { format } from "date-fns";
import { getValidTime, isWhatsAppEnabled, truncateName } from "@/components/helperFunctions";
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

interface ActiveListProps {
  setActiveId: Function;
  sectionClass: string;
  sectionBodyClass: string;
}

/* ============================== ACTIVE LIST BOX ============================== */

const ActiveList = ({
  setActiveId,
  sectionClass,
  sectionBodyClass,
}: ActiveListProps) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const activeConversation = useActiveConversation();
  const allLeadsDetails = useAllLeadDetails();
  const selectedCampaign = useSelectedCampaign();
  console.log(selectedCampaign, 'selectedCampaign');
  const singleLeadDetails = useSingleLeadDetails();
  const campaignMode = useCampaignMode();
  const leadInfo = useLeadInfo();
  const isCallHangUp = useIsCallHangUp();
  const campaignType = useCampaignType();
  const callQueueList = useActiveCallQueueList();
  const activeChatListData = useActiveChats();
  const chatModeType = useChatMode();
  const isActiveChat = useIsActiveChat();
  console.log(singleLeadDetails, 'singleLeadDetails')
  console.log(allLeadsDetails, 'allLeadsDetailssssssss')
  console.log(isCallHangUp, 'isCallHangUp')
  const [data, setData] = useState<any>([]);
  console.log(data,'data');
  console.log(campaignMode,'campaignMode');
  

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

  function processMessages(data: any[]) {
    //console.log("whatsappp isnideee processs emssageage")
    const uniqueMap = new Map();

    data.forEach((item) => {
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
    const filteredMessages = Array.from(data).filter(
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
  const merged = activeChatListData.filter(
    (msg1: any, _, arr) => arr.some(msg2 => msg1.from_number === msg2.to)
  );

  //console.log("Last messages per phone megrgegrer:", merged);
  // Group by unique phone number (from_number)
  const groupedByNumber = merged.reduce((acc: any, msg: any) => {
    const key = msg.from_number;
    if (!acc[key] || new Date(msg.createdAt) > new Date(acc[key].createdAt)) {
      acc[key] = msg; // keep the latest message
    }
    return acc;
  }, {});

  // Convert back to array
  const lastMessages = Object.values(groupedByNumber);

  //console.log("Last messages per phone number:", lastMessages);

  const activeChatList = processMessages(activeChatListData);

  useEffect(() => {
    if (Object.keys(singleLeadDetails).length) {
      console.log("commonnnnnnnnnnnnnnn from single lead")
      let data = [];
      data?.push(singleLeadDetails);
      setData(data);
    }
    else if (allLeadsDetails.length > 0 && campaignMode == "2") {
      console.log("commonnnnnnnnnnnnnnn from all lead")
      setData(allLeadsDetails);
    }
    else if (campaignMode == "0") {
      setData([])
    }
    else if(campaignMode=="1"&& !Object.keys(singleLeadDetails).length){
      setData([])
    }
    // else if (!Object.keys(singleLeadDetails).length && allLeadsDetails.length <= 0){
    //  setData([])
    // }
  //else 
    //else {
    //  setData([]);
    //}
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
  console.log(campaignType, "campaignType", "campaignMode", campaignMode);

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
  }, [allLeadsDetails]);

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
      console.log("its working");

      setActiveId("1");
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

  const renderWhatsAppItems = () => {
    //console.log("whatsappp inside renderr whatsapp items")
    //console.log("whatsappp active chat list", activeChatList)
    return (
      <>
        {activeChatList?.map((activeItem: any, index: number) => {
          //console.log(activeItem, "cvzzzzzzz");
          return (
            <div
              key={index}
              className={`grid grid-cols-6 items-center pr-2 gap-2 py-1.5 border-b border-dark-800 cursor-pointer h-[7.2vh] ${activeConversation?._id === activeItem?._id && isActiveChat
                ? "bg-[#66A28625]"
                : ""
                }`}
              onClick={() => {
                dispatch(setActiveConversation(activeItem));
                onGetSingleChatLeadInfo(activeItem.lead_management_uuid);
                setActiveId("2");
              }}
            >
              <div className="col-span-1 flex justify-center">
                <div className="relative 5xl:w-[26px] 5xl:h-[26px] 4xl:w-[22px] 4xl:-h-[22px] w-[18px] h-[18px]">
                  {activeItem.channel_type == "WhatsApp" ? <Legacy src={whatsappBlue} alt="whatsapp" layout="fill" /> : <Legacy src={instagram} alt="instagram" layout="fill" />}
                </div>
              </div>
              <div className="col-span-3 flex flex-col">
                <div className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading capitalize text-ellipsis whitespace-nowrap overflow-hidden">
                  {activeItem.name}
                </div>
                <div className="5xl:text-[13px] 4xl:text-[12px] text-[10px] text-txt-primary overflow-hidden whitespace-nowrap text-ellipsis">
                  {getLatestActiveDetails(activeItem)?.image_url?.length ? (
                    <div className="flex items-center">
                      <div className="relative 5xl:w-[13px] 5xl:h-[13px] 4xl:w-[12px] 4xl:-h-[12px] w-[12px] h-[12px]">
                        <Legacy src={getLatestActiveDetails(activeItem)?.image_url} alt="photo" layout="fill" />
                      </div>
                      {/* <span className="ml-1">Photo</span> */}
                    </div>
                  ) : (
                    getLatestActiveDetails(activeItem)?.text_content
                  )}
                </div>
              </div>
              <div className="col-span-2 flex flex-col justify-end items-end">
                <span className="5xl:text-[13px] 4xl:text-[12px] text-[10px] text-txt-primary">
                  {format(
                    getValidTime(
                      // getLatestActiveDetails(activeItem)?.timestamp ??
                      getLatestActiveDetails(activeItem)?.createdAt
                    ),
                    "dd/MM/yyyy hh:mm a"
                  )}
                </span>
                {activeConversation?.user_uuid !== activeItem.user_uuid &&
                  activeItem?.unread_message_count ? (
                  <span className="5xl:text-[12px] 4xl:text-[10px] text-[8px] 5xl:w-[16px] 4xl:w-[14px] 5xl:h-[16px] 4xl:h-[14px] w-[12px] h-[12px] flex bg-[#2C99FE] text-white text-center justify-center rounded-[50%]">
                    {activeItem?.unread_message_count}
                  </span>
                ) : (
                  <></>
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const renderDataNotFound = () => {
    return (
      // <div
      //   // className={`w-full flex justify-center items-center ${sectionBodyClass}`}

      // >
      //   <NoRecordFound
      //     title="No Active Calls or Messages"
      //     description={!selectedCampaign ? "Select campaign to view data" : ""}
      //     topImageClass="p-0"
      //     imageClass="!h-24 !w-24"
      //   />
      // </div>

      <div className="w-full  flex justify-center items-center">
        {/* <div className="{`w-full flex justify-center items-center ${sectionBodyClass}`}"> */}

        <NoRecordFound
          title="No Active Calls"
          description={!selectedCampaign ? "Select campaign to view data" : ""}
          topImageClass="p-0"
          imageClass="!h-24 !w-24"
        />
      </div>
    );
  };

  const renderActiveList = () => {
    console.log("renederrrrr active list compomenenenneeeeeeeeeeee", campaignType, callQueueList);
    console.log("data from data", data);

    return (
      <div className={`${sectionBodyClass} overflow-y-auto scrollbar-hide`}>
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
                        <span 
                          className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading"
                          title={(val?.first_name || "") + " " + (val?.last_name || "")}
                        >
                          {truncateName(val?.first_name || "") + " " + (val?.last_name || "")}
                        </span>
                        <span className="5xl:text-[13px] 4xl:text-[12px] text-[10px] text-txt-primary">
                          Outgoing call
                        </span>
                      </div>
                      <div className="col-span-1 flex gap-2 justify-end">
                        <div
                          className="cursor-pointer"
                          onClick={async () => {
                            try {
                              const res: any = await getWabaSsoTokenPost();
                              debugger
                              const redirectUrl = res?.data?.redirect_url;
                              if (redirectUrl) {
                                window.open(redirectUrl, "_blank");
                              } else {
                                Danger("SSO redirect URL not available");
                              }
                            } catch (err) {
                              Danger("Failed to generate SSO token");
                            }
                          }}
                        >
                          <div className="relative 5xl:w-[26px] 5xl:h-[26px] 4xl:w-[22px] 4xl:-h-[22px] w-[16px] h-[16px]">
                            <Legacy
                              src={whatsapp}
                              alt="whatsapp"
                              layout="fill"
                            />
                          </div>
                          </div>
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
            ) : selectedCampaign && data.length ? (
              data.map((val: any, index: number) => {
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
                          <span 
                            className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading"
                            title={(val?.first_name || "") + " " + (val?.last_name || "")}
                          >
                            {truncateName(val?.first_name || "") + " " + (val?.last_name || "")}
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
                        <div
                          className="cursor-pointer"
                          onClick={async () => {
                            try {
                              const res: any = await getWabaSsoTokenPost();
                              const redirectUrl = res?.data?.redirect_url;
                              if (redirectUrl) {
                                window.open(redirectUrl, "_blank");
                              } else {
                                Danger("SSO redirect URL not available");
                              }
                            } catch (err) {
                              Danger("Failed to generate SSO token");
                            }
                          }}
                        >
                          <div className="relative 5xl:w-[24px] 5xl:h-[24px] 4xl:w-[20px] 4xl:-h-[20px] w-[16px] h-[16px]">
                            <Legacy
                              src={whatsapp}
                              alt="whatsapp"
                              layout="fill"
                            />
                          </div>
                        </div>
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
        {/* {chatModeType === "pbx" ||
          (selectedCampaign && campaignType === "blended")
          ? renderWhatsAppItems()
          : null} */}
      </div>
    );
  };

  return (
    <>
      <div className={`bg-blue-50 h-full ${sectionClass}`}>
        <div className="bg-[#F2F2F2] 3xl:px-6 3xl:py-2.5 py-1.5 px-4 flex items-center  justify-between h-[5.8vh]">
          <span className="3xl:text-base text-xs text-heading font-bold ">
            Active
          </span>
          {/* {((selectedCampaign && campaignType === "blended") ||
            chatModeType === "pbx") &&
            isWhatsAppEnabled(user) ? (
            <>
              <Button
                text="Start Conversation"
                loaderClass="!border-primary-green !border-t-transparent"
                style="primary"
                icon="plus-white"
                className="px-1.5 py-1 font-normal text-white"
                onClick={async () => {
                  await dispatch(
                    onStartConversation({
                      channel:
                        user?.agent_detail?.whatsapp_messaging_channel_uuid,
                    })
                  );
                  setActiveId("2");
                }}
              />
            </>
          ) : null} */}
        </div>
        {!data?.length && !callQueueList?.length ? (
          <>{renderDataNotFound()}</>
        ) : (
          <>{renderActiveList()}</>
        )}
      </div>
    </>
  );
};

export default ActiveList;

/* all types list UI ------------->

return (
              <div
                key={index}
                className={`grid grid-cols-6 items-center pr-2 gap-2 py-1.5 border-b border-dark-800 ${
                  val.dataType === "Queue Call" && "bg-heading-yellow-v10"
                }`}
              >
                {val.dataType === "message" ? (
                  <>
                    <div className="col-span-1 flex justify-center">
                      <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                        <Legacy
                          src={notification}
                          alt="notification"
                          layout="fill"
                        />
                      </div>
                    </div>
                    <div className="col-span-4 flex flex-col">
                      <span className="text-xs font-semibold text-heading">
                        {val.name}
                      </span>
                      <span className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis text-txt-primary">
                        {val.note}
                      </span>
                    </div>
                    <div className="col-span-1 flex flex-col items-end">
                      <span className="text-[10px] font-semibold text-heading">
                        {val.date}
                      </span>
                      <div className="bg-notification rounded-full flex justify-center items-center h-3 w-3">
                        <span className="text-[8px] font-semibold  text-white">
                          {val.base}
                        </span>
                      </div>
                    </div>
                  </>
                ) : val.dataType === "Queue Call" ? (
                  <>
                    <div className="col-span-1 flex justify-center">
                      <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                        <Legacy
                          src={call_ring}
                          alt="notification"
                          layout="fill"
                        />
                      </div>
                    </div>
                    <div className="col-span-3 flex flex-col">
                      <span className="text-xs font-semibold text-heading">
                        {val.name}
                      </span>
                      <span className="text-[10px] text-txt-primary">
                        {val.dataType}
                      </span>
                    </div>
                    <div className="col-span-1 flex flex-col">
                      <span className="text-[10px] text-txt-primary">
                        {val.time}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px] cursor-pointer">
                        <Legacy src={callGreen} alt="callGreen" layout="fill" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-1 flex justify-center">
                      <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                        <Legacy
                          src={
                            val.dataType === "Incoming call"
                              ? call_inbond
                              : call_outbound
                          }
                          alt="call"
                          layout="fill"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-col">
                      <span className="text-xs font-semibold text-heading">
                        {val.name}
                      </span>
                      <span className="text-[10px] text-txt-primary">
                        Outgoing call
                      </span>
                    </div>

                    {val.dataType === "Incoming call" ? (
                      <>
                        <div className="col-span-2 flex justify-end">
                          <span className="text-[10px] text-txt-primary mr-2">
                            {val.time}
                          </span>
                          <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px] cursor-pointer">
                            <Legacy src={next} alt="next" layout="fill" />
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px] cursor-pointer">
                            <Legacy src={callGreen} alt="call" layout="fill" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-3 flex justify-end">
                        <span className="text-[10px] text-txt-primary mr-2">
                          {val.time}
                        </span>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-heading">
                            Call Duration
                          </span>
                          <span className="text-[10px] text-txt-primary">
                            {val.duration}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
*/

