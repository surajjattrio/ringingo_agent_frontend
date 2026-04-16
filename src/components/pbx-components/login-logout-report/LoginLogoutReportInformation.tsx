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
    onGetInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInfoDate]);

  // ON GETTING INFO
  const onGetInfo = async () => {
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

  const getDuration = (startDate: any, endDate: any) => {
    let newTime: any = intervalToDuration({
      start: new Date(startDate),
      end: new Date(endDate),
    });
    return `${
      (newTime?.hours > 9 ? newTime.hours : "0" + newTime.hours) +
      ":" +
      (newTime?.minutes > 9 ? newTime.minutes : "0" + newTime.minutes)
    }`;
  };

  const isDurationOver = (duration: string, breakCode: any) => {
    return duration > breakCode.duration ? "error" : "success";
  };

  const getEventDuration = (rowData: any, index: number) => {
    if (
      data[index - 1] &&
      rowData.login_status === "0" &&
      rowData.breakcode?.length
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
    } else if (rowData.login_status === "2") {
      const duration = getDuration(data[0]?.date_time, rowData?.date_time);
      return <span className="text-heading">{duration}</span>;
    }
  };

  return (
    <>
      <div
        className={`w-full scrollbar-hide h-[calc(100vh-156px)] 3xl:h-[calc(100vh-184px)] overflow-y-auto drop-shadow-xl bg-white rounded-lg ${
          !isInfoDate && "hidden"
        }`}
      >
        <div className="3xl:py-2 py-1.5 bg-dark-800 3xl:px-4 px-3 rounded-t-lg sticky top-0 z-[5]">
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
        <div>
          {isLoading ? (
            <div className=" h-[calc(100vh-233px)]">
              <Loader />
            </div>
          ) : data && data?.length ? (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-x-1">
                <div className="p-[5px] text-sm font-bold text-heading">
                  Time Stamp
                </div>
                <div className="p-[5px] text-sm font-bold text-heading">
                  Event
                </div>
                <div className="p-[5px] text-sm font-bold text-heading">
                  Duration(HH:MM)
                </div>
              </div>
              <div className="grid grid-cols-3 gap-x-1">
                {data.map((data: any, index: number) => {
                  return (
                    <>
                      <div className="p-[10px]">
                        <span className="3xl:text-xs text-[11px] text-heading">
                          {data.date_time
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
            <div className=" h-[calc(100vh-233px)] flex justify-center items-center">
              <Chip title="No Record found" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginLogoutReportInformation;
