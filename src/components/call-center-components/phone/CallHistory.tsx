import { useEffect, useState } from "react";
import Legacy from "next/legacy/image";
import { useAuth } from "@/contexts/hooks/useAuth";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import {
  useAddLeadNoteId,
  useAddNoteId,
  useIsCallHangUp,
  useSelectedCampaign,
} from "@/redux/slice/commonSlice";
import { Chip, Loader, NoRecordFound } from "../../ui-components";
import { getSingleLeadInfo } from "@/redux/slice/leadListSlice";
import { Button, Textarea } from "@/components/forms";
import { Danger, Success } from "@/redux/services/toasterService";
import { createNewNote } from "@/redux/slice/noteSlice";

// THIRD-PARTY IMPORT
import { format, formatDistanceStrict, intervalToDuration } from "date-fns";
import { useLeadUuid, blackListCallCenter } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { getFollowUp } from "@/redux/slice/followUpSlice";

// ASSETS
const add_note = "/assets/icons/add-note.svg";
const call_inbond = "/assets/icons/call/call-inbond.svg";
const call_outbound = "/assets/icons/call/call-outbound.svg";
const call_missed = "/assets/icons/orange/call-missed.svg";
const doc = "/assets/icons/document-text.svg";

// TYPES
interface CallHistoryProps {
  setIsFollowUpData?: any;
  setNoteDetails?: any;
  setNoteData?: any;
  activeTab?: any;
}

/* ============================== CALL HISTORY TAB ============================== */

