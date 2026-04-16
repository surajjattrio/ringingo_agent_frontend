// PROJECT IMPORTS
import Button from "../forms/Button";

// TYPES
interface ConfirmationModalProps {
    doneClassName?:string;
    cancelClassName?:string;
    doneStyle?:string;
    cancelStyle?:string;
    title?: string;
    content?: string;
    doneText?: string;
    cancelText?: string;
    isLoading?:boolean;
    children?: React.ReactNode;
    visible: boolean;
    onCancleClick?: any;
    onDoneClick?: any;
}

/* ============================== MODEL ============================== */

const ConfirmationModal = (props: ConfirmationModalProps) => {
    const {
        doneClassName = '',
        cancelClassName = '',
        doneStyle = "primary",
        cancelStyle = "dark-outline",
        title,
        content,
        doneText = "Done",
        cancelText = "Cancel",
        isLoading = false,
        children,
        visible = false,
        onCancleClick,
        onDoneClick,
    } = props;

    return (
        <>
            <div
                id="popup-ConfirmationModal"
                tabIndex={-1}
                className={`fixed top-0 left-0 right-0 z-[60] px-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[100%] max-h-full bg-black bg-opacity-40 ${!visible && "hidden"
                    }`}
                onClick={onCancleClick}
            >
                <div className="w-full h-full relative flex justify-center">
                    <div className="absolute max-w-[650px] top-[calc(50%-88px)] w-full max-h-full">
                        <div
                            className="bg-white rounded-lg shadow"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <div className="pt-7 flex flex-col items-start">
                                <div className="pl-7">
                                    <p className="font-bold text-sm pb-2">
                                        {title}
                                    </p>
                                    {children ? (
                                        children
                                    ) : (
                                        <p className="mb-10 text-xs font-normal text-txt-primary">
                                            {content}
                                        </p>
                                    )}
                                </div>
                                <div className="py-5 w-full flex items-center justify-end border-t-2 border-dark-700 pr-10">
                                    <div className="flex gap-4">
                                        <Button
                                            className={`${cancelClassName} px-4 py-2`}
                                            text={cancelText}
                                            style={cancelStyle}
                                            onClick={onCancleClick}
                                        />
                                        <Button
                                            isLoading={isLoading}
                                            disabled={isLoading}
                                            className={`${doneClassName} px-4 py-2`}
                                            text={doneText}
                                            style={doneStyle}
                                            onClick={onDoneClick}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmationModal;
