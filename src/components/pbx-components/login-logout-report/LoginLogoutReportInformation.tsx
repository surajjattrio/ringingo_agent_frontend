import { Chip, Loader } from "@/components/ui-components";
import { useAppDispatch } from "@/redux/hooks";
import { Danger } from "@/redux/services/toasterService";
import { getLoginLogoutEntries } from "@/redux/slice/loginLogoutSlice";
import { format, intervalToDuration } from "date-fns";
import Legacy from "next/legacy/image";
import { useEffect, useState } from "react";

// ASSETS
const closeIcon = "/assets/icons/close.svg";

// TYPES
interface LoginLogoutReportInformation {
  isInfoDate: string;
  onCloseClick: any;
}

/* ============================== LOGIN LOGOUT REPORT INFORMATION ============================== */

const LoginLogoutReportInformation = (props: LoginLogoutReportInformation) => {
  const { isInfoDate, onCloseClick } = props;

  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    if (isInfoDate) {
      onGetInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInfoDate]);

  // ON GETTING INFO
  const onGetInfo = async () => {
    if (!isInfoDate) return;
    setIsLoading(true);
    try {
      let payload = {
        date: isInfoDate,
      };
      const res: any = await dispatch(getLoginLogoutEntries(payload)).unwrap();
      if (res && res?.statusCode === 200) {
        setData(res?.data);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        onCloseClick();
        Danger("Something went wrong");
      }
    } catch (error: any) {
      console.log("on get report err -->", error?.message);
      setIsLoading(false);
      onCloseClick();
      Danger("Something went wrong");
    }
  };

  const getEventStatus = (rowData: any) => {
    if (rowData.login_status === "0" && rowData.breakcode?.length) {
      return `${rowData.breakcode[0].name} Finished`;
    } else if (rowData.login_status === "0") {
      return "Login";
    } else if (rowData.login_status === "1" && rowData.breakcode?.length) {
      return `${rowData.breakcode[0].name} Started`;
    } else if (rowData.login_status === "2") {
      return "Logout";
    }
  };

  const getSubEventStatus = (rowData: any) => {
    if (rowData.login_status === "3") {
      return "Pause End";
    } else if (rowData.login_status === "4") {
      return "Pause Start";
    } else if (rowData.login_status === "5") {
      return "ACW Start";
    } else if (rowData.login_status === "6") {
      return "ACW End";
    }
  };

  const getDuration = (startDate: any, endDate: any) => {
    if (!startDate || !endDate) return "00:00:00";
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return "00:00:00";
      let newTime: any = intervalToDuration({
        start: s,
        end: e,
      });
      const hours = newTime?.hours || 0;
      const minutes = newTime?.minutes || 0;
      const seconds = newTime?.seconds || 0;
      return `${hours > 9 ? hours : "0" + hours}:${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}`;
    } catch {
      return "00:00:00";
    }
  };

  const isDurationOver = (duration: string, breakCode: any) => {
    if (!breakCode?.duration) return "success";
    return duration > breakCode.duration ? "error" : "success";
  };

  const getEventDuration = (rowData: any, index: number) => {
    if (
      data?.[index - 1] &&
      rowData?.login_status === "0" &&
      rowData?.breakcode?.length
    ) {
      const duration = getDuration(
        data[index - 1]?.date_time,
        rowData?.date_time
      );
      return (
        <span
          className={`text-${isDurationOver(duration, rowData.breakcode[0])}`}
        >
          {duration}
        </span>
      );
    } else if (rowData?.login_status === "2") {
      const firstLogin = data?.find((d: any) => d?.login_status === "0" && !d?.breakcode?.length);
      const startTime = firstLogin ? firstLogin.date_time : data?.[0]?.date_time;
      const duration = getDuration(startTime, rowData?.date_time);
      return <span className="text-heading">{duration}</span>;
    } else if (rowData?.login_status === "3") {
      for (let i = index - 1; i >= 0; i--) {
        if (data?.[i]?.login_status === "4") {
          const duration = getDuration(data[i]?.date_time, rowData?.date_time);
          return <span className="text-heading">{duration}</span>;
        }
      }
    } else if (rowData?.login_status === "6") {
      for (let i = index - 1; i >= 0; i--) {
        if (data?.[i]?.login_status === "5") {
          const duration = getDuration(data[i]?.date_time, rowData?.date_time);
          return <span className="text-heading">{duration}</span>;
        }
      }
    }
  };

  if (!isInfoDate) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onCloseClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="3xl:py-2 py-1.5 bg-dark-800 3xl:px-4 px-3 rounded-t-lg sticky top-0 z-[5] flex-shrink-0">
          <div className="flex-row-reverse justify-between flex items-center">
            <div className="relative h-[14px] w-[14px] 3xl:w-[16px] 3xl:h-[16px] cursor-pointer mr-2">
              <Legacy
                src={closeIcon}
                alt="close"
                layout="fill"
                onClick={onCloseClick}
              />
            </div>
            <span className="3xl:text-sm text-xs text-heading font-bold">
              Detailed Activity
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <Loader />
            </div>
          ) : data && data?.length ? (
            <div className="pb-4">
              <div className="grid grid-cols-4 gap-x-1 border-b pt-4 pb-2 mb-2 sticky top-0 bg-white z-10">
                <div className="p-[5px] text-sm font-bold text-heading">
                  Time Stamp
                </div>
                <div className="p-[5px] text-sm font-bold text-heading">
                  Event
                </div>
                <div className="p-[5px] text-sm font-bold text-heading">
                  Sub Event
                </div>
                <div className="p-[5px] text-sm font-bold text-heading">
                  Duration (HH:MM:SS)
                </div>
              </div>
              <div className="grid grid-cols-4 gap-x-1">
                {data.map((data: any, index: number) => {
                  return (
                    <>
                      <div className="p-[10px]">
                        <span className="3xl:text-xs text-[11px] text-heading">
                          {data.date_time && !isNaN(new Date(data.date_time).getTime())
                            ? format(new Date(data.date_time), "HH:mm")
                            : ""}
                        </span>
                      </div>
                      <div className="p-[10px]">
                        <span className="3xl:text-xs text-[11px] text-heading">
                          {getEventStatus(data)}
                        </span>
                      </div>
                      <div className="p-[10px]">
                        <span className="3xl:text-xs text-[11px] text-heading">
                          {getSubEventStatus(data)}
                        </span>
                      </div>
                      <div className="p-[10px]">
                        <span className="3xl:text-xs text-[11px]">
                          {getEventDuration(data, index)}
                        </span>
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex justify-center items-center">
              <Chip title="No Record found" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginLogoutReportInformation;