const CallHistory = (props: CallHistoryProps) => {
  const { setIsFollowUpData, setNoteDetails } = props;
  const dispatch = useAppDispatch();
  const selectedCampaign = useSelectedCampaign();
  const addLeadNoteId = useAddLeadNoteId();
  const addNoteId = useAddNoteId();
  const leadUuid = useLeadUuid();
  const isCallHangUp = useIsCallHangUp();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [showNoteAdd, setShowNoteAdd] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cdrsNotesData, setCdrsNotesData] = useState<any>([]);
  const [followUpData, setFollowUpData] = useState<any>([]);
  const [blackListData, setBlackListData] = useState<any>([]);

  const [noteData, setNoteData] = useState<any>(null);
  const [infoData, setInfoData] = useState<any>();
  const [comment, setComment] = useState<string>("");
  const permission = user?.agent_detail?.agent_permission[0];
  console.log(permission);
  console.log("permission===============");
  const callCenterMode = permission?.call_center_mode === "1";
  console.log(callCenterMode);
  console.log("callCenterMode===========");

  useEffect(() => {
    if (!!addLeadNoteId || !!leadUuid) {
      onGetSingleLeadInfo();
      onGetFollowUp();
    } else {
      setCdrsNotesData([]);
      setFollowUpData([]);
      setBlackListData([]);
      setInfoData({});
      setNoteData(null);
      setComment("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addLeadNoteId, leadUuid, selectedCampaign]);

  useEffect(() => {
    if (!addNoteId && cdrsNotesData?.length > 0) {
      setNoteData(cdrsNotesData[0]?.cdrs_info?.custom_callid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cdrsNotesData]);

  useEffect(() => {
    if (isCallHangUp) {
      setTimeout(() => {
        onGetSingleLeadInfo();
        onGetFollowUp();
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCallHangUp]);

  // GET FOLLOW UP
  const onGetFollowUp = async () => {
    if (!!addLeadNoteId || !!leadUuid) {
      try {
        const res: any = await dispatch(
          getFollowUp(addLeadNoteId ? addLeadNoteId : leadUuid)
        ).unwrap();
        if (res && res.statusCode === 200) {
          setFollowUpData(res?.data || []);
        } else {
          setFollowUpData([]);
        }
      } catch (error: any) {
        setFollowUpData([]);
        console.log("get single Follow up information err--->", error?.message);
      }
    }
  };

  // GET Black List
  const onGetBlackList = async (infoData: any) => {
    if (!!addLeadNoteId || !!leadUuid) {
      try {
        //    alert('here11');
        //    console.log(infoData.custom_phone_number);
        let payload = {
          type_value: infoData.custom_phone_number
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
        console.log("get single Black List information err--->", error?.message);
      }
    }
  };

  // GET LEAD INFORMATION
  const onGetSingleLeadInfo = async () => {
    if (!!addLeadNoteId || !!leadUuid) {
      setIsLoading(true);
      try {
        const res: any = await dispatch(
          getSingleLeadInfo(addLeadNoteId ? addLeadNoteId : leadUuid)
        ).unwrap();
        if (res && res?.statusCode === 200) {
          setInfoData(res?.data?.[0]?.lead_information?.[0] || {});
          setCdrsNotesData(res?.data?.[1]?.cdrs_and_notes || []);
          setIsLoading(false);
        }
      } catch (error: any) {
        setIsLoading(false);
        setInfoData({});
        setCdrsNotesData([]);
        setNoteData(null);
        setComment("");
        console.log("get single lead information err--->", error?.message);
      }
    }
  };

  // ON SUBMIT NOTE DEATILS
  const onSubmit = async () => {
    setLoading(true);
    try {
      const payloaad = {
        comment: comment,
        lead_uuid: addLeadNoteId ? addLeadNoteId : leadUuid ? leadUuid : "",
        cdrs_uuid: addNoteId ? addNoteId : noteData ? noteData : "",
      };
      const res: any = await dispatch(createNewNote(payloaad)).unwrap();
      if (res) {
        Success(res?.data);
        onGetSingleLeadInfo();
        setNoteData(null);
        setComment("");
        setLoading(false);
      }
    } catch (error: any) {
      console.log("create note err --->", error?.message);
      setLoading(false);
    }
  };

  // GET Day
  const getDay = (date: string) => {
    let day: any = formatDistanceStrict(new Date(), new Date(date), {
      unit: "day",
    });
    return `${day === "0 days" ? "Today" : day === "1 days" ? "Yesterday" : day + " ago"
      }`;
  };

  // get day info
  const getInfoDay = (date: string) => {
    let day: any = formatDistanceStrict(new Date(), new Date(date), {
      unit: "day",
    });
    return `${day === "0 days" ? "Today" : format(new Date(date), "dd/MM/yyyy")
      }`;
  };

  // GET CALL DURATION
  const getDuration = (time: number) => {
    let newTime: any = intervalToDuration({
      start: 0,
      end: time * 1000,
    });
    return `${(newTime?.hours > 9 ? newTime.hours : "0" + newTime.hours) +
      ":" +
      (newTime?.minutes > 9 ? newTime.minutes : "0" + newTime.minutes) +
      ":" +
      (newTime?.seconds > 9 ? newTime.seconds : "0" + newTime.seconds)
      }`;
  };

  return (
    <>
      <div className="h-[calc(100vh-178px)] 3xl:h-[calc(100vh-200px)]">
        {selectedCampaign ? (
          isLoading ? (
            <div className="h-[calc(100vh-233px)]">
              <Loader />
            </div>
          ) : (
            <>
              <div
                className={`${showNoteAdd
                  ? "h-[calc(100vh-310px)] 2lg:h-[calc(100vh-320px)] lg:h-[calc(100vh-330px)] smd:h-[calc(100vh-332px)] 3xl:h-[calc(100vh-325px)]"
                  : "h-[calc(100vh-230px)] 2lg:h-[calc(100vh-238px)] lg:h-[calc(100vh-250px)] smd:h-[calc(100vh-250px)] 3xl:h-[calc(100vh-245px)]"
                  }`}
              >
                <div className="h-[60%] overflow-y-auto relative scrollbar-change">
                  <div className="sticky top-0 border-b border-dark-800 bg-white z-[1] drop-shadow-sm flex items-center">
                    <span className="5xl:text-[15px] 4xl:text-[13px] text-[12px] font-bold text-heading px-4 py-2">
                      Call History
                    </span>
                  </div>
                  {cdrsNotesData && cdrsNotesData?.length ? (
                    cdrsNotesData?.map((value: any, index: number) => {
                      return (
                        <div
                          className={`border-b border-dark-800 3xl:py-2 py-1`}
                          key={index}
                        >
                          <div className="flex items-center justify-between 3xl:px-6 px-4">
                            <div className="flex flex-col items-start">
                              <div className="flex items-center gap-2">
                                <div className="relative 5xl:w-[24px] 4xl:w-[22px] 5xl:h-[24px] 4xl:h-[22px] 3xl:w-[20px] 3xl:h-[20px] w-[16px] h-[16px] cursor-pointer">
                                  <Legacy
                                    src={
                                      value?.cdrs_info?.direction === "missed"
                                        ? call_missed
                                        : value?.cdrs_info?.direction ===
                                          "outbound"
                                          ? call_outbound
                                          : call_inbond
                                    }
                                    alt="direction"
                                    layout="fill"
                                  />
                                </div>
                                <label className="5xl:text-[14px] 4xl:text-[12px] text-xs text-heading font-semibold">
                                  {value?.cdrs_info?.converted_date
                                    ? getInfoDay(value?.cdrs_info?.converted_date)
                                    : ""}
                                </label>
                                <label className="5xl:text-[14px] 4xl:text-[12px] text-xs text-heading font-semibold">
                                  {format(
                                    new Date(value?.cdrs_info?.converted_date),
                                    "h:mm a"
                                  )}
                                </label>
                                <label className="5xl:text-[14px] 4xl:text-[12px] text-xs text-heading font-semibold">
                                  {value?.cdrs_info?.billsecond
                                    ? getDuration(value?.cdrs_info?.billsecond)
                                    : ""}
                                </label>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className="cursor-pointer"
                                onClick={() =>
                                  setNoteDetails(
                                    value?.cdrs_info?.custom_callid
                                  )
                                }
                              >
                                <div className="relative 5xl:w-[24px] 4xl:w-[22px] 5xl:h-[24px] 4xl:h-[22px] 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                                  <Legacy
                                    src={add_note}
                                    alt="add-note"
                                    layout="fill"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            {value?.notes_info.length
                              ? value?.notes_info.map(
                                (val: any, index: number, array: any) => {
                                  return (
                                    <div
                                      key={index}
                                      className={`3xl:px-6 px-4 border-b border-dark-800 ${index === 0
                                        ? "3xl:pb-2 pb-1"
                                        : "3xl:py-2 py-1"
                                        } ${index === array.length - 1
                                          ? "border-b-0"
                                          : ""
                                        }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 max-w-[50%] w-full">
                                          <div className="relative 5xl:w-[24px] 4xl:w-[22px] 5xl:h-[24px] 4xl:h-[22px] 3xl:w-[20px] 3xl:h-[20px] w-[16px] h-[16px] cursor-pointer max-w-[unset]">
                                            <Legacy
                                              src={doc}
                                              alt="doc"
                                              layout="fill"
                                            />
                                          </div>
                                          <span className="5xl:text-[17px] 4xl:text-[15px] text-[13px] text-heading w-[80%] whitespace-nowrap text-ellipsis overflow-hidden">
                                            {val?.user && val?.user?.length
                                              ? val?.user[0]?.username
                                              : infoData?.tenant &&
                                                infoData?.tenant?.length
                                                ? infoData?.tenant[0]
                                                  ?.tenant_name
                                                : ""}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 justify-end">
                                          <span className="5xl:text-[14px] 4xl:text-[12px] 3xl:text-xs text-[11px] font-normal text-txt-primary">
                                            {val?.createdAt
                                              ? getDay(val?.createdAt)
                                              : ""}
                                          </span>
                                          <span className="5xl:text-[14px] 4xl:text-[12px] 3xl:text-xs text-[11px] font-normal text-txt-primary">
                                            {val?.createdAt
                                              ? format(
                                                new Date(val?.createdAt),
                                                "dd/MM/yyyy"
                                              )
                                              : ""}
                                          </span>
                                          <span className="5xl:text-[14px] 4xl:text-[12px] 3xl:text-xs text-[11px] font-normal text-txt-primary">
                                            {val?.createdAt
                                              ? format(
                                                new Date(val?.createdAt),
                                                "h:mm a"
                                              )
                                              : ""}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="3xl:pl-8 pl-7">
                                        <p className="5xl:text-[14px] 4xl:text-[12px] 3xl:text-xs text-[11px] font-normal text-txt-primary break-words">
                                          {val.comment}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                }
                              )
                              : null}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-[150px] flex justify-center items-center">
                      <Chip title="No Record Found" />
                    </div>
                  )}
                </div>
                <div className="py-1.5"></div>
                <div className="h-[40%] overflow-y-auto relative scrollbar-change">
                  <div className="sticky top-0 border-b border-t border-dark-800 bg-white z-[1] drop-shadow-sm flex items-center">
                    <span className="5xl:text-[15px] 4xl:text-[13px] text-[12px] font-bold text-headind px-4 py-2">
                      Lead Follow Up
                    </span>
                  </div>
                  {followUpData && followUpData?.length ? (
                    followUpData?.map((value: any, index: number) => {
                      return (
                        <div
                          className={`border-b px-4 border-dark-800 3xl:py-2 py-1`}
                          key={index}
                        >
                          <div className="grid grid-cols-2">
                            <span className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading">
                              {value?.type}
                            </span>
                            <span className="5xl:text-[15px] 4xl:text-[13px] text-xs font-semibold text-heading flex justify-end">
                              {value?.date_time}
                            </span>
                          </div>
                          <p className="5xl:text-[13px] 4xl:text-[12px] text-[11px] font-normal text-txt-primary break-words pt-1">
                            {value?.comment}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-[100px] flex justify-center items-center">
                      <Chip title="No Record Found" />
                    </div>
                  )}
                </div>
              </div>
              {/* <div className="py-1.5"></div> */}
              {addLeadNoteId || addLeadNoteId || leadUuid ? (
                <div className="px-4 transition-all border-t border-dark-800">
                  {showNoteAdd ? (
                    <Textarea
                      label="Add Note"
                      name="addNote"
                      rows={2}
                      tooltipRight={true}
                      value={comment}
                      placeholder="Type something here..."
                      onChange={(e: any) => {
                        setComment(e.target.value);
                      }}
                    />
                  ) : null}
                  <div className="py-3 flex gap-2 items-center">
                    <Button
                      disabled={
                        loading || (!addNoteId && cdrsNotesData?.length === 0)
                      }
                      className={`${!addNoteId && cdrsNotesData?.length === 0
                        ? "!bg-opacity-60"
                        : ""
                        } 3xl:py-1.5 3xl:px-2 px-1.5 py-1 rounded-lg`}
                      text="Add Note"
                      icon="plus-white"
                      onClick={() => {
                        if (!showNoteAdd) {
                          setShowNoteAdd(true);
                        } else {
                          onSubmit();
                        }
                      }}
                    />
                    {permission && user?.permission?.follow_up === "0" && (
                      <Button
                        className="3xl:py-1.5 3xl:px-2 px-1.5 py-1 rounded-lg"
                        text="Follow Up"
                        icon="followUp-white"
                        onClick={() => {
                          setIsFollowUpData(infoData);
                        }}
                      />
                    )}
                    {permission && permission.call_center_mode === "0" && user?.permission?.allow_black_list === "0" && (
                      <Button
                        className="3xl:py-1.5 3xl:px-2 px-1.5 py-1 rounded-lg"
                        text="Black List"
                        icon="blackList-white"
                        onClick={() => {
                          onGetBlackList(infoData);
                        }}
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )
        ) : (
          <>
            <NoRecordFound
              title="No data found"
              description={!selectedCampaign ? "Select campaign to view data" : "No more data found from this campaign"}
              className="pb-10 !justify-end"
              topImageClass="p-0"
            />
          </>
        )}
      </div>
    </>
  );
};

export default CallHistory;
