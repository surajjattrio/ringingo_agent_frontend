import Legacy from "next/legacy/image";
import { useState } from "react";

// PROJECT IMPORTS
import { Button } from "../../../forms";

// ASSETS
const remove = "/assets/icons/gray/remove.svg";

// TYPES
interface DtmfTransferPageProps {
    setPage: any;
    dtmfTransferCall: (destination: any) => void;
}

/* ============================== DTMF PAGE ============================== */

const DtmfTransferPage = (props: DtmfTransferPageProps) => {
    const { setPage, dtmfTransferCall } = props;

    const [number, setNumber] = useState<string>("");

    const onNumberChange = (val: string) => {
        dtmfTransferCall(val);
        setNumber(number + val);
    };
    return (
        <>
            <div className="flex justify-between gap-2 flex-col h-full">

                <div>
                    {/* <div className="3xl:pb-4 pb-3 relative">
                        <input
                            className="w-full border-t-none border-x-none pb-1 border-b-2 border-dark-800 focus:outline-none text-heading 3xl:text-xl text-sm font-normal text-center"
                            value={number}
                            type="text"
                            pattern="[0-9]+"
                            onChange={(e) => {
                                let value = e.target.value;
                                let val = value.replace(/[^0-9*#]+/g, "");
                                if (number.length < val.length) {
                                    dtmfTransferCall(val.charAt(val.length - 1));
                                }
                                setNumber(val);
                            }}
                        />
                        <div className="absolute right-0 3xl:top-0 top-1">
                            <div className="cursor-pointer relative 3xl:w-[28px] 3xl:h-[28px] h-[22px] w-[22px]">
                                <Legacy
                                    src={remove}
                                    alt="remove"
                                    layout="fill"
                                    onClick={() => {
                                        let string = number;
                                        string = string.substring(0, string.length - 1);
                                        setNumber(string);
                                    }}
                                />
                            </div>
                        </div>
                    </div> */}


                    <div className="relative px-3 mb-1.5">
                        <input
                            className="w-full px-7 border-t-0 border-x-0 border-b-2 border-dark-800 focus:outline-none text-heading 3xl:text-xl text-sm font-normal text-center"
                            value={number}
                            type="text"
                            pattern="[0-9]+"
                            onChange={(e) => {
                                let value = e.target.value;
                                let val = value.replace(/[^0-9*#]+/g, "");
                                if (number.length < val.length) {
                                    dtmfTransferCall(val.charAt(val.length - 1));
                                }
                                setNumber(val);
                            }}
                        />

                        <div
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                            onClick={() => {
                                let string = number;
                                string = string.substring(0, string.length - 1);
                                setNumber(string);
                            }}
                        >
                            <Legacy src={remove} alt="remove" width={22} height={22} />
                        </div>
                    </div>


                    <div className="grid grid-cols-3 gap-1.5 px-3">
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
                            (val: any, idx: number) => {
                                return (
                                    <div
                                        key={idx}
                                        className="bg-white select-none py-1 border-2 border-dark-800 rounded-md drop-shadow-sm flex justify-center items-center hover:border-primary hover:text-primary cursor-pointer"
                                        onClick={() => onNumberChange(val)}
                                    >
                                        <span className="3xl:text-base text-sm font-medium">
                                            {val}
                                        </span>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>


                <div className="flex gap-4 justify-center items-center">
                    <Button
                        className="py-1.5 px-4"
                        text="Back"
                        style="dark-outline"
                        onClick={() => {
                            setPage("TRANSFER_CALL");
                            setNumber("");
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default DtmfTransferPage;
