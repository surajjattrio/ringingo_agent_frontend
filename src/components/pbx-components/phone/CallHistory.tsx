import { Fragment, useEffect, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import {
  getCallStatistic,
  useCallStatistic,
  useIsCallLoading,
  blackListCallCenter,
} from "@/redux/slice/phoneSlice";
import { useLeadUuid } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import {
  useAddLeadNoteId,
  onAddLeadNoteId,
  onAddNewLead,
  onDial,
  onSetShowCallInfoId,
} from "@/redux/slice/commonSlice";
import { Chip, Loader, ToolTipIcon } from "../../ui-components";
import { useAuth } from "@/contexts/hooks/useAuth";
import { Danger, Success } from "@/redux/services/toasterService";

// THIRD-PARTY IMPORT
import { format } from "date-fns";
import Cookies from "js-cookie";
import Icon from "@/components/ui-components/Icon";

// ASSETS
const call = "/assets/icons/Call.svg";
const call_inbond = "/assets/icons/call/inbound.svg";
const call_outbound = "/assets/icons/call/outbound.svg";
const call_missed = "/assets/icons/orange/call-missed.svg";
const info = "/assets/icons/info-circle.svg";
const followUp = "/assets/icons/leave3way.svg";
const whatsapp = "/assets/icons/Whatsapp.svg";
const add = "/assets/icons/Create.svg";
const eye = "/assets/icons/info-circle.svg";
const blackList = "/assets/icons/Follow-up.svg";

// TYPES
interface CallHistoryProps {
  noteData?: any;
  setNoteData?: any;
  setIsFollowUpData?: any;
  activeTab?: string;
  searchQuery?: string;
}

const CallHistory = (props: CallHistoryProps) => {
  const { noteData, setNoteData, setIsFollowUpData, activeTab = 'Call History', searchQuery = '' } = props;
  const dispatch = useAppDispatch();
  const callStatisticDetails = useCallStatistic();
  const isCallLoading = useIsCallLoading();
  const { user } = useAuth();
  const [selectedCallHistory, setSelectedCallHistory] = useState("");
  const [blackListData, setBlackListData] = useState<any>([]);
  const addLeadNoteId = useAddLeadNoteId();
  const leadUuid = useLeadUuid();
  const [filteredCalls, setFilteredCalls] = useState<any>([]);

  useEffect(() => {
    onGetCallStatistic();
  }, []);

  useEffect(() => {
    if (callStatisticDetails?.top10Records) {
      let filtered = callStatisticDetails.top10Records.filter((call: any) => {
        if (activeTab === 'Missed Calls') {
          return call.call_state === 'missed';
        }
        return true; // Show all calls for Call History tab
      });

      // Apply search filter if searchQuery exists
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((call: any) => {
          const phoneNumber = getPhoneNumber(call).toLowerCase();
          const day = call?.day?.toLowerCase() || '';
          const time = format(new Date(call?.converted_date), "h:mm a").toLowerCase();
          const duration = call?.takeTime?.toLowerCase() || '';

          return (
            phoneNumber.includes(query) ||
            day.includes(query) ||
            time.includes(query) ||
            duration.includes(query)
          );
        });
      }

      setFilteredCalls(filtered);
    }
  }, [activeTab, callStatisticDetails, searchQuery]);

  // GET CALL STATISTIC
  const onGetCallStatistic = async () => {
    try {
      await dispatch(getCallStatistic()).unwrap();
    } catch (error: any) {
      console.log("Get statistics error ---->", error?.message);
    }
  };

  // GET PHONE NUMBER
  const getPhoneNumber = (val: any) => {
    let number =
      val?.direction === "outbound"
        ? val?.destination_number
        : val?.caller_id_number === val?.caller_id_name
          ? val?.caller_id_number
          : val?.caller_id_number + " (" + val?.caller_id_name + ")";
    return user?.isNumberMasking
      ? Array.from(number).length > 4
        ? Array.from(number).fill("X", 2, -2).join("")
        : Array.from(number).fill("X", 1, -1).join("")
      : number || "";
  };

  // GET Black List
  const onGetBlackList = async (val: any) => {
    try {
      let number =
        val?.direction === "outbound"
          ? val?.destination_number
          : val?.caller_id_number;
      let payload = {
        type_value: number
      };
      const res: any = await dispatch(
        blackListCallCenter(payload)
      ).unwrap();
      if (res && (res.statusCode === 201 || res.statusCode === 200)) {
        Success(res?.data);
      } else {
        Danger(res?.data);
      }
    } catch (error: any) {
      setBlackListData([]);
      console.log("get single BlackList information err--->", error?.message);
    }
  };

  if (isCallLoading) {
    return (
      <div className="min-h-[calc(100vh-230px)] flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (!filteredCalls.length) {
    return (
      <div className="min-h-[calc(100vh-230px)] flex justify-center items-center">
        <Chip title={`No ${activeTab} Found`} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-hidden">
        {/* Column Headers */}
        <div className="grid grid-cols-11 gap-6 px-6 py-4 border-b border-gray-200 bg-blue-50 font-semibold text-gray-700 text-sm  rounded-t-lg">
          <div className="col-span-3 flex justify-center items-center">
            Number
          </div>
          <div className="col-span-2 flex flex-col justify-center items-center">
            Days Ago
          </div>
          <div className="col-span-2 flex flex-col justify-center items-center">
            Time
          </div>
          <div className="col-span-1 flex flex-col justify-center items-center">
            Duration
          </div>
          <div className="col-span-3 flex flex-col justify-center items-center ">
            Action
          </div>
        </div>
        {filteredCalls.map((val: any, idx: number) => (
          <div
            key={idx}
            className={`grid grid-cols-11 gap-6 px-6 py-4 border-b border-gray-200 hover:bg-blue-50 ${val.uuid === selectedCallHistory
              ? "bg-[#88d6b2] bg-opacity-20"
              : ""
              }`}
          >
            {/* Call Icon and Number/Name */}
            <div className="col-span-3 flex justify-center items-center gap-4">
              <div className="relative w-6 h-6">
                <Legacy
                  src={
                    val?.call_state === "missed"
                      ? call_missed
                      : val?.direction === "outbound"
                        ? call_outbound
                        : call_inbond
                  }
                  alt="call"
                  layout="fill"
                />
              </div>
              <div className="flex flex-col">
                {val.fullName && (
                  <span className="text-sm font-semibold text-gray-900">
                    {val.fullName}
                  </span>
                )}
                <span
                  className={`text-sm ${val.fullName
                    ? "text-gray-500"
                    : "text-gray-900 font-semibold"
                    }`}
                >
                  {getPhoneNumber(val)}
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="col-span-2 flex flex-col justify-center items-center">
              <span className="text-sm text-gray-900">{val?.day}</span>
              <span className="text-sm text-gray-500">
                {format(new Date(val?.converted_date), "dd/MM/yyyy")}
              </span>
            </div>

            {/* Time */}
            <div className="col-span-2 flex flex-col items-center justify-center">
              <span className="text-sm text-gray-900">
                {format(new Date(val?.converted_date), "h:mm a")}
              </span>
            </div>

            {/* Duration */}
            <div className="col-span-1 flex gap-2 items-center justify-center">
              <Icon
                name={"clock"}
                // tooltip={tooltip}
                // onClick={onIconClick}
                className="text-dark-500 cursor-pointer"
                width={22}
                height={22}
              />
              <span className="text-sm text-gray-500">{val?.takeTime}</span>
            </div>

            {/* Action Buttons */}
            <div className="col-span-3 flex items-center justify-center gap-3">
              <a
                target="_blank"
                href={`https://wa.me/${val?.direction === "outbound"
                  ? val?.destination_number
                  : val?.caller_id_number
                  }`}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <div className="relative w-5 h-5">
                  {/* <Legacy src={whatsapp} alt="whatsapp" layout="fill" /> */}
                  <ToolTipIcon
                      src={whatsapp}
                      width={22}
                      height={22}
                      alt="whatsapp"
                      tooltip="Whatsapp "
                    />
                </div>
              </a>

              {val?.lead_management_uuid ? (
                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => {
                    setSelectedCallHistory(val?.uuid);
                    dispatch(onSetShowCallInfoId(val?.lead_management_uuid));
                  }}
                >
                  <div className="relative w-5 h-5">
                  <ToolTipIcon
                      src={info}
                      width={22}
                      height={22}
                      alt="info"
                      tooltip="Info "
                    />
                    {/* <Legacy src={info} alt="info" layout="fill" /> */}
                  </div>
                </button>
              ) : (
                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => {
                    setSelectedCallHistory(val?.uuid);
                    dispatch(onAddNewLead(val));
                  }}
                >


                  <div className="relative w-5 h-5">
                    <ToolTipIcon
                      src={add}
                      width={22}
                      height={22}
                      alt="add"
                      tooltip="Create Lead"
                    />

                    {/* <Legacy src={add} alt="add" layout="fill" /> */}
                  </div>
                </button>
              )}

              {val?.lead_management_uuid && (
                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setIsFollowUpData(val)}
                >
                  <div className="relative w-5 h-5">
                  <ToolTipIcon
                      src={followUp}
                      width={22}
                      height={22}
                      alt="followUp"
                      tooltip="Follow Up "
                    />
                    {/* <Legacy src={followUp} alt="followUp" layout="fill" /> */}
                  </div>
                </button>
              )}

              <button
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => onGetBlackList(val)}
              >
                <div className="relative w-5 h-5">
                  
                <ToolTipIcon
                      src={blackList}
                      width={22}
                      height={22}
                      alt="blackList"
                      tooltip="BlackList "
                    />
                  {/* <Legacy src={blackList} alt="blackList" layout="fill" /> */}
                </div>
              </button>

              <button
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => {
                  val?.lead_management_uuid &&
                    dispatch(onAddLeadNoteId(val?.lead_management_uuid));
                  val?.lead_management_uuid &&
                    Cookies.set("LeadDialName", val?.fullName);
                  dispatch(
                    onDial(
                      val?.direction === "outbound"
                        ? val?.destination_number
                        : val?.caller_id_number
                    )
                  );
                }}
              >
                <div className="relative w-5 h-5">
                <ToolTipIcon
                      src={call}
                      width={22}
                      height={22}
                      alt="call"
                      tooltip="Call "
                    />
                  {/* <Legacy src={call} alt="call" layout="fill" /> */}
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallHistory;
