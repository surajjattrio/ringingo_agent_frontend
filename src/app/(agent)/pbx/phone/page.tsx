"use client";
import { useEffect, useState } from "react";

// PROJECT IMPORTS
import ActiveList from "@/components/call-center-components/phone/ActiveList";
import CrmInformation from "@/components/call-center-components/phone/CrmInformation";
import LeadInformationTab from "@/components/call-center-components/phone/LeadInformationTab";
import ListingTab from "@/components/pbx-components/phone/ListingTab";
import UnreadList from "@/components/call-center-components/phone/UnreadList";
import CallHistoryHeader from "@/components/pbx-components/phone/CallHistoryHeader";
import {Head }from "@/components/ui-components";

import { useAppDispatch } from "@/redux/hooks";
import { getActiveUnreadChat } from "@/redux/slice/chatSlice";
import { SocketProvider } from "@/contexts/chatSocket/SocketProvider";
import { useAuth } from "@/contexts/hooks/useAuth";
import { isWhatsAppEnabled } from "@/components/helperFunctions";

export default function Phone() {
  const [activeId, setActiveId] = useState<string>("1");
  const [activeTab, setActiveTab] = useState<string>("Call History");
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user?.agent_detail) {
      dispatch(
        getActiveUnreadChat({ user_uuid: user.agent_detail.uuid })
      ).unwrap();
    }
  }, []);

  return (
    <SocketProvider>
      <div className="min-h-[calc(100vh-120px)] bg-gray-50 pb-5">
        {/* Header with tabs and search */}

        <CallHistoryHeader activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main content area */}
        <div className="grid grid-cols-7 2lg:grid-cols-6 lg:grid-cols-3 gap-6 p-6">
          <div className="col-span-7 2lg:col-span-6 lg:col-span-3">
            <div className="flex gap-6 w-full h-[50vh]">
              {/* ActiveList card */}
              <div className="w-1/2 h-[50vh] flex flex-col bg-blue-50 rounded-xl shadow p-4 ">
                <ActiveList
                  setActiveId={setActiveId}
                  sectionClass="h-full flex flex-col"
                  sectionBodyClass="flex-1 overflow-auto"
                />
              </div>

              {/* CrmInformation card */}
              <div className="w-1/2 h-[50vh] flex flex-col bg-blue-50 rounded-xl shadow p-4">
                <CrmInformation />
              </div>
            </div>
          </div>
        </div>


      </div>
    </SocketProvider>
  );
}