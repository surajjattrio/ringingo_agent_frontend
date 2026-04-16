// import { ToolTipIcon } from "@/components/ui-components";
// import { useAppDispatch } from "@/redux/hooks";
// import { onShowCallModal } from "@/redux/slice/commonSlice";
// import Image from "next/image";
// import { useState } from "react";

// // TYPES
// interface DispostionCallModalProps {
//     showModal: boolean;
//     onCancleClick: any;
//     phoneNumber?: string;
//     onDialNumberClick?: any;
// }

// /* ============================== Dispostion Cause CALL MODEL ============================== */
// const manualIcon = "/assets/icons/white/call.svg";
// const eyeGray = "/assets/icons/gray/eye.svg";
// const eye = "/assets/icons/eye.svg"

// const DispostionCallModal = (props: DispostionCallModalProps) => {
//     const { showModal, onCancleClick, phoneNumber, onDialNumberClick } = props;
//     const dispatch = useAppDispatch();
//     const [showPassword, setShowPassword] = useState<boolean>(false);
//     // SHOW PASSWORD
//     const onEyeClick = () => setShowPassword(!showPassword);
//     const [number, setNumber] = useState("");
//     const [error, setError] = useState("");

//     const handleChange = (e: any) => {
//         const value = e.target.value;
//         if (value === "12345") {
//             setNumber(value);
//             setError("");
//         } else {
//             setNumber(value);
//             setError("Invalid Pin.");
//         }
//     };
//     return (
//         <>
//             <div
//                 className={`fixed top-0 left-0 right-0 px-4 rounded-lg overflow-x-hidden overflow-y-auto md:inset-0 h-[100%] max-h-full bg-heading bg-opacity-30 ${!showModal && "hidden"
//                     }`}
//                 onClick={() => {
//                     onCancleClick();
//                     dispatch(onShowCallModal("false"));
//                 }}
//             >
//                 <div className="w-full h-full relative flex justify-center">
//                     <div className="fixed 3xl:max-w-[340px] 3xl:max-h-[455px] max-w-[340px] max-h-[400px] right w-full h-full left-[0] top-[0] bottom-[48px] drop-shadow-lg">
//                         <div
//                             className="h-full bg-white rounded-lg"
//                             onClick={(e: any) => e.stopPropagation()}
//                         >
//                             <div className="bg-heading 3xl:px-6 3xl:py-2.5 py-2 px-4 rounded-t-lg relative">
//                                 <div className="flex items-center">
//                                     <div
//                                         className={`w-2.5 h-2.5 rounded-full mr-1.5 bg-heading-yellow2`}
//                                     ></div>
//                                     <span className="3xl:text-base text-sm text-white font-bold ml-1">
//                                         Call Pin Override
//                                     </span>
//                                 </div>
//                             </div>
//                             <div className="bg-layout">
//                                 <div className="grid items-center 3xl:text-sm text-xs">
//                                     <div
//                                         className={`flex items-center cursor-pointer 3xl:px-6 3xl:py-2.5 py-2 border-r border-b-2 border-dark-700`}

//                                     >
//                                         <div className="relative w-[16px] h-[16px] 3xl:w-[18px] 3xl:h-[18px] mr-2">
//                                         </div>
//                                         <label>Lead Status: <b>Right Party Contact</b></label>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="pl-[24px] pt-[12px] text-xs">
//                                 Enter the PIN to bypass the rule group <br /> restrictions for this account.

//                                 <div className="flex pt-[12px] pb-[20px] gap-3">
//                                     <div className="3xl:h-9 3xl:w-9 h-[50px] w-[50px] mb-[12px] bg-secondary-v10 rounded-full flex items-center justify-center"><span className="3xl:text-base text-sm text-heading font-bold">T</span></div>
//                                     <div className="flex flex-col">
//                                         <div className="text-[10px] text-stone-400">Outgoing Call To</div>
//                                         <div className="text-[12px]"><b>Full Name</b></div>
//                                         <div className="text-[12px] opacity-80">{phoneNumber}</div>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="bg-layout mb-4">
//                                 <div className="grid items-center 3xl:text-sm text-xs">
//                                     <div
//                                         className={`flex items-center cursor-pointer 3xl:px-6 3xl:py-2.5 py-3`}

