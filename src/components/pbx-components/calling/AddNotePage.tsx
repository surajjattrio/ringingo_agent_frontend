import { useState } from "react";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { createNewNote } from "@/redux/slice/noteSlice";
import {
    onAddLeadNoteId,
    onSetAddNoteId,
    setCallScreen,
    setCallerName,
    setCallerNumber,
    useAddLeadNoteId,
    useAddNoteId,
} from "@/redux/slice/commonSlice";
import { Button, Textarea } from "@/components/forms";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";

// TYPES
interface AddNotePageProps {
    // setScreen: any;
    addNoteSeconds: number;
    addNoteMinutes: number;
    setAddNoteSeconds: any;
    setAddNoteMinutes: any;
    addNoteShowCallDuration: any;
    setAddNoteShowCallDuration: any;
    callerNumber: string;
    setSuccessMessage: any;
    setErrorMessage: any;
    setShowModal: any;
    callType: string;
    callerName: string;
}

/* ============================== ADD NOTE PAGE ============================== */

const AddNotePage = (props: AddNotePageProps) => {
    const {
        // setScreen,
        addNoteSeconds,
        addNoteMinutes,
        setAddNoteSeconds,
        setAddNoteMinutes,
        addNoteShowCallDuration,
        setAddNoteShowCallDuration,
        callerNumber,
        setSuccessMessage,
        setErrorMessage,
        setShowModal,
        callType,
        callerName,
    } = props;

    const dispatch = useAppDispatch();
    const addNoteId = useAddNoteId();
    const addLeadNoteId = useAddLeadNoteId();
    const [comment, setComment] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // ON SUBMIT NOTE
    const onSubmit = async () => {
        setIsLoading(true);
        try {
            if (comment === "") {
                setErrorMessage("Please enter note");
                setIsLoading(false);
                return;
            }
            const payloaad = {
                comment: comment,
                lead_uuid: addLeadNoteId ? addLeadNoteId : "",
                cdrs_uuid: addNoteId ? addNoteId : "",
            };
            const res: any = await dispatch(createNewNote(payloaad)).unwrap();
            if (res) {
                setSuccessMessage(res?.data);
                setTimeout(() => {
                    setIsLoading(false);
                    setComment("");
                    dispatch(setCallScreen(""));
                    Cookies.remove("Screen");
                    setAddNoteSeconds(0);
                    setAddNoteMinutes(0);
                    setAddNoteShowCallDuration(false);
                    dispatch(setCallerNumber(""));
                    dispatch(setCallerName(""));
                    dispatch(onSetAddNoteId(null));
                    dispatch(onAddLeadNoteId(null));
                    Cookies.remove("callId");
                    Cookies.set("is_call_start", "1");
                    setShowModal(false);
                }, 1500);
            }
        } catch (error: any) {
            setIsLoading(false);
            console.log("create note err --->", error?.message);
        }
    };

    return (
        <>
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
                        <div className="flex flex-col">
                            {addNoteShowCallDuration && (
                                <>
                                    <span className="3xl:text-xs text-[11px] text-heading">
                                        Established
                                    </span>
                                    <span className="3xl:text-sm text-xs text-heading font-bold">
                                        {addNoteMinutes < 10
                                            ? `0${addNoteMinutes}`
                                            : addNoteMinutes}{" "}
                                        :{" "}
                                        {addNoteSeconds < 10
                                            ? `0${addNoteSeconds}`
                                            : addNoteSeconds}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="pt-2">
                        <div>
                            <Textarea
                                className="!px-2"
                                label="Add Note"
                                name="addNote"
                                placeholder="Type something here..."
                                rows={6}
                                value={comment}
                                onChange={(e: any) => {
                                    setComment(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex 3xl:gap-4 gap-2 justify-center items-center">
                    <Button
                        disabled={isLoading}
                        isLoading={isLoading}
                        loaderClass="!border-primary !border-t-transparent"
                        className="3xl:py-1.5 3xl:px-4 py-1.5 px-3"
                        text="Submit"
                        style="primary-outline-text"
                        onClick={() => {
                            onSubmit();
                        }}
                    />
                    <Button
                        className="3xl:py-1.5 3xl:px-4 py-1.5 px-3"
                        text="Cancel"
                        style="dark-outline"
                        onClick={() => {
                            dispatch(setCallScreen(""));
                            setAddNoteSeconds(0);
                            setAddNoteMinutes(0);
                            setAddNoteShowCallDuration(false);
                            dispatch(setCallerNumber(""));
                            dispatch(setCallerName(""));
                            dispatch(onSetAddNoteId(null));
                            dispatch(onAddLeadNoteId(null));
                            Cookies.remove("callId");
                            Cookies.set("is_call_start", "1");
                            setComment("");
                            setShowModal(false);
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default AddNotePage;
