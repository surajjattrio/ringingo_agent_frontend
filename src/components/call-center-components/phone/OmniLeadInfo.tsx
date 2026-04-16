"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
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

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";

// ASSETS
const editIcon = "/assets/icons/edit.svg";

// TYPES
interface LeadInformationProps {
  setIsHangUp: any;
  active:string;
}

/* ============================== LEAD INFORMATION BOX ============================== */

const OmniLeadInformation = ({ setIsHangUp, active }: LeadInformationProps) => {
  const dispatch = useAppDispatch();

  // Redux states
  const selectedCampaign = useSelectedCampaign();
  const allLeadsDetails = useAllLeadDetails();
  const campaignMode = useCampaignMode();
  // const singleLeadDetails = useSingleLeadDetails();
  const singleChatLeadDetails = useSingleChatLeadDetails();
  const isCallHangUp = useIsCallHangUp();
  const numberMasking = useNumberMasking();
  const addLeadNoteId = useAddLeadNoteId();
  const activeConversation = useActiveConversation();
  const chatModeType = useChatMode();
  const isActiveChat = useIsActiveChat();
  const leadInfo = useLeadInfo();

  const [data, setData] = useState<any>(null);
  const [editLead, setEditLead] = useState(false);
  console.log("datadatadatadata", data);

  // ✅ Prevent duplicate API calls
  const hasFetchedLeads = useRef(false);

  // Get active lead details depending on chat/call
  const currentLeadDetails = useMemo(() => {
    if (activeConversation?.user_uuid && isActiveChat) {
      return singleChatLeadDetails;
    }
    // return singleLeadDetails;
  }, [activeConversation?.user_uuid, isActiveChat, singleChatLeadDetails,]);

  // Fetch leads only when campaign + mode are truly ready
  useEffect(() => {
    const leadInfoCookie = Cookies.get("lead_information");

    if (
      !hasFetchedLeads.current && // ✅ only once
      selectedCampaign &&
      (campaignMode === "0" || campaignMode === "2") &&
      leadInfoCookie === "0"
    ) {
      hasFetchedLeads.current = true; // lock to prevent rerun
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

  useEffect(() => {
    dispatch(getActiveUnreadChat({ campaign_uuid: selectedCampaign })).unwrap();
  }, [editLead]);

  const checkSelectedCampaign = () => {
    return chatModeType === "pbx" ? !!selectedCampaign : true;
  };

  const showLeadInformation = () => {
    return checkSelectedCampaign() && leadInfo && !!data;
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
  const renderLeadInformation = () => {
    return (
      <>

        <div className="flex justify-between items-center px-4 py-3 border-b">

          <h2 className="text-lg font-semibold text-gray-900">
            Lead Information
          </h2>
          {showLeadInformation() && (
            <div
              className="relative h-[14px] w-[14px] 3xl:w-[16px] 3xl:h-[16px] cursor-pointer  mr-2"
              onClick={() => setEditLead(true)}
            >
              <Legacy src={editIcon} alt="edit" layout="fill" />
            </div>
          )}
        </div>

        {showLeadInformation() ? (
          <>
            <div className="flex flex-col items-center px-4 py-3">
              <div className="relative">
                <div className={`w-[50px] h-[50px] rounded-full 
                 ${
                  active === "whatsapp"
                    ? "bg-[#E3F5EA]"
                    : active === "instagram"
                    ? "bg-[#F7E6EF]"
                    : active === "facebook"
                    ? "bg-[#E8F0FE]"
                    : "bg-[#F7F8F9]"
                 }
                     flex items-center justify-center  text-xl font-bold`}>
                  {getInitials((data?.first_name || "") + " " + (data?.last_name || ""))}
                </div>
              </div>

              <h3 className="m-2 text-lg font-semibold text-gray-900">
                {(data?.first_name || "") + " " + (data?.last_name || "")}
              </h3>
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
            <hr className="my-4" />
            <div className="space-y-2 text-left text-gray-700 px-4 py-3">
              {data && Object.entries(data)
                .filter(([key, value]) =>
                  value !== "" &&
                  value !== null &&
                  value !== undefined &&
                  key !== "_id" &&
                  key !== "id" &&
                  key !== "__v" &&
                  key !== "custom_fields" &&
                  key !== "tenant_uuid" &&
                  key !== "user_uuid"
                )
                .map(([key, value], idx) => {
                  const label = key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <div className="flex flex-col gap-0.5 rounded-md bg-[#F5F5F5] px-3 py-2">
                      <span className="text-[10px] font-medium text-heading font-semibold">
                        {label}
                      </span>
                      <span className="text-[12px] font-semibold text-txt-primary">
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
            </div>
           { data?.custom_fields &&
            <div className="space-y-2 text-left text-gray-700 px-4 py-3">
            <div className="space-y-2 mt-2 text-left text-gray-700 flex flex-col gap-0.5 rounded-md bg-[#F9F9FA] px-3 py-2">
              <h3 className="font-bold text-sm mt-3 text-heading uppercase">
                Custom Fields
              </h3>
              {Object.entries(data?.custom_fields).map(([key, value], idx) => {
                const label = key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <div className="flex items-center justify-between gap-0.5 rounded-md  py-2">
                    <span className="text-[10px] font-medium text-heading font-semibold">
                      {label}:
                    </span>
                    <span className="text-[12px] font-semibold text-txt-primary">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
            </div>
           }
          </>
        ) :
         <NoRecordFound
          title="No lead information"
          description={selectedCampaign
                ? "No more lead found from this campaign"
                : "Select campaign to view data"}
          topImageClass="p-0"
          imageClass="!h-24 !w-24"
        />
          // <NoRecordFound
          //   title="No lead information"
          //   description={
              // selectedCampaign
              //   ? "No more lead found from this campaign"
              //   : "Select campaign to view data"
          //   }
          //   imageClass="!h-24 !w-24"
          //   topImageClass="pt-0"
          // />

        }
      </>
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
    </>
  );
};

export default OmniLeadInformation;

