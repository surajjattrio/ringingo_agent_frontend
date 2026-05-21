"use client";
import { useEffect, useRef, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
//import { WSS_URL } from "@/API/baseURL";
const WSS_URL = process.env.WSS_URL;

import { useAuth } from "@/contexts/hooks/useAuth";
import { useAppDispatch } from "@/redux/hooks";
import {
  onAddLeadNoteId,
  onDial,
  onSetAddNoteId,
  onSetDialType,
  onSetNumberMask,
  onShowCallModal,
  onShowLeadInfo,
  setCallScreen,
  setCallerName,
  setCallerNumber,
  setWebRtcStatus,
  setIsCallHangUp,
  setIsShowCallDuration,
  useAddLeadNoteId,
  useCallScreen,
  useCallerName,
  useCallerNumber,
  useCampaignMode,
  useCampaignType,
  useDialNumber,
  useDialType,
  useIsCallHangUp,
  useIsInboundCampaign,
  useIsNumberMask,
  useIsShowCallDuration,
  useNumberMasking,
  usePredictiveData,
  useSelectedCampaign,
  useSelectedCampaignDetails,
  useShowCallModal,
  useUserEntry,
} from "@/redux/slice/commonSlice";
import {
  getCallStatistic,
  getMissedCallCount,
  leadDetailsSearch,
} from "@/redux/slice/phoneSlice";
import {
  clearLeadDetails,
  dialManual,
  getSingleLead,
  reportAdd,
} from "@/redux/slice/callCenter/callCenterPhoneSlice";
import {
  callQueueInbound,
  updateDialLevel,
  updateLiveAgentEntry,
  useCallResume,
} from "@/redux/slice/campaignSlice";
import LeadDialPage from "./callCenterComponents/LeadDialPage";
import CallFailedPage from "./CallFailedPage";
import IncomingCallPage from "./IncomingCallPage";
import IncomingCallModal from "./IncomingCallModal";
import AddNotePage from "./AddNotePage";
import ActiveCallModal from "./ActiveCallModal";
import CallingPage from "./CallingPage";
import DailPage from "./DailPage";

// THIRD-PARTY IMPORT

import {
  Invitation,
  Inviter,
  InviterOptions,
  Registerer,
  Session,
  SessionState,
  RegistererState,
  UserAgent,
  UserAgentOptions,
  InvitationAcceptOptions,
  Referral,
} from "sip.js";
import { OutgoingInviteRequest } from "sip.js/lib/core";
import Cookies from "js-cookie";
import { Danger } from "@/redux/services/toasterService";
import getDomain from "@/utils/GetDoamin";

// ASSETS
// const close = "/assets/icons/close.svg";
const LeadUserIcon = "/assets/icons/lead-user.svg";
const manualIcon = "/assets/icons/manual.svg";
const CallerTuneFile = "/assets/sound/ringtone.mp3";
const CallerBeepFile = "/assets/sound/tone.mp3";
const BeepFile = "/assets/sound/beep.mp3";

let userAgent: any;
let durationInterval: any;
let incomingMediaStream: any;
let outgoingMediaStream: any;
let incomingSession: any;
let outgoingSession: any;
let secondCallSession: any;
// Keep these global references (DO NOT re-declare inside functions)
let registerer: Registerer | null = null;
let registrationStateListenerAttached = false;

// USER UNREGISTRATION
export const userAgentUnRegistration = () => {
  console.log("ON LOG OUT CLICK....>");
  const registerer = new Registerer(userAgent);
  console.log(registerer);
  if (
    outgoingSession &&
    (outgoingSession._state === "Establishing" ||
      outgoingSession._state === "Established")
  ) {
    // Hang up the outgoing call
    outgoingSession.bye();
    outgoingSession = null;
  }

  if (
    incomingSession &&
    (incomingSession._state === "Establishing" ||
      incomingSession._state === "Established")
  ) {
    // Hang up the incoming call
    incomingSession.bye();
    incomingSession = null;
  }

  if (
    secondCallSession &&
    (secondCallSession._state === "Establishing" ||
      secondCallSession._state === "Established")
  ) {
    // Hang up the second call
    secondCallSession.bye();
    secondCallSession = null;
  }
  registerer
    .unregister()
    .then(() => {
      console.log("Unregister successful");
    })
    .catch((error: any) => {
      console.error("Unregister error:", error);
    });
};

// export const userAgentUnRegistration = () => {
//   console.log("ON LOG OUT CLICK....>");

//   // Close any active call cleanly
//   const endSession = (session: any) => {
//     if (!session) return;
//     if (
//       session.state === SessionState.Established ||
//       session.state === SessionState.Establishing
//     ) {
//       session.bye().catch(() => { });
//     }
//   };

//   endSession(outgoingSession);
//   endSession(incomingSession);
//   endSession(secondCallSession);

//   outgoingSession = null;
//   incomingSession = null;
//   secondCallSession = null;

//   if (registerer) {
//     registerer
//       .unregister()
//       .then(() => console.log("Unregister successful"))
//       .catch((error) => console.error("Unregister error:", error));
//   }

//   if (userAgent) {
//     userAgent
//       .stop()
//       .then(() => console.log("UA stopped"))
//       .catch((err:any) => console.warn("UA stop failed", err));
//   }

//   // Reset everything properly
//   registerer = null;
//   userAgent = null;
//   registrationStateListenerAttached = false;

//   Cookies.set("authenticated", "false", { expires: 1 });
//   Cookies.set("logout", "true", { expires: 1 });
// };


// TYPES
interface CallingModelProps {
  showModal: boolean;
  setShowModal?: any;
  onCancleClick: any;
}
/* ============================== CALLING MODAL ============================== */

const CallingModal = (props: CallingModelProps) => {
  const { showModal, onCancleClick, setShowModal } = props;
  const [number, setNumber] = useState<string>("");
  const [isHold, setIsHold] = useState<boolean>(false);
  // const callerTuneplay = new Audio(CallerTuneFile);
  // const callerBeepPlay = new Audio(CallerBeepFile);
  // const BeepPlay = new Audio(BeepFile);
  const [isMuted, setIsMuted] = useState(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  // const [isShowCallDuration, setIsShowCallDuration] = useState<boolean>(false);
  const [showIncomingModal, setShowIncomingModal] = useState<boolean>(false);
  const [addNoteShowCallDuration, setAddNoteShowCallDuration] =
    useState<boolean>(false);

  const [showActiveModal, setShowActiveModal] = useState<boolean>(false);
  const [addNoteSeconds, setAddNoteSeconds] = useState<number>(0);
  const [addNoteMinutes, setAddNoteMinutes] = useState<number>(0);
  const [page, setPage] = useState<string>("");
  // const [screen, setScreen] = useState<string>("");
  // const [callerNumber, setCallerNumber] = useState<any>("");
  // const [callerName, setCallerName] = useState<any>("");
  const [errorMessage, setErrorMessage] = useState<any>("");
  const [successMessage, setSuccessMessage] = useState<any>("");
  const [callType, setCallType] = useState<string>("");
  const [showConferenceBtn, setShowConferenceBtn] = useState<boolean>(true);
  const selectedCampaignDetails = useSelectedCampaignDetails(); //new
  // console.log("selectedCampaignDetailsselectedCampaignDetails ternary op",selectedCampaignDetails?.auto_answer == "1" ? false : true);

  const autoAnswer = selectedCampaignDetails?.auto_answer;
  console.log("auto anss", autoAnswer);

  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const dialNumbers = useDialNumber();
  const selectedCampaign = useSelectedCampaign();
  const dialType = useDialType();
  const addLeadNoteId = useAddLeadNoteId();
  const isNumberMask = useIsNumberMask();
  // const campaignMode: any = "1";
  const campaignMode = useCampaignMode();
  const isShowCallModal = useShowCallModal();
  const campaignType = useCampaignType();
  const numberMasking = useNumberMasking();
  const isInboundCampaign = useIsInboundCampaign();
  const predictiveData = usePredictiveData();
  const isCallResume = useCallResume();
  const callScreen = useCallScreen();
  const isShowCallDuration = useIsShowCallDuration();
  const isCallHangUp = useIsCallHangUp();
  const callerNumber = useCallerNumber();
  const callerName = useCallerName();
  const userEntry = useUserEntry();

  //  ---------------------------------------------------------
  // ✅ put near top of CallingModal()
  const callerTuneRef = useRef<HTMLAudioElement | null>(null);
  const callerBeepRef = useRef<HTMLAudioElement | null>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const playTune = () => {
    const a = callerTuneRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => { });
  };

  const stopTune = () => {
    const a = callerTuneRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  };

  const playBeep = () => {
    const a = callerBeepRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => { });
  };

  const stopBeep = () => {
    const a = callerBeepRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  };

  const playClickBeep = () => {
    const a = beepRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => { });
  };

  const stopClickBeep = () => {
    const a = beepRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  };

  useEffect(() => {
    callerTuneRef.current = new Audio(CallerTuneFile);
    callerTuneRef.current.preload = "auto";
    callerTuneRef.current.loop = true;          // optional (ringtone usually loops)
    callerTuneRef.current.volume = 1;

    callerBeepRef.current = new Audio(CallerBeepFile);
    callerBeepRef.current.preload = "auto";
    callerBeepRef.current.loop = false;
    callerBeepRef.current.volume = 1;

    beepRef.current = new Audio(BeepFile);
    beepRef.current.preload = "auto";
    beepRef.current.loop = false;
    beepRef.current.volume = 1;

    return () => {
      // ✅ cleanup on unmount
      [callerTuneRef.current, callerBeepRef.current, beepRef.current].forEach(a => {
        if (!a) return;
        a.pause();
        a.currentTime = 0;
        a.src = ""; // helps release resource in some browsers
      });
      callerTuneRef.current = null;
      callerBeepRef.current = null;
      beepRef.current = null;
    };
  }, []);


  //  ---------------------------------------------------------


  useEffect(() => {
    console.log(callScreen, "dialer screen------>");
    console.log(campaignMode, "dialer campaignMode------>");
  }, [callScreen, campaignMode]);

  useEffect(() => {
    return () => clearInterval(durationInterval); // Cleanup interval on component unmount
  }, []);

  useEffect(() => {
    callDuration(isShowCallDuration); // Update call duration when isShowCallDuration changes
  }, [isShowCallDuration]);

  const autoAnswerRef = useRef("1"); // default 1
  useEffect(() => {
    autoAnswerRef.current = String(selectedCampaignDetails?.auto_answer ?? "1");
    console.log("✅ autoAnswerRef updated =", autoAnswerRef.current);
  }, [selectedCampaignDetails?.auto_answer]);


  useEffect(() => {
    if (userEntry === "login-entry") {
      if (user?.isPbx) {
        userAgentRegistration();
      } else {
        if (!isInboundCampaign) {
          userAgentRegistration();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInboundCampaign, campaignType, userEntry]);

  useEffect(() => {
    // !user?.isPbx &&
    if (campaignMode === "1" || campaignMode === "3") {
      dispatch(setCallScreen("LEADDIAL"));
      dispatch(onSetDialType("leadDial"));
      Cookies.set("isReceivedDirect", "0");
    } else {
      Cookies.set("isReceivedDirect", "1");
    }

    Cookies.set("selectedCampaign", selectedCampaign);
    console.log(campaignMode, 'campaignMode');
    Cookies.set("campaignMode", campaignMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignMode, user, selectedCampaign]);

  useEffect(() => {
    Cookies.set("isCallResume", isCallResume ? "0" : "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCallResume]);

  useEffect(() => {
    if (campaignType === "inbound") {
      dispatch(setCallScreen("LEADDIAL"));
      dispatch(onSetDialType("leadDial"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignType]);

  useEffect(() => {
    // && !user?.isPbx
    console.log("campaignMode", campaignMode);
    if (callScreen !== "LIVE") {
      if (
        dialType === "leadDial" &&
        (campaignType === "inbound" ||
          campaignMode === "1" ||
          campaignMode === "3")
      ) {
        dispatch(setCallScreen("LEADDIAL"));
        dispatch(onSetDialType("leadDial"));
      } else {
        dispatch(setCallScreen(""));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialType, campaignType, campaignMode, isCallHangUp]);

  useEffect(() => {
    if (!user?.ispbx && campaignType === "inbound" && isCallResume) {
      Cookies.set("isRejected", "0");
    } else {
      Cookies.set("isRejected", "1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCallResume, campaignType]);

  useEffect(() => {
    // userAgentRegistration();
    //getLocalStream();
    if (outgoingSession && outgoingSession._state === "Established") {
      console.log(outgoingSession);
      setupRemoteMedia(outgoingSession);
    } else if (incomingSession && incomingSession._state === "Established") {
      setupRemoteMedia(incomingSession);
    } else {
      getLocalStream();
    }
    Cookies.set("showModal", showModal.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  useEffect(() => {
    if (
      (!incomingSession ||
        (incomingSession && incomingSession._state === "Terminated")) &&
      (!outgoingSession ||
        (outgoingSession && outgoingSession._state === "Terminated"))
    ) {
      dialNumbers && call();
    } else {
      dispatch(onDial(null));
      console.log("try to null--->");
      dispatch(onAddLeadNoteId(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialNumbers]);

  // CALL
  const call = () => {
    if (!user?.isPbx && !!!selectedCampaign) {
      Danger("You are not able to call without any campagin");
      dispatch(onDial(null));
      dispatch(onAddLeadNoteId(null));
      return false;
    } else {
      dialNumbers &&
        callStatusCardProperties(dialNumbers, "dialNumberKps", dialNumbers);
    }
  };

  useEffect(() => {
    if (isShowCallModal === "true") {
      setShowModal(true);
      if (
        dialType === "leadDial" &&
        // !user?.isPbx &&
        (campaignType === "inbound" ||
          campaignMode === "1" ||
          campaignMode === "3")
      ) {
        dispatch(setCallScreen("LEADDIAL"));
        dispatch(onSetDialType("leadDial"));
      } else {
        dispatch(setCallScreen(""));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowCallModal]);

  const getLocalStream = () => {
    navigator?.mediaDevices
      ?.getUserMedia({ video: false, audio: true })
      .then((stream) => {
        // window.localAudio.autoplay = true;
      })
      .catch((err) => {
        console.error(`you got an error: ${err}`);
      });
  };

  // GET CALL STATISTIC
  const onGetCallStatistic = async () => {
    if (user?.isPbx) {
      try {
        await dispatch(getCallStatistic()).unwrap();
      } catch (error: any) {
        console.log("Get statistics error ---->", error?.message);
      }
    } else {
      dispatch(onSetNumberMask(false));
    }
  };

  // GET MISSED CALL COUNT
  const onMissedCallCountGet = async () => {
    if (user?.isPbx) {
      try {
        await dispatch(getMissedCallCount()).unwrap();
      } catch (error: any) {
        console.log("Get missed call count error ---->", error?.message);
      }
    }
  };

  const onUpdateDialLevel = async () => {
    try {
      let payload: any = {
        campaign_uuid: selectedCampaign
          ? selectedCampaign
          : Cookies.get("selectedCampaign")
            ? Cookies.get("selectedCampaign")
            : "",
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

  const onCallQueueInbound = async () => {
    try {
      let payload: any = {
        extension: user?.agent_detail?.extension_details[0].username,
        campaign_uuid: selectedCampaign
          ? selectedCampaign
          : Cookies.get("selectedCampaign")
            ? Cookies.get("selectedCampaign")
            : "",
        feature: "hang-up",
        campaign_type:
          campaignType === "inbound"
            ? ""
            : campaignType === "outbound"
              ? "0"
              : "2",
      };
      await dispatch(callQueueInbound(payload)).unwrap();
    } catch (error: any) {
      console.log("call queue err -->", error?.message);
    }
  };

  // GET LEAD INFORMATUON
  const onGetLeadInfo = async (lead_uuid: string) => {
    try {
      console.log("chlaa");
      
      await dispatch(getSingleLead(lead_uuid)).unwrap();
    } catch (error: any) {
      console.log("Get lead Info Err--->", error?.message);
    }
  };

  // SET LEAD INFORMATUON
  const onSetLead = async (lead_uuid: string) => {
    try {
      const leadinfo = await dispatch(getSingleLead(lead_uuid)).unwrap();
      return leadinfo; // Return the leadinfo after unwrapping the promise
    } catch (error: any) {
      console.log("Get lead Info Err--->", error?.message);
      throw error; // Throw the error to handle it elsewhere if needed
    }
  };

  // ERROR || SUCCESS MSG TIME OUT
  useEffect(() => {
    if (errorMessage || successMessage) {
      setTimeout(() => {
        errorMessage && setErrorMessage("");
        successMessage && setSuccessMessage("");
      }, 2000);
    }
  }, [errorMessage, successMessage]);

  // UPDATE ENTRY IN LIVE REPORT
  const onUpdateLiveAgentEntry = async (
    callType: string,
    phone_number: string
  ) => {
    try {
      let payload = {
        status:
          callType === "Incoming" ? "1" : callType === "hangup" ? "5" : "2",
        campaign_uuid: selectedCampaign
          ? selectedCampaign
          : Cookies.get("selectedCampaign")
            ? Cookies.get("selectedCampaign")
            : "",
        phone_number: phone_number,
        type: callType === "hangup" ? "hangup" : callType,
      };
      await dispatch(updateLiveAgentEntry(payload)).unwrap();
    } catch (error: any) {
      console.log("Agent Entry err --->", error?.message);
    }
  };

  // ADD REPORT
  const onAddReport = async (feature: string, operation: string) => {
    try {
      let payload = {
        feature: feature,
        operation: operation,
      };
      await dispatch(reportAdd(payload)).unwrap();
    } catch (error: any) {
      console.log("add agent report error : --->", error?.message);
    }
  };

  // MUTE MEDIA
  // const muteMediaSession = () => {
  //   const mediaElement: any = document.getElementById("mediaElement");

  //   if (mediaElement) {
  //     //mediaElement.pause();
  //     setIsMuted(true);
  //   }

  //   if (
  //     incomingSession &&
  //     (incomingSession._state === "Initial" ||
  //       incomingSession._state === "Establishing" ||
  //       incomingSession._state === "Established")
  //   ) {
  //     if (incomingSession._state === "Established") {
  //       incomingMediaStream =
  //         incomingSession.sessionDescriptionHandler.peerConnection;
  //       incomingMediaStream.getSenders().forEach((incomingStream: any) => {
  //         incomingStream.track.enabled = false;
  //         setIsMuted(!incomingStream.track.enabled);
  //       });
  //     }
  //   }

  //   if (
  //     outgoingSession &&
  //     (outgoingSession._state === "Establishing" ||
  //       outgoingSession._state === "Established")
  //   ) {
  //     if (outgoingSession._state === "Established") {
  //       outgoingMediaStream =
  //         outgoingSession.sessionDescriptionHandler.peerConnection;
  //       outgoingMediaStream.getSenders().forEach((outgoingStream: any) => {
  //         outgoingStream.track.enabled = false;
  //         setIsMuted(!outgoingStream.track.enabled);
  //       });
  //     }
  //   }
  // };

  const confmuteMediaSession = (phoneNumber: number) => {
    // alert(phoneNumber);
    console.log("===============Session_mute");
    console.log(outgoingSession);
    console.log(secondCallSession);
    console.log(incomingSession);
    console.log("===============Session_mute");
    const mediaElement: any = document.getElementById("mediaElement");

    if (mediaElement) {
      //mediaElement.pause();
      setIsMuted(true);
    }
    /*  if (
        outgoingSession &&
        (outgoingSession._state === "Establishing" ||
          outgoingSession._state === "Established")
      ) {
        if (outgoingSession._state === "Established") {
          const localStream =
            outgoingSession.sessionDescriptionHandler.peerConnection.getRemoteStreams()[0];
          localStream.getAudioTracks().forEach((track: any) => {
            track.enabled = false; // Mute A's outgoing audio
          });
        }
      }*/
    if (
      outgoingSession &&
      (outgoingSession._state === "Establishing" ||
        outgoingSession._state === "Established")
    ) {
      const outgoingSessionPhoneNumber =
        outgoingSession.outgoingRequestMessage?.toURI?.normal?.user;

      if (outgoingSessionPhoneNumber === phoneNumber.toString()) {
        const localStream =
          outgoingSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
        localStream.getAudioTracks().forEach((track: any) => {
          track.enabled = false; // Mute A's outgoing audio
        });
      } else {
        console.warn(
          `Phone number ${phoneNumber} does not match the outgoing session's destination ${outgoingSessionPhoneNumber}. Checking secondCallSession...`
        );

        // Check if the phone number matches the second call session
        if (
          secondCallSession &&
          (secondCallSession._state === "Establishing" ||
            secondCallSession._state === "Established")
        ) {
          const secondCallSessionPhoneNumber =
            secondCallSession.outgoingRequestMessage?.toURI?.normal?.user;

          if (secondCallSessionPhoneNumber === phoneNumber.toString()) {
            const localStream =
              secondCallSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
            localStream.getAudioTracks().forEach((track: any) => {
              track.enabled = false; // Mute A's outgoing audio
            });
          } else {
            console.warn(
              `Phone number ${phoneNumber} does not match the second call session's destination ${secondCallSessionPhoneNumber}.`
            );
          }
        } else {
          console.warn(
            "Second call session is not in a valid state for muting."
          );
        }
      }
    } else {
      console.warn("Outgoing session is not in a valid state for muting.");
    }

    // if (
    //   outgoingSession &&
    //   (outgoingSession._state === "Establishing" ||
    //     outgoingSession._state === "Established")
    // ) {
    //   if (outgoingSession._state === "Established") {
    //     const remoteStream =
    //       outgoingSession.sessionDescriptionHandler.peerConnection.getRemoteStreams()[0];
    //     remoteStream.getAudioTracks().forEach((track: any) => {
    //       track.enabled = true; // Mute A's outgoing audio
    //     });
    //   }
    // }
  };

  const confunMuteMediaSession = (phoneNumber: number) => {
    // alert(phoneNumber);
    const mediaElement: any = document.getElementById("mediaElement");

    if (mediaElement) {
      mediaElement.play();
      setIsMuted(false);
    }
    console.log("===============Session_unmute");
    console.log(outgoingSession);
    console.log(secondCallSession);
    console.log(incomingSession);
    console.log("===============Session_unmute");
    /*    if (
          outgoingSession &&
          (outgoingSession._state === "Establishing" ||
            outgoingSession._state === "Established")
        ) {
          if (outgoingSession._state === "Established") {
            const remoteStream =
              outgoingSession.sessionDescriptionHandler.peerConnection.getRemoteStreams()[0];
            remoteStream.getAudioTracks().forEach((track: any) => {
              track.enabled = true; // Mute A's incoming audio from C
            });
          }
        }*/
    if (
      outgoingSession &&
      (outgoingSession._state === "Establishing" ||
        outgoingSession._state === "Established")
    ) {
      const outgoingSessionPhoneNumber =
        outgoingSession.outgoingRequestMessage?.toURI?.normal?.user;

      if (outgoingSessionPhoneNumber === phoneNumber.toString()) {
        const localStream =
          outgoingSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
        localStream.getAudioTracks().forEach((track: any) => {
          track.enabled = true; // Mute A's outgoing audio
        });
      } else {
        console.warn(
          `Phone number ${phoneNumber} does not match the outgoing session's destination ${outgoingSessionPhoneNumber}. Checking secondCallSession...`
        );

        // Check if the phone number matches the second call session
        if (
          secondCallSession &&
          (secondCallSession._state === "Establishing" ||
            secondCallSession._state === "Established")
        ) {
          const secondCallSessionPhoneNumber =
            secondCallSession.outgoingRequestMessage?.toURI?.normal?.user;

          if (secondCallSessionPhoneNumber === phoneNumber.toString()) {
            const localStream =
              secondCallSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
            localStream.getAudioTracks().forEach((track: any) => {
              track.enabled = true; // Mute A's outgoing audio
            });
          } else {
            console.warn(
              `Phone number ${phoneNumber} does not match the second call session's destination ${secondCallSessionPhoneNumber}.`
            );
          }
        } else {
          console.warn(
            "Second call session is not in a valid state for unmuting."
          );
        }
      }
    } else {
      console.warn("Outgoing session is not in a valid state for unmuting.");
    }
  };

  /*  const muteMediaSession = () => {
      // alert("1234");
      // alert(showConferenceBtn);
      const mediaElement: any = document.getElementById("mediaElement");
  
      if (mediaElement) {
        //mediaElement.pause();
        setIsMuted(true);
      }
      if (showConferenceBtn === false) {
        if (
          secondCallSession &&
          (secondCallSession._state === "Establishing" ||
            secondCallSession._state === "Established")
        ) {
          if (secondCallSession._state === "Established") {
            const remoteStream =
              secondCallSession.sessionDescriptionHandler.peerConnection.getRemoteStreams()[0];
            remoteStream.getAudioTracks().forEach((track: any) => {
              track.enabled = false; // Mute A's incoming audio from C
            });
          }
        }
      } else {
        if (
          incomingSession &&
          (incomingSession._state === "Initial" ||
            incomingSession._state === "Establishing" ||
            incomingSession._state === "Established")
        ) {
          if (incomingSession._state === "Established") {
            const localStream =
              incomingSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
            localStream.getAudioTracks().forEach((track: any) => {
              track.enabled = false; // Mute A's outgoing audio
            });
          }
        }
  
        if (
          outgoingSession &&
          (outgoingSession._state === "Establishing" ||
            outgoingSession._state === "Established")
        ) {
          if (outgoingSession._state === "Established") {
            const localStream =
              outgoingSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
            localStream.getAudioTracks().forEach((track: any) => {
              track.enabled = false; // Mute A's outgoing audio
            });
          }
        }
  
        if (
          outgoingSession &&
          (outgoingSession._state === "Establishing" ||
            outgoingSession._state === "Established")
        ) {
          if (outgoingSession._state === "Established") {
            const remoteStream =
              outgoingSession.sessionDescriptionHandler.peerConnection.getRemoteStreams()[0];
            remoteStream.getAudioTracks().forEach((track: any) => {
              track.enabled = true; // Mute A's outgoing audio
            });
          }
        }
  
        if (
          secondCallSession &&
          (secondCallSession._state === "Establishing" ||
            secondCallSession._state === "Established")
        ) {
          if (secondCallSession._state === "Established") {
            const remoteStream =
              secondCallSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
            remoteStream.getAudioTracks().forEach((track: any) => {
              track.enabled = false; // Mute A's incoming audio from C
            });
          }
        }
      }
    };*/

  const muteMediaSession = () => {
    // alert("1234");
    // alert(showConferenceBtn);
    const mediaElement: any = document.getElementById("mediaElement");
    console.log(mediaElement);
    console.log("mute ++  mediaElement");
    if (mediaElement) {
      //mediaElement.pause();
      setIsMuted(true);
    }
    if (showConferenceBtn === false) {
      if (
        secondCallSession &&
        (secondCallSession._state === "Establishing" ||
          secondCallSession._state === "Established")
      ) {
        if (secondCallSession._state === "Established") {
          const remoteStream =
            secondCallSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
          console.log(remoteStream);
          console.log("unmute ++  remoteStream second");
          console.log(
            "Current state of secondCallSession mute if:",
            secondCallSession._state
          );
          remoteStream.getAudioTracks().forEach((track: any) => {
            track.enabled = false; // Mute A's incoming audio from C
          });
        }
      }
    } else {
      if (
        incomingSession &&
        (incomingSession._state === "Initial" ||
          incomingSession._state === "Establishing" ||
          incomingSession._state === "Established")
      ) {
        if (incomingSession._state === "Established") {
          const localStream =
            incomingSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
          console.log(remoteStream);
          console.log("unmute ++  remoteStream incoming");
          console.log(
            "Current state of incomingSession mute:",
            incomingSession._state
          );
          localStream.getAudioTracks().forEach((track: any) => {
            track.enabled = false; // Mute A's outgoing audio
          });
        }
      }

      if (
        outgoingSession &&
        (outgoingSession._state === "Establishing" ||
          outgoingSession._state === "Established")
      ) {
        if (outgoingSession._state === "Established") {
          const localStream =
            outgoingSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
          if (localStream) {
            console.log(localStream);
            console.log("unmute ++  remoteStream incoming");
            console.log(
              "Current state of outgoingSession mute:",
              outgoingSession._state
            );
            localStream.getAudioTracks().forEach((track: any) => {
              track.enabled = false; // Mute A's outgoing audio
            });
          } else {
            console.log(
              "localStream is undefined. Possibly the call is on hold or transferred."
            );
          }
        }
      }

      if (
        outgoingSession &&
        (outgoingSession._state === "Establishing" ||
          outgoingSession._state === "Established")
      ) {
        if (outgoingSession._state === "Established") {
          const remoteStream =
            outgoingSession.sessionDescriptionHandler.peerConnection.getRemoteStreams()[0];
          if (remoteStream) {
            console.log(remoteStream);
            console.log("unmute ++  remoteStream outgoing");
            console.log(
              "Current state of outgoingSession mute2:",
              outgoingSession._state
            );
            remoteStream.getAudioTracks().forEach((track: any) => {
              track.enabled = true; // Mute A's outgoing audio
            });
          } else {
            console.log(
              "remoteStream is undefined. Possibly the call is on hold or transferred."
            );
          }
        }
      }

      if (
        secondCallSession &&
        (secondCallSession._state === "Establishing" ||
          secondCallSession._state === "Established")
      ) {
        if (secondCallSession._state === "Established") {
          const remoteStream =
            secondCallSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
          if (remoteStream) {
            console.log(remoteStream);
            console.log("unmute ++  remoteStream second");
            console.log(
              "Current state of secondCallSession mute:",
              secondCallSession._state
            );
            remoteStream.getAudioTracks().forEach((track: any) => {
              track.enabled = false; // Mute A's incoming audio from C
            });
          } else {
            console.log(
              "remoteStream is undefined. Possibly the call is on hold or transferred."
            );
          }
        }
      }
    }
  };

  /*  const unMuteMediaSession = () => {
      const mediaElement: any = document.getElementById("mediaElement");
  
      if (mediaElement) {
        mediaElement.play();
        setIsMuted(false);
      }
  
      if (showConferenceBtn === false) {
        if (
          secondCallSession &&
          (secondCallSession._state === "Establishing" ||
            secondCallSession._state === "Established")
        ) {
          if (secondCallSession._state === "Established") {
            const remoteStream =
              secondCallSession.sessionDescriptionHandler.peerConnection.getRemoteStreams()[0];
            remoteStream.getAudioTracks().forEach((track: any) => {
              track.enabled = true; // Mute A's incoming audio from C
            });
          }
        }
      } else {
        if (
          incomingSession &&
          (incomingSession._state === "Initial" ||
            incomingSession._state === "Establishing" ||
            incomingSession._state === "Established")
        ) {
          if (incomingSession._state === "Established") {
            const remoteStream =
              incomingSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
            remoteStream.getAudioTracks().forEach((track: any) => {
              track.enabled = true; // Mute A's incoming audio from C
            });
          }
        }
  
        if (
          outgoingSession &&
          (outgoingSession._state === "Establishing" ||
            outgoingSession._state === "Established")
        ) {
          if (outgoingSession._state === "Established") {
            const remoteStream =
              outgoingSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
            remoteStream.getAudioTracks().forEach((track: any) => {
              track.enabled = true; // Mute A's incoming audio from C
            });
          }
        }
  
        if (
          secondCallSession &&
          (secondCallSession._state === "Establishing" ||
            secondCallSession._state === "Established")
        ) {
          if (secondCallSession._state === "Established") {
            const remoteStream =
              secondCallSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
            remoteStream.getAudioTracks().forEach((track: any) => {
              track.enabled = true; // Mute A's incoming audio from C
            });
          }
        }
      }
    };*/
  const unMuteMediaSession = () => {
    const mediaElement: any = document.getElementById("mediaElement");
    console.log(mediaElement);
    console.log("unmute ++  mediaElement");

    if (mediaElement) {
      mediaElement.play();
      setIsMuted(false);
    }

    if (showConferenceBtn === false) {
      if (
        secondCallSession &&
        (secondCallSession._state === "Establishing" ||
          secondCallSession._state === "Established")
      ) {
        if (secondCallSession._state === "Established") {
          const remoteStream =
            secondCallSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
          console.log(remoteStream);
          console.log("unmute ++  remoteStream secondif");
          console.log(
            "Current state of secondCallSession unmute if:",
            secondCallSession._state
          );
          remoteStream.getAudioTracks().forEach((track: any) => {
            track.enabled = true; // Mute A's incoming audio from C
          });
        }
      }
    } else {
      if (
        incomingSession &&
        (incomingSession._state === "Initial" ||
          incomingSession._state === "Establishing" ||
          incomingSession._state === "Established")
      ) {
        if (incomingSession._state === "Established") {
          const remoteStream =
            incomingSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
          console.log(remoteStream);
          console.log("unmute ++  remoteStream incoming");
          console.log(
            "Current state of incomingSession un:",
            incomingSession._state
          );

          remoteStream.getAudioTracks().forEach((track: any) => {
            track.enabled = true; // Mute A's incoming audio from C
          });
        }
      }

      if (
        outgoingSession &&
        (outgoingSession._state === "Establishing" ||
          outgoingSession._state === "Established")
      ) {
        if (outgoingSession._state === "Established") {
          const remoteStream =
            outgoingSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
          console.log(remoteStream);
          console.log("unmute ++  remoteStream outgoing");
          console.log(
            "Current state of outgoingSession unmute:",
            outgoingSession._state
          );
          remoteStream.getAudioTracks().forEach((track: any) => {
            track.enabled = true; // Mute A's incoming audio from C
          });
        }
      }

      if (
        secondCallSession &&
        (secondCallSession._state === "Establishing" ||
          secondCallSession._state === "Established")
      ) {
        if (secondCallSession._state === "Established") {
          const remoteStream =
            secondCallSession.sessionDescriptionHandler.peerConnection.getLocalStreams()[0];
          console.log(remoteStream);
          console.log("unmute ++  remoteStream second");
          console.log(
            "Current state of secondCallSession unmute:",
            secondCallSession._state
          );
          remoteStream.getAudioTracks().forEach((track: any) => {
            track.enabled = true; // Mute A's incoming audio from C
          });
        }
      }
    }
  };

  // UNMUTE MEDIA
  // const unMuteMediaSession = () => {
  //   const mediaElement: any = document.getElementById("mediaElement");

  //   if (mediaElement) {
  //     mediaElement.play();
  //     setIsMuted(false);
  //   }

  //   if (
  //     incomingSession &&
  //     (incomingSession._state === "Initial" ||
  //       incomingSession._state === "Establishing" ||
  //       incomingSession._state === "Established")
  //   ) {
  //     if (incomingSession._state === "Established") {
  //       incomingMediaStream =
  //         incomingSession.sessionDescriptionHandler.peerConnection;
  //       incomingMediaStream.getSenders().forEach((incomingStream: any) => {
  //         incomingStream.track.enabled = true;
  //         setIsMuted(!incomingStream.track.enabled);
  //       });
  //     }
  //   }

  //   if (
  //     outgoingSession &&
  //     (outgoingSession._state === "Establishing" ||
  //       outgoingSession._state === "Established")
  //   ) {
  //     if (outgoingSession._state === "Established") {
  //       outgoingMediaStream =
  //         outgoingSession.sessionDescriptionHandler.peerConnection;
  //       outgoingMediaStream.getSenders().forEach((outgoingStream: any) => {
  //         outgoingStream.track.enabled = true;
  //         setIsMuted(!outgoingStream.track.enabled);
  //       });
  //     }
  //   }
  // };

  // HOLD CALL
  const onCallHold = async () => {
    setIsHold(true);
    const payload = {
      status: "7",
      campaign_uuid: selectedCampaign
        ? selectedCampaign
        : Cookies.get("selectedCampaign")
          ? Cookies.get("selectedCampaign")
          : "",
    }

    await dispatch(updateLiveAgentEntry(payload)).unwrap();

    if (outgoingSession && outgoingSession._state !== "Terminated") {
      if (outgoingSession._state !== "Establishing") {
        outgoingSession.invite({
          sessionDescriptionHandlerOptions: {
            hold: true,
          },
        });
      }
    }

    if (incomingSession && incomingSession._state !== "Terminated") {
      if (incomingSession._state !== "Establishing") {
        incomingSession.invite({
          sessionDescriptionHandlerOptions: {
            hold: true,
          },
        });
      }
    }
  };

  // UN-HOLD CALL
  const onCallUnHold = async () => {
    setIsHold(false);

    const payload = {
      status: callType == "Incoming Call From" ? "1" : callType == "Outgoing Call To" ? "2" : "",
      campaign_uuid: selectedCampaign
        ? selectedCampaign
        : Cookies.get("selectedCampaign")
          ? Cookies.get("selectedCampaign")
          : "",
    }

    await dispatch(updateLiveAgentEntry(payload)).unwrap();

    if (outgoingSession && outgoingSession._state !== "Terminated") {
      if (outgoingSession._state !== "Establishing") {
        outgoingSession.invite({
          sessionDescriptionHandlerOptions: {
            hold: false,
          },
        });
      }
    }

    if (incomingSession && incomingSession._state !== "Terminated") {
      if (incomingSession._state !== "Establishing") {
        incomingSession.invite({
          sessionDescriptionHandlerOptions: {
            hold: false,
          },
        });
      }
    }
  };

  //	VOLUME CONTROL
  const controlVolume = (event: any) => {
    const mediaElement: any = document.getElementById("mediaElement");

    if (
      incomingSession &&
      (incomingSession._state === "Initial" ||
        incomingSession._state === "Establishing" ||
        incomingSession._state === "Established")
    ) {
      if (incomingSession._state === "Established") {
        mediaElement.volume = (parseInt(event.target.value, 10) || 0) / 100;
      }
    }

    if (
      outgoingSession &&
      (outgoingSession._state === "Establishing" ||
        outgoingSession._state === "Established")
    ) {
      if (outgoingSession._state === "Established") {
        mediaElement.volume = (parseInt(event.target.value, 10) || 0) / 100;
      }
    }
  };

  // CALL DURATION
  // const callDuration = async (callStatus: Boolean) => {
  //   if (callStatus === true) {
  //     //	Call transfer type

  //     let secs = 0;
  //     let mins = 0;

  //     durationInterval = setInterval(() => {
  //       if (secs < 60) {
  //         secs = secs + 1;
  //         setSeconds(secs);
  //         setAddNoteSeconds(secs);
  //       }
  //       if (secs >= 59) {
  //         secs = 0;
  //         mins = mins + 1;
  //         setSeconds(secs);
  //         setMinutes(mins);
  //         setAddNoteSeconds(secs);
  //         setAddNoteMinutes(mins);
  //       }
  //     }, 1000);
  //   } else {
  //     setSeconds(0);
  //     setMinutes(0);
  //     clearInterval(durationInterval);
  //   }
  // };

  const callDuration = async (callStatus: boolean) => {
    if (callStatus) {
      // alert("IF callDuration")
      clearInterval(durationInterval); // Clear any existing interval
      durationInterval = setInterval(() => {
        setSeconds((prevSeconds) => {
          let newSeconds = prevSeconds + 1;
          if (newSeconds >= 60) {
            setMinutes((prevMinutes) => prevMinutes + 1);
            newSeconds = 0;
          }
          // alert(newSeconds);
          // console.log("====================newSeconds=======================");
          // console.log(newSeconds);
          // console.log("====================newSeconds=======================");
          return newSeconds;
        });
      }, 1000);
    } else {
      // alert("else callDuration")
      clearInterval(durationInterval);
      setSeconds(0);
      setMinutes(0);
    }
  };

  const remoteStream = new MediaStream();

  const setupRemoteMedia = (mediaSession: any) => {
    let mediaElement: any = document.getElementById("mediaElement");
    try {
      mediaSession.sessionDescriptionHandler.peerConnection
        .getReceivers()
        .forEach((receiver: any) => {
          if (receiver.track) {
            console.log("Audio remoteStream");

            remoteStream.addTrack(receiver.track);
            console.log(remoteStream);
            mediaElement.srcObject = remoteStream;
            mediaElement.play();
          }
        });
    } catch (error) {
      console.log("Media audio session error - ", error);
    }
  };

  function conference(sessions: any) {
    //take all received tracks from the sessions you want to merge
    //empty array called receivedTracks to store the received audio tracks.
    var receivedTracks: MediaStreamTrack[] = [];

    sessions.forEach(function (session: any) {
      if (session !== null && session !== undefined) {
        console.log("FOR LOOP");
        console.log(session);
        session.sessionDescriptionHandler.peerConnection
          .getReceivers()
          .forEach(function (receiver: any) {
            receivedTracks.push(receiver.track);
          });
      }
    });
    // over each receiver and adds its associated track to the receivedTracks array.
    //use the Web Audio API to mix the received tracks
    var context = new AudioContext();
    var allReceivedMediaStreams = new MediaStream();

    sessions.forEach(function (session: any) {
      if (session !== null && session !== undefined) {
        // it creates a new MediaStreamDestination object named mixedOutput using the context.createMediaStreamDestination() method.
        var mixedOutput = context.createMediaStreamDestination();

        session.sessionDescriptionHandler.peerConnection
          .getReceivers()
          .forEach(function (receiver: any) {
            receivedTracks.forEach(function (track) {
              allReceivedMediaStreams.addTrack(receiver.track);
              if (receiver.track.id !== track.id) {
                var sourceStream = context.createMediaStreamSource(
                  new MediaStream([track])
                );
                // For each track, it adds it to the allReceivedMediaStreams stream and checks
                //if the receiver's track ID is not equal to the current track's ID. If they are not the same,
                // it creates a MediaStreamSource object from the current track and connects it to the mixedOutput using sourceStream.connect(mixedOutput).
                sourceStream.connect(mixedOutput);
              }
            });
          });
        //mixing your voice with all the received audio

        session.sessionDescriptionHandler.peerConnection
          .getSenders()
          .forEach(function (sender: any) {
            var sourceStream = context.createMediaStreamSource(
              new MediaStream([sender.track])
            );
            sourceStream.connect(mixedOutput);
          });
        session.sessionDescriptionHandler.peerConnection
          .getSenders()[0]
          .replaceTrack(mixedOutput.stream.getTracks()[0]);
      }
    });

    //play all received stream to you
    const mediaElement: any = document.getElementById("mediaElement");
    mediaElement.srcObject = allReceivedMediaStreams;
    var promiseRemote = mediaElement.play();
    if (promiseRemote !== undefined) {
      promiseRemote
        .then(() => {
          console.log("playing all received streams to you");
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
  }


  // INCOMING CALL INVITATION
  const onInvite = async (invitation: any) => {
    console.log("INCOMING INCOMING BE READY ========================");
    const call_value = Cookies.get("call_status");
    console.log("isCallResume......" + isCallResume);
    console.log("isCallResume......" + call_value);
    // if (!user?.isPbx && campaignType === "outbound") {
    //   // User is not a PBX user and campaignType is "outbound"
    //   // Reject the incoming call
    //   invitation.reject({ status_code: 603, reason_phrase: "Decline" });
    //   console.log("Outbound campaign: No incoming calls allowed.");
    //   return;
    // }

    if (Cookies.get("isRejected") === "0") {
      invitation.reject({ status_code: 603, reason_phrase: "Decline" });
      console.log("Outbound campaign: No incoming calls allowed.");
      return;
    }

    if (
      !user?.isPbx &&
      Cookies.get("call_status") === "pause" &&
      campaignMode != "0" &&
      campaignMode != "2"
    ) {
      invitation.reject({ status_code: 603, reason_phrase: "Decline" });
      console.log("Outbound campaign: No incoming calls allowed.");
      return;
    }

    console.log(
      "INCOMING INCOMING BE READY ==========invitation==============",
      invitation
    );
    if (outgoingSession && outgoingSession._state != "Terminated") {
      console.log("second hit");

      invitation.reject();
      return;
    }
    if (incomingSession && incomingSession._state != "Terminated") {
      console.log("second hit");

      invitation.reject();
      return;
    }
    Cookies.remove("call_stick_status");
    Cookies.remove("phone_number");
    dispatch(setIsCallHangUp(false));
    dispatch(onSetAddNoteId(null));
    dispatch(onAddLeadNoteId(null));
    dispatch(setCallerNumber(""));
    dispatch(setCallerName(""));
    Cookies.remove("callId");
    console.log(invitation);
    console.log(outgoingSession);
    console.log(incomingSession);

    invitation.delegate = {
      // Handle incoming REFER request.
      onRefer(referral: Referral) {
        //console.log("Handle incoming REFER request.");
        referral.accept().then(() => {
          referral.makeInviter().invite();
        });
      },
    };

    incomingSession = invitation;

    //	Set caller number
    let callNumber = "Unknown";
    let callerId = "";
    let lead_uuid = "";
    let lead_name = "";
    let call_masking = "1";
    let auto = false;

    if (
      invitation?.incomingInviteRequest.earlyDialog.dialogState.remoteURI.normal
        .user
    ) {
      callNumber =
        invitation.incomingInviteRequest.earlyDialog.dialogState.remoteURI
          .normal.user;

      const headers =
        invitation &&
        invitation.incomingInviteRequest &&
        invitation.incomingInviteRequest.message &&
        invitation.incomingInviteRequest.message.headers &&
        invitation.incomingInviteRequest.message.headers;

      if (headers["X-Custom-Callid"] && headers["X-Custom-Callid"][0]) {
        callerId = headers["X-Custom-Callid"][0].raw;
      } else {
        callerId = "";
      }

      if (headers["X-Leaduuid"] && headers["X-Leaduuid"][0]) {
        lead_uuid = headers["X-Leaduuid"][0].raw;
      } else {
        lead_uuid = "";
      }

      if (headers["X-Lead-Name"] && headers["X-Lead-Name"][0]) {
        let name = headers["X-Lead-Name"][0].raw;
        lead_name = name.replace(/--/g, " "); // Replace '--' with a space
      } else {
        lead_name = "";
      }

      if (headers["X-Call-Masking"] && headers["X-Call-Masking"][0]) {
        call_masking = headers["X-Call-Masking"][0].raw;
      } else {
        call_masking = "1";
      }

      if (headers["X-Autocalltype"] && headers["X-Autocalltype"][0]) {
        auto = headers["X-Autocalltype"][0].raw;
      } else {
        auto = false;
      }
    }

    let LeadInfo: any;
    if (!user?.isPbx && lead_uuid) {
      try {
        LeadInfo = await onSetLead(lead_uuid);
        if (LeadInfo && LeadInfo.data) {
          callNumber = LeadInfo.data.phone_number;
        }
      } catch (error) {
        console.error("Error occurred while setting lead:", error);
      }
    }
    console.log("ANJALI CALLER NUNMBER 111", LeadInfo);
    console.log("Call Number:", callNumber);

    if (lead_uuid !== "" && lead_uuid !== "null") {
      console.log("lead_uuid------------------------------->", lead_uuid);
      dispatch(onAddLeadNoteId(lead_uuid));
      !user?.isPbx && onGetLeadInfo(lead_uuid);
    }
    Cookies.set("phone_number", callNumber);
    dispatch(setCallerName(lead_name ? lead_name : ""));
    let CallerNumber =
      call_masking === "0" || (numberMasking && !user?.isPbx)
        ? Array.from(callNumber).length > 4
          ? Array.from(callNumber).fill("X", 2, -2).join("")
          : Array.from(callNumber).fill("X", 1, -1).join("")
        : user?.isPbx && user?.isNumberMasking
          ? Array.from(callNumber).length > 4
            ? Array.from(callNumber).fill("X", 2, -2).join("")
            : Array.from(callNumber).fill("X", 1, -1).join("")
          : callNumber;
    dispatch(setCallerNumber(CallerNumber));
    const autoAnswerValue = autoAnswerRef.current;

console.log("✅ autoAnswerValue (ref) =", autoAnswerValue);
  console.log(autoAnswer ,"auto answer value in invite");
  console.log(Cookies.get("isReceivedDirect") ,"auto isReceivedDirect value in invite");
  
if (Cookies.get("isReceivedDirect") === "0" && autoAnswerValue === "0") {
   console.log("isReceivedDirect");
      console.log("---------TEST------------lead_uuid", lead_uuid);
      if (Cookies.get("isCallResume") === "0" && auto) {
        console.log("in hangup ------------------>");
        hangupCall();
      } else {
        receiveCall();
        Cookies.set("callId", callerId);
        dispatch(onSetAddNoteId(callerId));
      }
      setCallType("Outgoing Call To");
      if (!user?.isPbx) {
        onUpdateLiveAgentEntry("Outgoing", callNumber);
      }
    } else {
      const setScreens: boolean =
        Cookies.get("showModal") === "true" ? true : false;
      if (setScreens) {
        dispatch(setCallScreen("INCOMING"));
      }
      setCallType("Incoming Call From");
      setShowIncomingModal(!setScreens ? true : false);
      Cookies.set("is_call_start", !setScreens ? "0" : "1");
      // callerTuneplay.play(); //	Caller tune play
      // callerTuneplay.currentTime = 0;
      playTune()
      if (!user?.isPbx) {
        onUpdateLiveAgentEntry("Incoming", callNumber);
      }
    }

    if (!user?.isPbx && campaignType === "inbound") {
      onAddReport("inbound", "increment");
      Cookies.set("isEstablished", "1");
    }

    // Setup incoming session delegate
    // invitation.delegate = {
    //   // Handle incoming REFER request.
    //   onRefer(referral: Referral) {
    //     //console.log("Handle incoming REFER request.");
    //     referral.accept().then(() => {
    //       referral.makeInviter().invite();
    //     });
    //   },
    // };

    // incomingSession = invitation;
    dispatch(onShowLeadInfo(true));
    invitation.stateChange.addListener((incomingState: SessionState) => {
      console.log(incomingState, "incomingState");
      switch (incomingState) {
        case SessionState.Initial:
          console.log("Incoming initiated ....");
          Cookies.set("is_call_start", "0");
          // ::yaksh::
          if (Cookies.get("isReceivedDirect") === "0" && autoAnswer) {
            // setTimeout(() => {
            receiveCall();
            // }, 2000);
          } else {
            const setScreens: boolean =
              Cookies.get("showModal") === "true" ? true : false;
            if (setScreens) {
              dispatch(setCallScreen("INCOMING"));
            }
            setShowIncomingModal(!setScreens ? true : false);
            // callerTuneplay.play(); //	Caller tune play
            // callerTuneplay.currentTime = 0;
            playTune()
          }
          // callerTuneplay.play(); //	Caller tune play
          // callerTuneplay.currentTime = 0;
          break;

        case SessionState.Establishing:
          console.log("Incoming establishing ....");
          Cookies.set("is_call_start", "0");
          // callerTuneplay.play(); //	Caller tune play
          // callerTuneplay.currentTime = 0;
          playTune()
          if (Cookies.get("isReceivedDirect") === "0") {
            dispatch(setCallScreen("LIVE"));
          }
          break;

        case SessionState.Established:
          console.log("Incoming established ....");
          console.log("invitation------------------->", invitation);
          Cookies.set("is_call_start", "0");
          // callerBeepPlay.pause(); //	Caller tune pause
          stopBeep()
          if (!user?.isPbx && campaignType === "inbound") {
            onAddReport("inbound", "decrement");
            Cookies.set("isEstablished", "0");
          }
          dispatch(setIsShowCallDuration(true)); // show call duration
          setShowIncomingModal(false); // incoming call Model false
          setShowModal(true);
          dispatch(setCallScreen("LIVE"));
          // callerTuneplay.pause(); //	Caller tune play
          stopTune()
          setupRemoteMedia(invitation); //	Media audio control
          callDuration(true); //	Call duration
          Cookies.set("callId", callerId);
          dispatch(onSetAddNoteId(callerId));
          setAddNoteShowCallDuration(true);
          callKeypadSiderProperties("callEstablished", "Established"); //	On answer manage keypadsider states
          break;

        case SessionState.Terminated:
          console.log("Incoming terminated ....");
          console.log("invitation------------------->", invitation);
          console.log("invitation------------------->", secondCallSession);
          Cookies.set("is_call_start", "1");
          console.log("iscall call id valueeeee", Cookies.get("callId"))
          playBeep();
          onCallQueueInbound();
          if (
            (secondCallSession && secondCallSession._state == "Established") ||
            (secondCallSession && secondCallSession._state == "Establishing")
          ) {
            //incomingSession.refer(secondCallSession)
            console.log("COMING HERE 0");
            setPage("");
            setupRemoteMedia(secondCallSession);
            break;
          } else {
            setShowIncomingModal(false); // incoming call Model false
            // Cookies.remove("LeadDialName");
            setNumber("");
            dispatch(onDial(null));
            setShowModal(true);
            setShowActiveModal(false);
            if (!user?.isPbx) {
              onUpdateLiveAgentEntry(
                "hangup",
                Cookies.get("phone_number") || ""
              );
            }
            if (
              !user?.isPbx &&
              Cookies.get("isEstablished") === "1" &&
              campaignType === "inbound"
            ) {
              onAddReport("inbound", "decrement");
            }
            // if (!!Cookies.get("callId") && user?.isPbx) setIsAddNote(true);
            if (!!Cookies.get("callId") && user?.isPbx)
              dispatch(setCallScreen("ADDNOTE"));
            // && !user?.isPbx
            if (!!Cookies.get("callId")) {
              console.log("after terination incominf calllllll");
              dispatch(setIsCallHangUp(true));
              dispatch(onShowCallModal("false"));
              setShowModal(false);
              if (
                campaignType === "inbound" ||
                campaignMode === "3" ||
                campaignMode === "1"
              ) {
                dispatch(setCallScreen("LEADDIAL"));
                dispatch(onSetDialType("leadDial"));
              } else {
                dispatch(setCallScreen(""));
              }
              if (Cookies.get("campaignMode") === "3" || campaignMode === "3") {
                onUpdateDialLevel();
              }
              onCallQueueInbound();
            }
            if (!!!Cookies.get("callId")) {
              console.log("iscall inside he callid cinditon - its nullll", campaignType, campaignMode)
              dispatch(onAddLeadNoteId(null));
              // dispatch(clearLeadDetails());
              setShowModal(false);
              if (
                (campaignType === "inbound" ||
                  campaignMode === "3" ||
                  campaignMode === "1") &&
                !user?.isPbx
              ) {
                dispatch(setCallScreen("LEADDIAL"));
                dispatch(setIsCallHangUp(false));
                dispatch(onSetDialType("leadDial"));
                console.log("iscall hange upcall status change to false")
              } else {
                dispatch(setCallScreen(""));
              }
            }
            setIsHold(false);
            setIsMuted(false);
            setPage("");
            cleanupMedia(); //	Stop media audio control
            // callerTuneplay.pause(); //	Caller tune pause
            stopTune()
            //incomingSession = null;
            callDuration(false); //	Call duration
            onGetCallStatistic(); // call History refresh
            onMissedCallCountGet(); // call missed call count
            dispatch(setIsShowCallDuration(false));
            callKeypadSiderProperties("callTermination", "Termination"); //	On termination manage keypadsider states
            // console.log("iscall before hangup set to false campaign typeee",campaignType)
            // if (campaignType === "inbound") {
            // console.log("iscall the hang up is set to FALSE after termination")
            // dispatch(setIsCallHangUp(false));
            // }
            if (
              (campaignType === "outbound" || campaignType === "blended") &&
              (campaignMode === "3" || campaignMode === "1")
            ) {
              userAgentRegistration();
            }
            break;
          }

        case SessionState.Terminating:
          Cookies.set("is_call_start", "1");
          console.log("Incoming terminating ....");
          onCallQueueInbound();
          setShowIncomingModal(false); // incoming call Model false
          // Cookies.remove("LeadDialName");
          setNumber("");
          dispatch(onDial(null));
          setShowModal(true);
          setShowActiveModal(false);
          if (!user?.isPbx) {
            onUpdateLiveAgentEntry("hangup", Cookies.get("phone_number") || "");
          }
          // if (!!Cookies.get("callId") && user?.isPbx) setIsAddNote(true);
          if (!!Cookies.get("callId") && user?.isPbx)
            dispatch(setCallScreen("ADDNOTE"));
          // && !user?.isPbx
          if (!!Cookies.get("callId")) {
            dispatch(setIsCallHangUp(true));
            console.log('isCallHangUp from trye');
            
            setShowModal(false);
            if (
              campaignType === "inbound" ||
              campaignMode === "3" ||
              campaignMode === "1"
            ) {
              dispatch(setCallScreen("LEADDIAL"));
              dispatch(onSetDialType("leadDial"));
            } else {
              dispatch(setCallScreen(""));
            }
            if (Cookies.get("campaignMode") === "3" || campaignMode === "3") {
              onUpdateDialLevel();
            }
          }
          Cookies.set("is_call_start", "1");
          if (!!!Cookies.get("callId")) {
            dispatch(onAddLeadNoteId(null));
            dispatch(clearLeadDetails());
            setShowModal(false);
            if (
              (campaignType === "inbound" ||
                campaignMode === "3" ||
                campaignMode === "1") &&
              !user?.isPbx
            ) {
              dispatch(setCallScreen("LEADDIAL"));
              dispatch(onSetDialType("leadDial"));
            } else {
              dispatch(setCallScreen(""));
            }
          }
          setIsHold(false);
          setIsMuted(false);
          setPage("");
          cleanupMedia(); //	Stop media audio control
          // callerTuneplay.pause(); //	Caller tune pause
          stopTune()
          callDuration(false); //	Call duration
          onGetCallStatistic(); // call History refresh
          onMissedCallCountGet(); // call missed call count
          dispatch(setIsShowCallDuration(false));
          callKeypadSiderProperties("callTermination", "Termination"); //	On termination manage keypadsider states
          if (
            (campaignType === "outbound" || campaignType === "blended") &&
            (campaignMode === "3" || campaignMode === "1")
          ) {
            userAgentRegistration();
          }
          break;

        default:
          console.log(
            "Could not identified incoming state .... ",
            incomingState
          );
          setShowIncomingModal(false); // incoming call Model false
          Cookies.remove("LeadDialName");
          setNumber("");
          dispatch(onDial(null));
          setShowModal(true);
          setShowActiveModal(false);
          if (!user?.isPbx) {
            onUpdateLiveAgentEntry("hangup", Cookies.get("phone_number") || "");
          }
          if (
            !user?.isPbx &&
            Cookies.get("isEstablished") === "1" &&
            campaignType === "inbound"
          ) {
            onAddReport("inbound", "decrement");
          }
          // if (!!Cookies.get("callId") && user?.isPbx) setIsAddNote(true);
          if (!!Cookies.get("callId") && user?.isPbx)
            dispatch(setCallScreen("ADDNOTE"));
          // && !user?.isPbx
          if (!!Cookies.get("callId")) {
            dispatch(setIsCallHangUp(true));
            console.log("setIsCallHangUp");

            setShowModal(false);
            if (
              campaignType === "inbound" ||
              campaignMode === "3" ||
              campaignMode === "1"
            ) {
              dispatch(setCallScreen("LEADDIAL"));
              dispatch(onSetDialType("leadDial"));
            } else {
              dispatch(setCallScreen(""));
            }
            if (Cookies.get("campaignMode") === "3" || campaignMode === "3") {
              onUpdateDialLevel();
            }
            onCallQueueInbound();
          }
          Cookies.set("is_call_start", "1");
          if (!!!Cookies.get("callId")) {
            dispatch(onAddLeadNoteId(null));
            dispatch(clearLeadDetails());
            setShowModal(false);
            if (
              (campaignType === "inbound" ||
                campaignMode === "3" ||
                campaignMode === "1") &&
              !user?.isPbx
            ) {
              dispatch(setCallScreen("LEADDIAL"));
              dispatch(onSetDialType("leadDial"));
            } else {
              dispatch(setCallScreen(""));
            }
          }
          setIsHold(false);
          setIsMuted(false);
          setPage("");
          // callerTuneplay.pause(); //	Caller tune pause
          stopTune()
          callDuration(false); //	Call duration
          onGetCallStatistic(); // call History refresh
          onMissedCallCountGet(); // call missed call count
          dispatch(setIsShowCallDuration(false));
          break;
      }
    });

    let constrainsDefault: MediaStreamConstraints = {
      audio: true,
      video: false,
    };

    const options: InvitationAcceptOptions = {
      sessionDescriptionHandlerOptions: {
        constraints: constrainsDefault,
      },
    };
    Cookies.get("isReceivedDirect") !== "0" && invitation.progress(options);
  };

  // const userAgentRegistration = () => {
  //   let username =
  //     Cookies.get("username") ||
  //     user?.agent_detail?.extension_details[0]?.username;
  //   let password =
  //     Cookies.get("password") ||
  //     user?.agent_detail?.extension_details[0]?.password;
  //   let domain =
  //     Cookies.get("domain") || user?.agent_detail?.tenant[0]?.domain;

  //   let UAURI = UserAgent.makeURI("sip:" + username + "@" + domain);
  //   if (!UAURI) throw new Error("Failed to create UserAgent URI ....");

  //   // If UA already exists, DO NOT recreate
  //   if (!userAgent) {
  //     const userOptions: any = {
  //       uri: UAURI,
  //       authorizationPassword: password,
  //       authorizationUsername: username,
  //       transportOptions: {
  //         server: WSS_URL,
  //         traceSip: false, // FALSE to stop lag from logs
  //       },
  //       delegate: { onInvite },
  //       register: false,  // IMPORTANT — manual control
  //       userAgentString: "ASTPP | WEBRTC",
  //       dtmfType: "info",
  //       displayName: username,
  //       activeAfterTransfer: false,
  //       logBuiltinEnabled: false,
  //     };

  //     userAgent = new UserAgent(userOptions);
  //   }

  //   userAgent
  //     .start()
  //     .then(() => {
  //       console.log("Connected ....");

  //       if (!registerer) {
  //         registerer = new Registerer(userAgent);
  //       }

  //       if (!registrationStateListenerAttached) {
  //         registerer.stateChange.addListener((registrationState) => {
  //           console.log("registrationState => ", registrationState);

  //           switch (registrationState) {
  //             case RegistererState.Registered:
  //               console.log("Registered ....");
  //               Cookies.set("logout_count", "", { expires: 1 });
  //               break;

  //             case RegistererState.Unregistered:
  //               console.log("Unregistered ....");
  //               break;

  //             case RegistererState.Terminated:
  //               console.log("Terminated ....");
  //               break;

  //             default:
  //               console.log("Unknown register state", registrationState);
  //           }
  //         });
  //         registrationStateListenerAttached = true;
  //       }

  //       if (callScreen !== "LIVE") {
  //         registerer
  //           .register()
  //           .then(() => console.log("Successfully sent REGISTER"))
  //           .catch((err) => console.log("Failed REGISTER", err));
  //       }
  //     })
  //     .catch((error: any) => {
  //       console.log("Failed to connect user agent .... ", error);
  //     });
  // };


  // AGENT REGISTRATION
  const userAgentRegistration = () => {
    let username =
      Cookies.get("username") ||
      user?.agent_detail?.extension_details[0]?.username;
    let password =
      Cookies.get("password") ||
      user?.agent_detail?.extension_details[0]?.password;
    let domain = Cookies.get("domain") || user?.agent_detail?.tenant[0]?.domain;
    let UAURI = UserAgent.makeURI("sip:" + username + "@" + domain);
    if (!UAURI) {
      throw new Error("Failed to create UserAgent URI ....");
    }

    const userOptions: any = {
      uri: UAURI,
      authorizationPassword: password,
      authorizationUsername: username,
      transportOptions: {
        server: WSS_URL,
        traceSip: true,
      },
      delegate: { onInvite },
      register: true,
      noAnswerTimeout: 60,
      userAgentString: "ASTPP | WEBRTC ",
      dtmfType: "info",
      displayName: username,
      activeAfterTransfer: false, //	Die when the transfer is completed
      logBuiltinEnabled: true, //	Boolean - true or false - If true throws console logs
    };
    userAgent = new UserAgent(userOptions);
    dispatch(setWebRtcStatus('CONNECTING'));
    userAgent
      .start()
      .then(() => {
        console.log("Connected ....");
        const registerer = new Registerer(userAgent);
        registerer.stateChange.addListener(
          (registrationState: RegistererState) => {
            console.log("registrationState", registrationState);
          }
        );
        registerer.stateChange.addListener(
          (registrationState: RegistererState) => {
            console.log("registrationState => ", registrationState);
            switch (registrationState) {
              case RegistererState.Registered:
                console.log("Registered11111 ....");
                dispatch(setWebRtcStatus('CONNECTED'));
                Cookies.set("logout_count", "", { expires: 1 });
                break;
              case RegistererState.Unregistered:
                console.log("Unregistered ....");
                dispatch(setWebRtcStatus('DISCONNECTED'));
                if (!!user) {
                  setTimeout(() => {
                    userAgentRegistration();
                  }, 3000);
                }
                let start: any = 1;
                let count: any = Cookies.get("logout_count");
                if (count === "") {
                  Cookies.set("logout_count", start, { expires: 1 });
                } else {
                  count = 2;
                  Cookies.set("logout_count", count, { expires: 1 });
                }
                count = Cookies.get("logout_count");
                if (count === "2") {
                  Cookies.set("logout_count", "", { expires: 1 });
                  Cookies.set("authenticated", "false", { expires: 1 });
                  Cookies.set("logout", "true", { expires: 1 });
                  break;
                }
                break;
              case RegistererState.Terminated:
                console.log("Terminated ....");
                dispatch(setWebRtcStatus('DISCONNECTED'));
                break;
              default:
                console.log(
                  "Could not identified registration state .... ",
                  registrationState
                );
                dispatch(setWebRtcStatus('ERROR'));
                break;
            }
          }
        );
        if (callScreen !== "LIVE") {
          registerer
            .register()
            .then((request: any) => {
              console.log("Successfully sent REGISTER request .... ", request);
            })
            .catch((error: any) => {
              console.log("Failed to send REGISTER request .... ", error);
            });
        }
      })
      .catch((error: any) => {
        console.log("Failed to connect user agent .... ", error);
      });
  };

  //	Call keypadsider properties from statuscard component
  const callKeypadSiderProperties = (functionName = "", argumentOne = "") => {
    if (functionName !== "") {
      let dataForLocalStorageSc = {
        functionName: functionName,
        argumentOne: argumentOne,
      };
      // console.log("dataForLocalStorageSc ===> ");
      console.log("iscall dataForLocalStorageSc", dataForLocalStorageSc);

      switch (functionName) {
        case "callTermination":
          dispatch(setIsCallHangUp(true));
          console.log("iscall callTermination is call hangu up set = TRUEEEEEE")
          Cookies.set(
            "statuscardToKeypadSider",
            JSON.stringify(dataForLocalStorageSc),
            { expires: 1 }
          );
          break;
        case "callEstablished":
          Cookies.set(
            "statuscardToKeypadSider",
            JSON.stringify(dataForLocalStorageSc),
            { expires: 1 }
          );
          break;
        default:
          console.log("Statuscard to Keypadsider default");
          console.log(functionName);
          console.log(argumentOne);
          break;
      }
    }
  };

  // OUTBOUND CALL
  const callStatusCardProperties = (
    number: string,
    functionName = "",
    argumentOne = "",
    argumentTwo = ""
  ) => {
    dispatch(setCallerNumber(""));
    dispatch(setCallerName(""));
    let domain = Cookies.get("domain") || "10.180.67.151";
    // let domain = Cookies.get("domain") || "192.168.1.25";
    // BeepPlay.play();
    playClickBeep()
    if (number === user?.agent_detail?.extension_details[0]?.username) {
      setErrorMessage("You are not able to call yourself");
      dispatch(onDial(null));
      dispatch(onAddLeadNoteId(null));
      dispatch(setIsCallHangUp(false));
      return false;
    }
    dispatch(onSetAddNoteId(null));
    Cookies.remove("callId");
    dispatch(setIsCallHangUp(false));
    if (user?.sticky_agent) {
      Cookies.set("call_stick_status", "0");
    }
    Cookies.set("phone_number", number);
    if (functionName !== "") {
      let dataForLocalStorageKps = {
        functionName: functionName,
        argumentOne: argumentOne,
        argumentTwo: argumentTwo,
      };
      console.log("dataForLocalStorageKps ==> ");
      console.log(dataForLocalStorageKps);
      console.log(functionName);
      console.log(number);
      switch (functionName) {
        case "dialNumberKps":
          const targetURI: any = UserAgent.makeURI(
            "sip:" + number + "@" + domain
          );
          //Pass Lead uuid
          let leaduuid = Cookies.get("addLeadNoteId")
            ? Cookies.get("addLeadNoteId")
            : addLeadNoteId
              ? addLeadNoteId
              : null;

          let extraHeader: any;
          if (user?.isPbx) {
            extraHeader = {
              earlyMedia: true, // Set earlyMedia to true to enable early media
              sessionDescriptionHandlerOptions: {
                constraints: {
                  audio: true,
                  video: false,
                },
              },
              extraHeaders: [`X-Leaduuid: ${leaduuid}`],
            };
          } else {
            extraHeader = {
              earlyMedia: true, // Set earlyMedia to true to enable early media
              sessionDescriptionHandlerOptions: {
                constraints: {
                  audio: true,
                  video: false,
                },
              },
              extraHeaders: [
                `X-Leaduuid: ${leaduuid}`,
                `X-selectedcampaignuuid: ${selectedCampaign}`,
                `X-previous_destination_number : ${number}`,
                `X-campaign_flag:${campaignType}`,
              ],
            };
          }
          if (
            !user?.isPbx &&
            (campaignMode === "1" || campaignMode === "3") &&
            Cookies.get("sendAutoParam") === "true"
          ) {
            let newheader = [
              `X-Leaduuid: ${leaduuid}`,
              `X-selectedcampaignuuid: ${selectedCampaign}`,
              `X-previous_destination_number : ${number}`,
              `X-autocall_flag : true`,
              `X-campaign_flag:${campaignType}`,
            ];
            extraHeader = { ...extraHeader, extraHeaders: newheader };
            console.log(extraHeader, "newheader");
          }
          if (!user?.isPbx && leaduuid) {
            onGetLeadInfo(leaduuid);
            dispatch(onShowLeadInfo(true));
          }
          if (!user?.isPbx) {
            onUpdateLiveAgentEntry("Outgoing", number);
            onAddReport("outbound", "increment");
            Cookies.set("isEstablished", "1");
          }
          Cookies.remove("sendAutoParam");
          const inviter = new Inviter(userAgent, targetURI, extraHeader);
          inviter.delegate = {
            // Handle outgoing REFER request.
            onRefer(referral: Referral) {
              //console.log("Handle outgoing REFER request.");
              referral.accept().then(() => {
                referral.makeInviter().invite();
              });
            },
          };
          Cookies.remove("addLeadNoteId");
          dispatch(
            setCallerName(
              Cookies.get("LeadDialName") ? Cookies.get("LeadDialName") : ""
            )
          );
          let CallerNumber =
            (isNumberMask || numberMasking) && !user?.isPbx
              ? Array.from(number).length > 4
                ? Array.from(number).fill("X", 2, -2).join("")
                : Array.from(number).fill("X", 1, -1).join("")
              : user?.isPbx && user?.isNumberMasking
                ? Array.from(number).length > 4
                  ? Array.from(number).fill("X", 2, -2).join("")
                  : Array.from(number).fill("X", 1, -1).join("")
                : number;
          dispatch(setCallerNumber(CallerNumber));
          setCallType("Outgoing Call To");
          setShowModal(true);
          // setLiveCall(true);
          dispatch(setCallScreen("LIVE"));

          outgoingSession = inviter;

          inviter.stateChange.addListener((callingState: SessionState) => {
            console.log("outgoing callingState =========> ", callingState);
            switch (callingState) {
              case SessionState.Establishing:
                console.log("Ringing on destination ....");
                Cookies.set("is_call_start", "0");
                console.log(inviter);
                setShowModal(true);
                // setLiveCall(true);
                dispatch(setCallScreen("LIVE"));
                let cdr_uuid: any = inviter;
                let headers = cdr_uuid?.outgoingRequestMessage;
                let id: string = "";
                if (headers && headers?.callId) {
                  id = headers?.callId;
                } else {
                  id = "";
                }
                console.log("id-------->", id);
                Cookies.set("callId", id);
                dispatch(onSetAddNoteId(id));

                // callerTuneplay.play(); //	Caller tune play
                // callerTuneplay.currentTime = 0;
                // dispatch(onSetAddNoteId(null));
                // dispatch(onAddLeadNoteId(null));
                // Cookies.remove("callId");
                break;

              case SessionState.Established:
                console.log("Call answered ....");
                Cookies.set("is_call_start", "0");
                console.log("Established -------------------->", inviter);
                if (!user?.isPbx) {
                  Cookies.set("isEstablished", "0");
                  onAddReport("outbound", "decrement");
                }
                // let cdr_uuid: any = inviter;
                // let test = new Map();
                // test = cdr_uuid?.outgoingInviteRequest?.confirmedDialogs;
                // let id: string = "";
                // test.forEach((value: any) => {
                //   id = value.dialogState?.callId
                // S    ? value.dialogState?.callId
                //     : "";
                // });
                // console.log("id-------->", id);
                // Cookies.set("callId", id);
                // dispatch(onSetAddNoteId(id));
                setupRemoteMedia(inviter); //	Media audio control
                // callerTuneplay.pause(); //	Caller tune pause
                stopTune()
                // BeepPlay.pause();
                stopClickBeep()
                callDuration(true); //	Call duration
                dispatch(setIsShowCallDuration(true)); // show call duration
                setAddNoteShowCallDuration(true);
                callKeypadSiderProperties("callEstablished", "Established"); //	On answer manage keypadsider states
                break;

              case SessionState.Terminated:
                console.log("Call terminated ....");
                console.log(secondCallSession);
                console.log(outgoingSession);
                // callerBeepPlay.play(); //	Caller tune play
                // callerBeepPlay.currentTime = 0;
                playBeep()
                if (
                  (secondCallSession &&
                    secondCallSession._state == "Established") ||
                  (secondCallSession &&
                    secondCallSession._state == "Establishing")
                ) {
                  //incomingSession.refer(secondCallSession)
                  console.log("COMING HERE 00");
                  setPage("");
                  setupRemoteMedia(secondCallSession);
                  break;
                } else {
                  // setLiveCall(false);
                  Cookies.remove("LeadDialName");
                  setNumber("");
                  dispatch(onDial(null));
                  setShowModal(true);
                  setShowActiveModal(false);
                  // if (!!Cookies.get("callId") && user?.isPbx)
                  //   setIsAddNote(true);
                  if (!!Cookies.get("callId") && user?.isPbx)
                    dispatch(setCallScreen("ADDNOTE"));
                  // && !user?.isPbx
                  if (!!Cookies.get("callId")) {
                    dispatch(setIsCallHangUp(true));
                    setShowModal(false);
                    if (
                      campaignType === "inbound" ||
                      campaignMode === "3" ||
                      campaignMode === "1"
                    ) {
                      dispatch(setCallScreen("LEADDIAL"));
                      dispatch(onSetDialType("leadDial"));
                    } else {
                      dispatch(setCallScreen(""));
                    }
                    onUpdateLiveAgentEntry(
                      "hangup",
                      Cookies.get("phone_number") || ""
                    );
                    if (!user?.isPbx && Cookies.get("isEstablished") === "1") {
                      onAddReport("outbound", "decrement");
                    }
                    if (
                      Cookies.get("campaignMode") === "3" ||
                      campaignMode === "3"
                    ) {
                      onUpdateDialLevel();
                    }
                    onCallQueueInbound();
                  }
                  Cookies.set("is_call_start", "1");
                  if (!!!Cookies.get("callId") && callScreen !== "CALLFAILED") {
                    dispatch(onAddLeadNoteId(null));
                    dispatch(clearLeadDetails());
                    setShowModal(false);
                    if (
                      (campaignType === "inbound" ||
                        campaignMode === "3" ||
                        campaignMode === "1") &&
                      !user?.isPbx
                    ) {
                      dispatch(setCallScreen("LEADDIAL"));
                      dispatch(onSetDialType("leadDial"));
                    } else {
                      dispatch(setCallScreen(""));
                    }
                  }
                  setIsHold(false);
                  setIsMuted(false);
                  setPage("");
                  cleanupMedia(); //	Stop media audio control
                  //outgoingSession("");
                  // outgoingSession = null;
                  // incomingSession("");
                  // callerTuneplay.pause(); //	Caller tune pause
                  stopTune()
                  // BeepPlay.pause();
                  stopClickBeep()
                  callDuration(false); //	Call duration
                  onGetCallStatistic(); // call History refresh
                  onMissedCallCountGet(); // call missed call count
                  dispatch(setIsShowCallDuration(false));
                  callKeypadSiderProperties("callTermination", "Termination"); //	On termination manage keypadsider states
                  if (
                    (campaignType === "outbound" ||
                      campaignType === "blended") &&
                    (campaignMode === "3" || campaignMode === "1")
                  ) {
                    userAgentRegistration();
                  }
                  break;
                }
              case SessionState.Terminating:
                console.log("Call terminating ....");
                // setLiveCall(false);
                Cookies.remove("LeadDialName");
                setNumber("");
                dispatch(onDial(null));
                setShowModal(true);
                setShowActiveModal(false);
                // if (!!Cookies.get("callId") && user?.isPbx) setIsAddNote(true);
                if (!!Cookies.get("callId") && user?.isPbx)
                  dispatch(setCallScreen("ADDNOTE"));
                // && !user?.isPbx
                if (!!Cookies.get("callId")) {
                  dispatch(setIsCallHangUp(true));
                  onUpdateLiveAgentEntry(
                    "hangup",
                    Cookies.get("phone_number") || ""
                  );
                  if (
                    Cookies.get("campaignMode") === "3" ||
                    campaignMode === "3"
                  ) {
                    onUpdateDialLevel();
                  }
                  if (
                    campaignType === "inbound" ||
                    campaignMode === "3" ||
                    campaignMode === "1"
                  ) {
                    dispatch(setCallScreen("LEADDIAL"));
                    dispatch(onSetDialType("leadDial"));
                  } else {
                    dispatch(setCallScreen(""));
                  }

                  setShowModal(false);
                }
                Cookies.set("is_call_start", "1");
                if (!!!Cookies.get("callId") && callScreen !== "CALLFAILED") {
                  dispatch(onAddLeadNoteId(null));
                  dispatch(clearLeadDetails());
                  setShowModal(false);
                  if (
                    (campaignType === "inbound" ||
                      campaignMode === "3" ||
                      campaignMode === "1") &&
                    !user?.isPbx
                  ) {
                    dispatch(setCallScreen("LEADDIAL"));
                    dispatch(onSetDialType("leadDial"));
                  } else {
                    dispatch(setCallScreen(""));
                  }
                }
                setIsHold(false);
                setIsMuted(false);
                setPage("");
                cleanupMedia(); //	Stop media audio control
                // callerTuneplay.pause(); //	Caller tune pause
                stopTune()
                // BeepPlay.pause();
                stopClickBeep()
                callDuration(false); //	Call duration
                onGetCallStatistic(); // call History refresh
                onMissedCallCountGet(); // call missed call count
                dispatch(setIsShowCallDuration(false));
                callKeypadSiderProperties("callTermination", "Termination"); //	On termination manage keypadsider states
                if (
                  (campaignType === "outbound" || campaignType === "blended") &&
                  (campaignMode === "3" || campaignMode === "1")
                ) {
                  userAgentRegistration();
                }
                break;

              default:
                console.log(
                  "Could not identified calling state while calling .... ",
                  callingState
                );
                // setLiveCall(false);
                Cookies.remove("LeadDialName");
                setNumber("");
                dispatch(onDial(null));
                setShowModal(true);
                setShowActiveModal(false);
                // if (!!Cookies.get("callId") && user?.isPbx) setIsAddNote(true);
                if (!!Cookies.get("callId") && user?.isPbx)
                  dispatch(setCallScreen("ADDNOTE"));
                // && !user?.isPbx
                if (!!Cookies.get("callId")) {
                  dispatch(setIsCallHangUp(true));
                  onUpdateLiveAgentEntry(
                    "hangup",
                    Cookies.get("phone_number") || ""
                  );
                  if (!user?.isPbx && Cookies.get("isEstablished") === "1") {
                    onAddReport("outbound", "decrement");
                  }
                  if (
                    Cookies.get("campaignMode") === "3" ||
                    campaignMode === "3"
                  ) {
                    onUpdateDialLevel();
                  }
                  onCallQueueInbound();
                  if (
                    campaignType === "inbound" ||
                    campaignMode === "3" ||
                    campaignMode === "1"
                  ) {
                    dispatch(setCallScreen("LEADDIAL"));
                    dispatch(onSetDialType("leadDial"));
                  } else {
                    dispatch(setCallScreen(""));
                  }
                  setShowModal(false);
                }
                if (!!!Cookies.get("callId") && callScreen !== "CALLFAILED") {
                  dispatch(onAddLeadNoteId(null));
                  dispatch(clearLeadDetails());
                  setShowModal(false);
                  if (
                    (campaignType === "inbound" ||
                      campaignMode === "3" ||
                      campaignMode === "1") &&
                    !user?.isPbx
                  ) {
                    dispatch(setCallScreen("LEADDIAL"));
                    dispatch(onSetDialType("leadDial"));
                  } else {
                    dispatch(setCallScreen(""));
                  }
                }
                setIsHold(false);
                setIsMuted(false);
                setPage("");
                // callerTuneplay.pause(); //	Caller tune pause
                stopTune()
                // BeepPlay.pause();
                stopClickBeep()
                callDuration(false); //	Call duration
                onGetCallStatistic(); // call History refresh
                onMissedCallCountGet(); // call missed call count
                dispatch(setIsShowCallDuration(false));
                break;
            }
          });

          // Options including delegate to capture response messages
          const inviteOptions: any = {
            requestDelegate: {
              onAccept: (response: any) => {
                //console.log(response.message);
                // BeepPlay.pause();
                stopClickBeep()
                console.log("Positive response ....");
                console.log(response);
              },
              onReject: (response: any) => {
                console.log("Negative response ....");
                if (response.message.statusCode == 404) {
                  // BeepPlay.pause();
                  stopClickBeep()
                  setShowModal(true);
                  dispatch(setCallScreen("CALLFAILED"));
                }
                console.log(response);
              },
              onProgress: (response: any) => {
                console.log(response.message.statusCode);
                console.log("183+180 Session Progress - Call is in progress.");
                if (response.message.statusCode == 183) {
                  // alert("183 Session Progress");
                  // BeepPlay.pause();
                  stopClickBeep()
                  setupRemoteMedia(inviter); //	Media audio control
                  console.log(response);
                  // callerTuneplay.pause(); //	Caller tune pause
                }
                console.log(response);
              },
            },
            sessionDescriptionHandlerOptions: {
              constraints: {
                audio: true,
                video: false,
              },
            },
          };

          //	Send invition
          inviter
            .invite(inviteOptions)
            .then((request: OutgoingInviteRequest) => {
              console.log("Successfully sent INVITE ....");
              //console.log("INVITE request ....");
              // console.log(request);
            })
            .catch((error: Error) => {
              console.log("Failed to send INVITE ....");
              // console.log(error);
            });
          //};
          Cookies.set(
            "keypadSiderToStatuscard",
            JSON.stringify(dataForLocalStorageKps),
            { expires: 1 }
          );
          break;
        case "directDialKps":
          Cookies.set(
            "keypadSiderToStatuscard",
            JSON.stringify(dataForLocalStorageKps),
            { expires: 1 }
          );
          break;
        case "setCallTransferOrMergeDestinationKps":
          Cookies.set(
            "keypadSiderToStatuscard",
            JSON.stringify(dataForLocalStorageKps),
            { expires: 1 }
          );
          break;
        case "sendDTMFKps":
          // let keypadSiderToStatuscard = JSON.parse(dataForLocalStorageKps);	//	For keypadsider to statuscard
          console.log(
            "keypadSiderToStatuscard dtmf =====> ",
            dataForLocalStorageKps.argumentOne
          );
          sendDTMF(dataForLocalStorageKps.argumentOne);

          // Cookies.set('keypadSiderToStatuscard', JSON.stringify(dataForLocalStorageKps), {expires: 1});
          break;
        default:
          console.log("Keypad default");
          console.log(functionName);
          console.log(argumentOne);
          break;
      }
    }
  };

  // CLEANUP
  const cleanupMedia = () => {
    const mediaElement: any = document.getElementById("mediaElement");
    try {
      if (mediaElement) {
        mediaElement.srcObject = null;
        mediaElement.pause();
      }
    } catch (error) {
      console.log("Clean media audio session error - ", error);
    }
  };

  const sendDTMF = (dtmfDigit: any) => {
    //	Create DTMF option
    console.log("dtmf--->", dtmfDigit);
    const optionsDTMF = {
      requestOptions: {
        body: {
          contentDisposition: "render",
          contentType: "application/dtmf-relay",
          content: "Signal=" + dtmfDigit.toString() + "\r\nDuration=250",
        },
      },
    };

    try {
      if (outgoingSession && outgoingSession._state === "Established") {
        // alert(event.target.innerHTML);
        // outgoingSession.info(event.target.innerHTML.toString(), optionsDTMF);
        outgoingSession.info(optionsDTMF);
      }

      if (incomingSession && incomingSession._state === "Established") {
        // alert(event.target.innerHTML);
        // incomingSession.info(event.target.innerHTML.toString(), optionsDTMF);
        incomingSession.info(optionsDTMF);
      }
    } catch (error) {
      console.log("Incoming or Outgoing session not found for DTMF - ", error);
    }
  };

  // RECEIVE CALL
  const receiveCall = () => {
    //callerTune.pause(); //	Caller tune pause
    if (Cookies.get("isReceivedDirect") === "0") {
      // callerBeepPlay.play(); //	Caller tune play
      // callerBeepPlay.currentTime = 0;
      playBeep()
      dispatch(setIsShowCallDuration(true)); // show call duration
      dispatch(setCallScreen("LIVE"));
      dispatch(onShowCallModal("true"));
    }
    dispatch(onShowLeadInfo(true));
    console.log(incomingSession, "incomingSession");

    if (incomingSession) {
      try {
        incomingSession.accept();
        callDuration(false);
      } catch (error) {
        console.log("Incoming session accept error found - ", error);
      }
    }
  };

  // AGENT TRANSFER
  const agentTransferCall = async (destination: any, callType: string) => {
    let domain = Cookies.get("domain") || "10.180.67.151";
    let destinationNumber = destination;
    console.log(domain, destinationNumber, "destinationNumber=====>");

    if (callType === "blindTransfer") {
      try {
        const target = UserAgent.makeURI(
          "sip:" + destinationNumber + "@" + domain
        );
        if (outgoingSession && outgoingSession._state !== "Terminated") {
          if (outgoingSession._state !== "Establishing") {
            outgoingSession.refer(target);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
          }
        }
      } catch (error: any) {
        console.log("Blind Transfer error ===>", error);
      }

      try {
        const target = UserAgent.makeURI(
          "sip:" + destinationNumber + "@" + domain
        );
        if (incomingSession && incomingSession._state !== "Terminated") {
          if (incomingSession._state !== "Establishing") {
            incomingSession.refer(target);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
          }
        }
      } catch (error: any) {
        console.log("Blind Transfer error ===>", error);
      }
    } else if (callType === "attendedTransfer") {
      console.log("COMING FOR ATTEND TRANSFER");
      try {
        const targetURI: any = UserAgent.makeURI(
          "sip:" + destinationNumber + "@" + domain
        );
        console.log(outgoingSession);
        if (outgoingSession && outgoingSession._state !== "Terminated") {
          if (outgoingSession._state !== "Establishing") {
            console.log("COMING FOR HOLD");
            outgoingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
            //Pass Lead uuid
            let leaduuid = Cookies.get("addLeadNoteId")
              ? Cookies.get("addLeadNoteId")
              : addLeadNoteId
                ? addLeadNoteId
                : null;
            let extraHeader: any;
            if (!user?.isPbx) {
              extraHeader = {
                earlyMedia: true, // Set earlyMedia to true to enable early media
                sessionDescriptionHandlerOptions: {
                  constraints: {
                    audio: true,
                    video: false,
                  },
                },
                extraHeaders: [
                  `X-selectedcampaignuuid: ${selectedCampaign}`,
                  `X-previous_destination_number: ${destinationNumber}`,
                  `X-type: transfer`,
                  `X-Leaduuid: ${leaduuid}`,
                  `X-campaign_flag:${campaignType}`,
                ],
              };
            } else {
              extraHeader = {
                earlyMedia: true, // Set earlyMedia to true to enable early media
                sessionDescriptionHandlerOptions: {
                  constraints: {
                    audio: true,
                    video: false,
                  },
                },
              };
            }
            secondCallSession = new Inviter(userAgent, targetURI, extraHeader);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
            secondCallSession.stateChange.addListener(
              (callingState: SessionState) => {
                console.log("here2 callingState =========> ", callingState);
                switch (callingState) {
                  case SessionState.Establishing:
                    console.log("Ringing on destination ....");
                    console.log(secondCallSession);
                    setShowModal(true);
                    // setLiveCall(true);
                    dispatch(setCallScreen("LIVE"));
                    //                callerTuneplay.play(); //	Caller tune play
                    //                callerTuneplay.currentTime = 0;
                    // dispatch(onSetAddNoteId(null));
                    // dispatch(onAddLeadNoteId(null));
                    // Cookies.remove("callId");
                    break;
                  case SessionState.Established:
                    console.log("Call answered ....");
                    //  if (
                    //    outgoingSession.sessionDescriptionHandlerOptions &&
                    //   outgoingSession.sessionDescriptionHandlerOptions.hold ===
                    //   true
                    //  ) {
                    setupRemoteMedia(secondCallSession);
                    //  }
                    break;
                  case SessionState.Terminated:
                    console.log("Call Terminated ....");
                    console.log(secondCallSession);
                    console.log(incomingSession);
                    console.log(outgoingSession);
                    if (
                      outgoingSession &&
                      outgoingSession._state == "Established" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      outgoingSession.invite({
                        sessionDescriptionHandlerOptions: { hold: false },
                      });
                      setPage("");
                      setupRemoteMedia(outgoingSession);
                    }

                    if (
                      outgoingSession &&
                      outgoingSession._state == "Terminated" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      hangupChangeout();
                    }
                    if (
                      (campaignType === "outbound" ||
                        campaignType === "blended") &&
                      (campaignMode === "3" || campaignMode === "1")
                    ) {
                      userAgentRegistration();
                    }
                    //setupRemoteMedia(secondCallSession);
                    // outgoingSession.invite({
                    //   sessionDescriptionHandlerOptions: { hold: false },
                    // });
                    // setPage("");
                    // setupRemoteMedia(outgoingSession);
                    break;
                }
              }
            );
            // Options including delegate to capture response messages
            const inviteOptions: any = {
              requestDelegate: {
                onAccept: (response: any) => {
                  console.log("Positive response ....");
                  console.log(response);
                },
                onReject: (response: any) => {
                  console.log("Negative response ....");
                  console.log(response);
                },
                onProgress: (response: any) => {
                  console.log(response.message.statusCode);
                  console.log(
                    "183+180 Session Progress - Call is in progress."
                  );
                  if (response.message.statusCode == 183) {
                    setupRemoteMedia(secondCallSession);
                    // alert("183 Session Progress");
                    console.log(response);
                    //             callerTuneplay.pause(); //	Caller tune pause
                  }
                  console.log(response);
                },
              },
              sessionDescriptionHandlerOptions: {
                constraints: {
                  audio: true,
                  video: false,
                },
              },
            };
            //	Send invition
            secondCallSession
              .invite(inviteOptions)
              .then((request: OutgoingInviteRequest) => {
                console.log("Successfully sent INVITE ....");
              })
              .catch((error: Error) => {
                console.log("Failed to send INVITE ....");
                // console.log(error);
              });
          }
        }

        if (
          secondCallSession &&
          secondCallSession._state !== "Terminated" &&
          outgoingSession &&
          outgoingSession._state == "Terminated"
        ) {
          secondCallSession.invite({
            sessionDescriptionHandlerOptions: { hold: true },
          });
          let extraHeader: any;
          extraHeader = {
            earlyMedia: true, // Set earlyMedia to true to enable early media
            sessionDescriptionHandlerOptions: {
              constraints: {
                audio: true,
                video: false,
              },
            },
          };
          outgoingSession = new Inviter(userAgent, targetURI, extraHeader);
          setPage("TRANSFER_CALL");
          setShowConferenceBtn(true);
          outgoingSession.stateChange.addListener(
            (callingState: SessionState) => {
              console.log("here8 callingState =========> ", callingState);
              switch (callingState) {
                case SessionState.Establishing:
                  console.log("Ringing on destination ....");
                  console.log(outgoingSession);
                  setShowModal(true);
                  // setLiveCall(true);
                  dispatch(setCallScreen("LIVE"));
                  break;
                case SessionState.Established:
                  console.log("Call answered ....");
                  // if (
                  //   secondCallSession.sessionDescriptionHandlerOptions &&
                  //   secondCallSession.sessionDescriptionHandlerOptions.hold ===
                  //   true
                  // ) {
                  setupRemoteMedia(outgoingSession);
                  // }
                  break;
                case SessionState.Terminated:
                  console.log("Call Terminated ....");
                  console.log(secondCallSession);
                  console.log(incomingSession);
                  console.log(outgoingSession);
                  if (
                    secondCallSession &&
                    secondCallSession._state == "Established" &&
                    outgoingSession &&
                    outgoingSession._state == "Terminated"
                  ) {
                    secondCallSession.invite({
                      sessionDescriptionHandlerOptions: { hold: false },
                    });
                    setPage("");
                    setupRemoteMedia(secondCallSession);
                  }

                  if (
                    outgoingSession &&
                    outgoingSession._state == "Terminated" &&
                    secondCallSession &&
                    secondCallSession._state == "Terminated"
                  ) {
                    hangupChangeout();
                  }
                  if (
                    (campaignType === "outbound" ||
                      campaignType === "blended") &&
                    (campaignMode === "3" || campaignMode === "1")
                  ) {
                    userAgentRegistration();
                  }
                  break;
              }
            }
          );
          // Options including delegate to capture response messages
          const inviteOptions: any = {
            requestDelegate: {
              onAccept: (response: any) => {
                console.log("Positive response ....");
                console.log(response);
              },
              onReject: (response: any) => {
                console.log("Negative response ....");
                console.log(response);
              },
              onProgress: (response: any) => {
                console.log(response.message.statusCode);
                console.log("183+180 Session Progress - Call is in progress.");
                if (response.message.statusCode == 183) {
                  secondCallSession.invite({
                    sessionDescriptionHandlerOptions: { hold: true },
                  });
                  setupRemoteMedia(outgoingSession);
                  // alert("183 Session Progress");
                  console.log(response);
                }
                console.log(response);
              },
            },
            sessionDescriptionHandlerOptions: {
              constraints: {
                audio: true,
                video: false,
              },
            },
          };
          //	Send invition
          outgoingSession
            .invite(inviteOptions)
            .then((request: OutgoingInviteRequest) => {
              console.log("Successfully sent INVITE ....");
            })
            .catch((error: Error) => {
              console.log("Failed to send INVITE ....");
              // console.log(error);
            });
        }
      } catch (error: any) {
        console.log("Attended Transfer error ===>", error);
      }

      try {
        const targetURI: any = UserAgent.makeURI(
          "sip:" + destinationNumber + "@" + domain
        );
        if (incomingSession && incomingSession._state !== "Terminated") {
          if (incomingSession._state !== "Establishing") {
            incomingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
            let campaignOptions: any;
            //Pass Lead uuid
            let leaduuid = Cookies.get("addLeadNoteId")
              ? Cookies.get("addLeadNoteId")
              : addLeadNoteId
                ? addLeadNoteId
                : null;
            if (!user?.isPbx) {
              campaignOptions = {
                extraHeaders: [
                  `X-selectedcampaignuuid: ${selectedCampaign}`,
                  `X-previous_destination_number: ${destinationNumber}`,
                  `X-type: transfer`,
                  `X-Leaduuid: ${leaduuid}`,
                  `X-campaign_flag:${campaignType}`,
                ],
              };
            } else {
              console.log(callerNumber);
              console.log(":::callerNumber");

              campaignOptions = {
                extraHeaders: [
                  `X-previous_caller_id_number: ${callerNumber}`,
                  `X-type: transfer`,
                  `X-campaign_flag:${campaignType}`,
                ],
              };
            }
            secondCallSession = new Inviter(
              userAgent,
              targetURI,
              campaignOptions
            );
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
            secondCallSession.stateChange.addListener(
              async (callingState: SessionState) => {
                console.log("here3 callingState =========> ", callingState);
                switch (callingState) {
                  case SessionState.Established:
                    console.log("Call answered ....");
                    //  if (
                    //    incomingSession.sessionDescriptionHandlerOptions &&
                    //    incomingSession.sessionDescriptionHandlerOptions.hold ===
                    //    true
                    //  ) {
                    setupRemoteMedia(secondCallSession);
                    //  }
                    break;
                  case SessionState.Terminated:
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    console.log("Call Terminated ....");
                    console.log(secondCallSession);
                    console.log(incomingSession);
                    // console.log(
                    //   incomingSession._sessionDescriptionHandler._localMediaStream.active
                    // );

                    // console.log(
                    //   incomingSession._sessionDescriptionHandler._remoteMediaStream.active
                    // );
                    //const secondState = incomingSession.state;
                    // const peerConnection = incomingSession.sessionDescriptionHandler.peerConnection;
                    // if (peerConnection && peerConnection.connectionState === 'closed') {
                    //   console.log('Peer connection is closed.');
                    // } else {
                    //   console.log('Peer connection is still active.');
                    // }
                    //console.log(secondState);
                    console.log(outgoingSession);
                    if (
                      incomingSession &&
                      incomingSession._state == "Established" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      if (
                        incomingSession.invite !== undefined &&
                        typeof incomingSession.invite === "function"
                      ) {
                        incomingSession.invite({
                          sessionDescriptionHandlerOptions: { hold: false },
                        });
                        setPage("");
                        setupRemoteMedia(incomingSession);
                      }
                    }
                    if (
                      incomingSession &&
                      incomingSession._state == "Terminated" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      hangupChange();
                    }

                    if (
                      incomingSession &&
                      incomingSession._state == "Terminated"
                    ) {
                      hangupChange();
                    }
                    if (
                      (campaignType === "outbound" ||
                        campaignType === "blended") &&
                      (campaignMode === "3" || campaignMode === "1")
                    ) {
                      userAgentRegistration();
                    }
                    break;
                }
              }
            );
            // Options including delegate to capture response messages
            const inviteOptions: any = {
              requestDelegate: {
                onAccept: (response: any) => {
                  console.log("Positive response ....");
                  console.log(response);
                },
                onReject: (response: any) => {
                  console.log("Negative response ....");
                  console.log(response);
                },
              },
              onProgress: (response: any) => {
                console.log(response.message.statusCode);
                console.log("183+180 Session Progress - Call is in progress.");
                if (response.message.statusCode == 183) {
                  setupRemoteMedia(incomingSession);
                  // alert("183 Session Progress");
                  console.log(response);
                  //             callerTuneplay.pause(); //	Caller tune pause
                }
                console.log(response);
              },
              sessionDescriptionHandlerOptions: {
                constraints: {
                  audio: true,
                  video: false,
                },
              },
            };
            //	Send invition
            secondCallSession
              .invite(inviteOptions)
              .then((request: OutgoingInviteRequest) => {
                console.log("Successfully sent INVITE ....");
              })
              .catch((error: Error) => {
                console.log("Failed to send INVITE ....");
                // console.log(error);
              });
          }
        }
      } catch (error: any) {
        console.log("Attended Transfer error ===>", error);
      }
    }
  };

  // RING GROUP TRANSFER
  const ringGroupTransferCall = async (destination: any, callType: string) => {
    console.log("destination ---->", destination);
    console.log("callType ---->", callType);
    let domain = Cookies.get("domain") || "10.180.67.151";
    let destinationNumber = destination;
    console.log(domain, destinationNumber, "destinationNumber=====>");

    if (callType === "blindTransfer") {
      try {
        const target = UserAgent.makeURI(
          "sip:" + "webphonetransfer_6_" + destinationNumber + "@" + domain
        );
        console.log(target, "===========");
        if (outgoingSession && outgoingSession._state !== "Terminated") {
          if (outgoingSession._state !== "Establishing") {
            outgoingSession.refer(target);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
          }
        }
      } catch (error: any) {
        console.log("Blind Transfer error ===>", error);
      }

      try {
        const target = UserAgent.makeURI(
          "sip:" + "webphonetransfer_6_" + destinationNumber + "@" + domain
        );
        if (incomingSession && incomingSession._state !== "Terminated") {
          if (incomingSession._state !== "Establishing") {
            incomingSession.refer(target);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
          }
        }
      } catch (error: any) {
        console.log("Blind Transfer error ===>", error);
      }
    } else if (callType === "attendedTransfer") {
      console.log("COMING FOR RINGGROUP TRANSFER");
      try {
        const targetURI: any = UserAgent.makeURI(
          "sip:" + "webphonetransfer_6_" + destinationNumber + "@" + domain
          // "sip:" + '${original_did_number}#PBX#6# 518c5d71-95cd-4ecf-8479-fe843a06b1fb' + "@" + domain
        );
        console.log(targetURI, "===========");
        if (outgoingSession && outgoingSession._state !== "Terminated") {
          if (outgoingSession._state !== "Establishing") {
            outgoingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
            let extraHeader: any;
            if (!user?.isPbx) {
              extraHeader = {
                earlyMedia: true, // Set earlyMedia to true to enable early media
                sessionDescriptionHandlerOptions: {
                  constraints: {
                    audio: true,
                    video: false,
                  },
                },
                extraHeaders: [
                  `X-selectedcampaignuuid: ${selectedCampaign}`,
                  `X-previous_destination_number: ${destinationNumber}`,
                  `X-type: transfer`,
                  `X-campaign_flag:${campaignType}`,
                ],
              };
            } else {
              extraHeader = {
                earlyMedia: true, // Set earlyMedia to true to enable early media
                sessionDescriptionHandlerOptions: {
                  constraints: {
                    audio: true,
                    video: false,
                  },
                },
              };
            }
            secondCallSession = new Inviter(userAgent, targetURI, extraHeader);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
            secondCallSession.stateChange.addListener(
              (callingState: SessionState) => {
                console.log("here4 callingState =========> ", callingState);
                switch (callingState) {
                  case SessionState.Established:
                    console.log("Call answered ....");
                    // if (
                    //   outgoingSession.sessionDescriptionHandlerOptions &&
                    //   outgoingSession.sessionDescriptionHandlerOptions.hold ===
                    //   true
                    // ) {
                    setupRemoteMedia(secondCallSession);
                    // }
                    break;
                  case SessionState.Terminated:
                    console.log("Call Terminated ....");
                    console.log(secondCallSession);
                    console.log(incomingSession);
                    console.log(outgoingSession);
                    if (
                      outgoingSession &&
                      outgoingSession._state == "Established" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      outgoingSession.invite({
                        sessionDescriptionHandlerOptions: { hold: false },
                      });
                      setPage("");
                      setupRemoteMedia(outgoingSession);
                    }

                    if (
                      outgoingSession &&
                      outgoingSession._state == "Terminated" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      hangupChangeout();
                    }
                    if (
                      (campaignType === "outbound" ||
                        campaignType === "blended") &&
                      (campaignMode === "3" || campaignMode === "1")
                    ) {
                      userAgentRegistration();
                    }
                    //setupRemoteMedia(secondCallSession);
                    // outgoingSession.invite({
                    //   sessionDescriptionHandlerOptions: { hold: false },
                    // });
                    // setPage("");
                    // setupRemoteMedia(outgoingSession);
                    break;
                }
              }
            );
            // Options including delegate to capture response messages
            const inviteOptions: any = {
              requestDelegate: {
                onAccept: (response: any) => {
                  console.log("Positive response ....");
                  console.log(response);
                },
                onReject: (response: any) => {
                  console.log("Negative response ....");
                  console.log(response);
                },
                onProgress: (response: any) => {
                  console.log(response.message.statusCode);
                  console.log(
                    "183+180 Session Progress - Call is in progress."
                  );
                  if (response.message.statusCode == 183) {
                    setupRemoteMedia(outgoingSession);
                    // alert("183 Session Progress");
                    console.log(response);
                    //             callerTuneplay.pause(); //	Caller tune pause
                  }
                  console.log(response);
                },
              },
              sessionDescriptionHandlerOptions: {
                constraints: {
                  audio: true,
                  video: false,
                },
              },
            };
            //	Send invition
            secondCallSession
              .invite(inviteOptions)
              .then((request: OutgoingInviteRequest) => {
                console.log("Successfully sent INVITE ....");
              })
              .catch((error: Error) => {
                console.log("Failed to send INVITE ....");
                // console.log(error);
              });
          }
        }

        if (
          secondCallSession &&
          secondCallSession._state !== "Terminated" &&
          outgoingSession &&
          outgoingSession._state == "Terminated"
        ) {
          secondCallSession.invite({
            sessionDescriptionHandlerOptions: { hold: true },
          });
          let extraHeader: any;
          extraHeader = {
            earlyMedia: true, // Set earlyMedia to true to enable early media
            sessionDescriptionHandlerOptions: {
              constraints: {
                audio: true,
                video: false,
              },
            },
          };
          outgoingSession = new Inviter(userAgent, targetURI, extraHeader);
          setPage("TRANSFER_CALL");
          setShowConferenceBtn(true);
          outgoingSession.stateChange.addListener(
            (callingState: SessionState) => {
              console.log("here8 callingState =========> ", callingState);
              switch (callingState) {
                case SessionState.Establishing:
                  console.log("Ringing on destination ....");
                  console.log(outgoingSession);
                  setShowModal(true);
                  // setLiveCall(true);
                  dispatch(setCallScreen("LIVE"));
                  //                callerTuneplay.play(); //	Caller tune play
                  //                callerTuneplay.currentTime = 0;
                  // dispatch(onSetAddNoteId(null));
                  // dispatch(onAddLeadNoteId(null));
                  // Cookies.remove("callId");
                  break;
                case SessionState.Established:
                  console.log("Call answered ....");
                  // if (
                  //   secondCallSession.sessionDescriptionHandlerOptions &&
                  //   secondCallSession.sessionDescriptionHandlerOptions.hold ===
                  //   true
                  // ) {
                  setupRemoteMedia(outgoingSession);
                  // }
                  break;
                case SessionState.Terminated:
                  console.log("Call Terminated ....");
                  console.log(secondCallSession);
                  console.log(incomingSession);
                  console.log(outgoingSession);
                  if (
                    secondCallSession &&
                    secondCallSession._state == "Established" &&
                    outgoingSession &&
                    outgoingSession._state == "Terminated"
                  ) {
                    secondCallSession.invite({
                      sessionDescriptionHandlerOptions: { hold: true },
                    });
                    setPage("");
                    setupRemoteMedia(secondCallSession);
                  }

                  if (
                    outgoingSession &&
                    outgoingSession._state == "Terminated" &&
                    secondCallSession &&
                    secondCallSession._state == "Terminated"
                  ) {
                    hangupChangeout();
                  }
                  if (
                    (campaignType === "outbound" ||
                      campaignType === "blended") &&
                    (campaignMode === "3" || campaignMode === "1")
                  ) {
                    userAgentRegistration();
                  }
                  //setupRemoteMedia(secondCallSession);
                  // outgoingSession.invite({
                  //   sessionDescriptionHandlerOptions: { hold: false },
                  // });
                  // setPage("");
                  // setupRemoteMedia(outgoingSession);
                  break;
              }
            }
          );
          // Options including delegate to capture response messages
          const inviteOptions: any = {
            requestDelegate: {
              onAccept: (response: any) => {
                console.log("Positive response ....");
                console.log(response);
              },
              onReject: (response: any) => {
                console.log("Negative response ....");
                console.log(response);
              },
              onProgress: (response: any) => {
                console.log(response.message.statusCode);
                console.log("183+180 Session Progress - Call is in progress.");
                if (response.message.statusCode == 183) {
                  secondCallSession.invite({
                    sessionDescriptionHandlerOptions: { hold: true },
                  });
                  //	                setupRemoteMedia1(outgoingSession);
                  setupRemoteMedia(outgoingSession);
                  //alert("183 Session Progress");
                  console.log(response);
                  //             callerTuneplay.pause(); //	Caller tune pause
                }
                console.log(response);
              },
            },
            sessionDescriptionHandlerOptions: {
              constraints: {
                audio: true,
                video: false,
              },
            },
          };
          //	Send invition
          outgoingSession
            .invite(inviteOptions)
            .then((request: OutgoingInviteRequest) => {
              console.log("Successfully sent INVITE ....");
            })
            .catch((error: Error) => {
              console.log("Failed to send INVITE ....");
              // console.log(error);
            });
        }
      } catch (error: any) {
        console.log("Attended Transfer error ===>", error);
      }

      try {
        const targetURI: any = UserAgent.makeURI(
          "sip:" + "webphonetransfer_6_" + destinationNumber + "@" + domain
        );
        if (incomingSession && incomingSession._state !== "Terminated") {
          if (incomingSession._state !== "Establishing") {
            incomingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
            let campaignOptions: any;
            if (!user?.isPbx) {
              campaignOptions = {
                extraHeaders: [
                  `X-selectedcampaignuuid: ${selectedCampaign}`,
                  `X-previous_destination_number: ${destinationNumber}`,
                  `X-type: transfer`,
                  `X-campaign_flag:${campaignType}`,
                ],
              };
            }
            secondCallSession = new Inviter(
              userAgent,
              targetURI,
              campaignOptions
            );
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
            secondCallSession.stateChange.addListener(
              async (callingState: SessionState) => {
                console.log("here5 callingState =========> ", callingState);
                switch (callingState) {
                  case SessionState.Established:
                    console.log("Call answered ....");
                    // if (
                    //   incomingSession.sessionDescriptionHandlerOptions &&
                    //   incomingSession.sessionDescriptionHandlerOptions.hold ===
                    //   true
                    // ) {
                    setupRemoteMedia(secondCallSession);
                    // }
                    break;
                  case SessionState.Terminated:
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    console.log("Call Terminated ....");
                    console.log(secondCallSession);
                    console.log(incomingSession);
                    // console.log(
                    //   incomingSession._sessionDescriptionHandler._localMediaStream.active
                    // );

                    // console.log(
                    //   incomingSession._sessionDescriptionHandler._remoteMediaStream.active
                    // );
                    //const secondState = incomingSession.state;
                    // const peerConnection = incomingSession.sessionDescriptionHandler.peerConnection;
                    // if (peerConnection && peerConnection.connectionState === 'closed') {
                    //   console.log('Peer connection is closed.');
                    // } else {
                    //   console.log('Peer connection is still active.');
                    // }
                    //console.log(secondState);
                    console.log(outgoingSession);
                    if (
                      incomingSession &&
                      incomingSession._state == "Established" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      if (
                        incomingSession.invite !== undefined &&
                        typeof incomingSession.invite === "function"
                      ) {
                        incomingSession.invite({
                          sessionDescriptionHandlerOptions: { hold: false },
                        });
                        setPage("");
                        setupRemoteMedia(incomingSession);
                      }
                    }
                    if (
                      incomingSession &&
                      incomingSession._state == "Terminated" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      hangupChange();
                    }

                    if (
                      incomingSession &&
                      incomingSession._state == "Terminated"
                    ) {
                      hangupChange();
                    }
                    if (
                      (campaignType === "outbound" ||
                        campaignType === "blended") &&
                      (campaignMode === "3" || campaignMode === "1")
                    ) {
                      userAgentRegistration();
                    }
                    break;
                }
              }
            );
            // Options including delegate to capture response messages
            const inviteOptions: any = {
              requestDelegate: {
                onAccept: (response: any) => {
                  console.log("Positive response ....");
                  console.log(response);
                },
                onReject: (response: any) => {
                  console.log("Negative response ....");
                  console.log(response);
                },
                onProgress: (response: any) => {
                  console.log(response.message.statusCode);
                  console.log(
                    "183+180 Session Progress - Call is in progress."
                  );
                  if (response.message.statusCode == 183) {
                    setupRemoteMedia(incomingSession);
                    // alert("183 Session Progress");
                    console.log(response);
                    //             callerTuneplay.pause(); //	Caller tune pause
                  }
                  console.log(response);
                },
              },
              sessionDescriptionHandlerOptions: {
                constraints: {
                  audio: true,
                  video: false,
                },
              },
            };
            //	Send invition
            secondCallSession
              .invite(inviteOptions)
              .then((request: OutgoingInviteRequest) => {
                console.log("Successfully sent INVITE ....");
              })
              .catch((error: Error) => {
                console.log("Failed to send INVITE ....");
                // console.log(error);
              });
          }
        }
      } catch (error: any) {
        console.log("Attended Transfer error ===>", error);
      }
    }
  };

  // QUEUE CALL TRANSFER
  const queueTransferCall = async (destination: any, callType: string) => {
    console.log("destination ---->", destination);
    console.log("callType ---->", callType);
    let domain = Cookies.get("domain") || "10.180.67.151";
    let destinationNumber = destination;
    console.log(domain, destinationNumber, "destinationNumber=====>");

    if (callType === "blindTransfer") {
      try {
        const target = UserAgent.makeURI(
          "sip:" + "webphonetransfer_5_" + destinationNumber + "@" + domain
        );
        if (outgoingSession && outgoingSession._state !== "Terminated") {
          if (outgoingSession._state !== "Establishing") {
            outgoingSession.refer(target);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
          }
        }
      } catch (error: any) {
        console.log("Blind Transfer error ===>", error);
      }

      try {
        const target = UserAgent.makeURI(
          "sip:" + "webphonetransfer_5_" + destinationNumber + "@" + domain
        );
        if (incomingSession && incomingSession._state !== "Terminated") {
          if (incomingSession._state !== "Establishing") {
            incomingSession.refer(target);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
          }
        }
      } catch (error: any) {
        console.log("Blind Transfer error ===>", error);
      }
    } else if (callType === "attendedTransfer") {
      console.log("COMING FOR ATTEND TRANSFER");
      try {
        const targetURI: any = UserAgent.makeURI(
          "sip:" + "webphonetransfer_5_" + destinationNumber + "@" + domain
        );
        if (outgoingSession && outgoingSession._state !== "Terminated") {
          if (outgoingSession._state !== "Establishing") {
            outgoingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
            let extraHeader: any;
            if (!user?.isPbx) {
              extraHeader = {
                earlyMedia: true, // Set earlyMedia to true to enable early media
                sessionDescriptionHandlerOptions: {
                  constraints: {
                    audio: true,
                    video: false,
                  },
                },
                extraHeaders: [
                  `X-selectedcampaignuuid: ${selectedCampaign}`,
                  `X-previous_destination_number: ${destinationNumber}`,
                  `X-type: transfer`,
                  `X-campaign_flag:${campaignType}`,
                ],
              };
            } else {
              extraHeader = {
                earlyMedia: true, // Set earlyMedia to true to enable early media
                sessionDescriptionHandlerOptions: {
                  constraints: {
                    audio: true,
                    video: false,
                  },
                },
              };
            }
            secondCallSession = new Inviter(userAgent, targetURI, extraHeader);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
            secondCallSession.stateChange.addListener(
              (callingState: SessionState) => {
                console.log("here6 callingState =========> ", callingState);
                switch (callingState) {
                  case SessionState.Established:
                    console.log("Call answered ....");
                    // if (
                    //   outgoingSession.sessionDescriptionHandlerOptions &&
                    //   outgoingSession.sessionDescriptionHandlerOptions.hold ===
                    //   true
                    // ) {
                    setupRemoteMedia(secondCallSession);
                    // }
                    break;
                  case SessionState.Terminated:
                    console.log("Call Terminated ....");
                    console.log(secondCallSession);
                    console.log(incomingSession);
                    console.log(outgoingSession);
                    if (
                      outgoingSession &&
                      outgoingSession._state == "Established" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      outgoingSession.invite({
                        sessionDescriptionHandlerOptions: { hold: false },
                      });
                      setPage("");
                      setupRemoteMedia(outgoingSession);
                    }

                    if (
                      outgoingSession &&
                      outgoingSession._state == "Terminated" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      hangupChangeout();
                    }
                    if (
                      (campaignType === "outbound" ||
                        campaignType === "blended") &&
                      (campaignMode === "3" || campaignMode === "1")
                    ) {
                      userAgentRegistration();
                    }
                    //setupRemoteMedia(secondCallSession);
                    // outgoingSession.invite({
                    //   sessionDescriptionHandlerOptions: { hold: false },
                    // });
                    // setPage("");
                    // setupRemoteMedia(outgoingSession);
                    break;
                }
              }
            );
            // Options including delegate to capture response messages
            const inviteOptions: any = {
              requestDelegate: {
                onAccept: (response: any) => {
                  console.log("Positive response ....");
                  console.log(response);
                },
                onReject: (response: any) => {
                  console.log("Negative response ....");
                  console.log(response);
                },
                onProgress: (response: any) => {
                  console.log(response.message.statusCode);
                  console.log(
                    "183+180 Session Progress - Call is in progress."
                  );
                  if (response.message.statusCode == 183) {
                    setupRemoteMedia(outgoingSession);
                    // alert("183 Session Progress");
                    console.log(response);
                    //             callerTuneplay.pause(); //	Caller tune pause
                  }
                  console.log(response);
                },
              },
              sessionDescriptionHandlerOptions: {
                constraints: {
                  audio: true,
                  video: false,
                },
              },
            };
            //	Send invition
            secondCallSession
              .invite(inviteOptions)
              .then((request: OutgoingInviteRequest) => {
                console.log("Successfully sent INVITE ....");
              })
              .catch((error: Error) => {
                console.log("Failed to send INVITE ....");
                // console.log(error);
              });
          }
        }

        if (
          secondCallSession &&
          secondCallSession._state !== "Terminated" &&
          outgoingSession &&
          outgoingSession._state == "Terminated"
        ) {
          secondCallSession.invite({
            sessionDescriptionHandlerOptions: { hold: true },
          });
          let extraHeader: any;
          extraHeader = {
            earlyMedia: true, // Set earlyMedia to true to enable early media
            sessionDescriptionHandlerOptions: {
              constraints: {
                audio: true,
                video: false,
              },
            },
          };
          outgoingSession = new Inviter(userAgent, targetURI, extraHeader);
          setPage("TRANSFER_CALL");
          setShowConferenceBtn(true);
          outgoingSession.stateChange.addListener(
            (callingState: SessionState) => {
              console.log("here8 callingState =========> ", callingState);
              switch (callingState) {
                case SessionState.Establishing:
                  console.log("Ringing on destination ....");
                  console.log(outgoingSession);
                  setShowModal(true);
                  // setLiveCall(true);
                  dispatch(setCallScreen("LIVE"));
                  //                callerTuneplay.play(); //	Caller tune play
                  //                callerTuneplay.currentTime = 0;
                  // dispatch(onSetAddNoteId(null));
                  // dispatch(onAddLeadNoteId(null));
                  // Cookies.remove("callId");
                  break;
                case SessionState.Established:
                  console.log("Call answered ....");
                  // if (
                  //   secondCallSession.sessionDescriptionHandlerOptions &&
                  //   secondCallSession.sessionDescriptionHandlerOptions.hold ===
                  //   true
                  // ) {
                  setupRemoteMedia(outgoingSession);
                  // }
                  break;
                case SessionState.Terminated:
                  console.log("Call Terminated ....");
                  console.log(secondCallSession);
                  console.log(incomingSession);
                  console.log(outgoingSession);
                  if (
                    secondCallSession &&
                    secondCallSession._state == "Established" &&
                    outgoingSession &&
                    outgoingSession._state == "Terminated"
                  ) {
                    secondCallSession.invite({
                      sessionDescriptionHandlerOptions: { hold: false },
                    });
                    setPage("");
                    setupRemoteMedia(secondCallSession);
                  }

                  if (
                    outgoingSession &&
                    outgoingSession._state == "Terminated" &&
                    secondCallSession &&
                    secondCallSession._state == "Terminated"
                  ) {
                    hangupChangeout();
                  }
                  if (
                    (campaignType === "outbound" ||
                      campaignType === "blended") &&
                    (campaignMode === "3" || campaignMode === "1")
                  ) {
                    userAgentRegistration();
                  }
                  //setupRemoteMedia(secondCallSession);
                  // outgoingSession.invite({
                  //   sessionDescriptionHandlerOptions: { hold: false },
                  // });
                  // setPage("");
                  // setupRemoteMedia(outgoingSession);
                  break;
              }
            }
          );
          // Options including delegate to capture response messages
          const inviteOptions: any = {
            requestDelegate: {
              onAccept: (response: any) => {
                console.log("Positive response ....");
                console.log(response);
              },
              onReject: (response: any) => {
                console.log("Negative response ....");
                console.log(response);
              },
              onProgress: (response: any) => {
                console.log(response.message.statusCode);
                console.log("183+180 Session Progress - Call is in progress.");
                if (response.message.statusCode == 183) {
                  secondCallSession.invite({
                    sessionDescriptionHandlerOptions: { hold: true },
                  });
                  //	                setupRemoteMedia1(outgoingSession);
                  setupRemoteMedia(outgoingSession);
                  //alert("183 Session Progress");
                  console.log(response);
                  //             callerTuneplay.pause(); //	Caller tune pause
                }
                console.log(response);
              },
            },
            sessionDescriptionHandlerOptions: {
              constraints: {
                audio: true,
                video: false,
              },
            },
          };
          //	Send invition
          outgoingSession
            .invite(inviteOptions)
            .then((request: OutgoingInviteRequest) => {
              console.log("Successfully sent INVITE ....");
            })
            .catch((error: Error) => {
              console.log("Failed to send INVITE ....");
              // console.log(error);
            });
        }
      } catch (error: any) {
        console.log("Attended Transfer error ===>", error);
      }

      try {
        const targetURI: any = UserAgent.makeURI(
          "sip:" + "webphonetransfer_5_" + destinationNumber + "@" + domain
        );
        if (incomingSession && incomingSession._state !== "Terminated") {
          if (incomingSession._state !== "Establishing") {
            incomingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
            let campaignOptions: any;
            if (!user?.isPbx) {
              campaignOptions = {
                extraHeaders: [
                  `X-selectedcampaignuuid: ${selectedCampaign}`,
                  `X-previous_destination_number: ${destinationNumber}`,
                  `X-type: transfer`,
                  `X-campaign_flag:${campaignType}`,
                ],
              };
            }
            secondCallSession = new Inviter(
              userAgent,
              targetURI,
              campaignOptions
            );
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
            secondCallSession.stateChange.addListener(
              async (callingState: SessionState) => {
                console.log("here7 callingState =========> ", callingState);
                switch (callingState) {
                  case SessionState.Established:
                    console.log("Call answered ....");
                    // if (
                    //   incomingSession.sessionDescriptionHandlerOptions &&
                    //   incomingSession.sessionDescriptionHandlerOptions.hold ===
                    //   true
                    // ) {
                    setupRemoteMedia(secondCallSession);
                    // }
                    break;
                  case SessionState.Terminated:
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    console.log("Call Terminated ....");
                    console.log(secondCallSession);
                    console.log(incomingSession);
                    // console.log(
                    //   incomingSession._sessionDescriptionHandler._localMediaStream.active
                    // );

                    // console.log(
                    //   incomingSession._sessionDescriptionHandler._remoteMediaStream.active
                    // );
                    //const secondState = incomingSession.state;
                    // const peerConnection = incomingSession.sessionDescriptionHandler.peerConnection;
                    // if (peerConnection && peerConnection.connectionState === 'closed') {
                    //   console.log('Peer connection is closed.');
                    // } else {
                    //   console.log('Peer connection is still active.');
                    // }
                    //console.log(secondState);
                    console.log(outgoingSession);
                    if (
                      incomingSession &&
                      incomingSession._state == "Established" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      if (
                        incomingSession.invite !== undefined &&
                        typeof incomingSession.invite === "function"
                      ) {
                        incomingSession.invite({
                          sessionDescriptionHandlerOptions: { hold: false },
                        });
                        setPage("");
                        setupRemoteMedia(incomingSession);
                      }
                    }
                    if (
                      incomingSession &&
                      incomingSession._state == "Terminated" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      hangupChange();
                    }

                    if (
                      incomingSession &&
                      incomingSession._state == "Terminated"
                    ) {
                      hangupChange();
                    }
                    if (
                      (campaignType === "outbound" ||
                        campaignType === "blended") &&
                      (campaignMode === "3" || campaignMode === "1")
                    ) {
                      userAgentRegistration();
                    }
                    break;
                }
              }
            );
            // Options including delegate to capture response messages
            const inviteOptions: any = {
              requestDelegate: {
                onAccept: (response: any) => {
                  console.log("Positive response ....");
                  console.log(response);
                },
                onReject: (response: any) => {
                  console.log("Negative response ....");
                  console.log(response);
                },
                onProgress: (response: any) => {
                  console.log(response.message.statusCode);
                  console.log(
                    "183+180 Session Progress - Call is in progress."
                  );
                  if (response.message.statusCode == 183) {
                    setupRemoteMedia(incomingSession);
                    // alert("183 Session Progress");
                    console.log(response);
                    //             callerTuneplay.pause(); //	Caller tune pause
                  }
                  console.log(response);
                },
              },
              sessionDescriptionHandlerOptions: {
                constraints: {
                  audio: true,
                  video: false,
                },
              },
            };
            //	Send invition
            secondCallSession
              .invite(inviteOptions)
              .then((request: OutgoingInviteRequest) => {
                console.log("Successfully sent INVITE ....");
              })
              .catch((error: Error) => {
                console.log("Failed to send INVITE ....");
                // console.log(error);
              });
          }
        }
      } catch (error: any) {
        console.log("Attended Transfer error ===>", error);
      }
    }
  };

  // IVR CALL TRANSFER
  const ivrTransferCall = async (destination: any, callType: string) => {
    console.log("destination ---->", destination);
    let domain = Cookies.get("domain") || "10.180.67.151";
    let destinationNumber = destination;
    const extraHeaders = [
      "X-user_uuid: my-value",
    ];
    console.log(domain, destinationNumber, "destinationNumber=====>");

    // if (callType === "blindTransfer") {
    try {
      const target = UserAgent.makeURI(
        "sip:" + "webphonetransfer_2_" + destinationNumber + "@" + domain
      );
      if (outgoingSession && outgoingSession._state !== "Terminated") {
        if (outgoingSession._state !== "Establishing") {
          outgoingSession.refer(target, {
            requestOptions: {
              extraHeaders: extraHeaders
            }
          });
          setPage("TRANSFER_CALL");
          setShowConferenceBtn(true);
        }
      }
    } catch (error: any) {
      console.log("Blind Transfer error ===>", error);
    }

    try {
      const target = UserAgent.makeURI(
        "sip:" + "webphonetransfer_2_" + destinationNumber + "@" + domain
      );
      if (incomingSession && incomingSession._state !== "Terminated") {
        if (incomingSession._state !== "Establishing") {
          incomingSession.refer(target, {
            requestOptions: {
              extraHeaders: extraHeaders
            }
          });
          setPage("TRANSFER_CALL");
          setShowConferenceBtn(true);
        }
      }
    } catch (error: any) {
      console.log("Blind Transfer error ===>", error);
    }
    // }
  };

  // EXTERNAL CALL TRANSFER
  const externalTransferCall = async (destination: any, callType: string) => {
    console.log("destination ---->", destination);
    console.log("callType ---->", callType);

    let domain = Cookies.get("domain") || "10.180.67.151";
    let destinationNumber = destination;
    console.log(domain, destinationNumber, "destinationNumber=====>");

    if (callType === "blindTransfer") {
      try {
        const target = UserAgent.makeURI(
          "sip:" + destinationNumber + "@" + domain
        );
        if (outgoingSession && outgoingSession._state !== "Terminated") {
          if (outgoingSession._state !== "Establishing") {
            outgoingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
            outgoingSession.refer(target);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
          }
        }
      } catch (error: any) {
        console.log("Blind Transfer error ===>", error);
      }

      try {
        const target = UserAgent.makeURI(
          "sip:" + destinationNumber + "@" + domain
        );
        if (incomingSession && incomingSession._state !== "Terminated") {
          if (incomingSession._state !== "Establishing") {
            incomingSession.refer(target);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
          }
        }
      } catch (error: any) {
        console.log("Blind Transfer error ===>", error);
      }
    } else if (callType === "attendedTransfer") {
      console.log("COMING FOR ATTEND TRANSFER");
      try {
        console.log("COMING FOR ATTEND TRANSFER");
        const targetURI: any = UserAgent.makeURI(
          "sip:" + destinationNumber + "@" + domain
        );
        if (outgoingSession && outgoingSession._state !== "Terminated") {
          if (outgoingSession._state !== "Establishing") {
            outgoingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
            // let extraHeader: any;
            //   extraHeader = {
            //     earlyMedia: true, // Set earlyMedia to true to enable early media
            //     sessionDescriptionHandlerOptions: {
            //           constraints: {
            //             audio: true,
            //             video: false,
            //           },
            //         }
            //         };
            let extraHeader: any;
            if (!user?.isPbx) {
              extraHeader = {
                earlyMedia: true, // Set earlyMedia to true to enable early media
                sessionDescriptionHandlerOptions: {
                  constraints: {
                    audio: true,
                    video: false,
                  },
                },
                extraHeaders: [
                  `X-selectedcampaignuuid: ${selectedCampaign}`,
                  `X-previous_destination_number: ${destinationNumber}`,
                  `X-type: transfer`,
                  `X-campaign_flag:${campaignType}`,
                ],
              };
            } else {
              extraHeader = {
                earlyMedia: true, // Set earlyMedia to true to enable early media
                sessionDescriptionHandlerOptions: {
                  constraints: {
                    audio: true,
                    video: false,
                  },
                },
              };
            }
            secondCallSession = new Inviter(userAgent, targetURI, extraHeader);
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
            secondCallSession.stateChange.addListener(
              (callingState: SessionState) => {
                console.log("here8 callingState =========> ", callingState);
                switch (callingState) {
                  case SessionState.Establishing:
                    console.log("Ringing on destination ....");
                    console.log(secondCallSession);
                    setShowModal(true);
                    // setLiveCall(true);
                    dispatch(setCallScreen("LIVE"));
                    //                callerTuneplay.play(); //	Caller tune play
                    //                callerTuneplay.currentTime = 0;
                    // dispatch(onSetAddNoteId(null));
                    // dispatch(onAddLeadNoteId(null));
                    // Cookies.remove("callId");
                    break;
                  case SessionState.Established:
                    console.log("Call answered ....");
                    if (
                      outgoingSession.sessionDescriptionHandlerOptions &&
                      outgoingSession.sessionDescriptionHandlerOptions.hold ===
                      true
                    ) {
                      setupRemoteMedia(secondCallSession);
                    }
                    break;
                  case SessionState.Terminated:
                    console.log("Call Terminated ....");
                    console.log(secondCallSession);
                    console.log(incomingSession);
                    console.log(outgoingSession);
                    if (
                      outgoingSession &&
                      outgoingSession._state == "Established" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      outgoingSession.invite({
                        sessionDescriptionHandlerOptions: { hold: false },
                      });
                      setPage("");
                      setupRemoteMedia(outgoingSession);
                    }

                    if (
                      outgoingSession &&
                      outgoingSession._state == "Terminated" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      hangupChangeout();
                    }
                    if (
                      (campaignType === "outbound" ||
                        campaignType === "blended") &&
                      (campaignMode === "3" || campaignMode === "1")
                    ) {
                      userAgentRegistration();
                    }
                    //setupRemoteMedia(secondCallSession);
                    // outgoingSession.invite({
                    //   sessionDescriptionHandlerOptions: { hold: false },
                    // });
                    // setPage("");
                    // setupRemoteMedia(outgoingSession);
                    break;
                }
              }
            );
            // Options including delegate to capture response messages
            const inviteOptions: any = {
              requestDelegate: {
                onAccept: (response: any) => {
                  console.log("Positive response ....");
                  console.log(response);
                },
                onReject: (response: any) => {
                  console.log("Negative response ....");
                  console.log(response);
                },
                onProgress: (response: any) => {
                  console.log(response.message.statusCode);
                  console.log(
                    "183+180 Session Progress - Call is in progress."
                  );
                  if (response.message.statusCode == 183) {
                    outgoingSession.invite({
                      sessionDescriptionHandlerOptions: { hold: true },
                    });
                    //	                setupRemoteMedia1(outgoingSession);
                    setupRemoteMedia(secondCallSession);
                    //alert("183 Session Progress");
                    console.log(response);
                    //             callerTuneplay.pause(); //	Caller tune pause
                  }
                  console.log(response);
                },
              },
              sessionDescriptionHandlerOptions: {
                constraints: {
                  audio: true,
                  video: false,
                },
              },
            };
            //	Send invition
            secondCallSession
              .invite(inviteOptions)
              .then((request: OutgoingInviteRequest) => {
                console.log("Successfully sent INVITE ....");
              })
              .catch((error: Error) => {
                console.log("Failed to send INVITE ....");
                // console.log(error);
              });
          }
        }
        console.log(outgoingSession);
        console.log(secondCallSession);
        if (
          secondCallSession &&
          secondCallSession._state !== "Terminated" &&
          outgoingSession &&
          outgoingSession._state == "Terminated"
        ) {
          secondCallSession.invite({
            sessionDescriptionHandlerOptions: { hold: true },
          });
          let extraHeader: any;
          extraHeader = {
            earlyMedia: true, // Set earlyMedia to true to enable early media
            sessionDescriptionHandlerOptions: {
              constraints: {
                audio: true,
                video: false,
              },
            },
          };
          outgoingSession = new Inviter(userAgent, targetURI, extraHeader);
          setPage("TRANSFER_CALL");
          setShowConferenceBtn(true);
          outgoingSession.stateChange.addListener(
            (callingState: SessionState) => {
              console.log("here8 callingState =========> ", callingState);
              switch (callingState) {
                case SessionState.Establishing:
                  console.log("Ringing on destination ....");
                  console.log(outgoingSession);
                  setShowModal(true);
                  // setLiveCall(true);
                  dispatch(setCallScreen("LIVE"));
                  //                callerTuneplay.play(); //	Caller tune play
                  //                callerTuneplay.currentTime = 0;
                  // dispatch(onSetAddNoteId(null));
                  // dispatch(onAddLeadNoteId(null));
                  // Cookies.remove("callId");
                  break;
                case SessionState.Established:
                  console.log("Call answered ....");
                  if (
                    secondCallSession.sessionDescriptionHandlerOptions &&
                    secondCallSession.sessionDescriptionHandlerOptions.hold ===
                    true
                  ) {
                    setupRemoteMedia(outgoingSession);
                  }
                  break;
                case SessionState.Terminated:
                  console.log("Call Terminated ....");
                  console.log(secondCallSession);
                  console.log(incomingSession);
                  console.log(outgoingSession);
                  if (
                    secondCallSession &&
                    secondCallSession._state == "Established" &&
                    outgoingSession &&
                    outgoingSession._state == "Terminated"
                  ) {
                    secondCallSession.invite({
                      sessionDescriptionHandlerOptions: { hold: false },
                    });
                    setPage("");
                    setupRemoteMedia(secondCallSession);
                  }

                  if (
                    outgoingSession &&
                    outgoingSession._state == "Terminated" &&
                    secondCallSession &&
                    secondCallSession._state == "Terminated"
                  ) {
                    hangupChangeout();
                  }
                  if (
                    (campaignType === "outbound" ||
                      campaignType === "blended") &&
                    (campaignMode === "3" || campaignMode === "1")
                  ) {
                    userAgentRegistration();
                  }
                  //setupRemoteMedia(secondCallSession);
                  // outgoingSession.invite({
                  //   sessionDescriptionHandlerOptions: { hold: false },
                  // });
                  // setPage("");
                  // setupRemoteMedia(outgoingSession);
                  break;
              }
            }
          );
          // Options including delegate to capture response messages
          const inviteOptions: any = {
            requestDelegate: {
              onAccept: (response: any) => {
                console.log("Positive response ....");
                console.log(response);
              },
              onReject: (response: any) => {
                console.log("Negative response ....");
                console.log(response);
              },
              onProgress: (response: any) => {
                console.log(response.message.statusCode);
                console.log("183+180 Session Progress - Call is in progress.");
                if (response.message.statusCode == 183) {
                  secondCallSession.invite({
                    sessionDescriptionHandlerOptions: { hold: true },
                  });
                  //	                setupRemoteMedia1(outgoingSession);
                  setupRemoteMedia(outgoingSession);
                  //alert("183 Session Progress");
                  console.log(response);
                  //             callerTuneplay.pause(); //	Caller tune pause
                }
                console.log(response);
              },
            },
            sessionDescriptionHandlerOptions: {
              constraints: {
                audio: true,
                video: false,
              },
            },
          };
          //	Send invition
          outgoingSession
            .invite(inviteOptions)
            .then((request: OutgoingInviteRequest) => {
              console.log("Successfully sent INVITE ....");
            })
            .catch((error: Error) => {
              console.log("Failed to send INVITE ....");
              // console.log(error);
            });
        }
      } catch (error: any) {
        console.log("Attended Transfer error ===>", error);
      }

      try {
        const targetURI: any = UserAgent.makeURI(
          "sip:" + destinationNumber + "@" + domain
        );
        if (incomingSession && incomingSession._state !== "Terminated") {
          if (incomingSession._state !== "Establishing") {
            incomingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
            let campaignOptions: any;
            if (!user?.isPbx) {
              campaignOptions = {
                extraHeaders: [
                  `X-selectedcampaignuuid: ${selectedCampaign}`,
                  `X-previous_destination_number: ${destinationNumber}`,
                  `X-type: transfer`,
                  `X-campaign_flag:${campaignType}`,
                ],
              };
            }
            secondCallSession = new Inviter(
              userAgent,
              targetURI,
              campaignOptions
            );
            setPage("TRANSFER_CALL");
            setShowConferenceBtn(true);
            secondCallSession.stateChange.addListener(
              async (callingState: SessionState) => {
                console.log("here1 callingState =========> ", callingState);
                switch (callingState) {
                  case SessionState.Established:
                    console.log("Call answered ....");
                    if (
                      incomingSession.sessionDescriptionHandlerOptionsReInvite &&
                      incomingSession.sessionDescriptionHandlerOptionsReInvite
                        .hold === true
                    ) {
                      setupRemoteMedia(secondCallSession);
                    }
                    break;
                  case SessionState.Terminated:
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    console.log("Call Terminated ....");
                    console.log(secondCallSession);
                    console.log(incomingSession);
                    // console.log(
                    //   incomingSession._sessionDescriptionHandler._localMediaStream.active
                    // );

                    // console.log(
                    //   incomingSession._sessionDescriptionHandler._remoteMediaStream.active
                    // );
                    //const secondState = incomingSession.state;
                    // const peerConnection = incomingSession.sessionDescriptionHandler.peerConnection;
                    // if (peerConnection && peerConnection.connectionState === 'closed') {
                    //   console.log('Peer connection is closed.');
                    // } else {
                    //   console.log('Peer connection is still active.');
                    // }
                    //console.log(secondState);
                    console.log(outgoingSession);
                    if (
                      incomingSession &&
                      incomingSession._state == "Established" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      if (
                        incomingSession.invite !== undefined &&
                        typeof incomingSession.invite === "function"
                      ) {
                        incomingSession.invite({
                          sessionDescriptionHandlerOptions: { hold: false },
                        });
                        setPage("");
                        setupRemoteMedia(incomingSession);
                      }
                    }
                    if (
                      incomingSession &&
                      incomingSession._state == "Terminated" &&
                      secondCallSession &&
                      secondCallSession._state == "Terminated"
                    ) {
                      hangupChange();
                    }

                    if (
                      incomingSession &&
                      incomingSession._state == "Terminated"
                    ) {
                      hangupChange();
                    }
                    if (
                      (campaignType === "outbound" ||
                        campaignType === "blended") &&
                      (campaignMode === "3" || campaignMode === "1")
                    ) {
                      userAgentRegistration();
                    }
                    break;
                }
              }
            );
            // Options including delegate to capture response messages
            const inviteOptions: any = {
              requestDelegate: {
                onAccept: (response: any) => {
                  console.log("Positive response ....");
                  console.log(response);
                },
                onReject: (response: any) => {
                  console.log("Negative response ....");
                  console.log(response);
                },
                onProgress: (response: any) => {
                  console.log(response.message.statusCode);
                  console.log(
                    "183+180 Session Progress - Call is in progress."
                  );
                  if (response.message.statusCode == 183) {
                    setupRemoteMedia(incomingSession);
                    // alert("183 Session Progress");
                    console.log(response);
                    //             callerTuneplay.pause(); //	Caller tune pause
                  }
                  console.log(response);
                },
              },
              sessionDescriptionHandlerOptions: {
                constraints: {
                  audio: true,
                  video: false,
                },
              },
            };
            //	Send invition
            secondCallSession
              .invite(inviteOptions)
              .then((request: OutgoingInviteRequest) => {
                console.log("Successfully sent INVITE ....");
              })
              .catch((error: Error) => {
                console.log("Failed to send INVITE ....");
                // console.log(error);
              });
          }
        }
      } catch (error: any) {
        console.log("Attended Transfer error ===>", error);
      }
    }
  };

  // DTMF CALL TRANSFER
  const dtmfTransferCall = async (destination: any) => {
    console.log("destination ---->", destination);
    var destination = destination;
    console.log("send DTMF");
    console.log(destination);
    const optionsDTMF = {
      requestOptions: {
        body: {
          contentDisposition: "render",
          contentType: "application/dtmf-relay",
          content: "Signal=" + destination.toString() + "\r\nDuration=250",
        },
      },
    };
    try {
      //  Manage DTMF in outgoing session
      if (outgoingSession && outgoingSession._state === "Established") {
        if (secondCallSession && secondCallSession._state !== "Established") {
          outgoingSession.info(optionsDTMF);
        }
      }
      //  Manage DTMF in incoming session
      if (incomingSession && incomingSession._state === "Established") {
        if (secondCallSession && secondCallSession._state !== "Established") {
          incomingSession.info(optionsDTMF);
        }
      }
      //  Manage DTMF in secondCall Session
      if (secondCallSession && secondCallSession._state === "Established") {
        secondCallSession.info(optionsDTMF);
      }
    } catch (error) {
      console.log("Incoming or Outgoing session not found for DTMF - ", error);
    }
  };

  const hangupChangeout = () => {
    // setLiveCall(false);
    Cookies.remove("LeadDialName");
    setNumber("");
    dispatch(onDial(null));
    setShowModal(true);
    setShowActiveModal(false);
    // if (!!Cookies.get("callId") && user?.isPbx) setIsAddNote(true);
    if (!!Cookies.get("callId") && user?.isPbx)
      dispatch(setCallScreen("ADDNOTE"));
    // && !user?.isPbx
    if (!!Cookies.get("callId")) {
      dispatch(setIsCallHangUp(true));
      console.log('isCallHangUp from hangup');
      onUpdateLiveAgentEntry("hangup", Cookies.get("phone_number") || "");
      if (!user?.isPbx && Cookies.get("isEstablished") === "1") {
        onAddReport("outbound", "decrement");
      }
      if (Cookies.get("campaignMode") === "3" || campaignMode === "3") {
        onUpdateDialLevel();
      }
      onCallQueueInbound();
      dispatch(onShowCallModal("false"));
      setShowModal(false);
      if (
        campaignType === "inbound" ||
        campaignMode === "3" ||
        campaignMode === "1"
      ) {
        dispatch(setCallScreen("LEADDIAL"));
        dispatch(onSetDialType("leadDial"));
      } else {
        dispatch(setCallScreen(""));
      }
    }
    if (!!!Cookies.get("callId") && callScreen !== "CALLFAILED") {
      dispatch(onAddLeadNoteId(null));
      setShowModal(false);
      if (
        (campaignType === "inbound" ||
          campaignMode === "3" ||
          campaignMode === "1") &&
        !user?.isPbx
      ) {
        dispatch(setCallScreen("LEADDIAL"));
        dispatch(onSetDialType("leadDial"));
      } else {
        dispatch(setCallScreen(""));
      }
    }
    setIsHold(false);
    setIsMuted(false);
    setPage("");
    cleanupMedia(); //	Stop media audio control
    //outgoingSession("");
    // outgoingSession = null;
    // incomingSession("");
    // callerTuneplay.pause(); //	Caller tune pause
    stopTune()
    callDuration(false); //	Call duration
    onGetCallStatistic(); // call History refresh
    onMissedCallCountGet(); // call missed call count
    dispatch(setIsShowCallDuration(false));
    callKeypadSiderProperties("callTermination", "Termination");
  };

  const hangupChange = () => {
    setShowIncomingModal(false); // incoming call Model false
    Cookies.remove("LeadDialName");
    setNumber("");
    dispatch(onDial(null));
    setShowModal(true);
    setShowActiveModal(false);
    // if (!!Cookies.get("callId") && user?.isPbx) setIsAddNote(true);
    if (!!Cookies.get("callId") && user?.isPbx)
      dispatch(setCallScreen("ADDNOTE"));
    // && !user?.isPbx
    if (!!Cookies.get("callId")) {
      dispatch(setIsCallHangUp(true));
      console.log(isCallHangUp, 'isCallHangUp from hangupChange');
      onUpdateLiveAgentEntry("hangup", Cookies.get("phone_number") || "");
      if (!user?.isPbx && Cookies.get("isEstablished") === "1") {
        onAddReport("outbound", "decrement");
      }
      if (Cookies.get("campaignMode") === "3" || campaignMode === "3") {
        onUpdateDialLevel();
      }
      onCallQueueInbound();
      dispatch(onShowCallModal("false"));
      setShowModal(false);
      if (
        campaignType === "inbound" ||
        campaignMode === "3" ||
        campaignMode === "1"
      ) {
        dispatch(setCallScreen("LEADDIAL"));
        dispatch(onSetDialType("leadDial"));
      } else {
        dispatch(setCallScreen(""));
      }
    }
    if (!!!Cookies.get("callId")) {
      dispatch(onAddLeadNoteId(null));
      dispatch(clearLeadDetails());
      setShowModal(false);
      if (
        (campaignType === "inbound" ||
          campaignMode === "3" ||
          campaignMode === "1") &&
        !user?.isPbx
      ) {
        dispatch(setCallScreen("LEADDIAL"));
        dispatch(onSetDialType("leadDial"));
      } else {
        dispatch(setCallScreen(""));
      }
    }
    setIsHold(false);
    setIsMuted(false);
    setPage("");
    cleanupMedia(); //	Stop media audio control
    // callerTuneplay.pause(); //	Caller tune pause
    stopTune()
    //incomingSession = null;
    callDuration(false); //	Call duration
    onGetCallStatistic(); // call History refresh
    onMissedCallCountGet(); // call missed call count
    dispatch(setIsShowCallDuration(false));
    callKeypadSiderProperties("callTermination", "Termination");
  };

  // HANGUP CALL
  const hangupCall = (callHangUpType?: string) => {
    //alert(callHangUpType);
    setAddNoteSeconds(seconds);
    setAddNoteMinutes(minutes);
    // dispatch(setIsCallHangUp(false))
    console.log("COMING HANGUP");
    console.log(callHangUpType);
    console.log(secondCallSession);
    console.log(incomingSession);
    console.log(outgoingSession);
    if (outgoingSession) {
      switch (callHangUpType) {
        case "HANGUP_BOTH_LINE":
          Cookies.set("is_call_start", "1");
          if (outgoingSession && outgoingSession._state === "Establishing") {
            //outgoingSession = null;
            outgoingSession.cancel();
            outgoingSession = null;
          }
          if (outgoingSession && outgoingSession._state === "Established") {
            //outgoingSession = null;

            outgoingSession.bye();
            outgoingSession = null;
          }
          if (
            secondCallSession &&
            secondCallSession._state === "Establishing"
          ) {
            //secondCallSession = null;
            secondCallSession.cancel();
            secondCallSession = null;
          }
          if (secondCallSession && secondCallSession._state === "Established") {
            //secondCallSession = null;
            secondCallSession.bye();
            secondCallSession = null;
          }
          hangupChangeout();
          hangupChange();
          //secondCallSession.bye();
          break;
        case "LEAVE_3_WAY":
          // console.log(secondCallSession,"second");
          // console.log(outgoingSession,"outgoing");
          if (
            outgoingSession &&
            outgoingSession._state == "Established" &&
            secondCallSession &&
            secondCallSession._state === "Established"
          ) {
            outgoingSession.refer(secondCallSession);
          }
          break;
        case "LINE_HANG_UP":
          cleanupMedia(); //	Stop media audio control
          // if (secondCallSession && secondCallSession.state === "Established") {
          //   secondCallSession.bye();
          // }
          if (
            secondCallSession &&
            secondCallSession._state === "Establishing"
          ) {
            //secondCallSession = null;
            secondCallSession.cancel();
            secondCallSession = null;
          }
          if (secondCallSession && secondCallSession._state === "Established") {
            //secondCallSession = null;
            secondCallSession.bye();
            secondCallSession = null;
          }
          //secondCallSession.bye();
          if (outgoingSession.pendingReinvite == false) {
            outgoingSession.invite({
              sessionDescriptionHandlerOptions: { hold: false },
            });
            setPage("");
            setupRemoteMedia(outgoingSession);
          }
          break;
        case "CONFERENCE_3_WAY":
          console.log("===============3 way");
          console.log(outgoingSession);
          console.log(secondCallSession);
          console.log("===============3 way");
          outgoingSession.invite({
            sessionDescriptionHandlerOptions: { hold: false },
          });
          secondCallSession.invite({
            sessionDescriptionHandlerOptions: { hold: false },
          });
          var sessionsToConference = [outgoingSession, secondCallSession];
          var conferenceData = conference(sessionsToConference);
          setShowConferenceBtn(false);
          break;
        case "SWAP_CALL":
          console.log("===============SWAP_CALL");
          console.log(
            outgoingSession.sessionDescriptionHandlerOptionsReInvite.hold
          );
          console.log(
            secondCallSession.sessionDescriptionHandlerOptionsReInvite.hold
          );
          console.log("===============SWAP_CALL");
          if (
            outgoingSession.sessionDescriptionHandlerOptionsReInvite &&
            outgoingSession.sessionDescriptionHandlerOptionsReInvite.hold ===
            true
          ) {
            outgoingSession.invite({
              sessionDescriptionHandlerOptions: { hold: false },
            });
            setupRemoteMedia(outgoingSession);
          } else {
            outgoingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
          }
          if (
            secondCallSession.sessionDescriptionHandlerOptionsReInvite &&
            secondCallSession.sessionDescriptionHandlerOptionsReInvite.hold ===
            true
          ) {
            secondCallSession.invite({
              sessionDescriptionHandlerOptions: { hold: false },
            });
            setupRemoteMedia(secondCallSession);
          } else {
            secondCallSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
          }
          // outgoingSession.invite({
          //   sessionDescriptionHandlerOptions: { hold: false },
          // });
          // secondCallSession.invite({
          //   sessionDescriptionHandlerOptions: { hold: false },
          // });
          break;
        default:
          try {
            if (outgoingSession) {
              if (outgoingSession._state === "Establishing") {
                //alert('123');
                //outgoingSession = null;
                outgoingSession.cancel();
                outgoingSession = null;
              } else if (outgoingSession._state === "Established") {
                //alert('456');
                //  outgoingSession.bye();
                if (
                  secondCallSession &&
                  (secondCallSession.state === "Established" ||
                    (secondCallSession &&
                      secondCallSession.state === "Establishing") ||
                    secondCallSession.state === "Initial")
                ) {
                  if (
                    outgoingSession &&
                    outgoingSession.state === "Established"
                  ) {
                    outgoingSession.refer(secondCallSession);
                  }
                } else {
                  //alert("null");
                  //outgoingSession = null;

                  outgoingSession.bye();
                  outgoingSession = null;
                  //incomingSession = null;
                }
                // outgoingSession.refer(secondCallSession);
              }
            }

            if (incomingSession) {
              // dispatch(setIsCallHangUp(false))
              if (
                incomingSession._state === "Initial" ||
                incomingSession._state === "Establishing"
              ) {
                // incomingSession.cancel()
                //incomingSession = null;
                incomingSession.reject();
                incomingSession = null;
              } else if (incomingSession._state === "Established") {
                // incomingSession.bye();
                // incomingSession.refer(secondCallSession);
                if (
                  secondCallSession &&
                  secondCallSession.state === "Established"
                ) {
                  if (
                    incomingSession &&
                    incomingSession.state === "Established"
                  ) {
                    incomingSession.refer(secondCallSession);
                  }
                } else {
                  //incomingSession = null;
                  incomingSession.bye();
                  incomingSession = null;
                  //outgoingSession = null;
                }
              }
            }
            if (secondCallSession) {
              if (
                secondCallSession._state === "Initial" ||
                secondCallSession._state === "Establishing"
              ) {
                // incomingSession.cancel()
                //incomingSession = null;
                secondCallSession.cancel();
                secondCallSession = null;
              } else if (secondCallSession._state === "Established") {
                //  incomingSession.bye();
                // incomingSession.refer(secondCallSession);
                if (
                  secondCallSession &&
                  secondCallSession.state === "Established"
                ) {
                  if (
                    incomingSession &&
                    incomingSession.state === "Established"
                  ) {
                    incomingSession.refer(secondCallSession);
                  } else {
                    hangupChangeout();
                    secondCallSession.bye();
                    secondCallSession = null;
                  }
                } else {
                  //incomingSession = null;
                  secondCallSession.bye();
                  secondCallSession = null;
                }
              }
            }
          } catch (error) {
            console.log("Incoming or Outgoing session not found - ", error);
          }
          break;
      }
    }

    if (incomingSession) {
      switch (callHangUpType) {
        case "HANGUP_BOTH_LINE":
          console.log("COMING");
          console.log(secondCallSession);
          console.log(incomingSession);
          //secondCallSession = null;
          //incomingSession = null;
          //incomingSession.bye();
          //secondCallSession.bye();
          if (incomingSession && incomingSession._state === "Establishing") {
            //incomingSession = null;
            incomingSession.cancel();
            incomingSession = null;
          }
          if (incomingSession && incomingSession._state === "Established") {
            //incomingSession = null;
            incomingSession.bye();
            incomingSession = null;
          }
          if (
            secondCallSession &&
            secondCallSession._state === "Establishing"
          ) {
            //secondCallSession = null;
            secondCallSession.cancel();
            secondCallSession = null;
          }
          if (secondCallSession && secondCallSession._state === "Established") {
            //secondCallSession = null;
            secondCallSession.bye();
            secondCallSession = null;
          }

          hangupChangeout();
          hangupChange();
          console.log("COMING");
          console.log(secondCallSession);
          console.log(incomingSession);
          break;
        case "LEAVE_3_WAY":
          console.log(incomingSession);
          console.log(secondCallSession);
          if (incomingSession && secondCallSession) {
            if (
              incomingSession &&
              incomingSession._state === "Established" &&
              secondCallSession &&
              secondCallSession._state === "Established"
            ) {
              incomingSession.refer(secondCallSession);
            }
          }
          //incomingSession.refer(secondCallSession);
          break;
        case "LINE_HANG_UP":
          cleanupMedia(); //	Stop media audio control
          // setupRemoteMedia(outgoingSession);
          if (secondCallSession && secondCallSession.state === "Established") {
            //secondCallSession = null;
            secondCallSession.bye();
            secondCallSession = null;
          } else {
            console.log("Invalid session state for hanging up the second call");
          }
          // secondCallSession.bye();
          console.log("SESSION FIND");
          console.log(incomingSession.pendingReinvite);
          console.log(outgoingSession);
          if (incomingSession.pendingReinvite == false) {
            incomingSession.invite({
              sessionDescriptionHandlerOptions: { hold: false },
            });
            setPage("");
            setupRemoteMedia(incomingSession);
          }
          break;
        case "CONFERENCE_3_WAY":
          console.log("===============3 way");
          console.log(incomingSession);
          console.log(secondCallSession);
          console.log("===============3 way");
          incomingSession.invite({
            sessionDescriptionHandlerOptions: { hold: false },
          });
          var sessionsToConference = [incomingSession, secondCallSession];
          var conferenceData = conference(sessionsToConference);
          setShowConferenceBtn(false);
          break;
        case "SWAP_CALL":
          console.log("===============SWAP_CALL");
          console.log(
            outgoingSession.sessionDescriptionHandlerOptionsReInvite.hold
          );
          console.log(
            secondCallSession.sessionDescriptionHandlerOptionsReInvite.hold
          );
          console.log("===============SWAP_CALL");
          if (
            outgoingSession.sessionDescriptionHandlerOptionsReInvite &&
            outgoingSession.sessionDescriptionHandlerOptionsReInvite.hold ===
            true
          ) {
            outgoingSession.invite({
              sessionDescriptionHandlerOptions: { hold: false },
            });
            setupRemoteMedia(outgoingSession);
          } else {
            outgoingSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
          }
          if (
            secondCallSession.sessionDescriptionHandlerOptionsReInvite &&
            secondCallSession.sessionDescriptionHandlerOptionsReInvite.hold ===
            true
          ) {
            secondCallSession.invite({
              sessionDescriptionHandlerOptions: { hold: false },
            });
            setupRemoteMedia(secondCallSession);
          } else {
            secondCallSession.invite({
              sessionDescriptionHandlerOptions: { hold: true },
            });
          }
          // outgoingSession.invite({
          //   sessionDescriptionHandlerOptions: { hold: false },
          // });
          // secondCallSession.invite({
          //   sessionDescriptionHandlerOptions: { hold: false },
          // });
          break;
        default:
          console.log("HANGUP DEFAULT");
          try {
            if (outgoingSession) {
              if (outgoingSession._state === "Establishing") {
                //alert('123');
                //outgoingSession = null;
                outgoingSession.cancel();
                outgoingSession = null;
              } else if (
                outgoingSession &&
                outgoingSession.state !== "Established"
              ) {
                //alert('456');
                // outgoingSession.bye();
                if (
                  secondCallSession &&
                  (secondCallSession.state === "Established" ||
                    (secondCallSession &&
                      secondCallSession.state === "Establishing") ||
                    secondCallSession.state === "Initial")
                ) {
                  if (
                    outgoingSession &&
                    outgoingSession.state === "Established"
                  ) {
                    outgoingSession.refer(secondCallSession);
                  }
                } else {
                  //outgoingSession = null;
                  outgoingSession.bye();
                  outgoingSession = null;
                }
              }
            }

            if (incomingSession) {
              if (
                incomingSession._state === "Initial" ||
                incomingSession._state === "Establishing"
              ) {
                // incomingSession.cancel()
                //incomingSession = null;
                incomingSession.reject();
                incomingSession = null;
              } else if (incomingSession._state === "Established") {
                //  incomingSession.bye();
                // incomingSession.refer(secondCallSession);
                if (
                  secondCallSession &&
                  secondCallSession.state === "Established"
                ) {
                  if (
                    incomingSession &&
                    incomingSession.state === "Established"
                  ) {
                    incomingSession.refer(secondCallSession);
                  }
                } else {
                  //incomingSession = null;
                  incomingSession.bye();
                  incomingSession = null;
                }
              }
            }

            if (secondCallSession) {
              if (
                secondCallSession._state === "Initial" ||
                secondCallSession._state === "Establishing"
              ) {
                // incomingSession.cancel()
                //incomingSession = null;
                secondCallSession.cancel();
                secondCallSession = null;
              } else if (secondCallSession._state === "Established") {
                //  incomingSession.bye();
                // incomingSession.refer(secondCallSession);
                if (
                  secondCallSession &&
                  secondCallSession.state === "Established"
                ) {
                  if (
                    incomingSession &&
                    incomingSession.state === "Established"
                  ) {
                    incomingSession.refer(secondCallSession);
                  } else {
                    // incomingSession.bye();
                    // incomingSession = null;
                    secondCallSession.bye();
                    secondCallSession = null;
                  }
                } else {
                  //incomingSession = null;
                  secondCallSession.bye();
                  secondCallSession = null;
                }
              }
            }
          } catch (error) {
            console.log("Incoming or Outgoing session not found - ", error);
          }
          break;
      }
    }

    // if (secondCallSession) {

    //   try {

    //     if (secondCallSession) {
    //       setCallTransferType("Blind"); //	Call transfer type

    //           hangupChangeout();
    //           //incomingSession = null;
    //           secondCallSession.bye();
    //           secondCallSession = null;
    //         }

    //   } catch (error) {
    //     console.log("Incoming or Outgoing session not found - ", error);
    //   }
    //   //break;
    // }
  };

  // SEARCH LEAD NUMBER
  const onSearchLead = async (number: string) => {
    if (user?.isPbx) {
      try {
        const params = { search: number };
        let res: any = await dispatch(leadDetailsSearch(params)).unwrap();
        if (res && res.statusCode === 200) {
          let newData = res?.data;
          newData.map((val: any) => {
            if (
              val.phone_number === number ||
              val.custom_phone_number === number
            ) {
              val.fullName = val.first_name + " " + (val?.last_name || "");
              Cookies.set("LeadDialName", val.fullName);
              Cookies.set("addLeadNoteId", val.lead_management_uuid);
              dispatch(onAddLeadNoteId(val?.lead_management_uuid));
            }
          });
        } else {
        }
      } catch (error: any) {
        console.log("Get lead list error ---->", error?.message);
      }
    } else {
      let alreadyInLead: boolean = false;
      try {
        const params = { search: number };
        let res: any = await dispatch(leadDetailsSearch(params)).unwrap();
        if (res && res.statusCode === 200) {
          let newData = res?.data;
          newData.map((val: any) => {
            if (
              val.phone_number === number ||
              val.custom_phone_number === number
            ) {
              alreadyInLead = true;
              val.fullName = val.first_name + " " + (val?.last_name || "");
              Cookies.set("LeadDialName", val.fullName);
              Cookies.set("addLeadNoteId", val.lead_management_uuid);
              dispatch(onAddLeadNoteId(val?.lead_management_uuid));
            }
          });
        } else {
        }
      } catch (error: any) {
        console.log("Get lead list error ---->", error?.message);
      }

      if (!alreadyInLead) {
        try {
          const payload: any = {
            campaign_uuid: selectedCampaign
              ? selectedCampaign
              : Cookies.get("selectedCampaign")
                ? Cookies.get("selectedCampaign")
                : "",
            dial_number: number,
            campaign_type:
              campaignType === "outbound"
                ? "0"
                : campaignType === "blended"
                  ? "2"
                  : "",
          };
          if (campaignType == "outbound" || campaignType == "blended") {
            payload["campaign_flag"] = campaignType;
          }
          const res: any = await dispatch(dialManual(payload)).unwrap();
          if (res && res.statusCode === 200) {
            let fullName =
              res?.data?.first_name + " " + (res?.data?.last_name || "");
            Cookies.set("LeadDialName", fullName);
            Cookies.set("addLeadNoteId", res?.data.lead_management_uuid);
            dispatch(onAddLeadNoteId(res?.data?.lead_management_uuid));
          }
        } catch (error: any) { }
      }
    }
  };

  // DIAL CALL
  const dialNumber = async () => {
    // if (number) {
    //   if (user?.isPbx) {
    //     allLeadListDetails &&
    //       allLeadListDetails?.data?.map((val: any) => {
    //         if (val.phone_number === number) {
    //           Cookies.set("LeadDialName", val.fullName);
    //           Cookies.set("addLeadNoteId", val.lead_management_uuid);
    //           dispatch(onAddLeadNoteId(val?.lead_management_uuid));
    //         }
    //       });

    //   } else {
    //     callStatusCardProperties(number, "dialNumberKps", number);
    //   }
    // }
    if (number) {
      if (!user?.isPbx && !!!selectedCampaign) {
        setErrorMessage("You are not able to call without any campagin");
        return false;
      }
      await onSearchLead(number);
      if (!user?.isPbx && (campaignMode === "1" || campaignMode === "3")) {
        Cookies.set("sendAutoParam", "true");
      } else if (!user?.isPbx) {
        Cookies.remove("sendAutoParam");
      }
      callStatusCardProperties(number, "dialNumberKps", number);
    }
  };

  const renderScreen = () => {
    console.log("callScreen", callScreen);
    switch (callScreen) {
      // const callScree: string  = "LIVE"
      // switch (callScree) {
      case "LIVE":
        return (
          <CallingPage
            hangupCall={hangupCall}
            isHold={isHold}
            isShowCallDuration={isShowCallDuration}
            seconds={seconds}
            minutes={minutes}
            isMuted={isMuted}
            muteMediaSession={muteMediaSession}
            unMuteMediaSession={unMuteMediaSession}
            confmuteMediaSession={confmuteMediaSession}
            confunMuteMediaSession={confunMuteMediaSession}
            onCallUnHold={onCallUnHold}
            onCallHold={onCallHold}
            controlVolume={controlVolume}
            page={page}
            setPage={setPage}
            agentTransferCall={agentTransferCall}
            ringGroupTransferCall={ringGroupTransferCall}
            queueTransferCall={queueTransferCall}
            ivrTransferCall={ivrTransferCall}
            externalTransferCall={externalTransferCall}
            dtmfTransferCall={dtmfTransferCall}
            sendDTMF={sendDTMF}
            callerNumber={callerNumber}
            callerName={callerName}
            callType={callType}
            showConferenceBtn={showConferenceBtn}
            setSuccessMessage={setSuccessMessage}
          />
        );

      case "INCOMING":
        return (
          <IncomingCallPage
            hangupCall={hangupCall}
            receiveCall={receiveCall}
            callerNumber={callerNumber}
            callerName={callerName}
          />
        );

      case "ADDNOTE":
        return (
          <AddNotePage
            // setScreen={setScreen}
            addNoteSeconds={addNoteSeconds}
            addNoteMinutes={addNoteMinutes}
            setAddNoteSeconds={setAddNoteSeconds}
            setAddNoteMinutes={setAddNoteMinutes}
            addNoteShowCallDuration={addNoteShowCallDuration}
            setAddNoteShowCallDuration={setAddNoteShowCallDuration}
            callerNumber={callerNumber}
            callerName={callerName}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
            setShowModal={setShowModal}
            callType={callType}
          />
        );

      case "CALLFAILED":
        return (
          <CallFailedPage
            callerNumber={callerNumber}
            callerName={callerName}
            setShowModal={setShowModal}
            callType={callType}
          // setScreen={setScreen}
          />
        );

      case "LEADDIAL":
        return <LeadDialPage setErrorMessage={setErrorMessage} />;

      default:
        const call_start = Cookies.get("is_call_start");
        if (
          user?.isPbx &&
          call_start == "0" &&
          !showIncomingModal &&
          !showModal
        ) {
          setShowIncomingModal(true);
        }
        return (
          <DailPage
            number={number}
            setNumber={setNumber}
            dialNumber={dialNumber}
            onClose={() => { }}
          />
        );
    }
  };

  if (showIncomingModal && !showModal) {
    return (
      <>
        <IncomingCallModal
          showIncomingModal={showIncomingModal}
          setShowIncomingModal={setShowIncomingModal}
          // setScreen={setScreen}
          setShowModal={setShowModal}
          hangupCall={hangupCall}
          receiveCall={receiveCall}
          callerNumber={callerNumber}
          callerName={callerName}
        />
      </>
    );
  }

  if (callScreen === "LIVE" && !showModal) {
    return (
      <>
        <ActiveCallModal
          showActiveModal={showActiveModal}
          setShowActiveModal={setShowActiveModal}
          hangupCall={hangupCall}
          seconds={seconds}
          minutes={minutes}
          setShowModal={setShowModal}
        />
      </>
    );
  }

  console.log("asfdasdsadasa", callScreen, campaignMode, selectedCampaign);

  return (
    <>
      <div
        className={`fixed 
        top-0 left-0 right-0 z-50 px-4 overflow-x-hidden overflow-y-auto h-full bg-heading bg-opacity-30 ${!showModal && "hidden"
          }`}
        onClick={() => {
          onCancleClick();
          dispatch(onShowCallModal("false"));
          if (callScreen === "INCOMING") {
            setShowIncomingModal(true);
          }
          if (callScreen === "LIVE") {
            setShowActiveModal(true);
          }
          if (callScreen !== "LIVE") {
            setNumber("");
            setIsHold(false);
            setIsMuted(false);
            dialType !== "leadDial" && dispatch(setCallScreen(""));
          }
        }}
      >
        <div className="w-full h-full relative flex justify-center items-center">
          <div
            className="
            fixed 
            bottom-[25px] 
            right-[20px] 
            w-full 
            min-w-[260px]
            max-w-[289px] 
            sm:max-w-[220px] 
            sm:max-h-[440px]
            md:max-w-[289px] 
            xl:max-w-[289px] 
            2xl:max-w-[289px]
            h-[480px] 
            bg-white
            border border-blue-700 
            rounded-3xl 
            drop-shadow-lg
          "
            onClick={(e: any) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="3xl:px-6 3xl:py-2.5 bg-black bg-dark-100 py-2 px-4 rounded-t-lg relative">
              <div className="flex items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full mr-1.5 ${callScreen === "LIVE" || callScreen === "INCOMING"
                    ? "bg-primary-green-success"
                    : "bg-error"
                    }`}
                />
                <span className="text-[11px] text-primary-green font-bold ml-1">
                  {callScreen === "LIVE" && isShowCallDuration
                    ? "Live Call"
                    : callScreen === "LIVE" && !isShowCallDuration
                      ? "Ringing"
                      : callScreen === "INCOMING"
                        ? "Incoming Call"
                        : callScreen === "CALLFAILED"
                          ? "Call Failed"
                          : "No Live Call"}
                </span>
              </div>


            </div>


            {/* Success or Error Message */}
            <div
              className={`${!user?.isPbx &&
                (campaignMode === "1" || campaignMode === "3") &&
                callScreen !== "ADDNOTE"
                ? "bottom-[-52px]"
                : "bottom-[-20px]"
                } mt-4 text-xs flex justify-center ${successMessage ? "text-primary-green" : "text-error"
                }`}
            >
              <p className="whitespace-wrap text-center">
                {errorMessage || successMessage}</p>
            </div>



            {/* Dial Type Buttons */}
            {callScreen !== "LIVE" &&
              callScreen !== "CALLFAILED" &&
              callScreen !== "INCOMING" &&
              (campaignMode === "1" || campaignMode === "3") && (
                <div className="flex justify-around  px-5 pr-8 mt-4">
                  <button
                    className={`h-[30px] w-[90px] text-[10px] rounded-full transition duration-200 font-semibold ${dialType === "leadDial"
                      ? "bg-[#322996] text-white border"
                      : "bg-white text-[#979797] border"
                      }`}
                    onClick={() => dispatch(onSetDialType("leadDial"))}
                  >
                    Lead Dial
                  </button>

                  <button
                    className={`h-[30px] w-[90px] text-[10px] rounded-full transition duration-200 font-semibold ${dialType === "manualDial"
                      ? "bg-[#322996] text-white border"
                      : "bg-white text-[#979797] border"
                      }`}
                    onClick={() => {
                      if (isCallResume) {
                        dispatch(onSetDialType("manualDial"));
                      }
                    }}
                  >
                    Manual Dial
                  </button>
                </div>
              )}

            {/* Screen Content */}
            <div
             className={`${callScreen === "LIVE"? "mt-0"
                  : "mt-4"
                }`}
            //  className="px-4 mt-4 "
             >{renderScreen()}</div>

            {/* Close Button Area (if needed in future) */}
            <div
              onClick={() => {
                onCancleClick();
                dispatch(onShowCallModal("false"));
                if (callScreen === "INCOMING") {
                  setShowIncomingModal(true);
                }
                if (callScreen === "LIVE") {
                  setShowActiveModal(true);
                }
                if (callScreen !== "LIVE") {
                  setNumber("");
                  setIsHold(false);
                  setIsMuted(false);
                  dialType !== "leadDial" && dispatch(setCallScreen(""));
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );

};

export default CallingModal;
function delay(arg0: number) {
  throw new Error("Function not implemented.");
}

