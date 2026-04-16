import { useEffect, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { useAuth } from "@/contexts/hooks/useAuth";
import { getSingleLeadInfo } from "@/redux/slice/leadListSlice";
import { onSetShowCallInfoId } from "@/redux/slice/commonSlice";
import { Loader } from "@/components/ui-components";

// THIRD-PARTY IMPORT
import { format, formatDistanceStrict, intervalToDuration } from "date-fns";

// ASSETS
const backIcon = "/assets/icons/back-icon.svg";
const add_note = "/assets/icons/add-note.svg";
const editIcon = "/assets/icons/edit.svg";
const call_inbond = "/assets/icons/call/call-inbond.svg";
const call_outbound = "/assets/icons/call/call-outbound.svg";
const call_missed = "/assets/icons/orange/call-missed.svg";
const doc = "/assets/icons/document-text.svg";

// TYPES
interface CallInformationProps {
  fromCallCenter?: boolean;
  setIsCreateLead?: any;
  setLeadEdit?: any;
  setEditData?: any;
  isLeadInfoID: string | null;
  setNoteData: any;
  onRefreshData?: any;
}

/* ============================== NOTE ============================== */

const CallInformation = (props: CallInformationProps) => {
  const {
    fromCallCenter = false,
    setIsCreateLead,
    setLeadEdit,
    setEditData,
    isLeadInfoID = null,
    setNoteData,
    onRefreshData = null,
  } = props;

  const [infoData, setInfoData] = useState<any>("");
  const [cdrsNotesData, setCdrsNotesData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isLeadInfoID) {
      onGetSingleLeadInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeadInfoID]);

  const dispatch = useAppDispatch();

  // GET LEAD INFORMATION
  const onGetSingleLeadInfo = async () => {
    setIsLoading(true);
    try {
      const res: any = await dispatch(getSingleLeadInfo(isLeadInfoID)).unwrap();
      if (res && res?.statusCode === 200) {
        setInfoData(res?.data?.[0]?.lead_information?.[0] || {});
        setCdrsNotesData(res?.data?.[1]?.cdrs_and_notes || []);
        setIsLoading(false);
      }
    } catch (error: any) {
      setIsLoading(false);
      console.log("get single lead information err--->", error?.message);
    }
  };

  // GET Day
  const getDay = (date: string) => {
    let day: any = formatDistanceStrict(new Date(), new Date(date), {
      unit: "day",
    });
    return `${
      day === "0 days" ? "Today" : day === "1 days" ? "Yesterday" : day + " ago"
    }`;
  };

  // get day info
  const getInfoDay = (date: string) => {
    let day: any = formatDistanceStrict(new Date(), new Date(date), {
      unit: "day",
    });
    return `${
      day === "0 days" ? "Today" : format(new Date(date), "dd/MM/yyyy")
    }`;
  };

  // GET CALL DURATION
  const getDuration = (time: number) => {
    let newTime: any = intervalToDuration({
      start: 0,
      end: time * 1000,
    });
    return `${
      (newTime?.hours > 9 ? newTime.hours : "0" + newTime.hours) +
      ":" +
      (newTime?.minutes > 9 ? newTime.minutes : "0" + newTime.minutes) +
      ":" +
      (newTime?.seconds > 9 ? newTime.seconds : "0" + newTime.seconds)
    }`;
  };

  return (
    <>
      <div className="w-full">
        <div className="rounded-lg drop-shadow-lg">
          <div className="bg-layout 3xl:px-4 3xl:py-3 px-2 py-2 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Legacy
                className="cursor-pointer"
                src={backIcon}
                alt="back"
                width={18}
                height={18}
                onClick={() => {
                  dispatch(onSetShowCallInfoId(null));
                  onRefreshData && onRefreshData();
                  setInfoData("");
                  setCdrsNotesData([]);
                }}
              />
              <span className="3xl:text-sm text-xs text-heading font-bold">
                Lead Information
              </span>
            </div>
          </div>
          <div className="pt-2 pb-4 bg-white rounded-b-lg">
            <div
              className={`${
                user?.isPbx
                  ? "h-[calc(100vh-230px)] 3xl:h-[calc(100vh-270px)] overflow-y-auto"
                  : "h-[calc(100vh-172px)] 3xl:h-[calc(100vh-188px)] overflow-y-auto"
              }`}
            >
              {isLoading ? (
                <div className=" h-[calc(100vh-233px)]">
                  <Loader />
                </div>
              ) : (
                <>
                  <div className="pt-2">
                    {infoData && Object.keys(infoData).length ? (
                      <div className="px-4 pb-4">
                        <div className="3xl:py-2 py-1 flex items-center justify-between">
                          <div className="flex gap-2">
                            <label className="text-sm font-bold text-heading">
                              {infoData?.first_name +
                                " " +
                                (infoData?.last_name || "")}
                            </label>
                            {infoData?.user?.length ? (
                              <p className="ml-5 text-sm font-bold text-heading">
                                {"( " +
                                  "Assigned to " +
                                  infoData?.user[0].username +
                                  " )"}
                              </p>
                            ) : null}
                          </div>
                          {!fromCallCenter && (
                            <Legacy
                              className="cursor-pointer"
                              src={editIcon}
                              alt="edit"
                              width={18}
                              height={18}
                              onClick={() => {
                                setLeadEdit(true);
                                setEditData(infoData);
                                setIsCreateLead(true);
                              }}
                            />
                          )}
                        </div>
                        <div className="grid grid-cols-5 gap-x-1">
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              Email:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.email}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              Phone No:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.phone_number
                                ? user?.isNumberMasking
                                  ? Array.from(infoData?.phone_number).length >
                                    4
                                    ? Array.from(infoData?.phone_number)
                                        .fill("X", 2, -2)
                                        .join("")
                                    : Array.from(infoData?.phone_number)
                                        .fill("X", 1, -1)
                                        .join("")
                                  : infoData?.phone_number
                                : ""}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              Alternate Phone No:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.alternate_phone_number}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              DOB:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.dob
                                ? format(new Date(infoData?.dob), "MM/dd/yyyy")
                                : ""}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              Description:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.description}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              Lead Status:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.disposition?.[0]?.name || ""}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              Address:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.address}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              City:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.city}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              State:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.state}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              Province:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.province}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              Postal Code:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.postal_code}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="3xl:text-xs text-[11px] text-heading">
                              Country:
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="3xl:text-xs text-[11px] text-txt-primary">
                              {infoData?.country && infoData?.country?.length
                                ? infoData?.country[0]?.country
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    {cdrsNotesData && cdrsNotesData?.length
                      ? cdrsNotesData?.map((value: any, index: number) => {
                          return (
                            <div
                              className={`border-b border-dark-800 ${
                                index === 0 ? "3xl:pb-2 pb-1" : "3xl:py-2 py-1"
                              }`}
                              key={index}
                            >
                              <div className="flex items-center justify-between 3xl:px-6 px-4">
                                <div className="flex flex-col items-start">
                                  <div className="flex items-center gap-2">
                                    <div className="relative 3xl:w-[20px] 3xl:h-[20px] w-[16px] h-[16px] cursor-pointer">
                                      <Legacy
                                        src={
                                          value?.cdrs_info?.direction ===
                                          "missed"
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
                                    <label className="text-xs text-heading font-semibold">
                                      {value?.cdrs_info?.converted_date
                                        ? getInfoDay(
                                            value?.cdrs_info?.converted_date
                                          )
                                        : ""}
                                    </label>
                                    <label className="text-xs text-heading font-semibold">
                                      {format(
                                        new Date(
                                          value?.cdrs_info?.converted_date
                                        ),
                                        "h:mm a"
                                      )}
                                    </label>
                                    <label className="text-xs text-heading font-semibold">
                                      {value?.cdrs_info?.billsecond
                                        ? getDuration(
                                            value?.cdrs_info?.billsecond
                                          )
                                        : ""}
                                    </label>
                                  </div>
                                </div>
                                <div>
                                  <div
                                    className="cursor-pointer"
                                    onClick={() =>
                                      setNoteData(
                                        value?.cdrs_info?.custom_callid
                                      )
                                    }
                                  >
                                    <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
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
                                            className={`3xl:px-6 px-4 border-b border-dark-800 ${
                                              index === 0
                                                ? "3xl:pb-2 pb-1"
                                                : "3xl:py-2 py-1"
                                            } ${
                                              index === array.length - 1
                                                ? "border-b-0"
                                                : ""
                                            }`}
                                          >
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-2 max-w-[50%] w-full">
                                                <div className="relative 3xl:w-[20px] 3xl:h-[20px] w-[16px] h-[16px] cursor-pointer max-w-[unset]">
                                                  <Legacy
                                                    src={doc}
                                                    alt="doc"
                                                    layout="fill"
                                                  />
                                                </div>
                                                <span className="text-[13px] text-heading w-[80%] whitespace-nowrap text-ellipsis overflow-hidden">
                                                  {val?.user &&
                                                  val?.user?.length
                                                    ? val?.user[0]?.username
                                                    : infoData?.tenant &&
                                                      infoData?.tenant?.length
                                                    ? infoData?.tenant[0]
                                                        ?.tenant_name
                                                    : ""}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2 justify-end">
                                                <span className="3xl:text-xs text-[11px] font-normal text-txt-primary">
                                                  {val?.createdAt
                                                    ? getDay(val?.createdAt)
                                                    : ""}
                                                </span>
                                                <span className="3xl:text-xs text-[11px] font-normal text-txt-primary">
                                                  {val?.createdAt
                                                    ? format(
                                                        new Date(
                                                          val?.createdAt
                                                        ),
                                                        "dd/MM/yyyy"
                                                      )
                                                    : ""}
                                                </span>
                                                <span className="3xl:text-xs text-[11px] font-normal text-txt-primary">
                                                  {val?.createdAt
                                                    ? format(
                                                        new Date(
                                                          val?.createdAt
                                                        ),
                                                        "h:mm a"
                                                      )
                                                    : ""}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="3xl:pl-8 pl-7">
                                              <p className="3xl:text-xs text-[11px] font-normal text-txt-primary break-words">
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
                      : null}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CallInformation;
