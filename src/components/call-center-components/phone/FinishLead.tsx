import { useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";

// PROJECT IMPORTS
import { Button, CheckBox, Select, Textarea } from "@/components/forms";
import {
  clearLeadDetails,
  clearCustomCallId,
  clearLeadUuid,
  clearSingleChatLeadDetails,
  getAllHangupCause,
  getAllLeads,
  getSingleParentDisposition,
  leadHangup,
  useHangupCause,
  useSingleChatLeadDetails,
  useSingleLeadDetails,
  useCustomCallId,
} from "@/redux/slice/callCenter/callCenterPhoneSlice";
import {
  onAddLeadNoteId,
  onLeadDispositionTimerEnded,
  onSetAddNoteId,
  onSetDialType,
  onShowCallModal,
  onShowLeadInfo,
  setIsCallHangUp,
  setIsInboundCampaign,
  useAddLeadNoteId,
  useAddNoteId,
  useCampaignMode,
  useCampaignType,
  useDispositionTimerEnded,
  usePredictiveData,
  useSelectedCampaign,
  useSelectedCampaignDetails,
} from "@/redux/slice/commonSlice";
import { useAppDispatch } from "@/redux/hooks";
import { createNewNote } from "@/redux/slice/noteSlice";
import { userAgentUnRegistration } from "@/components/pbx-components/calling/CallingModal";
import {
  callQueueInbound,
  resumeCampaign,
  setCallResume,
  updateAgentStatus,
  updateDialLevel,
  updateLiveAgentEntry,
} from "@/redux/slice/campaignSlice";
import { useAuth } from "@/contexts/hooks/useAuth";
import {
  endChat,
  getActiveUnreadChat,
  useActiveConversation,
  useChatMode,
  useIsActiveChat,
} from "@/redux/slice/chatSlice";
import { getMessageFromNumber } from "@/components/helperFunctions";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Disclosure } from "@headlessui/react";
import { FollowUpModal } from "@/components/modals";

// ASSETS
const backIcon = "/assets/icons/back-icon.svg";

// TYPES
interface FinishLeadProps {
  setIsHangUp: any;
}

interface DispositionTreeProps {
  items: any;
  onSelect: any;
}

