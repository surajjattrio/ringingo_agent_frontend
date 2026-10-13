"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { useAuth } from "@/contexts/hooks/useAuth";
import {
  onAddLeadNoteId,
  useAddLeadNoteId,
  useCampaignMode,
  useIsCallHangUp,
  useLeadInfo,
  useNumberMasking,
  useSelectedCampaign,
} from "@/redux/slice/commonSlice";
import {
  getAllLeads,
  useAllLeadDetails,
  useSingleChatLeadDetails,
  useSingleLeadDetails,
} from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { Button } from "@/components/forms";
import { NoRecordFound } from "@/components/ui-components";
import LeadEditModal from "./LeadEditModal";
import {
  getActiveUnreadChat,
  useActiveConversation,
  useChatMode,
  useIsActiveChat,
} from "@/redux/slice/chatSlice";
import Search from "@/components/pbx-components/phone/Search";
import { truncateName } from "@/components/helperFunctions";
import { BotLeadInfoModal } from "../../modals";
import { getBotLeadInfo } from "@/redux/services/xenyAiService";
import getDomain from "@/utils/GetDoamin";
import { Danger } from "@/redux/services/toasterService";
// THIRD-PARTY IMPORT
// import Cookies from "js-cookie";
import Cookies from "@/lib/cookies";
import { Pencil } from "lucide-react";

// ASSETS
const editIcon = "/assets/icons/edit.svg";
const HIDDEN_LEAD_KEYS = new Set([
    "_id",
    "id",
    "__v",
    // "custom_fields",
    "tenant_uuid",
    // "user_uuid",
    "lead_group_uuid",
    // "created_flag",
    // "lead_status",
    "campaign_uuid",
    "created_flag",
    "role",
    "tenant",
    "retries_count",
    // "lead_management_uuid",
    "createdat",
    "updatedat",
]);

// TYPES
interface LeadInformationProps {
  setIsHangUp: any;
}

/* ============================== LEAD INFORMATION BOX ============================== */

