/* eslint-disable @next/next/no-img-element */
import { CSSProperties, useEffect, useState } from "react";
import Image from "next/image";

// PROJECT IMPORTS
import Legacy from "next/legacy/image";
import EmojiPicker from "emoji-picker-react";
import ChatPlatformPopup from "@/components/popups/ChatPlatformPopup";
import { Modal } from "@/components/modals";
import { OptionTypes } from "@/types/formTypes";
import {
  getAllLeadList,
  useAllLeadListDetails,
} from "@/redux/slice/leadListSlice";
import { useAppDispatch } from "@/redux/hooks";
import Icon from "@/components/ui-components/Icon";

const emojiHappy = "/assets/icons/white/emoji_happy.svg";
const location = "/assets/icons/white/location.svg";
const attachSquare = "/assets/icons/white/attach_square.svg";
const send = "/assets/icons/white/send.svg";
const transfer = "/assets/icons/gray/transfer.svg";
const arrowDown = "/assets/icons/arrow-down.svg";
const pdfIcon = "/assets/images/pdfIcon.svg";
const imageIcon = "/assets/images/photo.png";

const platformIcons: any = {
  whatsapp: "/assets/icons/blue/whatsapp.svg",
  sms: "/assets/icons/blue/whatsapp.svg",
  email: "/assets/icons/blue/whatsapp.svg",
  chat: "/assets/icons/blue/whatsapp.svg",
};

interface ConversationFooterProps {
  onImagePreview: Function;
  onFilePreview: Function;
  onSubmit: Function;
  selectedPlatform: OptionTypes;
  setSelectedPlatform: Function;
  editMessageId: number;
  conversationData: any;
  newConversation: any;
}

/* ============================== CONVERSATION FOOTER ============================== */

const getImagePreview = (file: any) => {
  const objectUrl = URL.createObjectURL(file);
  return objectUrl;
};

