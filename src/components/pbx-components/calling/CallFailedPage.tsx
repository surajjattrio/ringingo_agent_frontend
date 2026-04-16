// PROJECT IMPORTS
import {
    onAddLeadNoteId,
    onSetAddNoteId,
    setCallScreen,
    setCallerName,
    setCallerNumber,
    useDialType,
} from "@/redux/slice/commonSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Button } from "@/components/forms";
import { useAuth } from "@/contexts/hooks/useAuth";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";

// TYPES
interface CallFailedPageProps {
    callerNumber: string;
    setShowModal: any;
    callType: string;
    callerName: string;
    // setScreen: any;
}

/* ============================== CALL FAILED PAGE ============================== */

const CallFailedPage = (props: CallFailedPageProps) => {
    const {
        callerNumber,
        setShowModal,
        callType,
        callerName,
        // setScreen,
    } = props;

    const dialType = useDialType();
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    return (
        <div className="3xl:h-[90%] h-[92%] 3xl:px-8 px-6 flex flex-col justify-between select-none 3xl:pb-6 pb-4">
            <div className="3xl:py-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="3xl:h-14 3xl:w-14 h-12 w-12 bg-secondary-v10 rounded-full flex items-center justify-center">
                            <span className="3xl:text-base text-sm text-heading font-bold">
                                {callerName
                                    ? callerName.slice(0, 1).toUpperCase()
                                    : callerNumber.slice(0, 1).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex flex-col 3xl:pl-3 pl-1">
                            <span className="3xl:text-xs text-[11px] text-heading">
                                {callType}
                            </span>
                            {callerName ? (
                                <span className="3xl:text-sm text-xs text-heading font-bold">
                                    {callerName}
                                </span>
                            ) : null}
                            <span
                                className={`text-heading ${callerName
                                        ? "3xl:text-xs text-[11px] font-medium"
                                        : "3xl:text-sm text-xs font-bold"
                                    }`}
                            >
                                {callerNumber}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex 3xl:gap-4 gap-2 justify-center items-center">
                <Button
                    className="3xl:py-1.5 3xl:px-4 py-1.5 px-3"
                    text="Cancel"
                    style="dark-outline"
                    onClick={() => {
                        dispatch(setCallerNumber(""));
                        dispatch(setCallerName(""));
                        setShowModal(false);
                        dialType !== "leadDial" && dispatch(setCallScreen(""));
                        if (user?.isPbx) {
                            dispatch(onSetAddNoteId(null));
                            dispatch(onAddLeadNoteId(null));
                            Cookies.remove("callId");
                            dispatch(setCallScreen(""));
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default CallFailedPage;
