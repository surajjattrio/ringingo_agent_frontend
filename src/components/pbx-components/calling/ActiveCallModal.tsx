import Legacy from "next/legacy/image";

// ASSETS
const call_end = "/assets/icons/white/call_end.svg";

// TYPES
interface ActiveCallModalProps {
    showActiveModal: boolean;
    hangupCall: any;
    seconds: number;
    minutes: number;
    setShowModal: any;
    setShowActiveModal: any;
}

/* ============================== ACTIVE CALL MODEL ============================== */

const ActiveCallModal = (props: ActiveCallModalProps) => {
    const {
        showActiveModal,
        hangupCall,
        seconds,
        minutes,
        setShowModal,
        setShowActiveModal,
    } = props;

    return (
        <>
            <div
                className={`fixed top-0 left-0 right-0 z-50 px-4 overflow-x-hidden overflow-y-auto md:inset-0 bg-transparent ${!showActiveModal && "hidden"
                    }`}
            >
                <div className="w-full h-full relative flex justify-center">
                    <div className="fixed max-w-[400px] rounded-lg w-full max-h-full right-[43px] bottom-[48px]">
                        <div
                            className="3xl:w-[190px] w-[160px] bg-primary-green rounded-lg flex items-center justify-between 3xl:py-3 3xl:px-4 py-1.5 px-3 absolute 3xl:-right-3 right-[-14px] bottom-[35px] 3xl:bottom-[42px] cursor-pointer"
                            onClick={() => {
                                setShowModal(true);
                                setShowActiveModal(false);
                            }}
                        >
                            <div className="text-white">
                                <span className="3xl:text-sm text-xs font-bold">Active Call</span>
                            </div>
                            <div className="flex 3xl:gap-2 gap-1 items-center ">
                                <>
                                    <div className="3xl:h-3 3xl:w-3 w-2 h-2 bg-error rounded-full"></div>
                                    <span className="3xl:text-sm text-xs text-white">
                                        {minutes < 10 ? `0${minutes}` : minutes} :{" "}
                                        {seconds < 10 ? `0${seconds}` : seconds}
                                    </span>
                                </>
                            </div>
                        </div>
                        <div
                            className="absolute bg-error 3xl:h-14 3xl:w-14 w-12 h-12 flex justify-center items-center rounded-full drop-shadow-lg cursor-pointer -right-4 -bottom-4"
                            onClick={() => {
                                hangupCall();
                            }}
                        >
                            <div className="relative w-[18px] h-[18px] 3xl:w-[24px] 3xl:h-[24px]">
                                <Legacy src={call_end} alt="call_end" layout="fill" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ActiveCallModal;
