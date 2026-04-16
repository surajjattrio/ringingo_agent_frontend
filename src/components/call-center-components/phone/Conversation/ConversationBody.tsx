/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import Image from "next/image";

// PROJECT IMPORTS
import Legacy from "next/legacy/image";
import { Carousel } from "react-responsive-carousel";
import { Modal } from "@/components/modals";
import { format } from "date-fns";
import { Loader } from "@/components/ui-components";
import { useAuth } from "@/contexts/hooks/useAuth";
import { downloadFile, getValidTime } from "@/components/helperFunctions";
import { useSingleChatLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";

const closeCircle = "/assets/icons/gray/close_circle.svg";
const downloadDocument = "/assets/icons/gray/document_download.svg";
const deleteIcon = "/assets/icons/gray/trash.svg";
const replyIcon = "/assets/icons/gray/reply.svg";
const editIcon = "/assets/icons/gray/edit.svg";
const pdfIcon = "/assets/images/pdfIcon.svg";
const sentIcon = "/assets/icons/blue/single-tic.svg";
const deliveredIcon = "/assets/icons/blue/double-tic.svg";
const readIcon = "/assets/icons/blue/read-tic.svg";
const timerIcon = "/assets/icons/clock.svg";

interface ConversationBodyProps {
  conversationData: any;
  setConversationData: Function;
  onImagePreview: Function;
  onFilePreview: Function;
  selectedItem: number;
  setSelectedItem: Function;
  previewFiles: any[];
  previewImages: any[];
  closeImagePreview: Function;
  closeFilePreview: Function;
  setReplyMessageId: Function;
  editMessageId: number;
  setEditMessageId: Function;
  isLoading: boolean;
  chatHistoryList: any[];
}

/* ============================== CONVERSATION BODY ============================== */

const getImagePreview = (file: any) => {
  if (typeof file === "string") {
    return file;
  }
  const objectUrl = URL.createObjectURL(file);
  return objectUrl;
};

const ConversationBody = ({
  conversationData,
  setConversationData,
  onImagePreview,
  onFilePreview,
  selectedItem,
  setSelectedItem,
  previewFiles,
  previewImages,
  closeImagePreview,
  closeFilePreview,
  setReplyMessageId,
  editMessageId,
  setEditMessageId,
  isLoading,
  chatHistoryList,
}: ConversationBodyProps) => {
  console.log(conversationData, "chatHistoryList");
  const { user } = useAuth();
  const [deleteMessageId, setDeleteMessageId] = useState<number>(-1);
  const singleChatLeadDetails = useSingleChatLeadDetails();
  const previewIconClassName =
    "relative 5xl:w-[28px] 4xl:w-[24px] 5xl:h-[28px] 4xl:h-[24px] 3xl:w-[20px] 3xl:h-[20px] w-[20px] h-[20px] cursor-pointer z-[99]";

  const msgIconClassName =
    "relative 5xl:w-[26px] 4xl:w-[22px] 5xl:h-[26px] 4xl:h-[22px] 3xl:w-[18px] 3xl:h-[18px] w-[16px] h-[16px] cursor-pointer";

  const renderImagePreview = () => {
    return (
      <div className="relative">
        <Carousel
          showArrows={true}
          showStatus={false}
          transitionTime={700}
          selectedItem={selectedItem}
          showIndicators={false}
          onChange={(newIndex: number) => setSelectedItem(newIndex)}
        >
          {previewImages?.map((file: any, index: number) => {
            return (
              <div key={index} className="image-slider">
                <img
                  className="object-cover rounded"
                  src={getImagePreview(file)}
                  alt="img"
                />
              </div>
            );
          })}
        </Carousel>
        <div className="absolute top-0 right-2.5 flex flex-col items-center gap-2">
          <div className={previewIconClassName}>
            <Legacy
              src={closeCircle}
              alt="close"
              layout="fill"
              onClick={() => closeImagePreview()}
            />
          </div>
          <div
            className={previewIconClassName}
            onClick={() => downloadFile(previewImages[selectedItem], "test")}
          >
            <Legacy src={downloadDocument} alt="download" layout="fill" />
          </div>
        </div>
      </div>
    );
  };

  const renderFilePreview = () => {
    return (
      <div className="relative">
        <Carousel
          showArrows={true}
          showStatus={false}
          transitionTime={700}
          selectedItem={selectedItem}
          showIndicators={false}
          onChange={(newIndex: number) => setSelectedItem(newIndex)}
        >
          {previewFiles?.map((file: any, index: number) => {
            return (
              <div
                className="flex items-center justify-center flex-col h-[50vh] pdf-slider"
                key={index}
              >
                <Image src={pdfIcon} alt="pdf" height={50} width={50} />
                <span>{getFileName(file)}</span>
                <span>No Preview Available</span>
              </div>
            );
          })}
        </Carousel>
        <div className="absolute top-0 right-2.5 flex flex-col items-center gap-2">
          <div className={previewIconClassName}>
            <Legacy
              src={closeCircle}
              alt="close"
              layout="fill"
              onClick={() => closeFilePreview()}
            />
          </div>
          <div
            className={previewIconClassName}
            onClick={() => downloadFile(previewFiles[selectedItem], "test")}
          >
            <Legacy src={downloadDocument} alt="download" layout="fill" />
          </div>
        </div>
      </div>
    );
  };

  const renderMessageImages = (msg: any) => {
    if (msg?.image_url?.length) {
      return (
        <div className={`grid grid-cols-2 gap-1 pb-1`}>
          {msg?.image_url?.map((file: any, index: number) => {
            if (index < 4) {
              return (
                <div
                  key={index}
                  className="relative cursor-pointer"
                  onClick={() => onImagePreview(msg?.image_url, index)}
                >
                  <img
                    className="5xl:w-[80px] 4xl:w-[60px] 5xl:h-[80px] 4xl:h-[60px] w-[50px] h-[50px] object-cover rounded"
                    src={getImagePreview(file)}
                    alt="img"
                  />
                  {msg?.image_url?.length &&
                    msg?.image_url?.length > 4 &&
                    index === 3 ? (
                    <div className="bg-[#00000060] absolute top-0 left-0 w-full h-full flex justify-center items-center text-[11px] text-white rounded">
                      +{msg?.image_url?.length - 4}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              );
            } else return <></>;
          })}
        </div>
      );
    } else {
      return <></>;
    }
  };

  const getFileName = (file: any) => {
    if (typeof file === "string") {
      const fileUrlData = file.split("-");
      return fileUrlData[fileUrlData.length - 1];
    } else {
      return file.name;
    }
  };

  const renderMessageFiles = (msg: any) => {
    if (msg?.document_url?.length) {
      return (
        <div className={`grid grid-cols-2 gap-1`}>
          {msg?.document_url?.map((file: any, index: number) => {
            if (index < 4) {
              return (
                <div
                  key={index}
                  className="relative cursor-pointer"
                  onClick={() => {}}
                >
                  <div
                    key={index}
                    className="5xl:w-[80px] 4xl:w-[60px] 5xl:h-[80px] 4xl:h-[60px] w-[50px] h-[50px] rounded text-[7px] text-white flex items-center justify-center"
                    onClick={() => onFilePreview(msg?.document_url, index)}
                  >
                    {/* {getFileName(file)} */}
                    <Image src={pdfIcon} alt="pdf" height={50} width={50} />
                  </div>
                  {msg?.document_url?.length &&
                    msg?.document_url?.length > 4 &&
                    index === 3 ? (
                    <div className="bg-[#00000060] absolute top-0 left-0 w-full h-full flex justify-center items-center text-[11px] text-white rounded">
                      +{msg?.document_url?.length - 4}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              );
            } else return <></>;
          })}
        </div>
      );
    } else {
      return <></>;
    }
  };

  const renderMessageText = (msg: any) => {
    if (msg?.text_type === "template" && msg?.template_name?.components) {
      return (
        <div className="5xl:text-[14px] 4xl:text-[12px] text-[11px] py-1 break-words">
          {msg?.template_name?.components?.map(
            (template: any, index: number) => {
              return (
                <p className="pb-1" key={index}>
                  {template.text}
                </p>
              );
            }
          )}
        </div>
      );
    }
    return (
      <div className="5xl:text-[14px] 4xl:text-[12px] text-[11px] py-1 break-words">
        {msg?.text_content ?? msg?.message}
      </div>
    );
  };

  const renderMessageStatusIcon = (msg: any) => {
    if (
      msg.notification_type === "delivered" ||
      msg.notification_type === "1"
    ) {
      return <Legacy src={deliveredIcon} alt="delivered" layout="fill" />;
    } else if (
      msg.notification_type === "read" ||
      msg.notification_type === "2"
    ) {
      return <Legacy src={readIcon} alt="read" layout="fill" />;
    } else if (
      msg.notification_type === "sent" ||
      msg.notification_type === "0"
    ) {
      return <Legacy src={sentIcon} alt="sent" layout="fill" />;
    } else if (msg.message_type !== "1") {
      return <Legacy src={timerIcon} alt="sending" layout="fill" />;
    }
  };

  const renderMessageInfo = (msg: any) => {
    return (
      <div className="flex justify-end items-center">
        <div className="5xl:text-[13px] 4xl:text-[11px] text-[10px] px-1 text-dark-400">
          {format(
            getValidTime(msg?.createdAt),
            "dd/MM/yyyy hh:mm a"
          )}
        </div>
        {/* <div className="relative 3xl:w-[12px] 3xl:h-[12px] w-[10px] h-[10px]">
          {renderMessageStatusIcon(msg)}
        </div> */}
      </div>
    );
  };

  const renderReplySenderName = (replyMessage: any) => {
    return (
      <div className="text-[11px] font-bold pt-1 opacity-[0.6]">
        {replyMessage?.senderName}
      </div>
    );
  };

  const renderReplyMessageText = (msg: any) => {
    if (msg.replyMessageId !== undefined && msg.replyMessageId !== -1) {
      const replyMessage: any =
        conversationData?.messages?.[msg.replyMessageId];
      return (
        <div className="bg-[#F0F0F0] 5xl:px-2 4xl:px-1 px-1 rounded">
          {renderReplySenderName(replyMessage)}
          {renderMessageText(replyMessage)}
        </div>
      );
    } else {
      return <></>;
    }
  };

  const renderMessageContent = (msg: any) => {
    return (
      <div className="bg-white max-w-[260px] 5xl:px-2 4xl:px-1 5xl:py-1 4xl:py-1 py-1 px-1 rounded">
        {renderReplyMessageText(msg)}
        {renderMessageImages(msg)}
        {renderMessageFiles(msg)}
        {renderMessageText(msg)}
        {renderMessageInfo(msg)}
      </div>
    );
  };

  const renderMessageAvtar = (msg: any) => {
    return (
      <div className="bg-[#adadb6] text-[#313349] font-bold 5xl:text-[15px] 4xl:text-[13px] text-[12px] 5xl:w-[28px] 4xl:w-[26px] 5xl:h-[28px] 4xl:h-[26px] h-[24px] w-[24px] rounded-[50%] flex justify-center items-center m-2 capitalize">
        {!msg.name
          // {msg.message_type === "1"
          ? singleChatLeadDetails?.first_name?.charAt(0)
          : user?.agent_detail?.username?.charAt(0)}
      </div>
    );
  };

  const onReplyMessage = (msg: any, index: number) => {
    setReplyMessageId(index);
    const messageTextArea = document.getElementById("messageTextArea");
    messageTextArea?.focus();
  };

  const onEditMessage = (msg: any, index: number) => {
    setEditMessageId(index);
  };

  const renderMessageButtons = (msg: any, index: number) => {
    return (
      <div className="flex items-center justify-center gap-2">
        <div
          className={msgIconClassName}
          onClick={() => setDeleteMessageId(index)}
        >
          <Legacy src={deleteIcon} alt="delete" layout="fill" />
        </div>
        <Modal
          visible={deleteMessageId !== -1}
          title="Delete Message"
          doneText="Delete"
          onCancleClick={() => {
            setDeleteMessageId(-1);
          }}
          onDoneClick={() => {
            conversationData.messages?.splice(deleteMessageId, 1);
            setConversationData({
              ...conversationData,
              messages: conversationData.messages,
            });
            setDeleteMessageId(-1);
          }}
          contentClassName="max-w-[320px] top-[calc(50%-110px)]"
        >
          <div className="3xl:text-sm text-xs text-txt-secondary p-2 text-center">
            {`Are you sure you want to delete this message?`}
          </div>
        </Modal>
        <div
          className={msgIconClassName}
          onClick={() => onReplyMessage(msg, index)}
        >
          <Legacy src={replyIcon} alt="reply" layout="fill" />
        </div>
        {msg.message_type !== "1" ? (
          <div
            className={msgIconClassName}
            onClick={() => onEditMessage(msg, index)}
          >
            <Legacy src={editIcon} alt="edit" layout="fill" />
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  };

  const renderTransferByLabel = () => {
    return (
      <div className="text-[10px] text-txt-secondary p-2 border-dark-800 border-b text-center">
        This conversation is transfered By {conversationData?.transfer_username}
      </div>
    );
  };

  const renderSingleMessage = (msg: any, index: number) => {
    return (
      <div
        key={index}
        className={`conversation-msg flex justify-between items-center p-2 hover:bg-[#F0F0F0] ${msg.message_type === "1" || !msg.name ? "flex-row-reverse" : ""
          } ${editMessageId === index
            ? "bg-[#F0F0F0] conversation-edit-message"
            : ""
          }`}
      >
        <div className="conversation-msg-buttons">
          {/* {renderMessageButtons(msg, index)} */}
        </div>
        <div
          className={`flex ${msg.message_type === "1" || !msg.name ? "justify-start flex-row-reverse" : ""
            } justify-end item-center`}
        >
          {renderMessageContent(msg)}
          {renderMessageAvtar(msg)}
        </div>
      </div>
    );
  };

  const renderChatHistory = () => {
    return (
      <div>
        {chatHistoryList.map((agentHistory: any, index: number) => {
          return (
            <div
              key={index}
              className={`${index === chatHistoryList.length - 1
                  ? "border-dark-800 border-b"
                  : ""
                }`}
            >
              {agentHistory?.agent?.map((history: any, hIndex: number) => {
                return (
                  <div key={hIndex}>
                    {history?.message_json?.length ? (
                      <div className="p-1">
                        {history?.userDetails?.length ? (
                          <div className="text-[10px] text-txt-secondary p-2 border-dark-800 border-b border-t text-center">
                            Conversation With {history?.userDetails[0].username}
                          </div>
                        ) : null}
                        <div className="py-1">
                          {history?.message_json?.map(
                            (msg: any, index: number) => {
                              return renderSingleMessage(msg, index);
                            }
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMessages = () => {
    return (
      <>
        {chatHistoryList?.length ? renderChatHistory() : null}
        {conversationData?.transfer_username ? renderTransferByLabel() : null}
        {conversationData?.messages?.map((msg: any, index: number) => {
          return renderSingleMessage(msg, index);
        })}
      </>
    );
  };

  return (
    <div
      id="messageBody"
      className={`bg-[#f9f9f9] h-[52vh] ${selectedItem !== -1 ? "" : "overflow-y-auto"
        } scrollbar-hide`}
    >
      <>
        {isLoading ? (
          <div className="h-full">
            <Loader />
          </div>
        ) : (
          <>
            {selectedItem !== -1 ? (
              <>
                {previewImages?.length
                  ? renderImagePreview()
                  : renderFilePreview()}
              </>
            ) : (
              <>{renderMessages()}</>
            )}
          </>
        )}
      </>
    </div>
  );
};

export default ConversationBody;
