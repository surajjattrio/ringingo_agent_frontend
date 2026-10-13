import { useEffect, useLayoutEffect, useState, Fragment, useRef } from "react";
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
  // getActiveUnreadChat,
  getAgentTodayStats,
  useActiveConversation,
  useChatMode,
  useIsActiveChat,
} from "@/redux/slice/chatSlice";
import { getMessageFromNumber } from "@/components/helperFunctions";

// THIRD-PARTY IMPORT
// import Cookies from "js-cookie";
import Cookies from "@/lib/cookies";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Disclosure, Transition } from "@headlessui/react";
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
    <ul className="space-y-1.5">
      {items.map((item: any) => (
        <li key={item.disposition_uuid || item.value} className="group">
          {item.has_children ? (
            <Disclosure>
              {({ open }) => (
                <>
                  <div className="flex items-center justify-between rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <Disclosure.Button
                      as="span"
                      className="flex-1 px-3 py-2 text-sm cursor-pointer text-gray-700 hover:text-primary font-medium"
                    >
                      {item.label || item.name}
                    </Disclosure.Button>

                    <Disclosure.Button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                      <span className={`block transform transition-transform duration-200 ${open ? "rotate-90" : ""}`}>
                        ▶
                      </span>
                    </Disclosure.Button>
                  </div>
                  <Disclosure.Panel className="transition-all duration-300 ease-in-out">
                    <div className="ml-4 mt-1 border-l-2 border-gray-100 pl-3 py-1">
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
            <div
              className="px-3 py-2 text-sm cursor-pointer text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center group/item"
              onClick={() => {
                onSelect(item);
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover/item:bg-primary mr-2 transition-all"></span>
              {item.label || item.name}
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

  // ─── REMOVED: capturedIds useRef ───────────────────────────────────────────
  // The useRef was initialized once on mount and held stale IDs from the
  // previous call. IDs are now snapshotted fresh at the moment each async
  // function runs (see getSubmissionIds helper below).

  const [agentStatus, setAgentStatus] = useState<string>("resume");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [followUpModal, setFollowUpModal] = useState<boolean>(false);
  const [isFollowUpData, setIsFollowUpData] = useState<any>();
  const [dispoName, setDispoName] = useState<any>();
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Snapshot the current call's IDs at the moment of submission.
   *
   * Reading Redux state + cookies here (not from a stale ref captured on mount)
   * guarantees we always operate on the CURRENT call's identifiers, even if the
   * component stayed mounted across multiple calls.
   */
  const getSubmissionIds = () => ({
    addLeadNoteId,
    addNoteId,
    customCallId,
    cookieCallId: Cookies.get("callId"),
  });

  // Filter function for recursive disposition tree
  const filterDispositions = (items: any[], term: string): any[] => {
    if (!term) return items;
    return items.reduce((acc: any[], item: any) => {
      const label = (item.label || item.name || "").toLowerCase();
      const isMatch = label.includes(term.toLowerCase());
      const filteredChildren = item.children ? filterDispositions(item.children, term) : [];

      if (isMatch || filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren,
        });
      }
      return acc;
    }, []);
  };

  const filteredHangupCases = filterDispositions(hangupCases || [], searchTerm);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModal(false);
        setSearchTerm("");
      }
    };
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  const initialValues: any = {
    lead_status: "",
    lead_status_1: "",
    lead_status_2: "",
    code: "",
    lead_uuid: addLeadNoteId,
    comment: "",
    knowledge_base: "",
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

  // GET LEAD INFORMATION
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
      console.log("dial level change Err --->", error?.message);
    }
  };

  const onCallResume = async () => {
    // ── Snapshot current IDs at the moment this function is called ──────────
    const currentIds = getSubmissionIds();

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
            lead_management_uuid: currentIds.addLeadNoteId || "",
            campaign_type: "0",
            custom_callid: currentIds.customCallId || "",
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
      console.log("call resume or push Err --->", error?.message);
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
    // ── Snapshot current IDs at the moment of submission ────────────────────
    const currentIds = getSubmissionIds();

    dispatch(onLeadDispositionTimerEnded(false));
    setIsLoading(true);
    try {
      let data: any = {
        // phone_number_id: activeConversation?.phone_number_id,
        from_number:
          activeConversation?.[getMessageFromNumber(activeConversation)],
        note: values.comment,
        lead_management_uuid: currentIds.addLeadNoteId || "",
        type: chatModeType === "pbx" ? 1 : 0,
        channel_identifiers: activeConversation?.channel_identifiers,
        channel_type: activeConversation?.channel_type
      };
      if (chatModeType !== "pbx") {
        data.disposition_uuid = values.lead_status;
      }
      await dispatch(endChat(data)).unwrap();
      // dispatch(getActiveUnreadChat({ campaign_uuid: selectedCampaign })).unwrap();
      dispatch(getAgentTodayStats({
        uuid: user?.agent_detail?.uuid,
        timezone: user?.timezone || "Asia/Kolkata"
      }));
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
    // ── Snapshot current IDs at the moment of submission ────────────────────
    // This is the critical fix: by reading addLeadNoteId, addNoteId,
    // customCallId, and the cookie HERE (not from a ref captured on mount),
    // we always use the CURRENT call's identifiers regardless of how long
    // the component has been mounted or how many calls have passed through it.
    const currentIds = getSubmissionIds();

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
        //if (values.comment !== "") {
        if (values.comment !== "" || values.knowledge_base !== "") {
          let data = {
            comment: values.comment,
            knowledge_base: values.knowledge_base || "",
            lead_uuid: currentIds.addLeadNoteId || "",
            // cdrs_uuid: addNoteId ? addNoteId : "",
            cdrs_uuid: currentIds.addNoteId || currentIds.cookieCallId || "",
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
          lead_management_uuid: currentIds.addLeadNoteId || "",
          campaign_type: campaignType === "inbound" ? "" : "2",
          custom_callid: currentIds.customCallId || "",
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
          //values.comment !== ""
          values.comment !== "" || values.knowledge_base !== ""
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
          dispatch(getAgentTodayStats({
            uuid: user?.agent_detail?.uuid,
            timezone: user?.timezone || "Asia/Kolkata"
          }));
          dispatch(getAgentTodayStats({
            uuid: user?.agent_detail?.uuid,
            timezone: user?.timezone || "Asia/Kolkata"
          }));
        }
      } else {
        console.log("OUTGOING CALLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
        let response: any;
        let res: any;

        if (!!currentIds.addLeadNoteId) {
          let payload: any = {
            lead_management_uuid: currentIds.addLeadNoteId || "",
            lead_status: dispositionCause ? dispositionCause : values.lead_status,
            lead_status_1: dispositionCause ? dispositionCause : values.lead_status_1,
            lead_status_2: dispositionCause ? dispositionCause : values.lead_status_2,
            code: values.code,
            custom_phone_number: Cookies.get("phone_number") || "",
            campaign_uuid: selectedCampaign,
            pause: agentStatus === "pause" ? "true" : "false",
            custom_callid: currentIds.customCallId || "",
            knowledge_base: values.knowledge_base || "",
          };
          if (campaignType === "outbound" || campaignType === "blended") {
            payload["campaign_flag"] = campaignType;
          }
          // console.log("payloadpayload", payload);

          // response = {statusCode:200};
          response = await dispatch(leadHangup(payload)).unwrap();
        }
        //if (values.comment !== "") {
         if (values.comment !== "" || values.knowledge_base !== "") {
          let data = {
            comment: values.comment,
            knowledge_base: values.knowledge_base || "",
            lead_uuid: currentIds.addLeadNoteId || "",
            // cdrs_uuid: addNoteId ? addNoteId : "",
            cdrs_uuid: currentIds.addNoteId || currentIds.cookieCallId || "",

          };
          res = await dispatch(createNewNote(data)).unwrap();
        }
         const hasNoteOrKb = values.comment !== "" || values.knowledge_base !== "";
        if (
          !!currentIds.addLeadNoteId && && hasNoteOrKb
            ? res &&
            res.statusCode === 201 &&
            response &&
            response.statusCode === 200
            : !!!currentIds.addLeadNoteId && hasNoteOrKb
              ? res && res.statusCode === 201
              : !!currentIds.addLeadNoteId &&
                hasNoteOrKb  &&
                response &&
                response.statusCode === 200
                ? true
                : !!!currentIds.addLeadNoteId && hasNoteOrKb
        ) {
          // Success(!!addLeadNoteId ? response?.data : res.data);
          dispatch(onSetDialType("manualDial"));
          setIsLoading(false);
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
              lead_management_uuid: currentIds.addLeadNoteId || "",
              custom_callid: currentIds.customCallId || "",
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
          setIsHangUp(false);
          dispatch(clearCustomCallId());
          dispatch(getAgentTodayStats({
            uuid: user?.agent_detail?.uuid,
            timezone: user?.timezone || "Asia/Kolkata"
          }));
          if (campaignMode === "2") {
            await onGetLeadInfo();
            dispatch(onShowLeadInfo(true));
          }
          dispatch(getAgentTodayStats({
            uuid: user?.agent_detail?.uuid,
            timezone: user?.timezone || "Asia/Kolkata"
          }));
          if (campaignMode === "2") {
            await onGetLeadInfo();
            dispatch(onShowLeadInfo(true));
          }
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
        [`lead_status_${level}`]: data?.disposition_uuid || "",
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
                <div className="col-span-3 relative" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`w-full border flex items-center justify-between text-sm px-3 py-2 bg-white rounded-md shadow-sm transition-all ${touched.lead_status && errors.lead_status ? "!border-red-500" : "border-[#D1D5DB] hover:border-gray-400"}`}
                    onClick={() => setShowModal(!showModal)}
                  >
                    <span className="truncate">{dispoName || "Select"}</span>
                    <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showModal ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <Transition
                    show={showModal}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <div className="absolute top-full left-0 z-[100] mt-1 w-full min-w-[320px] bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden">
                      {/* Dropdown Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                        <span className="text-sm font-bold text-gray-800">Select Hang-up Cause</span>
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* Search Bar */}
                      <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </span>
                          <input
                            type="text"
                            autoFocus
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                            placeholder="Search disposition..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="max-h-[350px] overflow-y-auto px-2 py-2">
                        {filteredHangupCases.length > 0 ? (
                          <DispositionTree
                            items={filteredHangupCases}
                            onSelect={(item: any) => {
                              setDispoName(item?.label || item?.name);
                              setValues({
                                ...values,
                                lead_status: item?.value || item?.disposition_uuid,
                                code: item?.code,
                              });
                              setShowModal(false);
                              setSearchTerm("");

                              const selected = { ...item, lead_management_uuid: addLeadNoteId };
                              if (selected?.callback == "0") {
                                setIsFollowUpData(selected);
                                setFollowUpModal(true);
                              }
                            }}
                          />
                        ) : (
                          <div className="py-10 text-center">
                            <p className="text-sm text-gray-400 italic">No results found for "{searchTerm}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            ) : null}
            {(
              user?.agent_detail?.agent_permission?.[0]?.knowledge_base === "0") && (
              <div className="py-2">
                <Textarea
                  className="!px-2"
                  label="Knowledge Base Link"
                  name="knowledge_base"
                  placeholder="Enter Knowledge Base Link..."
                  value={values.knowledge_base}
                  onChange={handleChange}
                  touched={touched}
                  errors={errors}
                  onBlur={handleBlur}
                />
              </div>
            )}  
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


          <FollowUpModal
            visible={!!isFollowUpData}
            onCancleClick={() => {
              setIsFollowUpData("");
              setFollowUpModal(false);
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