const DispositionTree = (props: DispositionTreeProps) => {
  const { items, onSelect } = props;

  return (
    <ul className="pl-2 space-y-1">
      {items.map((item: any) => (
        <li key={item.disposition_uuid || item.value}>
          {item.has_children ? (
            // ✅ When item has children: text + arrow both toggle Disclosure
            <Disclosure>
              {({ open }) => (
                <>
                  <div className="">
                    {/* CHANGED: span -> Disclosure.Button as="span" */}
                    <Disclosure.Button
                      as="span"
                      className="cursor-pointer hover:underline"
                    >
                      {item.label || item.name}
                    </Disclosure.Button>

                    <Disclosure.Button className="text-xs px-2 py-1 text-gray-500">
                      {open ? "▼" : "▶"}
                    </Disclosure.Button>
                  </div>
                  <Disclosure.Panel>
                    {/* Indent nested list */}
                    <div className="pl-4 mt-1 border-l border-gray-200">
                      <DispositionTree
                        items={item.children || []}
                        onSelect={onSelect}
                      />
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ) : (
            // ✅ When no children: keep your original behavior exactly
            <div className="">
              <span
                className="cursor-pointer hover:underline"
                onClick={() => {
                  onSelect(item);
                }}
              >
                {item.label || item.name}
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};


/* ============================== FINISH LEAD ============================== */

const FinishLead = (props: FinishLeadProps) => {
  const { setIsHangUp } = props;

  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const addLeadNoteId = useAddLeadNoteId();
  const hangupCases = useHangupCause();
  // console.log("hangupCases", hangupCases);

  const selectedCampaign = useSelectedCampaign();
  const addNoteId = useAddNoteId();
  const predictiveData = usePredictiveData();
  const campaignType = useCampaignType();
  const activeConversation = useActiveConversation();
  const singleLeadDetails = useSingleLeadDetails();
  const singleChatLeadDetails = useSingleChatLeadDetails();
  const chatModeType = useChatMode();
  const isActiveChat = useIsActiveChat();
  const dispositionTimerEnded = useDispositionTimerEnded();
  const selectedCampaignDetails = useSelectedCampaignDetails();
  const customCallId = useCustomCallId();
console.log("customCallId", customCallId)

  const campaignMode = useCampaignMode();
  const [agentStatus, setAgentStatus] = useState<string>("resume");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [followUpModal, setFollowUpModal] = useState<boolean>(false);
  const [isFollowUpData, setIsFollowUpData] = useState<any>();
  const [dispoName, setDispoName] = useState<any>();

  const initialValues: any = {
    lead_status: "",
    lead_status_1: "",
    lead_status_2: "",
    code: "",
    lead_uuid: addLeadNoteId,
    comment: "",
  };

  const validationSchema = Yup.object<any>({
    lead_status: Yup.string().when("lead_uuid", {
      is: (val: any) => !!val,
      then: (e) =>
        e.required(
          `Please select ${isChatLead() ? "Disposition" : "Hang-up Cause"}`
        ),
    }),

    comment: Yup.string().when("lead_uuid", {
      is: (val: any) => !val,
      then: (e) => e.required("Please Enter note"),
    }),
  });

  const pbxValidationSchema = Yup.object<any>({
    comment: Yup.string().required("Please Enter note"),
  });

  const onGetHangupCases = async () => {
    try {
      await dispatch(getAllHangupCause(selectedCampaign)).unwrap();
    } catch (error: any) {
      console.log("get hangupcause err --->", error?.message);
    }
  };

  useEffect(() => {
    if (selectedCampaign) onGetHangupCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign]);

  useEffect(() => {
    if (dispositionTimerEnded && selectedCampaignDetails?.wrap_up_disposition) {
      onFinishLead(selectedCampaignDetails?.wrap_up_disposition);
    }
  }, [dispositionTimerEnded, selectedCampaignDetails]);

  // GET LEAD INFORMATUON
  const onGetLeadInfo = async () => {
    dispatch(clearLeadUuid());
    try {
      await dispatch(
        getAllLeads({
          campaign_uuid: selectedCampaign,
          campaign_mode: campaignMode,
        })
      ).unwrap();
    } catch (error: any) {
      console.log("Get lead Info Err--->", error?.message);
    }
  };

  const onUpdateDialLevel = async () => {
    try {
      let payload: any = {
        campaign_uuid: selectedCampaign,
        current_dial_level: predictiveData?.current_dial_level || "",
        target_drop_percent: predictiveData?.target_drop_percent || "",
        max_dial_level: predictiveData?.max_dial_level || "",
        minimum_calls: predictiveData?.minimum_calls || "",
        campaignType: campaignType,
      };
      await dispatch(updateDialLevel(payload)).unwrap();
    } catch (error: any) {
      console.log("dial lavel change Err --->", error?.message);
    }
  };

  const onCallResume = async () => {
    try {
      if (campaignMode === "1" || campaignMode === "3") {
        if (agentStatus !== "pause") {
          onUpdateLiveAgentEntry("0");
        } else {
          onUpdateLiveAgentEntry("4");
        }
        let payload = {
          agent_status: agentStatus === "pause" ? agentStatus : "",
          campaign_uuid: selectedCampaign,
        };
        let data: any = await dispatch(updateAgentStatus(payload)).unwrap();
        if (data && data.statusCode === 200) {
          let payloadData: any = {
            extension: user?.agent_detail?.extension_details[0].username,
            campaign_uuid: selectedCampaign,
            feature: "submit",
            lead_status: values.lead_status,
            lead_management_uuid: addLeadNoteId ? addLeadNoteId : "",
            campaign_type: "0",
	    custom_callid: customCallId ? customCallId : "",
          };
          if (agentStatus !== "pause") {
            await dispatch(callQueueInbound(payloadData)).unwrap();
          } else {
            payloadData["pause"] = "true";
            await dispatch(callQueueInbound(payloadData)).unwrap();
          }
          if (agentStatus !== "pause") {
            let payloadData: any = {
              campaign_uuid: selectedCampaign,
              sip_uri: "https://test.com/",
              username: user?.agent_detail?.extension_details[0].username,
              campaign_mode: campaignMode,
              campaign_flag: campaignType
            };
            if (Cookies.get("campaignMode") === "3" || campaignMode === "3") {
              onUpdateDialLevel();
            }
            dispatch(setCallResume(false));
            await dispatch(resumeCampaign(payloadData)).unwrap();
          } else {
            dispatch(setCallResume(true));
          }
        }
        dispatch(onSetDialType("leadDial"));
        dispatch(onShowCallModal("true"));
        dispatch(clearCustomCallId());
      }
    } catch (error: any) {
      console.log("call resume or push  Err --->", error?.message);
    }
  };

  const onUpdateLiveAgentEntry = async (status: string) => {
    try {
      let payload = {
        status: status,
        campaign_uuid: selectedCampaign
          ? selectedCampaign
          : Cookies.get("selectedCampaign")
            ? Cookies.get("selectedCampaign")
            : "",
        type: "hangup",
      };
      await dispatch(updateLiveAgentEntry(payload)).unwrap();
    } catch (error: any) {
      console.log("Agent Entry err --->", error?.message);
    }
  };

  const onCallstatuschange = async (status: string) => {
    if (status !== "pause") {
      Cookies.set("call_status", "pause");
    } else {
      Cookies.set("call_status", "play");
    }
  };

  const onEndChat = async () => {
    dispatch(onLeadDispositionTimerEnded(false));
    setIsLoading(true);
    try {
      let data: any = {
        // phone_number_id: activeConversation?.phone_number_id,
        from_number:
          activeConversation?.[getMessageFromNumber(activeConversation)],
        note: values.comment,
        lead_management_uuid: addLeadNoteId ? addLeadNoteId : "",
        type: chatModeType === "pbx" ? 1 : 0,
        channel_identifiers: activeConversation?.channel_identifiers,
        channel_type: activeConversation?.channel_type
      };
      if (chatModeType !== "pbx") {
        data.disposition_uuid = values.lead_status;
      }
      await dispatch(endChat(data)).unwrap();
      dispatch(getActiveUnreadChat({ campaign_uuid: selectedCampaign })).unwrap();
      setIsLoading(false);
      setIsHangUp(false);
      resetForm();
      dispatch(clearSingleChatLeadDetails());
      dispatch(onSetAddNoteId(null));
      dispatch(onAddLeadNoteId(null));
    } catch (error) {
      setIsLoading(false);
      console.log("end chat cause err --->", error);
    }
  };

  const isChatLead = () => {
    return (
      activeConversation?.user_uuid &&
      getSingleChatDetails() &&
      Object.keys(getSingleChatDetails()).length
    );
  };

  const getSingleChatDetails = () => {
    return activeConversation?.user_uuid && isActiveChat
      ? singleChatLeadDetails
      : singleLeadDetails;
  };

  const onFinishLead = async (dispositionCause?: string) => {
    // console.log("dispositionCause", values);

    dispatch(onLeadDispositionTimerEnded(false));
    setIsLoading(true);
    try {
      if (campaignType === "inbound") {
        console.log("INCOMING CALLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
        if (agentStatus !== "pause") {
          onUpdateLiveAgentEntry("0");
        } else {
          onUpdateLiveAgentEntry("4");
        }
        let res: any;
        let response: any;
        if (values.comment !== "") {
          let data = {
            comment: values.comment,
            lead_uuid: addLeadNoteId ? addLeadNoteId : "",
            // cdrs_uuid: addNoteId ? addNoteId : "",
            cdrs_uuid: addNoteId ? addNoteId : Cookies.get("callId") ? Cookies.get("callId") : "",
          };
          res = await dispatch(createNewNote(data)).unwrap();
        }
        let payload: any = {
          extension: user?.agent_detail?.extension_details[0].username,
          campaign_uuid: selectedCampaign,
          feature: "submit",
          lead_status: dispositionCause ? dispositionCause : values.lead_status,
          lead_status_1: dispositionCause ? dispositionCause : values.lead_status_1,
          lead_status_2: dispositionCause ? dispositionCause : values.lead_status_2,
          lead_management_uuid: addLeadNoteId ? addLeadNoteId : "",
          campaign_type: campaignType === "inbound" ? "" : "2",
	  custom_callid: customCallId ? customCallId : "",
        };
        if (agentStatus !== "pause") {
          response = await dispatch(callQueueInbound(payload)).unwrap();
          dispatch(setCallResume(false));
        } else {
          payload["pause"] = "true";
          response = await dispatch(callQueueInbound(payload)).unwrap();
          dispatch(setCallResume(true));
          if (campaignType === "inbound") {
            dispatch(setIsInboundCampaign(true));
            userAgentUnRegistration();
          }
        }
        if (
          values.comment !== ""
            ? res &&
            res.statusCode === 201 &&
            response &&
            response.statusCode === 200
            : response && response.statusCode === 200
        ) {
          dispatch(onSetDialType("manualDial"));
          setIsLoading(false);
          setIsHangUp(false);
          resetForm();
          dispatch(setIsCallHangUp(false));
          Cookies.set("is_call_start", "1");
          Cookies.remove("callId");
          dispatch(clearLeadDetails());
          dispatch(onSetAddNoteId(null));
          dispatch(onAddLeadNoteId(null));
          dispatch(onSetDialType("leadDial"));
          dispatch(onShowCallModal("true"));
          dispatch(clearCustomCallId());
        }
      } else {
        console.log("OUTGOING CALLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
        let response: any;
        let res: any;

        if (!!addLeadNoteId) {
          let payload: any = {
            lead_management_uuid: addLeadNoteId ? addLeadNoteId : "",
            lead_status: dispositionCause ? dispositionCause : values.lead_status,
            lead_status_1: dispositionCause ? dispositionCause : values.lead_status_1,
            lead_status_2: dispositionCause ? dispositionCause : values.lead_status_2,
            code: values.code,
            custom_phone_number: Cookies.get("phone_number") || "",
            campaign_uuid: selectedCampaign,
            pause: agentStatus === "pause" ? "true" : "false",
            custom_callid: customCallId ? customCallId : "",
          };
          if (campaignType === "outbound" || campaignType === "blended") {
            payload["campaign_flag"] = campaignType;
          }
          // console.log("payloadpayload", payload);

          // response = {statusCode:200};
          response = await dispatch(leadHangup(payload)).unwrap();
        }
        if (values.comment !== "") {
          let data = {
            comment: values.comment,
            lead_uuid: addLeadNoteId ? addLeadNoteId : "",
            // cdrs_uuid: addNoteId ? addNoteId : "",
            cdrs_uuid: addNoteId ? addNoteId : Cookies.get("callId") ? Cookies.get("callId") : "",
          };
          res = await dispatch(createNewNote(data)).unwrap();
        }
        if (
          !!addLeadNoteId && values.comment !== ""
            ? res &&
            res.statusCode === 201 &&
            response &&
            response.statusCode === 200
            : !!!addLeadNoteId && values.comment !== ""
              ? res && res.statusCode === 201
              : !!addLeadNoteId &&
              values.comment === "" &&
              response &&
              response.statusCode === 200
        ) {
          // Success(!!addLeadNoteId ? response?.data : res.data);
          dispatch(onSetDialType("manualDial"));
          setIsLoading(false);
          (campaignMode === "0" || campaignMode === "2") && onGetLeadInfo();
          (campaignMode === "1" ||
            campaignMode === "3" ||
            campaignMode === "0") &&
            dispatch(onShowLeadInfo(false));
          if (campaignMode === "1" || campaignMode === "3") {
            onCallResume();
          } else {
            onUpdateLiveAgentEntry("0");
            let payload: any = {
              extension: user?.agent_detail?.extension_details[0].username,
              campaign_uuid: selectedCampaign,
              feature: "submit",
              lead_status: dispositionCause ? dispositionCause : values.lead_status,
              lead_management_uuid: addLeadNoteId ? addLeadNoteId : "",
              custom_callid: customCallId ? customCallId : "",
              campaign_type:
                campaignType === "inbound"
                  ? ""
                  : campaignType === "outbound"
                    ? "0"
                    : "2",
            };
            console.log(campaignMode, "campaignModecampaignMode", payload);
            await dispatch(callQueueInbound(payload)).unwrap();
          }
          resetForm();
          dispatch(setIsCallHangUp(false));
          Cookies.set("is_call_start", "1");
          Cookies.remove("phone_number");
          Cookies.remove("callId");
          dispatch(clearLeadDetails());
          dispatch(onSetAddNoteId(null));
          dispatch(onAddLeadNoteId(null));
          setIsHangUp(false)
          dispatch(clearCustomCallId());
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log("create hangup cause err --->", error);
    }
  };

  const onSubmit = async () => {
    if (isChatLead()) {
      await onEndChat();
    } else {
      await onFinishLead();
    }
  };

  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    setValues,
    resetForm,
    handleSubmit,
  } = useFormik({
    initialValues,
    validationSchema:
      chatModeType === "pbx" ? pbxValidationSchema : validationSchema,
    onSubmit,
  });

  useLayoutEffect(() => {
    const fetchRecursiveParent = async (disposition_uuid: string, level: number) => {
      if (!disposition_uuid) return;

      const result: any = await dispatch(getSingleParentDisposition(disposition_uuid));
      const data = result?.payload?.data[0];

      // Dynamically update the form values
      setValues((prevValues: any) => ({
        ...prevValues,
        [`lead_status_${level}`]: data?.disposition_uuid || ""
      }));

      // Only continue if there is actually a parent
      if (data?.parent_disposition != "") {
        await fetchRecursiveParent(data?.disposition_uuid, level + 1);
      }
    };

    fetchRecursiveParent(values.lead_status, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.lead_status]);

  useEffect(() => {
    console.log("Updated follow-up data:", isFollowUpData);
    console.log("Updated follow-up modal:", followUpModal);
  }, [isFollowUpData, followUpModal]);

  // console.log("sdflkas", isFollowUpData)

  return (
    <>
      <div className=" bg-white h-[42vh]">
        <form onSubmit={handleSubmit}>
          <div className="bg-layout 3xl:px-6 py-2.5 px-4 flex gap-2 items-center h-[5.8vh]">
            <Image
              className="cursor-pointer"
              src={backIcon}
              alt="back"
              width={18}
              height={18}
              onClick={() => {
                setIsHangUp(false);
              }}
            />
            <span className="3xl:text-base text-xs text-heading font-bold">
              Finish Lead
            </span>
          </div>
          <div className="pt-2 px-4 h-[30.2vh]">
            {/* && chatModeType !== "pbx" */}
            {!!addLeadNoteId ? (
              // <div>
              //   <div className="grid grid-cols-5 pb-1.5 items-center">
              //     <label className="col-span-2 text-heading 3xl:text-xs text-[11px] font-bold">
              //       {!isChatLead() ? "Hang-up Cause" : "Disposition"}
              //     </label>
              //     <Select
              //       className="col-span-3"
              //       isShowLabel={false}
              //       value={values.lead_status}
              //       maxMenuHeight={150}
              //       name="lead_status"
              //       placeholder="Select"
              //       options={hangupCases}
              //       isManual
              //       onChange={(e: any) => {
              //         setValues({
              //           ...values,
              //           lead_status: e.value,
              //           code: e.code,
              //         });
              //       }}
              //       touched={touched}
              //       errors={errors}
              //       onBlur={handleBlur}
              //     />
              //   </div>
              // </div>
              <div className="grid grid-cols-5 pb-1.5 items-center">
                <label className="col-span-2 text-heading 3xl:text-xs text-[11px] font-bold">
                  {!isChatLead() ? "Hang-up Cause" : "Disposition"}
                </label>
                <div className="col-span-3">
                  <button
                    type="button"
                    className={`w-full border text-left text-sm px-3 py-2 bg-white rounded-md shadow-sm ${touched.lead_status && errors.lead_status ? "!border-red-500" : "border-[#D1D5DB]"}`}
                    onClick={() => setShowModal(true)}
                  >
                    {dispoName || "Select"}
                  </button>
                </div>
              </div>
            ) : null}
            <div className="py-2">
              <Textarea
                className="!px-2"
                label="Add Note"
                name="comment"
                placeholder="Type something here..."
                rows={3}
                value={values.comment}
                onChange={handleChange}
                touched={touched}
                errors={errors}
                onBlur={handleBlur}
              />
            </div>
            {campaignType === "inbound" ||
              campaignMode === "1" ||
              campaignMode === "3" ? (
              <div>
                <div className="flex justify-start pt-1.5 items-center">
                  <label className="col-span-3 text-heading 3xl:text-xs text-[11px] font-bold mr-4">
                    Pause Campaign:
                  </label>
                  <CheckBox
                    className="accent-[#66A277]"
                    checked={agentStatus === "pause"}
                    onChange={() => {
                      setAgentStatus(
                        agentStatus === "resume" ? "pause" : "resume"
                      );
                      onCallstatuschange(
                        agentStatus === "resume" ? "pause" : "resume"
                      );
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end px-4">
            <Button
              disabled={isLoading}
              isLoading={isLoading}
              loaderClass="!border-primary !border-t-transparent"
              className="py-1 px-3"
              text="Submit"
              style="primary-outline-text"
              type="submit"
            />
          </div>

          {showModal && (
            <div className="fixed top-0 right-0 w-[300px] h-full bg-white shadow-lg z-50 p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold">{!isChatLead() ? "Select Hang-up Cause" : "Select Disposition"}</h2>
                <button onClick={() => setShowModal(false)}>✕</button>
              </div>

              <DispositionTree
                items={hangupCases}
                onSelect={(item: any) => {
                  setDispoName(item?.label || item?.name)
                  setValues({
                    ...values,
                    // lead_status: item?.label || item?.name,
                    lead_status: item?.value || item?.disposition_uuid,
                    code: item?.code,
                  });
                  setShowModal(false);
                  // console.log("selectedDisposition aiuwdbasbda", item)
                  // ✅ If callback flag is "0", open follow-up modal immediately
                  const selected = { ...item, lead_management_uuid: addLeadNoteId };
                  if (selected?.callback == "0") {
                    console.log("selectedDisposition callback trueeeee");
                    setIsFollowUpData(selected);
                    setFollowUpModal(true);
                  }
                }}
              />
            </div>
          )}
          <FollowUpModal
            visible={!!isFollowUpData}
            onCancleClick={() => {
              setIsFollowUpData("");
              setFollowUpModal(false)
            }}
            data={isFollowUpData}
            fromCallCenter
          />
        </form>
      </div>
    </>
  );
};

export default FinishLead;
