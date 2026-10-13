import Image from "next/image";
import { useState } from "react";

// PROJECT IMPORTS
import { useRingGroupList } from "@/redux/slice/callSlice";
import { Button, Select, Switch } from "@/components/forms";

// THIRD-PARTY IMPORT
// import Cookies from "js-cookie";
import Cookies from "@/lib/cookies";

// ASSETS
const call = "/assets/icons/white/call_white.svg";

// TYPES
interface RingGroupTransferPageProps {
    setPage: any;
    ringGroupTransferCall: (destination: any, callType: string) => void;
}

/* ============================== RING GROUP TRANSFER PAGE ============================== */

const RingGroupTransferPage = (props: RingGroupTransferPageProps) => {
    const { setPage, ringGroupTransferCall } = props;

    const ringGroupList = useRingGroupList();

    const [destination, setDestinstion] = useState<string>("");
    const [transferType, setTransferType] = useState<string>("attendedTransfer");

    return (
        <>
            <div className="flex flex-col justify-between h-full">

                <div className="div flex flex-col px-4 gap-6 ">

                    <div className="">
                        <Switch
                            trueName="Attended Transfer"
                            falseName="Blind Transfer"
                            checked={transferType.includes("attendedTransfer")}
                            onChange={() =>
                                setTransferType(
                                    transferType === "attendedTransfer"
                                        ? "blindTransfer"
                                        : "attendedTransfer"
                                )
                            }
                        />
                    </div>

                    <div>
                        <div className="grid grid-cols-5 3xl:py-3 py-2 border-y border-dark-800 items-center">
                            <label className="col-span-2 text-heading 3xl:text-xs text-[11px] font-bold">
                                Ring Group:
                            </label>
                            <Select
                                className="col-span-3"
                                isShowLabel={false}
                                value={destination}
                                maxMenuHeight={150}
                                name="ringGroup"
                                placeholder="Select"
                                options={ringGroupList}
                                isManual
                                onChange={(e: any) => {
                                    setDestinstion(e.value);
                                    Cookies.set("secondCall", e.label);
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-3">
                        <div
                            className="3xl:py-2 py-1.5 3xl:px-6 px-5 bg-primary-green cursor-pointer rounded-md hover:bg-opacity-80"
                            onClick={() => {
                                ringGroupTransferCall(destination, transferType);
                            }}
                        >
                            <Image src={call} alt="call" width={20} height={20} />
                        </div>
                        <Button
                            className="py-1.5 px-4"
                            text="Back"
                            style="dark-outline"
                            onClick={() => {
                                setPage("TRANSFER");
                            }}
                        />
                    </div>


                </div>


            </div>
        </>
    );
};

export default RingGroupTransferPage;
