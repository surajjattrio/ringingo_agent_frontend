import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/hooks/useAuth";

import { usePresetList } from "@/redux/slice/callSlice";

// PROJECT IMPORTS
import { Button, Input, Switch, Select } from "@/components/forms";

// THIRD-PARTY IMPORT
// import Cookies from "js-cookie";
import Cookies from "@/lib/cookies";

// ASSETS
const call = "/assets/icons/white/call_white.svg";

// TYPES
interface ExternalTransferPageProps {
    setPage: any;
    externalTransferCall: (destination: any, callType: string) => void;
}

/* ============================== EXTERNAL TRANSFER PAGE ============================== */

const ExternalTransferPage = (props: ExternalTransferPageProps) => {
    const { setPage, externalTransferCall } = props;

    const [transferType, setTransferType] = useState<string>("attendedTransfer");
    const [destination, setDestinstion] = useState("");
    const presetList = usePresetList();
    const { user } = useAuth();

    const handlePresetChange = (selectedOption: any) => {
        console.log(selectedOption);
        const input = document.getElementsByName('example')[0] as HTMLInputElement;
        if (input) {
            input.value = selectedOption.value;
        }
        // setDestination(selectedOption.value);
    };

    return (
        <>
            <div className="flex flex-col justify-between h-full">

                <div className="div flex flex-col px-4 gap-6">
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
                        <div className={`${!user?.isPbx ? 'block' : 'hidden'} grid grid-cols-5 3xl:py-3 py-2 border-y border-dark-800 items-center`}>
                            <label className="col-span-2 text-heading 3xl:text-xs text-[11px] font-bold">
                                Preset:
                            </label>
                            <Select
                                className="col-span-3"
                                isShowLabel={false}
                                value={destination}
                                maxMenuHeight={150}
                                name="preset"
                                placeholder="Select"
                                options={presetList}
                                onChange={(e: any) => {
                                    console.log(e.target.value)
                                    handlePresetChange(e.target.value);
                                    setDestinstion(e.target.value);
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-5 3xl:py-3 py-2 border-y border-dark-800 items-center">
                            <label className="col-span-2 text-heading 3xl:text-xs text-[11px] font-bold ">
                                Enter Number:
                            </label>
                            <div className="col-span-3">
                                <Input
                                    isShowLabel={false}
                                    name="phoneNumber"
                                    type="number"
                                    value={destination}
                                    placeholder="Enter Phone No."
                                    icon="callGray"
                                    onChange={(e: any) => {
                                        setDestinstion(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="flex justify-center items-center gap-3">
                        <div
                            className="3xl:py-2 py-1.5 3xl:px-6 px-5 bg-primary-green cursor-pointer rounded-md hover:bg-opacity-80"
                            onClick={() => {
                                externalTransferCall(destination, transferType);
                                Cookies.set("secondCall", destination);
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

export default ExternalTransferPage;
