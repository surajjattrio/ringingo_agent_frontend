

"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

// PROJECT IMPORTS
import {
  dueFollowUp,
  onAddLeadNoteId,
  onLeadDispositionTimerEnded,
  onSelectCampaign,
  onSelectCampaignDetails,
  onSelectCampaignMode,
  onSetAddNoteId,
  onSetCampaignType,
  onSetDialType,
  onSetUserEntry,
  onShowCallModal,
  onShowLeadInfo,
  openDrawer,
  setCallScreen,
  setIsCallHangUp,
  setIsInboundCampaign,
  setNumberMasking,
  setPredictiveData,
  upComingFollowUp,
  useCampaignMode,
  useCampaignType,
  useDrawerOpen,
  useIsCallHangUp,
  useSelectedCampaign,
  useSelectedCampaignDetails,
  useStatus,
  useIsShowCallDuration,
  useCallScreen,
} from "@/redux/slice/commonSlice";
import { useAppDispatch } from "@/redux/hooks";
import { CallPbxSwitch } from "@/components/forms";
import { CallCenterMenuList, PbxMenuList } from "../SideBar/menuItems";
import { LogoutPopup } from "@/components/popups";
import { useAuth } from "@/contexts/hooks/useAuth";
import { userAgentUnRegistration } from "@/components/pbx-components/calling/CallingModal";
import { CampaignModal } from "@/components/modals";
import Cookies from "js-cookie";
import { setLoginAgentCampaign } from "@/utils/Storage";
import Options from "@/components/call-center-components/header/Options";
import { getAllLeadList } from "@/redux/slice/leadListSlice";
import { agentEntryAdd } from "@/redux/slice/authSlice";
import {
  callQueueInbound,
  getCampaignOption,
  pauseCampaign,
  setCallResume,
  updateAgentCampaign,
  updateLiveAgentEntry,
  useCallResume,
  useCampaignOptions,
} from "@/redux/slice/campaignSlice";
import { toast } from "react-toastify";
import { getFollowUpMessage } from "@/redux/slice/followUpSlice";
import { clearLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { Danger, Warning } from "@/redux/services/toasterService";
import BreakSelection from "@/components/pbx-components/break-selection/BreakSelection";
import { changeModle } from "@/redux/slice/chatSlice";
import { getWrapUpTimerString } from "@/redux/services/breakService";
import Icon from "@/components/ui-components/Icon";
import { io } from "socket.io-client";
import { getSocket } from "@/config/socket";
import NetworkStatus from "@/components/ui-components/NetworkStatus";
import WebRtcStatus from "@/components/ui-components/WebRtcStatus";
import CampaignStatus from "@/components/ui-components/CampaignStatus";
import AgentStatus from "@/components/ui-components/AgentStatus";


// ASSETS
const menuArrow = "/assets/icons/menu-arrow.svg";
const arrowDownIcon = "/assets/icons/arrow-down.svg";
const taskIcon = "/assets/icons/task-square.svg";
const smallLogo = "/assets/images/MenuLogoCollapsedImage.png";

let wrapUpTimeInterval: any;

interface HeaderProps {
  breakValue: any;
  onBreakSelection: any;
}
/* ============================== HEADER ============================== */

const Header = ({ breakValue, onBreakSelection }: HeaderProps) => {
  const dispatch = useAppDispatch();
  const isdrawerOpen = useDrawerOpen();
  const router = useRouter();
  const isCallResume = useCallResume();
  // let selectedCampaign = useSelectedCampaign();
  const selectedCampaignDetails = useSelectedCampaignDetails();
  const campaignMode = useCampaignMode();
  const isCallHangUp = useIsCallHangUp();
  const campaignType = useCampaignType();
  const campaignOptions = useCampaignOptions();
  const isShowCallDuration = useIsShowCallDuration();
  const callScreen = useCallScreen();
  const isCallActive = isShowCallDuration || callScreen === "LIVE";

  const { logout, user, switchRole } = useAuth();

  // const { logout, user, switchRole } = useAuth();

  useEffect(() => {
    if (user) {
      //  Force Call Center mode
      user.isPbx = false;

      // ✅ Set Redux mode
      dispatch(changeModle("call"));

      // ✅ Set local states for UI
      setIsPbx(false);
      setData(CallCenterMenuList);

      // ✅ Allow component to render
      setReady(true);
    }
  }, [user]);

  const socketRef = useRef<any>(null);
  socketRef.current = getSocket(user);

  // useEffect(() => {
  //   socketRef.current = io(process.env.BASE_URL!, {
  //     query: { agent_uuid: user?.agent_detail?.uuid },
  //     transports: ["websocket"],
  //     autoConnect: true, // important
  //   });

  //   return () => {
  //     socketRef.current?.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    const s = socketRef.current;
    // console.log("akjsdbhadssdahads ssssss", s);
    if (!s) return;

    s.on("logout-admin", onLogoutClick);

    return () => {
      s.off("logout-admin", onLogoutClick); // remove listener correctly
    };
  }, []);

  const status = useStatus();
  const [selectedCampaign, setSelectedCampaign] = useState<any>();
  // Force PBX mode to false
  if (user && user.isPbx) {
    user.isPbx = false;
  }

  const [isPbx, setIsPbx] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false)
  const [data, setData] = useState<any>(CallCenterMenuList);
  const [campaignModalOpen, setCamoaignModalOpen] = useState<boolean>(
    Cookies.get("campaign_modal") === "0" ? true : false
  );
  const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);
  const [wrapUpTime, setWrapUpTime] = useState<string>("");

  // GET CAMPAIGN OPTIONS
  const onGetCampaign = async () => {
    try {
      await dispatch(getCampaignOption({ list: "all" })).unwrap();
    } catch (error: any) {
      console.log("Get campaign list Err ---->", error?.message);
    }
  };

  useEffect(() => {
    onGetCampaign();
  }, [user]);

  useEffect(() => {
    console.log("campaignOptions", campaignOptions);
    if (campaignOptions && user?.agent_detail?.campaign_uuid) {
      let foundCampaign = null;
      for (const group of campaignOptions) {
        if (group.options) {
          foundCampaign = group.options.find(
            (opt: any) => opt.value === user.agent_detail.campaign_uuid
          );
          if (foundCampaign) break;
        }
      }
      if (foundCampaign) {
        setSelectedCampaign(foundCampaign);
      }
    }
  }, [campaignOptions, user]);

  useEffect(() => {
    liveChatOption(0);
  }, [selectedCampaign]);



  // DELETE ENTRY IN LIVE REPORT
  // const onDeleteLiveAgentEntry = async () => {
  //   try {
  //     await dispatch(deleteLiveAgentEntry(user?.agent_detail?.uuid)).unwrap();
  //     onAddLiveAgentEntry();
  //   } catch (error: any) {
  //     console.log("Agent Entry err --->", error?.message);
  //   }
  // };

  // const onAddLiveAgentEntry = async () => { temp
  //   try {
  //     let payload = {
  //       status: "4",
  //       agent_name: user?.agent_detail?.username,
  //       extension_uuid: user?.agent_detail?.extension_details?.[0].uuid,
  //       extension_name: user?.agent_detail?.extension_details?.[0].username,
  //       campaign_uuid: false,
  //       phone_number: "",
  //       campaign_type: "",
  //       campaign_name: "",
  //       type: "hangup",
  //     };
  //     await dispatch(updateLiveAgentEntry(payload)).unwrap();
  //   } catch (error: any) {
  //     console.log("Agent Entry err --->", error?.message);
  //   }
  // };

  // ADD ENTRY IN LIVE REPORT
  // const onAddLiveAgentEntry = async () => {
  //   try {
  //     let payload = {
  //       agent_status: "0",
  //       agent_name: user?.agent_detail?.username,
  //       extension_uuid: user?.agent_detail?.extension_details?.[0].uuid,
  //       extension_name: user?.agent_detail?.extension_details?.[0].username,
  //     };
  //     await dispatch(addLiveAgentEntry(payload)).unwrap();
  //   } catch (error: any) {
  //     console.log("Agent Entry err --->", error?.message);
  //   }
  // };

  // useEffect(() => {
  //   setIsPbx(user?.isPbx);
  // }, [user?.isPbx]);

  // SET CALL QUEUE
  const onCallQueueInbound = async () => {
    try {
      let payload: any = {
        extension: user?.agent_detail?.extension_details[0].username,
        campaign_uuid: selectedCampaign?.value,
        feature: "logout",
        campaign_type:
          campaignType === "inbound"
            ? ""
            : campaignType === "outbound"
              ? "0"
              : "2",
      };
      if (
        campaignType === "inbound" ||
        campaignType === "outbound" ||
        campaignType=="blended"||
        campaignMode === "1" ||
        campaignMode === "3"
      ) {
        payload["pause"] = "true";
      }
      console.log(payload,"payloadpayloadpayload");
      await dispatch(callQueueInbound(payload)).unwrap();
    } catch (error: any) {
      console.log("call queue err -->", error?.message);
    }
  };

  // ON ROLE CHANGE PBX / CALL CENTER
  const onRoleChange = async () => {
    dispatch(setCallScreen(""));
    if (
      user?.permission?.call_center_mode === "0" &&
      user?.permission?.pbx_mode === "0"
    ) {
      if (user?.isPbx) Cookies.set("campaign_modal", "0", { expires: 1 });
      if (!user?.isPbx) ondeleteLiveAgentEntry();
      if (!user?.isPbx && !!selectedCampaign) onCallQueueInbound();
      switchRole();
      dispatch(changeModle("call"));
      Cookies.set("lead_information", "0");
      dispatch(clearLeadDetails());
      dispatch(onSetCampaignType(null));
      dispatch(onSelectCampaign(null));
      dispatch(onSelectCampaignDetails(null));
      dispatch(onAddLeadNoteId(null));
      dispatch(onSetAddNoteId(null));
      // dispatch(onSelectCampaignMode(null));
      dispatch(onShowLeadInfo(true));
      dispatch(setIsCallHangUp(false));
      if (!isCallResume) {
        let payload: any = {
          campaign_uuid: selectedCampaign,
          campaign_mode: campaignMode,
        };
        dispatch(setCallResume(true));
        await dispatch(pauseCampaign(payload)).unwrap();
      }
    }
  };

  const [showLogoutPopup, setShowLogoutPopup] = useState<boolean>(false);

  const pathname = usePathname();
  const pathnames = pathname?.split("/");

  // GET TITLE FOR SHOW ON HEADER
  const getTitle = () => {
    if (pathnames[2] === "profile") {
      return "My Profile";
    }
    const user: any = data.find(
      (val: any) => val?.url === `/${pathnames[1] + `/${pathnames[2]}`}`
    );
    return user?.title;
  };

  // LOG OUT USER
  const onLogoutClick = async (eventOrFromSocket?: any) => {
    const isFromAdmin = eventOrFromSocket !== undefined;

    if (!isFromAdmin && (isCallActive || isCallHangUp)) {
      Warning("You cannot logout during an ongoing call or wrap-up.");
      return;
    }
    if (!isLogoutLoading) {
      setIsLogoutLoading(true);
      try {
        let payload = {
          campaign_uuid: selectedCampaign?.value,
          login_status: "2",
        };
        let response: any = await dispatch(agentEntryAdd(payload)).unwrap();
        if (response && response.statusCode === 201) {
          dispatch(onSetUserEntry("logout-entry"));
        }
        //  try {
        //       let payload: any = {
        //         campaigns_details: [{
        //           login_status :"2",
        //           campaign_uuid : selectedCampaign
        //         }],
        //         feature: "logout-entry",
        //       };
        //       let res: any = await dispatch(updateAgentCampaign(payload)).unwrap();
        //       if (res && res.statusCode === 200) {
               
        //       }
        //     } catch (error: any) {
        //       console.log("error while updating campaign", error.message);
        
        //     }
        ondeleteLiveAgentEntry();
        if (!user?.isPbx && !!selectedCampaign) onCallQueueInbound();
        if (!isCallResume) {
          let payload: any = {
            campaign_uuid: selectedCampaign?.value,
            campaign_mode: campaignMode,
          };
          dispatch(setCallResume(true));
          await dispatch(pauseCampaign(payload)).unwrap();
        }
        logout(user?.agent_detail?.uuid);
        setShowLogoutPopup(false);
        userAgentUnRegistration();
        setIsLogoutLoading(false);
      } catch (error: any) {
        console.log("Log out err --->", error?.message);
        setIsLogoutLoading(false);
      }
    }
  };

  // // DELETE ENTRY IN LIVE REPORT
  // const ondeleteLiveAgentEntry = async () => {
  //   try {
  //     await dispatch(deleteLiveAgentEntry(user?.agent_detail?.uuid)).unwrap();
  //   } catch (error: any) {
  //     console.log("Agent Entry err --->", error?.message);
  //   }
  // };

  const ondeleteLiveAgentEntry = async () => {
    try {
      let payload = {
        status: "6",
        campaign_uuid: false,
        type: "hangup",
      };
      await dispatch(updateLiveAgentEntry(payload)).unwrap();
    } catch (error: any) {
      console.log("Agent Entry err --->", error?.message);
    }
  };

  useEffect(() => {
    if (user?.isPbx) {
      onGetLeadList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pathname?.startsWith("/pbx")) {
      router.replace("/call-center/phone");
    }
  }, [pathname]);

  // GET LEAD LIST
  const onGetLeadList = async () => {
    try {
      await dispatch(getAllLeadList({ list: "all" })).unwrap();
    } catch (error: any) {
      console.log("Get lead list error ---->", error?.message);
    }
  };

  useEffect(() => {
    let interval = setInterval(() => {
      onGetFollowUpMsg();
    }, 1 * 60 * 1000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onGetFollowUpMsg = async () => {
    let dueFollowUps: any = [];
    let upComingFollowUps: any = [];
    try {
      let payload = {
        date: true,
      };
      const res: any = await dispatch(getFollowUpMessage(payload)).unwrap();
      if (res && res.statusCode === 200) {
        res.data &&
          res?.data?.map((val: any) => {
            if (val?.notification_status === "Danger") {
              reminderDue({
                ...val,
                fullName:
                  (val?.lead_details?.[0]?.first_name || "") +
                  " " +
                  (val?.lead_details?.[0]?.last_name || ""),
              });
              dueFollowUps.push(val?.follow_up_uuid);
            } else if (val?.notification_status === "Success") {
              reminderUpcoming({
                ...val,
                fullName:
                  (val?.lead_details?.[0]?.first_name || "") +
                  " " +
                  (val?.lead_details?.[0]?.last_name || ""),
              });
              upComingFollowUps.push(val?.follow_up_uuid);
            }
          });
        dispatch(dueFollowUp(dueFollowUps));
        dispatch(upComingFollowUp(upComingFollowUps));
      }
    } catch (error: any) {
      console.log("get follow up error --->", error?.message);
    }
  };

  const reminderDue = (val?: any) => {
    toast(
      <>
        <div className="flex justify-between px-2 items-center">
          <span className="text-xs font-semibold text-heading">
            {val?.fullName}
          </span>
          <span className="text-xs font-semibold text-heading flex justify-end">
            {val?.date_time}
          </span>
        </div>
        <span className="text-xs font-semibold text-heading px-2">
          {val?.type}
        </span>
        <p className="text-[11px] font-normal text-txt-primary break-words px-2 pt-1">
          {val?.comment}
        </p>
      </>,
      {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: false,
        progress: "#E7515A",
        progressStyle: {
          background: "#E7515A",
        },
        autoClose: false,
        closeOnClick: true,
        pauseOnHover: true,
        closeButton: true,
        icon: false,
        theme: "light",
        draggable: false,
      }
    );
  };

  const reminderUpcoming = (val?: any) => {
    toast(
      <>
        <div className="flex justify-between px-2 items-center">
          <span className="text-xs font-semibold text-heading">
            {val?.fullName}
          </span>
          <span className="text-xs font-semibold text-heading flex justify-end">
            {val?.date_time}
          </span>
        </div>
        <span className="text-xs font-semibold text-heading px-2">
          {val?.type}
        </span>
        <p className="text-[11px] font-normal text-txt-primary break-words px-2 pt-1">
          {val?.comment}
        </p>
      </>,
      {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: false,
        progress: "#66A286",
        progressStyle: {
          background: "#66A286",
        },
        autoClose: false,
        closeOnClick: true,
        pauseOnHover: true,
        closeButton: true,
        icon: false,
        theme: "light",
        draggable: false,
      }
    );
  };

  useEffect(() => {
    if (
      isCallHangUp &&
      selectedCampaignDetails?.wrap_up_time &&
      selectedCampaignDetails?.wrap_up_disposition
    ) {
      const endDate = new Date();
      endDate.setTime(
        endDate.getTime() +
        parseInt(selectedCampaignDetails?.wrap_up_time) * 1000
      );
      clearInterval(wrapUpTimeInterval);
      wrapUpTimeInterval = setInterval(() => {
        const now = new Date();
        const timer = getWrapUpTimerString(now, endDate);
        if (timer === "00:00") {
          clearInterval(wrapUpTimeInterval);
          wrapUpTimeInterval = undefined;
          setWrapUpTime("");
          dispatch(onLeadDispositionTimerEnded(true));
        } else {
          setWrapUpTime(timer);
        }
      }, 1000);
    } else {
      clearInterval(wrapUpTimeInterval);
      wrapUpTimeInterval = undefined;
    }
    return () => {
      if (wrapUpTimeInterval) {
        clearInterval(wrapUpTimeInterval);
        wrapUpTimeInterval = undefined;
        setWrapUpTime("");
      }
    };
  }, [isCallHangUp, selectedCampaignDetails]);

  // new campgin

  // ADD ENTRY IN LIVE REPORT
  const onAddLiveAgentEntry = async (data: any, browser_token: string) => {
    try {
      let payload = {
        status:
          data?.campaign === "inbound" ||
            data?.dial_method === "1" ||
            data?.dial_method === "3"
            ? "4"
            : "0",
        campaign_uuid: data?.value,
        campaign_name: data?.label,
        campaign_type: data?.campaign_type ? data?.campaign_type : "1",
        type: "hangup",
        browserToken: browser_token,
        //new 
        agent_status: "0",
        agent_name: user?.agent_detail?.username,
        extension_uuid: user?.agent_detail?.extension_details?.[0].uuid,
        extension_name: user?.agent_detail?.extension_details?.[0].username,
      };
      await dispatch(updateLiveAgentEntry(payload)).unwrap();
    } catch (error: any) {
      console.log("Agent Entry err --->", error?.message);
    }
  };

  const onDeleteLiveAgentEntry = async (data: any) => {
    try {
      let payload = {
        extension: user?.agent_detail?.extension_details[0].username,
        status: "0",
        campaign_uuid: false,
        type: "hangup",
      };
      await dispatch(updateLiveAgentEntry(payload)).unwrap();
      if (data) {
        const browser_token = user?.agent_detail?.browserToken;
        onAddLiveAgentEntry(data, browser_token);
      }
    } catch (error: any) {
      console.log("Delete Agent Entry err --->", error?.message);
    }
  };
  // SET CALL RESUME
  const onSetCallResumeMode = async () => {
    try {
      let payload: any = {
        campaign_uuid: selectedCampaign?.value,
        campaign_mode: campaignMode,
      };
      dispatch(setCallResume(true));
      await dispatch(pauseCampaign(payload)).unwrap();
    } catch (error: any) {
      console.log("set call resume err --->", error?.message);
    }
  };

  // SET CALL QUEUE
  const onCallQueueOutbound = async (e: any) => {
    try {
      let payload: any = {
        extension: user?.agent_detail?.extension_details[0].username,
        campaign_uuid: e?.value,
        feature: "resume",
        pause: "true",
        campaign_type: e?.campaign_type,
      };
      await dispatch(callQueueInbound(payload)).unwrap();
    } catch (error: any) {
      console.log("call queue err -->", error?.message);
    }
  };

  const liveChatOption = (flag: any) => {
    const e: any = selectedCampaign;
    console.log("eeeeeeeeeee");

    onDeleteLiveAgentEntry(e);
    selectedCampaign && onCallQueueInbound();
    // if (e && (e?.campaign === "outbound" || e?.campaign === "blended")) {
      // onCallQueueOutbound(e);
    // }
    if (!isCallResume) {
      onSetCallResumeMode();
    }
    // dispatch(clearLeadDetails());
    dispatch(onAddLeadNoteId(null));
    dispatch(onSetAddNoteId(null));
    if (e?.label) {
      setLoginAgentCampaign(e?.label);
      Cookies.set("login_agent_campaign_name", e?.label);
    }
    // dispatch(onSelectCampaignMode(null));
    dispatch(onShowLeadInfo(true));
    dispatch(setIsInboundCampaign(false));
    dispatch(setPredictiveData({}));
    dispatch(onSelectCampaign(e ? e?.value : e));
    dispatch(onSelectCampaignDetails(e));

    // if (e) onAddLiveAgentEntry(e);
    dispatch(
      setNumberMasking(e ? (e?.number_masking === "0" ? true : false) : false)
    );
    dispatch(onSetCampaignType(e?.campaign));
    Cookies.set("campaignType", e?.campaign);
    Cookies.set("isRecording", e?.recording);

    if (e?.campaign === "outbound" || e?.campaign === "blended") {
      Cookies.set("lead_information", "0");
      dispatch(setIsInboundCampaign(false));
      if (e?.dial_method === "3") {
        dispatch(
          setPredictiveData({
            current_dial_level: e?.current_dial_level,
            target_drop_percent: e?.target_drop_percent,
            max_dial_level: e?.max_dial_level,
            minimum_calls: e?.minimum_calls,
          })
        );
      } else {
        dispatch(setPredictiveData({}));
      }
      dispatch(onSelectCampaignMode(e?.dial_method));
      Cookies.set("campaignMode", e?.dial_method);
      if (e?.dial_method === "1" || e?.dial_method === "3") {
        dispatch(onSetDialType("leadDial"));
        if (flag == 1) {
          dispatch(onShowCallModal("true"));
        }
      } else {
        dispatch(onSetDialType("manualDial"));
      }
      //if (
       // e?.dial_method === "0" ||
       // e?.dial_method === "1" ||
       // e?.dial_method === "3"
     // ) {
       // dispatch(onShowLeadInfo(false));
     // } else {
        dispatch(onShowLeadInfo(true));
     // }
    } else if (e?.campaign === "inbound") {
      dispatch(setPredictiveData({}));
      if (flag == 1) {
        dispatch(onShowCallModal("true"));
      }
      dispatch(onSetDialType("leadDial"));
      if (e?.campaign === "inbound") {
        dispatch(setIsInboundCampaign(true));
        userAgentUnRegistration();
      }
    }
  };
  if (!ready) return null;


  return (
    <>
      <div
        className={`fixed flex h-[50px] mt-5 bg-white rounded-[10px]  z-40 border-b border-[#E5E7EB] transition-all

           ${isdrawerOpen
            ? "pl-[15px] ml-[265px] w-[81.2%]"
            : "pl-[15px] ml-[95px] w-[92.4%]"
          }`}
      >
        <div
          className={`flex justify-between items-center px-6 w-full ${!isdrawerOpen && "pl-4"
            }`}
        >
          <div className="flex items-center">
            <p className="text-base font-semibold text-[#111827]">
              {getTitle()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {wrapUpTime && (
              <div className="font-medium text-sm text-[#6B7280]">
                {wrapUpTime}
              </div>
            )}
            <WebRtcStatus />
            <NetworkStatus />
            <CampaignStatus />
            <AgentStatus />
            {user?.permission?.breakcode === "0" && (
              <div>
                <BreakSelection
                  breakValue={breakValue}
                  onBreakSelection={onBreakSelection}
                />
              </div>
            )}
            {user?.permission?.call_center_mode === "0" &&
              user?.permission?.pbx_mode === "0" && (
                <div>
                  <CallPbxSwitch
                    checked={isPbx}
                    onChange={(e: any) => {
                      if (
                        !user?.isPbx &&
                        (isCallHangUp ||
                          Cookies.get("is_call_start") === "0" ||
                          !isCallResume)
                      ) {
                        Danger(
                          !isCallResume
                            ? "You can't change the mode without pausing the campaign"
                            : "You can't change the mode without finishing the lead"
                        );
                      } else {
                        console.log("data chaleega ya nhi");              
                        onRoleChange();
                      }
                    }}
                  />
                </div>
              )}
            {/* {!user?.isPbx && (
              // <div
              //   className="bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-full h-8 w-8 flex items-center justify-center cursor-pointer transition-colors"
              //   onClick={() => setCamoaignModalOpen(true)}
              // >
              //   <Image src={taskIcon} alt="taskIcon" width={16} height={16} />
              // </div>
            )} */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowLogoutPopup(!showLogoutPopup)}
            >
              <div className="h-8 w-8 bg-[#F3F4F6] rounded-full flex items-center justify-center relative">
                <span className="text-sm text-[#111827] font-semibold">
                  {user?.agent_detail?.username.slice(0, 1).toUpperCase()}
                </span>
                <div className="bg-white h-3 w-3 rounded-full absolute flex justify-center items-center right-0 bottom-0 border border-[#E5E7EB]">
                  <div
                    className={`${status === "0" ? "bg-green-500" : "bg-red-500"
                      } h-2 w-2 rounded-full`}
                  ></div>
                </div>
              </div>
              <div className="hidden smd:block">
                <p className="text-xs text-[#6B7280]">{user?.role}</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-[#111827]">
                    {user?.agent_detail?.username}
                  </p>
                  <Image
                    src={arrowDownIcon}
                    alt="arrow-down"
                    width={12}
                    height={12}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LogoutPopup
        data={user}
        visible={showLogoutPopup}
        status={status}
        className="z-10 absolute 3xl:top-[55px] top-[45px] right-1"
        onCancleClick={() => setShowLogoutPopup(false)}
        onLogoutClick={() => onLogoutClick()}
        onProfileClick={() => {
          router.push("/profile");
          setShowLogoutPopup(false);
        }}
      />
      {/* 
        <CampaignModal
        campaignModalOpen={campaignModalOpen}
        setCamoaignModalOpen={setCamoaignModalOpen}
        selectedCampaign={selectedCampaign}
        />
      */}
    </>
  );
};

export default Header;