//                                     >
//                                         <div className="relative w-[16px] h-[16px] 3xl:w-[18px] 3xl:h-[18px] mr-2">
//                                         </div>
//                                         <label className="flex flex-1 items-center gap-2 pr-[20px]" style={{ flexWrap: 'wrap' }}>Call Pin:

//                                             <div className="flex flex-1 flex-row items-center relative">

//                                                 <input
//                                                     className={`focus:outline-none border-2 text-xs placeholder:text-txt-secondary rounded-md focus:border-primary 3xl:py-2 py-2 w-full pl-4 pr-8 ${error
//                                                         ? "border-error"
//                                                         : "border-dark-700"
//                                                         }`}
//                                                     name="pin"
//                                                     type={showPassword ? "text" : "password"}
//                                                     placeholder="Enter pin to bypass rules"
//                                                     value={number}
//                                                     onChange={handleChange}
//                                                 />
//                                                 <ToolTipIcon
//                                                     src={showPassword ? eye : eyeGray}
//                                                     className={`absolute right-2.5 items-center text-dark-700`}
//                                                     width={18}
//                                                     height={18}
//                                                     alt="pin"
//                                                     onClick={onEyeClick}
//                                                 />
//                                             </div>
//                                             {error && (
//                                                 <span className="text-error font-normal ms-auto text-[10px] w-[75%]">{error}</span>
//                                             )}
//                                         </label>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="flex gap-2 px-[24px] pt-[32px]">
//                                 <div className="cursor-pointer text-sm relative flex-1 flex items-center justify-center gap-1 rounded-md h-[40px] bg-black text-white" onClick={() => { if (!error && number !== '') { onDialNumberClick('1') } }}>
//                                     <Image
//                                         className={`max-w-[unset]`}
//                                         src={manualIcon}
//                                         alt="manualIcon"
//                                         width={20}
//                                         height={20}
//                                     />
//                                     Dial
//                                 </div>
//                                 <div className="flex cursor-pointer text-sm items-center justify-center flex-1 border-x border-y border-inherit rounded-md h-[40px]" onClick={() => { onCancleClick() }}>Back</div>
//                             </div>

//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default DispostionCallModal;


import { ToolTipIcon } from "@/components/ui-components";
import { useAppDispatch } from "@/redux/hooks";
import { onShowCallModal } from "@/redux/slice/commonSlice";
import Image from "next/image";
import { useState } from "react";

// TYPES
interface DispostionCallModalProps {
    showModal: boolean;
    onCancleClick: any;
    phoneNumber?: string;
    onDialNumberClick?: any;
}

/* ============================== Dispostion Cause CALL MODEL ============================== */
const manualIcon = "/assets/icons/white/call.svg";
const eyeGray = "/assets/icons/gray/eye.svg";
const eye = "/assets/icons/eye.svg"

