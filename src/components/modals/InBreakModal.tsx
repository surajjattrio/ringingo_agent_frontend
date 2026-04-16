// PROJECT IMPORTS
import Legacy from "next/legacy/image";
import Button from "../forms/Button";

// TYPES
interface InBreakModalProps {
  exitClassName?: string;
  exitStyle?: string;
  title?: string;
  content?: string;
  exitText?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
  visible: boolean;
  onExitClick?: any;
}

const breakIcon = "/assets/icons/gray/break.svg";

/* ============================== IN BREAK MODEL ============================== */

const InBreakModal = (props: InBreakModalProps) => {
  const {
    exitClassName = "",
    exitStyle = "primary",
    title,
    content,
    exitText = "Exit",
    children,
    visible = false,
    onExitClick,
  } = props;

  return (
    <>
      <div
        id="popup-ConfirmationModal"
        tabIndex={-1}
        className={`fixed top-0 left-0 right-0 z-[50] px-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[100%] max-h-full bg-black bg-opacity-80 ${
          !visible && "hidden"
        }`}
      >
        <div className="w-full h-full relative flex justify-center">
          <div className="absolute max-w-[280px] top-[calc(50%-150px)] w-full max-h-full">
            <div
              className="bg-white rounded-lg shadow"
              onClick={(e: any) => e.stopPropagation()}
            >
              <div className="flex items-start drop-shadow bg-white rounded-t-lg">
                <div className="pl-4 py-2 w-full bg-[#EDEDED] rounded-t-lg">
                  <p className="font-bold text-sm">{title}</p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative 3xl:w-[2000px] 3xl:h-[180px] w-[160px] h-[140px] pt-[20px]">
                  <Legacy src={breakIcon} alt="break" layout="fill" />
                </div>
                <div className="w-full">
                  {children ? (
                    children
                  ) : (
                    <p
                      className={`mb-[10px] mt-[5px] font-bold text-xl text-center ${
                        content?.includes("-")
                          ? "text-[#FF0000]"
                          : "text-[#008000]"
                      }`}
                    >
                      {content}
                    </p>
                  )}
                </div>
                <div className="py-4 w-full flex items-center justify-center border-t-2 border-dark-700">
                  <div className="flex gap-4">
                    <Button
                      className={`${exitClassName} px-4 py-2`}
                      text={exitText}
                      style={exitStyle}
                      onClick={onExitClick}
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

export default InBreakModal;
