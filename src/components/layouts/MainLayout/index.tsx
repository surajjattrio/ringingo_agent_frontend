"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Legacy from "next/legacy/image";
import { Helmet } from "react-helmet";
// PROJECT IMPORTS
import {
  useDrawerOpen,
  onSetUserEntry,
  useCampaignMode,
  useCampaignType,
  onSelectCampaignDetails,
  useIsShowCallDuration,
  useCallScreen,
  useIsCallHangUp,
} from "@/redux/slice/commonSlice";
import CallingModal from "@/components/pbx-components/calling/CallingModal";
import Header from "./Header";
import SideBar from "./SideBar";
import { useAppDispatch } from "@/redux/hooks";
import { RemoveCookiesData, clearAllData } from "@/components/helperFunctions";
import {
  onStatusChange,
  useSelectedCampaign,
  setWebRtcStatus,
} from "@/redux/slice/commonSlice";
import { LOGOUT } from "@/contexts/actions";
import InBreakModal from "@/components/modals/InBreakModal";
import { goInBreak } from "@/redux/slice/breakSlice";
import { getTimerString } from "@/redux/services/breakService";
import { userAgentUnRegistration } from "../../pbx-components/calling/CallingModal";
import { agentEntryAdd } from "@/redux/slice/authSlice";
import { updateLiveAgentEntry, useCallResume } from "@/redux/slice/campaignSlice";
import { Danger, Warning } from "@/redux/services/toasterService";

import getDomain from "@/utils/GetDoamin";

import { Registerer, RegistererState, UserAgent } from "sip.js";
import { useAuth } from "@/contexts/hooks/useAuth";
const WSS_URL = process.env.WSS_URL;
const baseUrl = process.env.BASE_URL;

import Cookies from "js-cookie";
import { getTenantPersonalization } from "@/redux/slice/tenantSlice";
import { ConfirmationModal } from "@/components/modals";
import { io } from "socket.io-client";
import CallHistoryHeader from "@/components/pbx-components/phone/CallHistoryHeader";
import ActiveList from "@/components/call-center-components/phone/ActiveList";
import CrmInformation from "@/components/call-center-components/phone/CrmInformation";
import WhatsAppServiceStandalone from "@/components/popups/WhatsAppServiceStandalone";
import { getActiveUnreadChat } from "@/redux/slice/chatSlice";
import OmniChannelServiceStandalone from "@/components/popups/OmniChannelServiceStandalone";
import { getSocket } from "@/config/socket";
  import { startKeepAliveMic, stopKeepAliveMic } from "@/utils/micKeepAlive";



// ASSETS
const callIcon = "/assets/icons/white/call_white.svg";
let breakInterval: any;
let timeInterval: any;
// const FaviconIcon = "/assets/images/Byte-collapsed-logo.png";
const FaviconIcon = process.env.COLLAPSED_LOGO;

// const FaviconIcon = "/assets/images/aargon-favicon2.ico";

