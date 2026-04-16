"use client";
import { useEffect, useState } from "react";

// PROJECT IMPORTS
import {
  getMissedCallCount,
  useMissedCallCount,
} from "@/redux/slice/phoneSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Tabs } from "../../ui-components";
import CallHistory from "./CallHistory";
import MissedCalls from "./MissedCalls";
import Note from "./Note";
import FollowUp from "./FollowUp";
import Conversation from "@/components/call-center-components/phone/Conversation/Conversation";
import { useAuth } from "@/contexts/hooks/useAuth";
import { isWhatsAppEnabled } from "@/components/helperFunctions";

interface ListingTabProps {
  activeId: string;
  setActiveId: Function;
}

/* ============================== LISTING TAB PAGE ============================== */

const ListingTab = ({ activeId, setActiveId }: ListingTabProps) => {
  const missedCallCount = useMissedCallCount();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<any>([]);
  const { user } = useAuth();

  // GET MISSED CALL COUNT
  const onMissedCallCountGet = async () => {
    try {
      await dispatch(getMissedCallCount()).unwrap();
    } catch (error: any) {
      console.log("Get missed call count error ---->", error?.message);
    }
  };

  useEffect(() => {
    onMissedCallCountGet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    const tabsData = [
      {
        id: "1",
        title: "Call History",
        subtitle: "Scheduled meetings and calls",
        icon: "call-history",
        // (
        //   <svg className="w-5 h-5 text-[#6366F1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        //     <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        //   </svg>
        // ),
        component: () => (
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                {/* <h3 className="text-sm font-medium text-gray-900">Quick actions</h3>
                <button className="text-sm font-medium text-[#6366F1] hover:text-[#4F46E5]">View schedule</button> */}
              </div>
              {/* <div className="grid grid-cols-2 gap-4">
                <button className="flex items-start space-x-3 p-4 text-left bg-[#6366F1]/5 hover:bg-[#6366F1]/10 rounded-xl transition-colors group">
                  <div className="p-2 bg-[#6366F1]/10 rounded-lg group-hover:bg-[#6366F1]/20">
                    <svg className="w-5 h-5 text-[#6366F1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Start conference call</div>
                    <div className="text-sm text-gray-500 mt-0.5">Plan a meeting or start a call</div>
                  </div>
                </button>
                <button className="flex items-start space-x-3 p-4 text-left bg-[#6366F1]/5 hover:bg-[#6366F1]/10 rounded-xl transition-colors group">
                  <div className="p-2 bg-[#6366F1]/10 rounded-lg group-hover:bg-[#6366F1]/20">
                    <svg className="w-5 h-5 text-[#6366F1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Send private message</div>
                    <div className="text-sm text-gray-500 mt-0.5">Message a team member</div>
                  </div>
                </button>
              </div> */}
            </div>
            <CallHistory
              noteData={noteData}
              setNoteData={setNoteData}
              setIsFollowUpData={setIsFollowUpData}
            />
          </div>
        ),
      },
      {
        id: "3",
        title: "Missed Calls",
        subtitle: "Recent missed calls",
        icon: "call-missed",
        component: () => (
          <MissedCalls
            noteData={noteData}
            setNoteData={setNoteData}
            setIsFollowUpData={setIsFollowUpData}
          />
        ),
        badge: missedCallCount,
      },
      
    ];

    if (isWhatsAppEnabled(user)) {
      tabsData.push({
        id: "2",
        title: "Conversation",
        subtitle: "Chat messages",
        icon: "",
        // icon: (
        //   <svg className="w-5 h-5 text-[#6366F1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        //     <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        //   </svg>
        // ),
        component: () => <Conversation />,
      });
    }
    setData([...tabsData]);
  }, [missedCallCount]);

  const [noteData, setNoteData] = useState<any>();
  const [isFollowUpData, setIsFollowUpData] = useState<any>();

  if (!!isFollowUpData)
    return (
      <FollowUp
        isFollowUpData={isFollowUpData}
        setIsFollowUpData={setIsFollowUpData}
      />
    );

  if (!!noteData)
    return (
      <Note noteData={noteData} setNoteData={setNoteData} />
    );

  return (
    <div className="h-full">
      <Tabs
        data={data}
        active={activeId}
        onChange={setActiveId}
        tabType="modern"
        tabClass="h-[calc(100%-5.8vh)] overflow-auto"
        className="bg-white rounded-2xl"
      />
    </div>
  );
};

export default ListingTab;