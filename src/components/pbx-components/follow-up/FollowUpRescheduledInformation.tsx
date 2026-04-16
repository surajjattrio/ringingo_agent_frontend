import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { Chip } from "@/components/ui-components";

// TYPES
interface FollowUpRescheduledInformation {
    rescheduledInfo: any;
    setRescheduledFollowUp: any;
    onCloseClick: any;
}

// ASSETS
const closeIcon = "/assets/icons/close.svg";

/* ============================== RE-SCHEDULED FOLLOW UP INFORMATION ============================== */

const FollowUpRescheduledInformation = (
    props: FollowUpRescheduledInformation
) => {
    const { rescheduledInfo, onCloseClick, setRescheduledFollowUp } = props;
    return (
        <>
            <div
                className={`w-full scrollbar-hide h-[calc(100vh-156px)] 3xl:h-[calc(100vh-184px)] overflow-y-auto drop-shadow-xl bg-white rounded-lg `}
            >
                <div className="3xl:py-2 py-1.5 bg-dark-800 3xl:px-4 px-3 rounded-t-lg sticky top-0 z-[5]">
                    <div className="flex-row-reverse flex items-center">
                        <div className="relative h-[14px] w-[14px] 3xl:w-[16px] 3xl:h-[16px] cursor-pointer mr-2">
                            <Legacy
                                src={closeIcon}
                                alt="close"
                                layout="fill"
                                onClick={onCloseClick}
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-4 px-4 py-2 w-[99%]">
                            <span className="3xl:text-sm text-xs text-heading font-bold col-span-2">
                                Date
                            </span>
                            <span className="3xl:text-sm text-xs text-heading font-bold ml-2">
                                Type
                            </span>
                            <span className="3xl:text-sm text-xs text-heading font-bold col-span-2 ml-5">
                                Comment
                            </span>
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-4">
                    <div className="3xl:py-2 py-1 flex items-center justify-between">
                        <div className="w-full">
                            {rescheduledInfo && rescheduledInfo.length > 0 ? (
                                rescheduledInfo.map((data: any) => {
                                    return (
                                        <>
                                            <div className="grid grid-cols-5 gap-4 py-2">
                                                <span className="col-span-2">{data.date}</span>
                                                <span>{data.type}</span>
                                                <span className="col-span-2 max-w-[98%] overflow-hidden overflow-ellipsis hover:overflow-visible hover:break-words">
                                                    {data.comment}
                                                </span>
                                            </div>
                                        </>
                                    );
                                })
                            ) : (
                                <div className="h-[calc(100vh-233px)] flex justify-center items-center w-full">
                                    <Chip title="No Record found" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FollowUpRescheduledInformation;