const ConversationFooter = ({
  onSubmit,
  onImagePreview,
  onFilePreview,
  selectedPlatform,
  setSelectedPlatform,
  editMessageId,
  conversationData,
  newConversation,
}: ConversationFooterProps) => {
  const maxFilePreview = 4;
  const dispatch = useAppDispatch();

  const allLeadListDetails = useAllLeadListDetails();
  const [currentMessage, setCurrentMessage] = useState<any>({});
  const [confirmPlatform, setConfirmPlatform] = useState<any>();
  const [isNumberOpen, setIsNumberOpen] = useState<boolean>(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState<boolean>(false);
  const [isEmojiExpanded, setIsEmojiExpanded] = useState<boolean>(true);
  const [showPlatformPopup, setShowPlatformPopup] = useState<boolean>(false);
  const [isFileTypeOpen, setIsFileTypeOpen] = useState<boolean>(false);
  const iconClass =
    "relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px] cursor-pointer";
  const buttonIconClass =
    "relative 3xl:w-[18px] 3xl:h-[18px] w-[14px] h-[14px] cursor-pointer";

  useEffect(() => {
    if (editMessageId !== -1) {
      const currentMessageData = conversationData?.messages?.[editMessageId];
      setCurrentMessage({ ...currentMessageData });
      const messageTextArea = document.getElementById("messageTextArea");
      messageTextArea?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMessageId]);

  useEffect(() => {
    if (newConversation?.channel) {
      onGetLeadList();
    }
  }, [newConversation]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".whatsapp-number-dropdown")) {
        setIsNumberOpen(false);
      }
    };

    if (isNumberOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNumberOpen]);

  // GET LEAD LIST
  const onGetLeadList = async () => {
    try {
      await dispatch(getAllLeadList({ list: "all" })).unwrap();
    } catch (error: any) {
      console.log("Get lead list error ---->", error?.message);
    }
  };

  const onSend = () => {
    if (
      currentMessage?.text ||
      currentMessage?.image_url?.length ||
      currentMessage?.document_url?.length ||
      (newConversation?.channel && currentMessage?.number)
    ) {
      onSubmit({
        text: currentMessage?.text,
        image_url: currentMessage?.image_url,
        document_url: currentMessage?.document_url,
        number: currentMessage?.number,
      });
      setIsEmojiOpen(false);

      // For new conversations, preserve the number but clear other fields
      if (newConversation?.channel && currentMessage?.number) {
        setCurrentMessage({
          number: currentMessage.number,
          text: "",
          image_url: [],
          document_url: [],
        });
      } else {
        setCurrentMessage(undefined);
      }
    }
  };

  const onKeyDown = (e: any) => {
    if (e.code === "Enter" && currentMessage?.text) {
      onSend();
    }
  };

  const onFileSelected = (e: any) => {
    if (e?.target?.files) {
      const allFiles = e?.target?.files;
      console.log("allfiles", allFiles);
      
      let images = [];
      let documnets = [];
      for (let index = 0; index < allFiles.length; index++) {
        if (
          allFiles[index].type === "image/png" ||
          allFiles[index].type === "image/jpg" ||
          allFiles[index].type === "image/webp" ||
          allFiles[index].type === "image/jpeg"
        ) {
          images.push(allFiles[index]);
        } else if (allFiles[index].type === "application/pdf") {
          documnets.push(allFiles[index]);
        }
      }
      const image_url: any = currentMessage?.image_url
        ? currentMessage?.image_url
        : [];
      const document_url: any = currentMessage?.document_url
        ? currentMessage?.document_url
        : [];
      setCurrentMessage({
        ...currentMessage,
        image_url: [...image_url, ...images],
        document_url: [...document_url, ...documnets],
      });
    }
  };
      // console.log("currentMessagecurrentMessagecurrentMessage",currentMessage,URL.createObjectURL(currentMessage?.image_url&&currentMessage?.image_url[0]));

  const onPhotoInput = () => {
    setCurrentMessage({ ...currentMessage, document_url: [] });
    document.getElementById("selectImage")?.click();
    setIsFileTypeOpen(false);
  };

  const onFileInput = () => {
    setCurrentMessage({ ...currentMessage, image_url: [] });
    document.getElementById("selectFile")?.click();
    setIsFileTypeOpen(false);
  };

  const onEmojiOpen = () => {
    setIsEmojiOpen(!isEmojiOpen);
  };

  const renderImageShadow = (index: number) => {
    return (
      <>
        {currentMessage?.image_url &&
        currentMessage?.image_url?.length > maxFilePreview &&
        index === maxFilePreview - 1 ? (
          <div className="bg-[#00000060] absolute top-0 left-0 w-full h-full z-1 flex justify-center items-center text-[12px] text-white rounded">
            +{currentMessage?.image_url.length - maxFilePreview}
          </div>
        ) : (
          <></>
        )}
      </>
    );
  };

  const renderFileSelected = () => {
    return (
      <>
        {currentMessage?.document_url?.length ||
        currentMessage?.image_url?.length ? (
          <div className="flex item-center">
            {currentMessage?.document_url?.map((file: any, index: number) => {
              return (
                <div
                  key={index}
                  className="relative m-1 cursor-pointer w-[40px] h-[40px] text-[7px] text-white flex items-center justify-center"
                  onClick={() =>
                    onFilePreview(currentMessage?.document_url, index)
                  }
                >
                  <Legacy src={pdfIcon} alt="pdf" height={40} width={40} />
                </div>
              );
            })}
            {currentMessage?.image_url?.map((file: any, index: number) => {
              console.log("filefileeeee",getImagePreview(file));
              
              if (index < maxFilePreview) {
                return (
                  <div
                    key={index}
                    className="relative m-1 cursor-pointer"
                    onClick={() =>
                      onImagePreview(currentMessage?.image_url, index)
                    }
                  >
                    <img
                      className="w-[40px] h-[40px] object-cover rounded"
                      src={getImagePreview(file)}
                      alt="img"
                    />
                    {renderImageShadow(index)}
                  </div>
                );
              } else {
                return <></>;
              }
            })}
          </div>
        ) : (
          <></>
        )}
      </>
    );
  };

  const renderFileInput = () => {
    return (
      <>
        <input
          id="selectFile"
          hidden
          type="file"
          onChange={onFileSelected}
          accept="application/pdf"
          multiple
        />
        <input
          id="selectImage"
          hidden
          type="file"
          onChange={onFileSelected}
          accept="image/*"
          multiple
        />
      </>
    );
  };

  const handleTransformDataTransferIntoURL = (dataTransfer: DataTransfer) => {
    const fileList: any = [];
    for (let index = 0; index < dataTransfer?.files?.length; index++) {
      const file: any = dataTransfer.files?.[index];
      if (file) fileList.push(file);
    }
    if (fileList?.length) {
      onFileSelected({ target: { files: fileList } });
    }
  };

  const renderTextArea = () => {
    return (
      <textarea
        id="messageTextArea"
        className={`5xl:text-[16px] 4xl:text-[15px] text-[13px] w-full ${
          currentMessage?.image_url?.length ||
          currentMessage?.document_url?.length
            ? "h-[3vh]"
            : "h-[11vh]"
        } outline-none border-none`}
        value={currentMessage?.text ? currentMessage?.text : ""}
        placeholder="Type your message here..."
        onChange={(e) => {
          setCurrentMessage({ ...currentMessage, text: e.target.value });
        }}
        onKeyDown={onKeyDown}
        onFocus={() => {
          setIsEmojiOpen(false);
        }}
        onPaste={async (e: any) => {
          const event = e as ClipboardEvent;
          if (event.clipboardData) {
            handleTransformDataTransferIntoURL(event.clipboardData);
          }
        }}
      />
    );
  };

  const onEmojiClick = (e: any) => {
    const text = (currentMessage?.text ?? "") + e.emoji;
    setCurrentMessage({
      ...currentMessage,
      text,
    });
    setIsEmojiOpen(false);
  };

  const renderFileInputTypes = () => {
    if (isFileTypeOpen) {
      return (
        <div className="absolute bottom-[25px] right-0 bg-white rounded-lg py-2 pl-[5px] pr-[15px] drop-shadow-xl">
          <div
            className="flex items-center p-1 cursor-pointer"
            onClick={onPhotoInput}
          >
            <Icon name={"ImageIcon"} alt="pdf" height={16} width={16} />
            <div className="5xl:text-[14px] 4xl:text-[12px] text-[10px] px-2">
              Image
            </div>
          </div>
          <div
            className="flex items-center p-1 cursor-pointer"
            onClick={onFileInput}
          >
            <Image src={pdfIcon} alt="pdf" height={16} width={16} />
            <div className="5xl:text-[14px] 4xl:text-[12px] text-[10px] px-2">
              Document
            </div>
          </div>
        </div>
      );
    }
  };

  const renderChatFooterIcons = () => {
    return (
      <div className="flex items-center justify-end gap-2">
        <div
          style={pointerNoneStyle()}
          className={iconClass}
          onClick={onEmojiOpen}
        >
          <Legacy src={emojiHappy} alt="emojiHappy" layout="fill" />
        </div>
        <div style={pointerNoneStyle()} className={iconClass}>
          <Legacy src={location} alt="location" layout="fill" />
        </div>
        <div style={pointerNoneStyle()} className={iconClass}>
          <Legacy
            src={attachSquare}
            alt="attachSquare"
            layout="fill"
            onClick={() => setIsFileTypeOpen(!isFileTypeOpen)}
          />
          {renderFileInputTypes()}
        </div>
        <div className={iconClass} onClick={onSend}>
          <Legacy src={send} alt="send" layout="fill" />
        </div>
      </div>
    );
  };

  const renderChatPlatform = () => {
    return (
      <div style={pointerNoneStyle()} className="relative">
        <div
          className="flex items-center justify-between w-[110px] rounded-lg border-[1.5px] border-[#D8D8D8] gap-1 py-1 px-1.5 text-[11px] cursor-pointer"
          // onClick={() => setShowPlatformPopup(!showPlatformPopup)}
        >
          <div className="flex items-center">
            <div className={buttonIconClass}>
              <Legacy
                src={platformIcons[selectedPlatform?.value]}
                alt={selectedPlatform?.label}
                layout="fill"
              />
            </div>
            <div className="text-[12px] px-1">{selectedPlatform?.label}</div>
            <div className={`${buttonIconClass} rotate-90 pl-1`}>
              <Legacy src={transfer} alt="transfer" layout="fill" />
            </div>
          </div>
        </div>
        <ChatPlatformPopup
          platformIcons={platformIcons}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={(platform: any) => {
            setConfirmPlatform(platform);
          }}
          visible={showPlatformPopup}
          onCancleClick={() => setShowPlatformPopup(false)}
        />
        <Modal
          visible={confirmPlatform}
          title="Change Conversion Type"
          doneText="Switch Type"
          onCancleClick={() => {
            setConfirmPlatform(undefined);
          }}
          onDoneClick={() => {
            setSelectedPlatform(confirmPlatform);
            setConfirmPlatform(undefined);
          }}
          contentClassName="max-w-[460px] top-[calc(50%-110px)]"
        >
          <div className="3xl:text-sm text-xs text-txt-secondary p-2 text-center">
            {`Are you sure you want to change conversion type from “${selectedPlatform?.label}” to ${confirmPlatform?.label} ?`}
          </div>
        </Modal>
      </div>
    );
  };

  const pointerNoneStyle = (): CSSProperties => {
    if (newConversation?.channel) return { pointerEvents: "none" };
    return {};
  };

  const renderAllLeadDetails = () => {
    if (
      isNumberOpen &&
      currentMessage?.number &&
      allLeadListDetails &&
      allLeadListDetails?.data?.length
    ) {
      const filteredLeadDetails = currentMessage.number
        ? allLeadListDetails?.data?.filter((leadDetails: any) =>
            leadDetails?.custom_phone_number?.includes(currentMessage.number)
          )
        : allLeadListDetails?.data;
      if (filteredLeadDetails?.length) {
        return (
          <div className="w-full absolute top-[32px] left-0 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-[200px] overflow-auto">
              <div className="py-1">
                {filteredLeadDetails?.map((leadDetails: any, index: number) => {
                  if (leadDetails.custom_phone_number)
                    return (
                      <div
                        className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        key={index}
                        onClick={() => {
                          setCurrentMessage({
                            ...currentMessage,
                            number: leadDetails.custom_phone_number,
                          });
                          setIsNumberOpen(false);
                        }}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {leadDetails.custom_phone_number}
                            </p>
                            <p className="text-xs text-gray-500">
                              WhatsApp Number
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  return null;
                })}
              </div>
              {filteredLeadDetails?.length > 5 && (
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Showing {Math.min(filteredLeadDetails.length, 5)} of{" "}
                    {filteredLeadDetails.length} numbers
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }
    }
  };

  const renderStartNewConversationInput = () => {
    if (newConversation?.channel) {
      return (
        <div className="w-full absolute left-0 top-[-32px]">
          <div className="relative whatsapp-number-dropdown">
            <div className="flex items-center w-full bg-white rounded-lg border border-gray-300 shadow-sm focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
              <div className="flex-shrink-0 pl-3">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <input
                  className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-transparent border-0 outline-none focus:ring-0"
                  name="number"
                  value={currentMessage?.number || ""}
                  placeholder="Enter WhatsApp Number..."
                  onChange={(e: any) => {
                    const value = e.target.value;
                    setCurrentMessage({
                      ...currentMessage,
                      number: value,
                    });
                    setIsNumberOpen(value.length > 0);
                  }}
                />
              </div>
              {currentMessage?.number && (
                <div className="flex-shrink-0 pr-3">
                  <button
                    onClick={() => {
                      setCurrentMessage({
                        ...currentMessage,
                        number: "",
                      });
                      setIsNumberOpen(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {renderAllLeadDetails()}
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className={`border-t border-dark-800 bg-white h-[19.2vh] p-2 relative message-footer ${
        !isEmojiExpanded ? "message-emoji-collapse" : ""
      }`}
    >
      <EmojiPicker
        previewConfig={{ showPreview: false }}
        open={isEmojiOpen}
        onEmojiClick={onEmojiClick}
      />
      {isEmojiOpen ? (
        <>
          <div className="absolute message-expand-icon right-[15px] top-[-35px]">
            <div
              className={iconClass}
              onClick={() => setIsEmojiExpanded(!isEmojiExpanded)}
            >
              <Legacy src={arrowDown} alt="expand" layout="fill" />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      {renderStartNewConversationInput()}
      <div>
        {renderFileSelected()}
        {renderFileInput()}
        {renderTextArea()}
      </div>
      <div className="flex justify-between items-center h-[4vh]">
        {/* {renderChatPlatform()} */}
        <div></div>
        {renderChatFooterIcons()}
      </div>
    </div>
  );
};

export default ConversationFooter;
