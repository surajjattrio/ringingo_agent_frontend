import Legacy from "next/legacy/image";
import Image from "next/image";

// PROJECT IMPORT
import { useAppDispatch } from "@/redux/hooks";
import { setCallScreen } from "@/redux/slice/commonSlice";

// ASSETS
const send = "/assets/icons/send.svg";
const call_end = "/assets/icons/white/call_end.svg";
const call = "/assets/icons/white/call_white.svg";

// TYPES
interface IncomingCallModalProps {
    showIncomingModal: boolean;
    setShowIncomingModal: any;
    // setScreen: any;
    hangupCall: any;
    receiveCall: any;
    setShowModal: any;
    callerNumber: string;
    callerName: string;
}

/* ============================== INCOMING CALL MODEL ============================== */

const IncomingCallModal = (props: IncomingCallModalProps) => {
    const {
        showIncomingModal,
        setShowIncomingModal,
        // setScreen,
        hangupCall,
        receiveCall,
        setShowModal,
        callerNumber,
        callerName,
    } = props;

    const dispatch = useAppDispatch();

    return (
        <>
            <div
                className={`fixed top-0 bg-red-500 left-0 right-0 z-50 px-4 overflow-x-hidden overflow-y-auto md:inset-0 bg-transparent ${!showIncomingModal && "hidden"
                    }`}
            >
                <div className="w-full h-full relative flex justify-center">
                    <div className="fixed max-w-[400px] rounded-lg w-full max-h-full right-[43px] bottom-[48px]">
                        <div
                            className="3xl:w-[290px] w-[230px] bg-green-200 rounded-xl flex items-center justify-between 3xl:py-3 3xl:px-4 py-2 px-3 absolute -right-3 3xl:bottom-[42px] bottom-[35px]"
                        >
                            <div className="flex flex-col text-primary-green">
                                <span className="3xl:text-sm text-xs">Incoming Call From</span>
                                {callerName ? (
                                    <span className="3xl:text-sm text-xs font-bold w-[90%] overflow-hidden whitespace-nowrap text-ellipsis">
                                        {callerName}
                                    </span>
                                ) : null}
                                <span
                                    className={`${callerName
                                        ? "3xl:text-xs text-[11px] font-medium"
                                        : "3xl:text-sm text-xs font-bold"
                                        }`}
                                >
                                    {callerNumber}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <div
                                    className="bg-error 3xl:w-8 3xl:h-8 w-6 h-6 drop-shadow-sm flex justify-center items-center rounded-full hover:bg-opacity-80 cursor-pointer"
                                    onClick={() => {
                                        hangupCall();
                                    }}
                                >
                                    <Image src={call_end} alt="call_end" height={14} width={14} />
                                </div>
                                <div
                                    className="bg-primary-green 3xl:w-8 3xl:h-8 w-6 h-6 drop-shadow-sm flex justify-center items-center rounded-full hover:bg-opacity-80 cursor-pointer"
                                    onClick={() => {
                                        receiveCall();
                                    }}
                                >
                                    <Image src={call} alt="call" height={14} width={14} />
                                </div>
                            </div>
                        </div>
                        <div
                            className="absolute bg-white 3xl:h-14 3xl:w-14 w-12 h-12 flex justify-center items-center rounded-full drop-shadow-lg cursor-pointer -right-4 -bottom-4"
                            onClick={() => {
                                setShowIncomingModal(false);
                                dispatch(setCallScreen("INCOMING"));
                                setShowModal(true);
                            }}
                        >
                            <div className="relative w-[18px] h-[18px] 3xl:w-[24px] 3xl:h-[24px]">
                                <Legacy src={send} alt="send" layout="fill" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default IncomingCallModal;
