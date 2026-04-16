import Legacy from "next/legacy/image";
import { Fragment, useEffect, useState } from "react";

// PROJECT IMPORTS
import {
  onAddLeadNoteId,
  onAddNewLead,
  onDial,
  onSetShowCallInfoId,
  useIsAddNewLead,
  useShowCallInfoId,
} from "@/redux/slice/commonSlice";
import { useAppDispatch } from "@/redux/hooks";
import { leadDetailsSearch, getMissedCallCount, useMissedCallCount } from "@/redux/slice/phoneSlice";
import { Loader } from "@/components/ui-components";
import { SearchBar } from "../../pickers";
import { Button } from "../../forms";
import CreateLead from "./CreateLead";
import CallInformation from "./CallInformation";
import Note from "./Note";
import FollowUp from "./FollowUp";
import AddLead from "./AddLead";
import CallHistory from "./CallHistory";
import MissedCalls from "./MissedCalls";
import { useAuth } from "@/contexts/hooks/useAuth";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";
import { useDebouncedCallback } from "use-debounce";

// ASSETS
const Search_icon = "/assets/images/Empty_search.svg";
const info = "/assets/icons/info-circle.svg";
const call = "/assets/icons/green/call.svg";
const followUp = "/assets/icons/leave3way.svg";

interface CallHistoryHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title?: any;
  onChange?: any;

  onCreateButtonClick?: any;
  totalCount?: number;
}

