import Legacy from "next/legacy/image";
import { useEffect, useState } from "react";

// PROJECT IMPORTS
import { Loader } from "@/components/ui-components";
import { useAppDispatch } from "@/redux/hooks";
import { getSingleLeadInfo } from "@/redux/slice/leadListSlice";
import { format, formatDistanceStrict, intervalToDuration } from "date-fns";
import { useNumberMasking } from "@/redux/slice/commonSlice";
import { useAuth } from "@/contexts/hooks/useAuth";

// ASSETS
const closeIcon = "/assets/icons/close.svg";
const whiteCloseIcon = "/assets/icons/close-white.svg";
const add_note = "/assets/icons/add-note.svg";
const call_inbond = "/assets/icons/call/call-inbond.svg";
const call_outbound = "/assets/icons/call/call-outbound.svg";
const call_missed = "/assets/icons/orange/call-missed.svg";
const doc = "/assets/icons/document-text.svg";

// TYPES
interface LeadInformationProps {
  isLeadInfoID: string;
  setIsLeadInfoID: any;
  setNoteData: any;
}

const LeadInformation = (props: LeadInformationProps) => {
  const { isLeadInfoID = null, setIsLeadInfoID, setNoteData } = props;

  const numberMasking = useNumberMasking();
  const { user } = useAuth();

  const [infoData, setInfoData] = useState<any>("");
  const [cdrsNotesData, setCdrsNotesData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // GET DAY
  const getDay = (date: string) => {
    let day: any = formatDistanceStrict(new Date(), new Date(date), {
      unit: "day",
    });
    return `${day === "0 days" ? "Today" : day === "1 days" ? "Yesterday" : day + " ago"
      }`;
  };

  // GET DAY INFO
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

  // PREPARE CUSTOM FIELDS (dynamic)
  const customFieldItems = infoData?.custom_fields && typeof infoData?.custom_fields === "object"
    ? Object.entries(infoData.custom_fields).map(([key, value]) => ({ label: key, value: value || "—" }))
    : [];

  /* ============================== LEAD INFORMATION ============================== */

  return (
    <>
      <div
        className={`w-full h-[70vh] overflow-y-auto scrollbar-hide bg-white rounded-[20px] border  transition-all duration-300 ${!isLeadInfoID && "hidden"
          }`}
      >
        <div className="py-4 px-6  flex items-center justify-center sticky top-0 z-10 bg-white">
          <h2 className="text-[#322996] font-semibold text-lg">
            Lead Information
          </h2>
          <div
            className="cursor-pointer absolute right-8"
            onClick={() => {
              setIsLeadInfoID(null);
              setInfoData("");
              setCdrsNotesData([]);
            }}
          >
            <Legacy src={closeIcon} alt="close" width={16} height={16} />
          </div>
        </div>

        {isLoading ? (
          <div className="h-[calc(100vh-233px)] flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <>
            {/* Lead Info */}
            <div className="pt-2">
              {infoData && Object.keys(infoData).length ? (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 gap-y-2 text-sm">
                    {[
                      { label: "Email id", value: infoData?.email || "—" },
                      {
                        label: "Phone No",
                        value: infoData?.phone_number
                          ? user?.isPbx
                            ? user?.isNumberMasking
                              ? Array.from(infoData?.phone_number).length > 4
                                ? Array.from(infoData?.phone_number)
                                  .fill("X", 2, -2)
                                  .join("")
                                : Array.from(infoData?.phone_number)
                                  .fill("X", 1, -1)
                                  .join("")
                              : infoData?.phone_number
                            : numberMasking
                              ? Array.from(infoData?.phone_number).length > 4
                                ? Array.from(infoData?.phone_number)
                                  .fill("X", 2, -2)
                                  .join("")
                                : Array.from(infoData?.phone_number)
                                  .fill("X", 1, -1)
                                  .join("")
                              : infoData?.phone_number
                          : "—",
                      },
                      {
                        label: "Alternate Phone No",
                        value: infoData?.alternate_phone_number || "—",
                      },
                      {
                        label: "DOB",
                        value: infoData?.dob
                          ? format(new Date(infoData?.dob), "MM/dd/yyyy")
                          : "—",
                      },
                      {
                        label: "Description",
                        value: infoData?.description || "—",
                      },
                      {
                        label: "Lead Status",
                        value: infoData?.disposition?.[0]?.name || "—",
                      },
                      { label: "Address", value: infoData?.address || "—" },
                      { label: "City", value: infoData?.city || "—" },
                      { label: "State", value: infoData?.state || "—" },
                      { label: "Province", value: infoData?.province || "—" },
                      {
                        label: "Postal Code",
                        value: infoData?.postal_code || "—",
                      },
                      {
                        label: "Country",
                        value:
                          infoData?.country && infoData?.country?.length
                            ? infoData?.country[0]?.country
                            : "—",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[150px_1fr] border-b rounded-lg py-2 px-2"
                      >
                        <div className="text-gray-500 text-sm">
                          {item.label}
                        </div>
                        <div className="font-medium pl-8">{item.value}</div>
                      </div>
                    ))}
                    {customFieldItems.length > 0 &&
                      customFieldItems.map((item: any, index: number) => (
                        <div
                          key={`custom-${index}`}
                          className="grid grid-cols-[150px_1fr] border-b rounded-lg py-2 px-2"
                        >
                          <div className="text-gray-500 text-sm">{item.label}</div>
                          <div className="font-medium pl-8">{item.value}</div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              {cdrsNotesData && cdrsNotesData?.length
                ? cdrsNotesData?.map((value: any, index: number) => {
                  return (
                    <div
                      className={`border-b border-dark-800 ${index === 0 ? "3xl:pb-2 pb-1" : "3xl:py-2 py-1"
                        }`}
                      key={index}
                    >
                      <div className="flex items-center justify-between 3xl:px-6 px-4">
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <div className="relative 3xl:w-[20px] 3xl:h-[20px] w-[16px] h-[16px] cursor-pointer">
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
                            <label className="text-xs text-heading font-semibold">
                              {value?.cdrs_info?.callstart
                                ? getInfoDay(value?.cdrs_info?.converted_date)
                                : getInfoDay(value?.cdrs_info?.callstart)}
                            </label>
                            <label className="text-xs text-heading font-semibold">
                              {value?.cdrs_info?.callstart
                                ? format(new Date(value?.cdrs_info?.converted_date), "h:mm:ss a")
                                : format(new Date(value?.cdrs_info?.callstart), "h:mm:ss a")
                              }
                            </label>
                            <label className="text-xs text-heading font-semibold">
                              {value?.cdrs_info?.billsecond
                                ? getDuration(value?.cdrs_info?.billsecond)
                                : ""}
                            </label>
                          </div>
                        </div>
                        <div>
                          <div
                            className="cursor-pointer"
                            onClick={() =>
                              setNoteData(value?.cdrs_info?.custom_callid)
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
                                  className={`3xl:px-6 px-4 border-b border-dark-800 ${index === 0
                                      ? "3xl:pb-2 pb-1"
                                      : "3xl:py-2 py-1"
                                    } ${index === array.length - 1
                                      ? "border-b-0"
                                      : ""
                                    }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 max-w-[50%] w-full">
                                      <div className="relative 3xl:w-[20px] 3xl:h-[20px] w-[16px] h-[16px] cursor-pointer max-w-[unset]">
                                        <Legacy
                                          src={doc}
                                          alt="doc"
                                          layout="fill"
                                        />
                                      </div>
                                      <span className="text-[13px] text-heading w-[80%] whitespace-nowrap text-ellipsis overflow-hidden">
                                        {val?.user && val?.user?.length
                                          ? val?.user[0]?.username
                                          : infoData?.tenant &&
                                            infoData?.tenant?.length
                                            ? infoData?.tenant[0]?.tenant_name
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
                                            new Date(val?.createdAt),
                                            "dd/MM/yyyy"
                                          )
                                          : ""}
                                      </span>
                                      <span className="3xl:text-xs text-[11px] font-normal text-txt-primary">
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
    </>
  );
};

export default LeadInformation;
