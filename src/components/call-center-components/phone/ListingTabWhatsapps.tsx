"use client";
import { useEffect, useState } from "react";

// PROJECT IMPORTS
import Conversation from "./Conversation/Conversation";
import { FollowUpModal } from "@/components/modals";
import NoteAdd from "./NoteAdd";
import { useAuth } from "@/contexts/hooks/useAuth";
import { isWhatsAppEnabled } from "@/components/helperFunctions";
import { useCampaignType } from "@/redux/slice/commonSlice";
import Image from "next/image";
import { setActiveConversation, useActiveConversation } from "@/redux/slice/chatSlice";
import { clearSingleChatLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { useAppDispatch } from "@/redux/hooks";
import OmniConversation from "./OmniConversation/OmniConversation";

/* ============================== LISTING TAB PAGE ============================== */

interface ListingTabWhatsappsProps {
  active:string;
}

const ListingTabWhatsapps = ({active }:ListingTabWhatsappsProps) => {
  const [isFollowUpData, setIsFollowUpData] = useState<any>();
  const [noteDetails, setNoteDetails] = useState<any>();
  const [data, setData] = useState<any>([]);
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const campaignType = useCampaignType();
  const conversationData = useActiveConversation()
  console.log(conversationData,'conversationData')
  

  useEffect(() => {
    const tabsData = [
      // {
      //   id: "1",
      //   title: "History",
      //   icon: "call-history2",
      //   component: () => (
      //     <CallHistory
      //       setIsFollowUpData={setIsFollowUpData}
      //       setNoteData={setNoteDetails}
      //       activeTab={activeTab}
      //     />
      //   ),
      // }
    ];
    if (isWhatsAppEnabled(user) && campaignType === "blended") {
      tabsData.push({
        id: "2",
        title: "Conversation",
        icon: "chat-notification",
        component: () => <Conversation />,
      });
    }
    setData([...tabsData]);
  }, [campaignType]);

  if (!!noteDetails)
    return (
      <>
        <NoteAdd noteData={noteDetails} setNoteData={setNoteDetails} />
      </>
    );

  const handleClose = () => {
    dispatch(setActiveConversation(undefined));
    dispatch(clearSingleChatLeadDetails());
  }
  const closeIcon = "/assets/icons/close.svg";
  return (
    <> 
    {/* header */}
     {isWhatsAppEnabled(user) && campaignType === "blended" && (
      <>
      <div className="flex justify-between items-center px-4 py-3 border-b">
         <h2 className="text-lg font-semibold text-gray-900 ">
           Conversation
         </h2>
        {conversationData &&
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
        }
      </div>
       <OmniConversation active={active} />
    </>
      )} 
  
      <FollowUpModal
        visible={!!isFollowUpData}
        onCancleClick={() => {
          setIsFollowUpData("");
        }}
        data={isFollowUpData}
        fromCallCenter
      />
    </>
  );
};

export default ListingTabWhatsapps;