const CallHistoryHeader = (props: CallHistoryHeaderProps) => {
  const { activeTab, setActiveTab } = props;

  const tabs = ['Call History', 'Missed Calls'];
  const {
    onCreateButtonClick,
    totalCount = 0,
    onChange,

    title,
  } = props;
  const [data, setData] = useState<any>([]);
  const [noteData, setNoteData] = useState<any>();
  const [isCreateLead, setIsCreateLead] = useState<boolean>(false);
  const [isShowFilter, setIsShowFilter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [leadEdit, setLeadEdit] = useState<boolean>(false);
  const [editLead, setEditLead] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>({});
  const [searchLead, setSearchLead] = useState("");
  const [isFollowUpData, setIsFollowUpData] = useState<any>();
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useAppDispatch();
  const isShowCallInfoId = useShowCallInfoId();
  const isAddNewLead = useIsAddNewLead();
  const missedCallCount = useMissedCallCount();
  const { user } = useAuth();

  const onMissedCallCountGet = async () => {
    try {
      await dispatch(getMissedCallCount()).unwrap();
    } catch (error: any) {
      console.log("Get missed call count error ---->", error?.message);
    }
  };

  const onSearchLead = useDebouncedCallback(async () => {
    try {
      setIsLoading(true);
      const params = { search: searchLead };
      let res: any = await dispatch(leadDetailsSearch(params)).unwrap();
      if (res && res.statusCode === 200) {
        if (searchLead !== "") {
          let newData = res?.data;
          newData.map((val: any) => {
            val.fullName = val.first_name + " " + (val?.last_name || "");
            val.country_name =
              val.country && val.country.length ? val.country[0]?.nicename : "";
          });
          setData(newData);
          setIsLoading(false);
        } else {
          setData([]);
          setIsLoading(false);
        }
      } else {
        setData([]);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.log("Get lead list error ---->", error?.message);
      setData([]);
      setIsLoading(false);
    }
  }, 500);

  const handleSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  useEffect(() => {
    onSearchLead();
    onMissedCallCountGet();
  }, [searchLead, activeTab]);

  useEffect(() => {
    setNoteData(null);
    setLeadEdit(false);
    setIsCreateLead(false);
    setEditData(null);
    setIsFollowUpData(null);
    dispatch(onAddNewLead(null));
  }, [isShowCallInfoId]);

  if (!!isAddNewLead) return <AddLead />;

  if (!!isFollowUpData)
    return (
      <div className="h-[42vh]">
        <FollowUp
          isFollowUpData={isFollowUpData}
          setIsFollowUpData={setIsFollowUpData}
        />
      </div>
    );

  if (!!noteData)
    return (
      <div className="h-[42vh]">
        <Note noteData={noteData} setNoteData={setNoteData} />
      </div>
    );

  if (isShowCallInfoId)
    return (
      <div className="h-[42vh]">
        <CallInformation
          setNoteData={setNoteData}
          isLeadInfoID={isShowCallInfoId}
          setIsCreateLead={setIsCreateLead}
          setLeadEdit={setLeadEdit}
          setEditData={setEditData}
          onRefreshData={onSearchLead}
        />
      </div>
    );

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left side - Tabs */}
          {/* <div className="flex items-center h-full"> */}
          <div className="flex bg-blue-50 rounded-[56px] pl-4 3xl:py-2 py-1.5 pr-4 ">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-full px-4 flex items-center gap-1 relative bg-blue-50  rounded-[46px] ${
                  activeTab === tab
                    ? "text-button-background font-semibold  border-blue-50 "
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <span className="text-lg">
                  {/* {tab === 'Call History' ? '📞' : '📵'} */}
                  {tab === "Call History" ? "" : ""}
                </span>
                {/* Pipeline separator */}
                {/* <span className=" text-gray-400">|</span> */}
                <span className="text-sm">{tab} </span>
                {tab === "Missed Calls" && missedCallCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {missedCallCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right side - Search and Create Lead */}
          <div className="flex items-center gap-4">
            <SearchBar
              className="w-56"
              iconClassName="3xl:!top-2.5"
              placeholder="Search by Keyword"
              onChange={(e: any) => handleSearch(e.target.value)}
            />
            <Button
              text="Create Lead"
              icon="plus-white"
              style=""
              className="h-8 bg-button-background hover:bg-button-background text-white text-sm font-medium px-3  rounded-[46px] flex items-center gap-2"
              onClick={() => {
                setIsCreateLead(true);
                setIsShowFilter(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Call History/Missed Calls Table */}
        <div
          className={`flex-1 overflow-auto transition-all duration-300, scrollbar-hide ${
            isCreateLead || isShowFilter ? "mr-[500px]" : ""
          }`}
        >
          {activeTab === "Call History" ? (
            <CallHistory
              setNoteData={setNoteData}
              setIsFollowUpData={setIsFollowUpData}
            />
          ) : (
            <MissedCalls
              setNoteData={setNoteData}
              setIsFollowUpData={setIsFollowUpData}
            />
          )}
        </div>

        {/* Right Side - Create Lead Form */}
        {isCreateLead && (
          <div className="fixed right-3 top-[18vh] bottom-0 w-[500px] bg-white border-l border-gray-200 overflow-auto smd:p-1.5 shadow-lg transition-transform duration-300 transform translate-x-0">
            <CreateLead
              leadEdit={editLead}
              setEditLead={setEditLead}
              setIsCreateLead={setIsCreateLead}
              editData={editData}
              setEditData={setEditData}
              fromList
            />
          </div>
        )}

        {/* Right Side - Filter Panel */}
        {isShowFilter && (
          <div className="fixed right-3 top-[18vh] bottom-0 w-[500px] bg-white border-l border-gray-200 overflow-auto shadow-lg transition-transform duration-300 transform translate-x-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-bg-blue-900">Filter</h2>
              <button
                onClick={() => setIsShowFilter(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#322996] focus:ring-[#322996]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#322996] focus:ring-[#322996]">
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Call Type
                  </label>
                  <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#322996] focus:ring-[#322996]">
                    <option value="">Select Call Type</option>
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                    <option value="missed">Missed</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  onClick={() => {
                    // Reset filter logic here
                  }}
                >
                  Reset
                </button>
                <button
                  className="px-4 py-2 text-white bg-[#322996] rounded-lg hover:bg-opacity-90"
                  onClick={() => {
                    // Apply filter logic here
                  }}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallHistoryHeader;
