// PROJECT IMPORTS
import CreateLead from "@/components/pbx-components/phone/CreateLead";

// TYPES
interface LeadEditModalProps {
    visible: boolean;
    onCancleClick: any;
    editData: any;
}

/* ============================== LEAD INFORMATION EDIT MODAL ============================== */

const LeadEditModal = (props: LeadEditModalProps) => {
    const { visible, onCancleClick, editData } = props;
    return (
        <>
            <div
                id="popup-modal"
                tabIndex={-1}
                className={`fixed top-0 left-0 right-0 z-[60] px-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[100%] max-h-full bg-black bg-opacity-40 ${!visible && "hidden"
                    }`}
                onClick={onCancleClick}
            >
                <div className="w-full h-full relative flex justify-center">
                    <div style={{maxWidth:"600px"}} className="absolute max-w-[320px] 3xl:max-w-[360px] top-[60px] 3xl:top-[75px] right-0 w-full max-h-full">
                        <div
                            className="bg-white rounded-lg shadow"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <CreateLead
                                leadEdit={visible}
                                setEditLead={onCancleClick}
                                setIsCreateLead={onCancleClick}
                                editData={editData}
                                setEditData={onCancleClick}
                                fromCallCenter
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeadEditModal;