/* ============================== MAIN LAYOUT ============================== */

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isdrawerOpen = useDrawerOpen();
  const [showModal, setShowModal] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const reduxDispatch = useAppDispatch();
  const selectedCampaign = useSelectedCampaign();

  const domain = getDomain();

  const { user } = useAuth();
  const campaignMode = useCampaignMode();
  const campaignType = useCampaignType();
  const isCallResume = useCallResume();
  const isCallHangUp = useIsCallHangUp();

  // FOR BREAK MODAL
  const [breakValue, setBreakValue] = useState<any>();
  const [breakTiming, setBreakTiming] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Call History");
  const [activeId, setActiveId] = useState<string>("1");
  const [personalizeData, setPersonalizeData] = useState<any>({});
  const [breakStatus, setBreakStatus] = useState<boolean>(false);

  const [isOpenConfirmBreak, setIsOpenConfirmBreak] = useState<boolean>(false);
  const hasRestoredBreakRef = useRef(false);

  const [showCampaignUpdatedModal, setShowCampaignUpdatedModal] = useState<boolean>(false);
  const isShowCallDuration = useIsShowCallDuration();
  const callScreen = useCallScreen();
  const isCallActive = isShowCallDuration || callScreen === "LIVE";

  const selectedCampaignRef = useRef<string | null>(null);
  useEffect(() => {
    selectedCampaignRef.current = selectedCampaign;
    if (selectedCampaign) {
      const isUpdated = localStorage.getItem("campaign_updated_" + selectedCampaign);
      if (isUpdated === "true") {
        setShowCampaignUpdatedModal(true);
      } else {
        setShowCampaignUpdatedModal(false);
      }
    } else {
      setShowCampaignUpdatedModal(false);
    }
  }, [selectedCampaign]);



  const socketRef = useRef<any>(null);
  socketRef.current = getSocket(user);
  // console.log("socket cnnecteddddd",socketRef.current);
  
  // useEffect(() => {
  // socketRef.current = io(process.env.BASE_URL!, {
  //   query: { agent_uuid: user?.agent_detail?.uuid },
  //   transports: ["websocket"],
  //   autoConnect: true, // important
  // });
  //   return () => {
  //     socketRef.current?.disconnect();
  //   };
  // }, []);

  const getTenantPersonalizeData = async () => {
    setLoading(true);
    try {
      const res: any = await dispatch(
        getTenantPersonalization(domain)
      ).unwrap();
      if (res?.statusCode === 200) {
        setPersonalizeData(res?.data);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Get Tenant Personlize Data Err =-=>", err);
    }
  };

  useEffect(() => {
    getTenantPersonalizeData();
  }, []);

// Mic 
useEffect(() => {
  // after user is available
  if (user) startKeepAliveMic().catch(console.error);

  return () => {
    stopKeepAliveMic();
  };
}, [user]);


  // const agentUpdateTime = (browserToken: string, agent_uuid: string) => {
  //   console.log(socketRef.current, "socket");
  //   socketRef.current?.emit("agent_update_time", {
  //     browserToken,
  //     agent_uuid,
  //   });
  // };

  useEffect(() => {
    const s = socketRef.current;
    // console.log("akjsdbhadssdahads ssssss", s);
    if (!s) return;

    const handleEvent = (event: any) => {
      console.log("akjsdbhadssdahads", event);

      if (event.type === "BREAK") {
        const eve = { value: event?.payload?.uuid, option: event?.payload };
        setBreakStatus(true)
        onBreakSelection(eve, true);
      } else if (event.type === "OFF_BREAK") {
        onBackToWork();
        setBreakStatus(false)
      } else if (event.type === "CAMPAIGN_UPDATED") {
        console.log("Campaign update received over socket:", event.payload);
        if (event.payload?.campaign_uuid && event.payload.campaign_uuid === selectedCampaignRef.current) {
          setShowCampaignUpdatedModal(true);
          localStorage.setItem("campaign_updated_" + selectedCampaignRef.current, "true");
        }
      }
    };

    s.on("agent-event", handleEvent);

    return () => {
      s.off("agent-event", handleEvent); // remove listener correctly
    };
  }, [breakStatus]);


  const onAccept = () => {
    console.log("Accept clicked")
  }
  const onDecline = () => {
    console.log("Decline clicked")
  }

  // useEffect(() => {
  //   dispatch(getActiveUnreadChat({ campaign_uuid: selectedCampaign })).unwrap();
  // }, [onAccept, onDecline]);

  // useEffect(() => {
  //   let browserToken = user?.agent_detail?.browserToken;
  //   let agent_uuid = user?.agent_detail?.uuid;
  //   if (
  //     user &&
  //     selectedCampaign &&
  //     (campaignMode === "1" || campaignMode === "3") &&
  //     (campaignType === "outbound" || campaignType === "blended")
  //   ) {
  //     if (timeInterval) {
  //       clearInterval(timeInterval);
  //       timeInterval = undefined;
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     timeInterval = setInterval(
  //       () => agentUpdateTime(browserToken, agent_uuid),
  //       1000 * 60 * 2
  //     );
  //   } else {
  //     clearInterval(timeInterval);
  //     timeInterval = undefined;
  //   }
  //   return () => {
  //     clearInterval(timeInterval);
  //     timeInterval = undefined;
  //   };
  // }, [selectedCampaign, campaignMode, campaignType, user]);

  const onStartBreak = (breakOption: any, customEndDate?: Date) => {
    if (breakOption.duration) {
      let endDate: Date;
      if (customEndDate) {
        endDate = customEndDate;
      } else {
        endDate = new Date();
        // const hoursMinutes: any[] = "00:01".split(":");
        const hoursMinutes = breakOption.duration.split(":");
        hoursMinutes[0] = parseInt(hoursMinutes[0]);
        hoursMinutes[1] = parseInt(hoursMinutes[1]);
        const calculatedMinutes = hoursMinutes[0] * 60 + hoursMinutes[1];
        endDate.setTime(endDate.getTime() + calculatedMinutes * 60 * 1000);

        Cookies.set("break_data", JSON.stringify({
          option: breakOption,
          endDate: endDate.getTime()
        }));
      }
      clearInterval(breakInterval);
      breakInterval = setInterval(() => {
        const now = new Date();
        setBreakTiming(getTimerString(now, endDate));
      }, 1000);
    }
  };

  const onUpdateLiveAgentEntry = async (status: string) => {
    try {
      let activeCampaign = selectedCampaign || user?.agent_detail?.campaign_uuid || false;
      let payload = {
        status: status,
        campaign_uuid: activeCampaign,
        type: "hangup",
      };
      await dispatch(updateLiveAgentEntry(payload)).unwrap();
    } catch (error: any) {
      console.log("Agent Entry err --->", error?.message);
    }
  };

  const onBackToWork = async () => {
    console.log("Back from Work");
    // await dispatch(
    //   goInBreak({ breakcode_uuid: breakValue, login_status: "0" })
    // ).unwrap();
    setBreakTiming("");
    setBreakValue(undefined);
    setIsOpenConfirmBreak(false);
    Cookies.remove("break_data");

    // Register

    let payload = {
      login_status: "0",
      breakcode_uuid: breakValue?.uuid,
    };
    let response: any = await dispatch(agentEntryAdd(payload)).unwrap();

    !user?.isPbx && onUpdateLiveAgentEntry("0");
    dispatch(onStatusChange("0"));
    dispatch(onSetUserEntry("login-entry"));

    /*
    let userAgent: any;
    let callScreen = "false";
    let username = user?.agent_detail?.extension_details[0]?.username;
    let password = user?.agent_detail?.extension_details[0]?.password;
    let domain = user?.agent_detail?.tenant[0]?.domain;
    var UAURI = UserAgent.makeURI("sip:" + username + "@" + domain);
    console.log("UAURI=====>", UAURI);
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
      register: true,
      noAnswerTimeout: 60,
      userAgentString: "ASTPP | WEBRTC ",
      dtmfType: "info",
      displayName: username,
      activeAfterTransfer: false, //  Die when the transfer is completed
      logBuiltinEnabled: false, //    Boolean - true or false - If true throws console logs
    };
    console.log(userOptions);
    userAgent = new UserAgent(userOptions);
    dispatch(setWebRtcStatus('CONNECTING'));
    userAgent
      .start()
      .then(() => {
        console.log("Connected ....");
        console.log(userAgent);
        //  Create register object
        const registerer = new Registerer(userAgent);
        registerer.stateChange.addListener(
          (registrationState: RegistererState) => {
            switch (registrationState) {
              case RegistererState.Registered:
                console.log("Registered ....");
                dispatch(setWebRtcStatus('CONNECTED'));
                dispatch(onStatusChange("0"));
                Cookies.set("username", username);
                Cookies.set("password", password);
                Cookies.set("domain", domain);
                Cookies.set("authenticated", "true");
                // window.setTimeout(function () {
                //     window.location.href = "/";
                // }, 2000);
                break;
              case RegistererState.Unregistered:
                console.log("Unregistered ....");
                dispatch(setWebRtcStatus('DISCONNECTED'));
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
        if (callScreen !== "true") {
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
    */

    clearInterval(breakInterval);
    // reconnect socket
    socketRef.current?.connect();
    console.log("Socket reconnected after break");
  };

  const onBreakSelection = async (e: any, isFromSocket: boolean = false) => {
    console.log("On Break");

    if ((isCallActive || (selectedCampaign && (!isCallResume || isCallHangUp))) && !isFromSocket) {
      Warning("Pause the campaign or finish your call before going on break.");
      return;
    }

    userAgentUnRegistration();
    setBreakValue(e.option);
    onStartBreak(e.option);
    let payload = {
      login_status: "1",
      breakcode_uuid: e.value,
    };
    let response: any = await dispatch(agentEntryAdd(payload)).unwrap();
    dispatch(onStatusChange("1"));
    !user?.isPbx && onUpdateLiveAgentEntry("3");
    dispatch(onSetUserEntry("busy-entry"));
    // Disconnect socket
    // socketRef.current?.disconnect();
    // console.log("Socket disconnected for break");
    // await dispatch(
    //   goInBreak({ breakcode_uuid: e.value, login_status: "1" })
    // ).unwrap();
  };

  useEffect(() => {
    const savedBreak = Cookies.get("break_data");
    console.log("DEBUG: MainLayout break useEffect triggered. savedBreak =", savedBreak, "user =", user);
    if (savedBreak && user?.agent_detail?.campaign_uuid && !hasRestoredBreakRef.current) {
      hasRestoredBreakRef.current = true;
      try {
        const breakData = JSON.parse(savedBreak);
        const endDate = new Date(breakData.endDate);
        const now = new Date();

        if (endDate > now) {
          userAgentUnRegistration();
          setBreakValue(breakData.option);
          onStartBreak(breakData.option, endDate);
          dispatch(onStatusChange("1"));
          !user?.isPbx && onUpdateLiveAgentEntry("3");
          dispatch(onSetUserEntry("busy-entry"));
        } else {
          Cookies.remove("break_data");
        }
      } catch (e) {
        console.error("Error restoring break:", e);
      }
    }
  }, [user]);

  // useEffect(() => {
  //   const handleBeforeUnload = (event: any) => {
  //     // const customMessage = 'You are attempting to leave the agent screen without logging out. This may result in lost information. Are you sure you want to exit this page?';
  //     event.preventDefault();
  //     event.returnValue = true;
  //   };

  //   const handleUnload = () => {
  //     // Clear data on page close
  //     reduxDispatch(onSelectCampaign(""));
  //     reduxDispatch(onSelectCampaignDetails(undefined));
  //     RemoveCookiesData();
  //     clearAllData(reduxDispatch);
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   window.addEventListener("unload", handleUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //     window.removeEventListener("unload", handleUnload);
  //     if (breakInterval) {
  //       clearInterval(breakInterval);
  //     }
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <>
      <div className="h-[100vh] flex flex-col overflow-hidden">
        {personalizeData?.title && personalizeData?.faviconfile ? (
          <Helmet>
            <title>{personalizeData.title}</title>
            <link
              rel="icon"
              type="image/svg"
              href={
                baseUrl + `/tenant/download/${personalizeData?.faviconfile}`
              }
            />
          </Helmet>
        ) : (
          <Helmet>
            <title>{process.env.TITLE}</title>
            <link rel="icon" href={FaviconIcon} />
          </Helmet>
        )}
        <audio id="mediaElement" controls style={{ display: "none" }}></audio>
        <Header breakValue={breakValue} onBreakSelection={onBreakSelection} />
        <SideBar />
          <main
          className={`flex-1 transition-all mt-[12px] mb-[12px] rounded-[10px] mr-[10px] pl-[10px] pt-[70px] pb-[10px] tsm:pt-[110px] pr-[10px] tsm:pr-3 bg-[#F4F7FE] ${isdrawerOpen
            ? "pl-[0px] ml-[255px] tmd:pl-[0px]"
            : "ml-[85px] pl-[0px]"
            } tsm:pl-3 relative overflow-hidden`}>
        {/* <main
          className={`flex-1 transition-all mt-[12px] mb-[12px]  rounded-[10px] mr-[10px] bg-[#F4F7FE] pl-[10px] pt-[70px] pb-[10px] tsm:pt-[110px] pr-[10px] tsm:pr-3 ${isdrawerOpen
            ? "pl-[0px] ml-[255px] tmd:pl-[0px]"
            : "ml-[85px] pl-[0px]"
            } tsm:pl-3 relative overflow-hidden`}
        > */}
          <div className="h-full flex flex-col">
            {showCampaignUpdatedModal && (
              <div className="mb-4 animate-fade-in pr-2">
                <div className="bg-gradient-to-r from-[#f59e0b] to-[#e11d48] text-white px-6 py-3 rounded-[10px] shadow-lg flex items-center justify-between border border-[#f59e0b]/20">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    <span className="text-sm font-semibold tracking-wide font-sans">
                      {isCallActive 
                        ? "Campaign settings updated by administrator. Please finish your call. After that, please logout and login."
                        : "Campaign settings updated by administrator. Please logout and login."
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 rounded-[10px] overflow-auto scrollbar-hide">
              {children}
            </div>
          </div>
        </main>

        {/* footer */}
        <div
          className={`py-3 flex justify-center items-center fixed bottom-0 left-0 right-0  z-10 ${isdrawerOpen ? "pl-[240px]" : "pl-[70px]"
            }`}
        >
          <div
            className="flex items-center justify-center bg-primary-green rounded-full 3xl:h-[54px] 3xl:w-[54px] h-[44px] w-[44px] fixed right-7 bottom-8 z-50 drop-shadow-lg cursor-pointer hover:bg-opacity-80"
            onClick={() => setShowModal(true)}
          >
            <div className="relative w-[24px] h-[24px] 3xl:w-[28px] 3xl:h-[28px]">
              <Legacy src={callIcon} alt="call" layout="fill" />
            </div>
          </div>
          {/* footer data */}
          {/* {personalizeData?.footer ? (
            <p className="3xl:text-sm text-xs font-normal text-txt-primary">
              ©{new Date().getFullYear()}.{personalizeData.footer}
            </p>
          ) : (
            <p className="3xl:text-sm text-xs font-normal text-txt-primary">
              ©{new Date().getFullYear()}.{process.env.FOOTER}
            </p>
          )} */}
        </div>
        <CallingModal
          showModal={showModal}
          setShowModal={setShowModal}
          onCancleClick={() => {
            setShowModal(false);
          }}
        />
        <InBreakModal
          visible={!!breakValue}
          title={`You are in break : ${breakValue?.name}`}
          content={breakTiming}
          exitText="Back To Work"
          onExitClick={() => {
            setIsOpenConfirmBreak(true);
          }}
        />
        <ConfirmationModal
          visible={isOpenConfirmBreak}
          title={"Back To Work"}
          content="Are you sure you want to back to work?"
          doneText="Yes"
          cancelText="No"
          onCancleClick={() => setIsOpenConfirmBreak(false)}
          onDoneClick={onBackToWork}
        />

        {/* WhatsApp Service Popup - Controlled by Redux */}
        {/* <WhatsAppServiceStandalone onAccept={onAccept} onDecline={onDecline} /> */}
        {/* Omnichannel Service Popup - Controlled by Redux */}
        <OmniChannelServiceStandalone onAccept={onAccept} onDecline={onDecline} />
      </div>
    </>
  );
};

export default MainLayout;