const LeadInformation = (props: LeadInformationProps) => {
  const { setIsHangUp } = props;
  const dispatch = useAppDispatch();

  // Redux states
  const selectedCampaign = useSelectedCampaign();
  const allLeadsDetails = useAllLeadDetails();
  const campaignMode = useCampaignMode();
  const singleLeadDetails = useSingleLeadDetails();
  const singleChatLeadDetails = useSingleChatLeadDetails();
  const isCallHangUp = useIsCallHangUp();
  const numberMasking = useNumberMasking();
  const addLeadNoteId = useAddLeadNoteId();
  const activeConversation = useActiveConversation();
  const chatModeType = useChatMode();
  const isActiveChat = useIsActiveChat();
  const leadInfo = useLeadInfo();
  const { user } = useAuth();
  const leadEditVal =
    user?.permission?.is_lead_edit ??
    (user as any)?.agent_detail?.agent_permission?.[0]?.is_lead_edit;
  const hasLeadEditPermission = leadEditVal === "0" || leadEditVal === undefined;
  const hasBotLeadInfoPermission =
    user?.permission?.bot_lead_info === "0" ||
    (user as any)?.agent_detail?.agent_permission?.[0]?.bot_lead_info === "0";

  const [data, setData] = useState<any>(null);
  const [editLead, setEditLead] = useState(false);
  const [showBotModal, setShowBotModal] = useState(false);
  const [botData, setBotData] = useState<any>(null);
  const [isBotLoading, setIsBotLoading] = useState(false);

  console.log("datadatadatadata", data);
  console.log("currentLeadDetails", singleLeadDetails);
  console.log(allLeadsDetails,'allLeadsDetails')

  // ✅ Prevent duplicate API calls
  const hasFetchedLeads = useRef<string | null>(null);
  // Get active lead details depending on chat/call
  const currentLeadDetails = useMemo(() => {
    // if (activeConversation?.user_uuid && isActiveChat) {
    //   return singleChatLeadDetails;
    // }
    return singleLeadDetails;
  }, [singleLeadDetails]);

  // Fetch leads only when campaign + mode are truly ready
  useEffect(() => {
    const leadInfoCookie = Cookies.get("lead_information");

    if (
      !hasFetchedLeads.current && // ✅ only once
      selectedCampaign &&
      (campaignMode === "0" || campaignMode === "2") &&
      leadInfoCookie === "0"
    ) {
       // ✅ We only start fetching/polling if we haven't for this specific campaign
      if (hasFetchedLeads.current !== selectedCampaign) {
        hasFetchedLeads.current = selectedCampaign;
      dispatch(
        getAllLeads({
          campaign_uuid: selectedCampaign,
          campaign_mode: campaignMode,
        })
      )
        .unwrap()
        .catch((err) => {
          console.log("Get lead Info Err--->", err?.message);
        });
      }
    }
  }, [selectedCampaign, campaignMode, dispatch]);

  // Decide which data to show
  useEffect(() => {
    if (currentLeadDetails && Object.keys(currentLeadDetails).length) {
      setData(currentLeadDetails);
    } else if (allLeadsDetails && allLeadsDetails.length) {
      setData(allLeadsDetails[0]);
    } else {
      // 🔑 only clear when nothing available at all
      setData(null);
    }
  }, [currentLeadDetails, allLeadsDetails]);

  // useEffect(() => {
  //   dispatch(getActiveUnreadChat({ campaign_uuid: selectedCampaign })).unwrap();
  // }, [editLead]);

  const checkSelectedCampaign = () => {
    return chatModeType === "pbx" ? !!selectedCampaign : true;
  };

  const showLeadInformation = () => {
    return checkSelectedCampaign() && leadInfo && !!data;
  };

  const renderLeadInformation = () => {
    return (
      <div className="border-dark-800 bg-white h-full flex flex-col">
        <div className="bg-layout 3xl:px-6 py-2.5 px-4 flex justify-between items-center shrink-0">
          <span className="3xl:text-base text-xs text-heading font-bold">
            Lead Information
          </span>
           <div className="flex items-center gap-3">
            {hasBotLeadInfoPermission && !isCallHangUp && Cookies.get("is_call_start") === "0" && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const isCallOngoing = !isCallHangUp && Cookies.get("is_call_start") === "0";
                  if (!isCallOngoing) {
                    Danger("u can only see this ongoing call");
                    return;
                  }

                  const domain = getDomain();
                  const companyCode = domain?.split(".")[0];
                  const phone = data?.phone_number;

                  if (!companyCode) {
                    Danger("Company code is missing.");
                    return;
                  }
                  if (!phone) {
                    Danger("Phone number is missing.");
                    return;
                  }

                  setShowBotModal(true);
                  setIsBotLoading(true);
                  const res = await getBotLeadInfo(phone, companyCode);
                  setBotData(res);
                } catch (err) {
                  console.error("Failed to fetch bot info", err);
                } finally {
                  setIsBotLoading(false);
                }
              }}
              className="text-[10px] bg-[#322996] hover:bg-[#251d7e] text-white px-2 py-1 rounded transition-colors font-medium border-0"
            >
              Bot LeadInfo
            </button>
            )}
          {showLeadInformation() && (
            <div
              className="relative h-[14px] w-[14px] 3xl:w-[16px] 3xl:h-[16px] cursor-pointer mr-2"
              onClick={() => {
                if (!hasLeadEditPermission) {
                  Danger("u doesnt have access to edit the info");
                  return;
                }
                setEditLead(true);
              }}
            >
              <Legacy src={editIcon} alt="edit" layout="fill" />
            </div>
          )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          {showLeadInformation() ? (
            <div className="3xl:pt-2 pt-1 3xl:pb-2 pb-1 rounded-b-lg">
              <div className="px-4">
                {/* Name + Actions */}
                <div className="py-1 flex justify-between items-center">
                  <label 
                    className="3xl:text-sm text-xs font-bold text-heading"
                    title={(data?.first_name || "") + " " + (data?.last_name || "")}
                  >
                    {truncateName(data?.first_name || "") + " " + (data?.last_name || "")}
                  </label>
                  {activeConversation?.user_uuid && isActiveChat ? (
                    <Button
                      text={"End Chat"}
                      className="px-2 py-1 rounded-md"
                      onClick={() => {
                        setIsHangUp(true);
                        !!!addLeadNoteId &&
                          dispatch(onAddLeadNoteId(data?.lead_management_uuid));
                      }}
                    />
                  ) : (
                    <>
                      {isCallHangUp && Cookies.get("is_call_start") === "1" ? (
                        <Button
                          text={"Finish Lead"}
                          className="px-2 py-1 rounded-md"
                          onClick={() => {
                            setIsHangUp(true);
                            !!!addLeadNoteId &&
                              dispatch(onAddLeadNoteId(data?.lead_management_uuid));
                          }}
                        />
                      ) : !isCallHangUp &&
                        Cookies.get("is_call_start") === "0" ? (
                        <Button
                          text="In Progress"
                          className="px-2 py-1 rounded-md"
                        />
                      ) : null}
                    </>
                  )}
                </div>

                {/* Lead Info Fields */}
                {/* 👉 Main Fields */}
                <div className="grid grid-cols-5 gap-y-1">
                  {Object.entries(data)
                    .filter(([key, value]) =>
                      value !== "" &&
                      value !== null &&
                      value !== undefined &&
                      typeof value !== "object" &&
                      !HIDDEN_LEAD_KEYS.has(key.toLowerCase())
                    )
                    .map(([key, value], idx) => {
                      const label = key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <div key={idx} className="contents">
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              {label}:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {String(value)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* 👉 Custom Fields */}
                {data?.custom_fields && Object.keys(data?.custom_fields).length > 0 && (
                  <div className="space-y-2">
                    {/* heading */}
                    <h3 className="font-bold text-sm mt-3 text-heading uppercase">
                      Custom Fields
                    </h3>
                    <div className="max-h-32border rounded-md">
                      <div className="grid grid-cols-5 gap-y-1">
                        {Object.entries(data.custom_fields).map(([key, value], idx) => {
                          const label = key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase());
                          return (
                            <div key={idx} className="contents">
                              <div className="col-span-2">
                                <span className="3xl:text-xs text-[11px] text-heading">
                                  {label}:
                                </span>
                              </div>
                              <div className="col-span-3">
                                <span className="3xl:text-xs text-[11px] text-txt-primary">
                                  {String(value)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <NoRecordFound
              title="No lead information"
              description={
                selectedCampaign
                  ? "No more lead found from this campaign"
                  : "Select campaign to view data"
              }
              imageClass="!h-24 !w-24"
              topImageClass="pt-0"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {showLeadInformation() || chatModeType !== "pbx" ? renderLeadInformation() : <Search />}
      {editLead && (
        <LeadEditModal
          editData={data}
          visible={editLead}
          onCancleClick={() => setEditLead(false)}
        />
      )}
      {showBotModal && (
        <BotLeadInfoModal
          visible={showBotModal}
          onCancleClick={() => setShowBotModal(false)}
          botData={botData}
          isLoading={isBotLoading}
        />
      )}
    </>
  );
};

export default LeadInformation;

