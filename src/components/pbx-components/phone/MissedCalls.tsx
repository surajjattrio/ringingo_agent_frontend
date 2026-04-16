import { Fragment, useEffect } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import {
    getMissedCallDetails,
    useIsMissedCallLoading,
    useMissedCallDetails,
} from "@/redux/slice/phoneSlice";
import {
    onAddLeadNoteId,
    onAddNewLead,
    onDial,
    onSetShowCallInfoId,
} from "@/redux/slice/commonSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Chip, Loader } from "../../ui-components";

// THIRD-PARTY IMPORT
import { format } from "date-fns";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/hooks/useAuth";

// ASSETS
const call_missed = "/assets/icons/orange/call-missed.svg";
const call = "/assets/icons/green/call.svg";
const info = "/assets/icons/info-circle.svg";
const followUp = "/assets/icons/leave3way.svg";
const whatsapp = "/assets/icons/green/whatsapp.svg";
const add = "/assets/icons/add.svg";

// TYPES
interface MissedCallsProps {
    noteData?: any;
    setNoteData?: any;
    setIsFollowUpData?: any;
}

/* ============================== MISSED CALL TAB ============================== */

const MissedCalls = (props: MissedCallsProps) => {
    const { noteData, setNoteData, setIsFollowUpData } = props;
    const dispatch = useAppDispatch();
    const missedCallDetails = useMissedCallDetails();
    const isMissedCallLoading = useIsMissedCallLoading();
    const { user } = useAuth();

    // GET MISSED CALL DETAILS
    const onMissedCallDetailsGet = async () => {
        try {
            await dispatch(getMissedCallDetails()).unwrap();
        } catch (error: any) {
            console.log("Get missed call error ---->", error?.message);
        }
    };

    useEffect(() => {
        onMissedCallDetailsGet();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // GET PHONE NUMBER
    const getPhoneNumber = (val: any) => {
        let callerIdNumber =
            Array.from(val?.caller_id_number).length > 4
                ? Array.from(val?.caller_id_number).fill("X", 2, -2).join("")
                : Array.from(val?.caller_id_number).fill("X", 1, -1).join("");

        let callerIdName =
            Array.from(val?.caller_id_name).length > 4
                ? Array.from(val?.caller_id_name).fill("X", 2, -2).join("")
                : Array.from(val?.caller_id_name).fill("X", 1, -1).join("");

        if (user?.isNumberMasking) {
            return val?.caller_id_number === val?.caller_id_name
                ? callerIdNumber
                : callerIdNumber + " (" + callerIdName + ")";
        }

        return val?.caller_id_number === val?.caller_id_name
            ? val?.caller_id_number
            : val?.caller_id_number + " (" + val?.caller_id_name + ")";
    };

    return (
        <>
            <div className="min-h-[calc(100vh-230px)] 3xl:min-h-[calc(100vh-270px)] h-full">
                {missedCallDetails && missedCallDetails.length ? (
                    missedCallDetails?.map((val: any, idx: number) => {
                        return (
                            <Fragment key={idx}>
                                <div
                                    className={`grid grid-cols-10 gap-6 3xl:py-2 py-1 border-b-2 border-dark-800 px-3 items-center ${idx === 0 && "3xl:pb-2 pb-1 pt-1"
                                        }`}
                                >
                                    <div className="col-span-3 flex items-center">
                                        <div className="mr-6 smd:mr-2 cursor-pointer">
                                            <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                                                <Legacy src={call_missed} alt="call" layout="fill" />
                                            </div>
                                        </div>
                                        <div
                                            className={`${val.fullName ? "flex flex-col" : "flex"}`}
                                        >
                                            {val.fullName ? (
                                                <span className="3xl:text-sm text-xs font-bold">
                                                    {val.fullName}
                                                </span>
                                            ) : null}
                                            <span
                                                className={`${val.fullName
                                                        ? "3xl:text-xs text-[10px] font-normal text-txt-primary"
                                                        : "3xl:text-sm text-xs font-bold"
                                                    }`}
                                            >
                                                {getPhoneNumber(val)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex flex-col items-center">
                                        <span className="3xl:text-sm text-xs font-normal text-heading">
                                            {val?.day}
                                        </span>
                                        <span className="3xl:text-xs text-[10px] font-normal text-txt-primary">
                                            {format(new Date(val?.callstart), "dd/MM/yyyy")}
                                        </span>
                                    </div>
                                    <div className="col-span-2 smd:col-span-3 flex flex-col items-center">
                                        <span className="3xl:text-sm text-xs font-normal text-heading">
                                            {format(new Date(val?.callstart), "h:mm a")}
                                        </span>
                                        <span className="3xl:text-xs text-[10px] font-normal text-txt-primary">
                                            {val?.takeTime}
                                        </span>
                                    </div>
                                    <div className="col-span-3 smd:col-span-1 smd:gap-1 flex items-center gap-1 justify-end">
                                        <a
                                            target="_blank"
                                            href={`https://wa.me/${val?.caller_id_number}`}
                                            className="cursor-pointer"
                                        >
                                            <div className="relative 3xl:w-[20px] 3xl:h-[20px] w-[16px] h-[16px]">
                                                <Legacy src={whatsapp} alt="whatsapp" layout="fill" />
                                            </div>
                                        </a>
                                        {val?.lead_management_uuid ? (
                                            <div
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    dispatch(
                                                        onSetShowCallInfoId(val?.lead_management_uuid)
                                                    );
                                                }}
                                            >
                                                <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                                                    <Legacy src={info} alt="info" layout="fill" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    dispatch(onAddNewLead(val));
                                                }}
                                            >
                                                <div className="border-dark-600 border-2 rounded-md px-0.5 py-[1px]">
                                                    <div className="relative 3xl:w-[18 px] 3xl:h-[18px] w-[14px] h-[14px]">
                                                        <Legacy src={add} alt="add" layout="fill" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {val?.lead_management_uuid ? (
                                            <div
                                                className="cursor-pointer"
                                                onClick={() => setIsFollowUpData(val)}
                                            >
                                                <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                                                    <Legacy src={followUp} alt="followUp" layout="fill" />
                                                </div>
                                            </div>
                                        ) : null}
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => {
                                                val?.lead_management_uuid &&
                                                    dispatch(onAddLeadNoteId(val?.lead_management_uuid));
                                                val?.lead_management_uuid &&
                                                    Cookies.set("LeadDialName", val?.fullName);
                                                dispatch(onDial(val?.caller_id_number));
                                            }}
                                        >
                                            <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                                                <Legacy src={call} alt="call" layout="fill" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>
                        );
                    })
                ) : (
                    <div className="min-h-[calc(100vh-230px)] 3xl:min-h-[calc(100vh-270px)] h-full w-full flex justify-center items-center">
                        {isMissedCallLoading ? (
                            <Loader />
                        ) : (
                            <Chip title="Record Not Found" />
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default MissedCalls;
