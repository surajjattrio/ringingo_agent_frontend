// PROJECT IMPORTS
import { Button } from "../forms";
import Legacy from "next/legacy/image";
import Image from "next/image";
import Icon from "../ui-components/Icon";

// TYPES
interface ModalProps {
  title?: string;
  content?: string;
  doneText?: string;
  cancelText?: string;
  children?: React.ReactNode;
  visible: boolean;
  onCancleClick?: any;
  onDoneClick?: any;
  isLoading?: boolean;
  form?: string;
  type?: "submit" | "button" | "reset" | undefined;
  extraButton?: any;
  contentClassName?: string;
}

// ASSETS
const closeIcon = "/assets/icons/close.svg";
const followUpImage = "/assets/images/FeaturedIcon.png";

/* ============================== DELETE MODEL ============================== */

const Modal = (props: ModalProps) => {
  const {
    title,
    content,
    doneText = "Done",
    cancelText = "Cancel",
    children,
    visible = false,
    isLoading = false,
    onCancleClick,
    onDoneClick,
    form,
    type = "button",
    extraButton,
    contentClassName,
  } = props;

  return (
    <>
      <div
        id="popup-modal"
        tabIndex={-1}
        className={`fixed top-0 left-0 right-0 z-[100] px-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[100%] max-h-full bg-black bg-opacity-40 ${
          !visible && "hidden"
        }`}
        onClick={onCancleClick}
      >
        <div className="w-full h-full relative flex justify-center">
          <div
            className={`absolute w-full max-h-full ${
              contentClassName ? contentClassName : "max-w-[650px] top-[80px]"
            }`}
          >
            <div
              className="bg-white rounded-[35px] shadow"
              onClick={(e: any) => e.stopPropagation()}
            >
              {/* Close button */}
              <div
                className="absolute top-4 right-4 cursor-pointer"
                onClick={onCancleClick}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {/* Follow up popup top icon and title */}
              {/* <div className="flex items-start drop-shadow bg-white rounded-[35px]">
                <div className="pl-4 py-2 w-full bg-dark-800 rounded-[200px] flex justify-between">
                  <div>
                    <p className="font-bold text-sm">{title}</p>
                  </div>
                  <div className="h-[5px] w-[5px] 3xl:w-[16px] 3xl:h-[16px] cursor-pointer ">
                    <Legacy
                      src={closeIcon}
                      alt="close"
                      layout="fill"
                      onClick={onCancleClick}
                    />
                  </div>
                </div>
              </div> */}
              <div className="pt-[20px] flex flex-col items-center justify-center">
                <Icon
                  name={"FollowUpImage"}
                  alt="Followup"
                  width={48}
                  height={48}
                  //priority
                  className="object-contain"
                />
                <p className="font-bold text-sm mt-[4px]">{title}</p>
                <p className="font-normal text-[10px] mt-[3px] leading-[150%] tracking-[0.01em] font-inter">
                  Tell us more about you
                </p>
              </div>
              {/* Follow up popup content */}
              <div className="w-full px-[10px]">
                {children ? (
                  children
                ) : (
                  <p className="mb-10 text-lg font-normal text-txt-primary px-4">
                    {content}
                  </p>
                )}
              </div>
              {/* Follow up popup button */}
              <div className="pb-[20px] w-full flex items-center justify-center border-dark-700 px-6">
                <div className="flex items-center gap-5">
                  {/* <Button
                                        className="py-2.5 px-6 hover:bg-gray-100 transition-all duration-200 font-medium"
                                        text={cancelText}
                                        style="dark-outline"
                                        onClick={onCancleClick}
                                    /> */}
                  <div className="">
                    <Button
                      icon="SaveBtn"
                      type={type}
                      form={form}
                      isLoading={isLoading}
                      disabled={isLoading}
                      className="py-2.5 px-4 text-center gap-[2px] hover:opacity-90 transition-all duration-200 font-medium"
                      text={doneText}
                      style="save"
                      onClick={onDoneClick}
                    />
                  </div>
                  {extraButton?.flag == true && (
                    <Button
                      icon="DoneBtn"
                      type={type}
                      form={extraButton.form}
                      isLoading={extraButton?.loading}
                      disabled={extraButton?.loading}
                      className="py-2.5 px-4 hover:opacity-90 transition-all duration-200 font-medium"
                      text={extraButton.buttonText}
                      style={extraButton.style}
                      onClick={extraButton.onClick}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