const DispostionCallModal = (props: DispostionCallModalProps) => {
    const { showModal, onCancleClick, phoneNumber, onDialNumberClick } = props;
    const dispatch = useAppDispatch();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    // SHOW PASSWORD
    const onEyeClick = () => setShowPassword(!showPassword);
    const [number, setNumber] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e: any) => {
        const value = e.target.value;
        if (value === "12345") {
            setNumber(value);
            setError("");
        } else {
            setNumber(value);
            setError("Invalid Pin.");
        }
    };
    return (
        <>
            <div
                className={`fixed top-0 left-0 right-0 px-4 rounded-lg overflow-x-hidden overflow-y-auto md:inset-0 h-[100%] max-h-full bg-heading bg-opacity-30 ${!showModal && "hidden"
                    }`}
                onClick={() => {
                    onCancleClick();
                    dispatch(onShowCallModal("false"));
                }}
            >
                <div className="w-full h-full relative flex justify-center">
                    <div className="fixed 3xl:max-w-[340px] 3xl:max-h-[455px] max-w-[340px] max-h-[400px] right w-full h-full left-[0] top-[0] bottom-[48px] drop-shadow-lg">
                        {/* <div className="fixed 3xl:max-w-[390px] 3xl:max-h-[550px] max-w-[340px] max-h-[590px] right w-full h-full left-[0] top-[0] bottom-[48px] drop-shadow-lg"> */}
                        <div
                            className="h-full bg-white rounded-2xl"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <div className="bg-heading 3xl:px-6 3xl:py-2.5 py-2 px-4 rounded-t-lg relative">
                                <div className="flex items-center">
                                    <div
                                        className={`w-2.5 h-2.5 rounded-full mr-1.5 bg-heading-yellow2`}
                                    ></div>
                                    <span className="3xl:text-base text-sm text-white font-bold ml-1">
                                        Call Pin Override
                                    </span>
                                </div>
                            </div>
                            <div className="bg-layout">
                                <div className="grid items-center 3xl:text-sm text-xs">
                                    <div
                                        className={`flex items-center cursor-pointer 3xl:px-6 3xl:py-2.5 py-2 border-r border-b-2 border-dark-700`}

                                    >
                                        <div className="relative w-[16px] h-[16px] 3xl:w-[18px] 3xl:h-[18px] mr-2">
                                        </div>
                                        <label>Lead Status: <b>Right Party Contact</b></label>
                                    </div>
                                </div>
                            </div>
                            <div className="pl-[24px] pt-[12px] text-xs">
                                Enter the PIN to bypass the rule group <br /> restrictions for this account.

                                <div className="flex pt-[12px] pb-[20px] gap-3">
                                    <div className="3xl:h-9 3xl:w-9 h-[50px] w-[50px] mb-[12px] bg-secondary-v10 rounded-full flex items-center justify-center"><span className="3xl:text-base text-sm text-heading font-bold">T</span></div>
                                    <div className="flex flex-col">
                                        <div className="text-[11px] text-primary-green rounded-xl bg-green-100">Outgoing Call To00000000000000</div>
                                        <div className="text-[14px]">Full Name</div>
                                        <div className="text-[10px] opacity-80">{phoneNumber}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-layout mb-4">
                                <div className="grid items-center 3xl:text-sm text-xs">
                                    <div
                                        className={`flex items-center cursor-pointer 3xl:px-6 3xl:py-2.5 py-3`}

                                    >
                                        <div className="relative w-[16px] h-[16px] 3xl:w-[18px] 3xl:h-[18px] mr-2">
                                        </div>
                                        <label className="flex flex-1 items-center gap-2 pr-[20px]" style={{ flexWrap: 'wrap' }}>Call Pin:

                                            <div className="flex flex-1 flex-row items-center relative">

                                                <input
                                                    className={`focus:outline-none border-2 text-xs placeholder:text-txt-secondary rounded-md focus:border-primary 3xl:py-2 py-2 w-full pl-4 pr-8 ${error
                                                        ? "border-error"
                                                        : "border-dark-700"
                                                        }`}
                                                    name="pin"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter pin to bypass rules"
                                                    value={number}
                                                    onChange={handleChange}
                                                />
                                                <ToolTipIcon
                                                    src={showPassword ? eye : eyeGray}
                                                    className={`absolute right-2.5 items-center text-dark-700`}
                                                    width={18}
                                                    height={18}
                                                    alt="pin"
                                                    onClick={onEyeClick}
                                                />
                                            </div>
                                            {error && (
                                                <span className="text-error font-normal ms-auto text-[10px] w-[75%]">{error}</span>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 px-[24px] pt-[32px]">
                                <div className="cursor-pointer text-sm relative flex-1 flex items-center justify-center gap-1 rounded-md h-[40px] bg-black text-white" onClick={() => { if (!error && number !== '') { onDialNumberClick('1') } }}>
                                    <Image
                                        className={`max-w-[unset]`}
                                        src={manualIcon}
                                        alt="manualIcon"
                                        width={20}
                                        height={20}
                                    />
                                    Dial
                                </div>
                                <div className="flex cursor-pointer text-sm items-center justify-center flex-1 border-x border-y border-inherit rounded-md h-[40px]" onClick={() => { onCancleClick() }}>Back</div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DispostionCallModal;