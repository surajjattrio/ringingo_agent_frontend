"use client";
import { useEffect, useState } from "react";

// PROJECT IMPORTS
import { Tabs } from "../../ui-components";
import CallHistory from "./CallHistory";
import Conversation from "./Conversation/Conversation";
import { FollowUpModal } from "@/components/modals";
import NoteAdd from "./NoteAdd";
import { useAuth } from "@/contexts/hooks/useAuth";
import { isWhatsAppEnabled } from "@/components/helperFunctions";
import { useCampaignType } from "@/redux/slice/commonSlice";

interface ListingTabProps {
  activeId: string;
  setActiveId: Function;
  activeTab: string;
}

/* ============================== LISTING TAB PAGE ============================== */

const ListingTab = ({ activeId, setActiveId, activeTab }: ListingTabProps) => {
  
  const [isFollowUpData, setIsFollowUpData] = useState<any>();
  const [noteDetails, setNoteDetails] = useState<any>();
  const [data, setData] = useState<any>([]);
  const { user } = useAuth();
  const campaignType = useCampaignType();

  useEffect(()=>{
    const tabsData = [
      {
        id: "1",
        title: "History",
        icon: "call-history2",
        component: () => (
          <CallHistory
            setIsFollowUpData={setIsFollowUpData}
            setNoteData={setNoteDetails}
            activeTab={activeTab}
          />
        ),
      }
    ];
    // if(isWhatsAppEnabled(user) && campaignType === "blended"){
    //   tabsData.push({
    //     id: "2",
    //     title: "Conversation",
    //     icon: "chat-notification",
    //     component: () => <Conversation />,
    //   });
    // }
    setData([...tabsData]);
  },[campaignType, activeTab]);

  if (!!noteDetails)
    return (
      <>
        <NoteAdd noteData={noteDetails} setNoteData={setNoteDetails} />
      </>
    );

  return (
    <>
      <Tabs
        data={data}
        active={activeId}
        onChange={setActiveId}
        tabClass="h-[calc(100%-5.8vh)] !p-0"
        className={`${isWhatsAppEnabled(user) && campaignType === "blended" ? "!grid-cols-2": "!grid-cols-1"}`}
        tabType="dashboard"
      />
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

export default ListingTab;
