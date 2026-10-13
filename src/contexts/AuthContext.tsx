"use client";
import { useEffect, useRef, useState, createContext, useReducer,useCallback } from "react";

// PROJECT IMPORTS
import { LOGIN, LOGOUT, PROCESS } from "./actions";
import { authReducer } from "./reducers/authReducer";
import { apiInstance } from "@/redux/axiosApi";
import {
  onSelectCampaign,
  onSelectCampaignDetails,
  onStatusChange,
  selectStatus,
  selectCallScreen,
  selectIsShowCallDuration,
  selectIsCallHangUp,
} from "@/redux/slice/commonSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
//import { baseUrl } from "@/API/baseURL";
import { Danger, Success } from "@/redux/services/toasterService";
import { Loader } from "@/components/ui-components";
import IdleWarningModal from "@/components/modals/IdleWarningModal";
import { updateLiveAgentEntry } from "@/redux/slice/campaignSlice";

import {
  AGENT_LOGIN,
  FORGOT_PASSWORD,
  UPDATE_AUTH_STATUS,
  UPDATE_PASSWORD,
  AGENT_CALL_QUEUE_LOGOUT,
  AGENT_ADMIN_LOGOUT,
} from "@/API/constAPI";
import {
  CallCenterMenuList,
  PbxMenuList,
} from "@/components/layouts/MainLayout/SideBar/menuItems";
import { RemoveCookiesData, clearAllData } from "@/components/helperFunctions";

// THIRD-PARTY IMPORT IMPORTS

const baseUrl = `${process.env.BASE_URL}`;

// import Cookies from "js-cookie";
import Cookies from "@/lib/cookies";
import axios from "axios";
// import { io } from "socket.io-client";

// TYPES
import { AuthContextType } from "@/types/auth";
import { getMissedCallDetails } from "@/redux/slice/phoneSlice";
import { changeModle } from "@/redux/slice/chatSlice";
import { disconnectSocket } from "@/config/socket";

interface InitialStateProps {
  user?: any;
  isInitialized?: boolean;
  isLoggedIn: boolean;
}

// Warning will show this many seconds before the actual logout
const IDLE_WARNING_LEAD_SECONDS = 30;

const initialState: InitialStateProps = {
  user: {},
  isLoggedIn: false,
  isInitialized: false,
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const reduxDispatch = useAppDispatch();
  const currentStatus = useAppSelector(selectStatus);
  const callScreen = useAppSelector(selectCallScreen);
  const isShowCallDuration = useAppSelector(selectIsShowCallDuration);
  //const isKnowledgeBase = permission?.knowledge_base === "0";
  const isCallHangUp = useAppSelector(selectIsCallHangUp);
  const prepareData = (isPbx: boolean, permission: any) => {
    const sideBarData = isPbx ? PbxMenuList : CallCenterMenuList;
    return sideBarData
      ?.filter((value: any) =>
        value?.roleId && permission[value?.roleId]
          ? permission[value?.roleId] === "0"
          : true
      )
      ?.map((val: any) => val?.url);
  };
  const idleTimeoutRef = useRef<number | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);
  const warningCountdownRef = useRef<number | null>(null);
  const idleStartRef = useRef<number>(Date.now());
  const warningVisibleRef = useRef(false);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [idleWarningSecondsLeft, setIdleWarningSecondsLeft] = useState(IDLE_WARNING_LEAD_SECONDS);
  const [idleMinutesSinceActive, setIdleMinutesSinceActive] = useState(0);
  const [idleResetCounter, setIdleResetCounter] = useState(0);
  useEffect(() => {
    const init = async () => {
      try {
        const cookies = Cookies.get("user_agent");
        const user = JSON.parse(cookies ? cookies : "{}");
        if (user?.access_token) {
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user,
            },
          });
        } else {
          dispatch({
            type: LOGOUT,
          });
        }
      } catch (e) {
        dispatch({ type: LOGOUT });
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LOGIN USER
  const login = async (
    username: string,
    password: string,
    tenant_domain: string,
    browserToken: string,
    remember_me: false,
    campaign_uuid: string,
    company_code: string
  ) => {
    console.log("newwcaam", campaign_uuid);
    // RemoveCookiesData();
    // clearAllData(reduxDispatch);
    try {
      const user: any = await axios.post(baseUrl + AGENT_LOGIN, {
        username,
        password,
        tenant_domain,
        browserToken,
        campaign_uuid,
        company_code
      });
      console.log("Payload being sent to login:", {
        username,
        password,
        tenant_domain,
        browserToken,
        campaign_uuid,
        company_code
      });

      if (user?.data?.access_token) {
        Success(user?.data?.data);

        const permission = user.data?.agent_detail?.agent_permission[0];
        const isRecording =
          user.data?.agent_detail?.recording === "1" &&
            user.data?.agent_detail?.extension_details[0]?.recording === "1"
            ? false
            : true;
        const isPbx =
          permission?.pbx_mode === "0"
            ? true
            : permission?.call_center_mode === "0"
              ? false
              : permission?.call_center_mode === "0" &&
                permission?.pbx_mode === "0"
                ? true
                : false;
        const sticky_agent = permission?.sticky_agent === "1";
        const settings = permission?.settings === "1";
        const isNumberMasking = permission?.number_masking === "0";
        const isCallQueueSelection = permission?.callqueue_selection === "0";
        const isKnowledgeBase = permission?.knowledge_base === "0";
        const isMessaging=permission?.whatsapp==="1"|| permission?.instagram==="1"|| permission?.facebook==="1"
        console.log(isMessaging,'isMessaging',isRecording,'isRecording');
        
        const data = {
          ...user.data,
          permission,
          isRecording,
          isPbx,
          sticky_agent,
          isNumberMasking,
          settings,
          isMessaging,
          isCallQueueSelection,
          isKnowledgeBase,
          urls: prepareData(isPbx, permission),
        };
        data.isPbx = false;

        if (!isPbx) Cookies.set("campaign_modal", "0", { expires: 1 });
        reduxDispatch(onStatusChange(data?.permission?.status));
        reduxDispatch(getMissedCallDetails());
        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user: data,
          },
        });
        // Cookies.set("user_agent", JSON.stringify(data), { expires: 1 });
        
        // 🚨 Remove long text from cookie to prevent 4KB overflow and 401 error
        const cookieData = { ...data };
        if (cookieData.agent_detail) {
          cookieData.agent_detail = { ...cookieData.agent_detail };
          // store it to localstorage instead 
          if (cookieData.agent_detail.agent_script_text) {
             localStorage.setItem("agent_script_text", cookieData.agent_detail.agent_script_text);
             delete cookieData.agent_detail.agent_script_text;
          } else {
             localStorage.removeItem("agent_script_text");
          }
        }
        // -------------------------------------
        Cookies.set("user_agent", JSON.stringify(cookieData), { expires: 1 });
        reduxDispatch(changeModle(isPbx ? "pbx" : "call"));

        // ✅ Add this to update campaign for the live agent
        reduxDispatch(
          updateLiveAgentEntry({
            agent_uuid: data?.agent_detail?.uuid,
            campaign_uuid: campaign_uuid, // ✅ This is the correct one
            status: "0",
          })
        );

        localStorage.setItem(
          "campaign_uuid",
          data?.agent_detail?.campaign_uuid || campaign_uuid
        );
        console.log(
          "✅ campaign_uuid stored in localStorage:",
          localStorage.getItem("campaign_uuid")
        );

        if (data?.agent_detail?.extension_details) {
          const username = data?.agent_detail?.extension_details[0].username;

          const logout_res: any = await axios.post(
            baseUrl + AGENT_CALL_QUEUE_LOGOUT,
            {
              username,
            },
            {
              headers: {
                Authorization: `Bearer ${user?.data?.access_token}`,
              },
            }
          );
        }
        return user;
      } else if (user?.data?.statusCode === 403) {
        return user;
      } else {
        Danger(user?.data?.message);
        return user;
      }
    } catch (err: any) {
      Danger(err?.response?.data?.message);
      return err;
    }
  };

  // LOGOUT USER
  const logout = useCallback(async (userId: string, autologout?: string) => {
    try {
      const res: any = await apiInstance.patch(
        AGENT_ADMIN_LOGOUT + `/${userId}`,
        { entity: "agent" }
      );
      // const res: any = await apiInstance.patch(
      //   UPDATE_AUTH_STATUS + `/${userId}`,
      //   { is_logged_in: "1" }
      // );

      // const newdata: any = await apiInstance.get(`user` + `/${userId}`);

      // if (newdata && newdata?.statusCode === 200 && autologout == undefined) {
      //   const socket = io(baseUrl, {
      //     query: {
      //       token: newdata.data.browserToken,
      //       uuid: userId,
      //       new_token: "empty",
      //     },
      //   });
      // }
      if (res && res?.statusCode === 200) {
        dispatch({
          type: LOGOUT,
        });
        reduxDispatch(onSelectCampaign(""));
        reduxDispatch(onSelectCampaignDetails(undefined));
        RemoveCookiesData();
        localStorage.clear();
        clearAllData(reduxDispatch);
        disconnectSocket()
      }
    } catch (error: any) {
      Danger(error?.response?.data?.message);
    }
  }, [dispatch, reduxDispatch]);  
  // Dismiss warning and reset idle timer (called ONLY when agent clicks "Stay Logged In")
  const dismissIdleWarning = useCallback(() => {
    setShowIdleWarning(false);
    warningVisibleRef.current = false;
    if (warningCountdownRef.current) {
      window.clearInterval(warningCountdownRef.current);
      warningCountdownRef.current = null;
    }
    // Reset the idle start timestamp
    idleStartRef.current = Date.now();
    // Trigger the useEffect to re-run and restart the full idle timer
    setIdleResetCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    // Check if automatic logout is disabled (1 = disabled, 0 = enabled)
    const autoLogoutEnabled = state?.user?.permission?.auto_logout !== "1";
    
    // Default to 30 minutes, or use configured time
    const configuredTimeout = state?.user?.permission?.idle_timeout
      ? Number.parseInt(state.user.permission.idle_timeout, 10) * 60 * 1000
      : 30 * 60 * 1000;

    // Time before auto-logout when the warning should appear (in ms)
    const warningLeadMs = IDLE_WARNING_LEAD_SECONDS * 1000;
    // Time after which the warning popup should show
    const warningDelay = Math.max(configuredTimeout - warningLeadMs, 0);
      
    const clearAllTimers = () => {
      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        window.clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      if (warningCountdownRef.current) {
        window.clearInterval(warningCountdownRef.current);
        warningCountdownRef.current = null;
      }
      setShowIdleWarning(false);
      warningVisibleRef.current = false;
    };

    const startIdleTimer = () => {
      console.log("[AuthContext] startIdleTimer called. Setting timeout for", configuredTimeout, "ms (warning at", warningDelay, "ms)");
      clearAllTimers();
      // Reset idle start time
      idleStartRef.current = Date.now();

      // 1) Set up warning popup timer
      warningTimeoutRef.current = window.setTimeout(() => {
        console.log("[AuthContext] WARNING TIMEOUT FIRED! Showing idle warning popup...");
        // Calculate how many minutes agent has been idle
        const elapsedMs = Date.now() - idleStartRef.current;
        setIdleMinutesSinceActive(Math.floor(elapsedMs / 60000));
        setIdleWarningSecondsLeft(IDLE_WARNING_LEAD_SECONDS);
        setShowIdleWarning(true);
        warningVisibleRef.current = true;

        // Start a 1-second countdown interval
        let remaining = IDLE_WARNING_LEAD_SECONDS;
        warningCountdownRef.current = window.setInterval(() => {
          remaining -= 1;
          setIdleWarningSecondsLeft(remaining);
          if (remaining <= 0) {
            if (warningCountdownRef.current) {
              window.clearInterval(warningCountdownRef.current);
              warningCountdownRef.current = null;
            }
          }
        }, 1000);
      }, warningDelay);

      // 2) Set up actual auto-logout timer (same as before)
      idleTimeoutRef.current = window.setTimeout(() => {
        console.log("[AuthContext] IDLE TIMEOUT FIRED! Logging out agent...");
        setShowIdleWarning(false);
        warningVisibleRef.current = false;
        if (state?.user?.agent_detail?.uuid) {
          Danger("You have been logged out due to inactivity.");
          logout(state.user.agent_detail.uuid, "autologout");
        }
      }, configuredTimeout);
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    let throttleTimer: number | null = null;
    const resetIdleTimer = () => {
      // If the warning popup is visible, do NOT reset — only "Stay Logged In" button should dismiss it
      if (warningVisibleRef.current) return;
      if (!throttleTimer) {
        console.log("[AuthContext] Activity detected, resetting idle timer...");
        startIdleTimer();
        throttleTimer = window.setTimeout(() => {
          throttleTimer = null;
        }, 10000); // Only reset the timer at most once every 10 seconds
      }
    };

    // Check if agent is in active state (not idle)
    const isAgentActive =
      currentStatus === "1" || // Break
      currentStatus === "3" || // Break (from realtime report)
      callScreen === "INCOMING" ||
      callScreen === "LIVE" ||
      isShowCallDuration ||
      isCallHangUp; // ACW (After Call Work)

    // Only apply event listeners and timer if auto_logout is enabled
    console.log(`[AuthContext] useEffect run. autoLogoutEnabled=${autoLogoutEnabled}, isLoggedIn=${state.isLoggedIn}, isAgentActive=${isAgentActive}, currentStatus=${currentStatus}`);
    if (autoLogoutEnabled && state.isLoggedIn && !isAgentActive) {
      console.log("[AuthContext] Agent is idle. Starting event listeners and timer.");
      activityEvents.forEach((event) =>
        window.addEventListener(event, resetIdleTimer)
      );
      startIdleTimer();
    } else {
      console.log("[AuthContext] Agent is active (or disabled). Clearing timer.");
      clearAllTimers();
    }

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
      if (throttleTimer) {
        window.clearTimeout(throttleTimer);
      }
      clearAllTimers();
    };
  }, [state.isLoggedIn, state.user, currentStatus, callScreen, isShowCallDuration, isCallHangUp, logout, idleResetCounter]);

  // FORGOT PASSWORD
  const forgotPassword = async (
    username: string,
    entity: string,
    tenant_domain: string
  ) => {
    try {
      const user: any = await axios.post(baseUrl + FORGOT_PASSWORD, {
        username,
        entity,
        tenant_domain,
      });
      if (user && user?.data?.statusCode === 200) {
        const data = { ...user?.data };
        return data;
      } else {
        Danger(user?.data?.data);
      }
    } catch (error: any) {
      Danger(error?.response?.data?.message);
      return error;
    }
  };

  // PASSWORD CHANGE
  const updatePassword = async (
    password: string,
    uuid: string,
    entity: string
  ) => {
    try {
      const user: any = await axios.post(baseUrl + UPDATE_PASSWORD, {
        password,
        uuid,
        entity,
      });
      const data = { ...user?.data };
      return data;
    } catch (error: any) {
      Danger(error?.response?.data?.message);
      return error;
    }
  };

  // USER ROLE CHANGE
  const switchRole = async () => {
    try {
      dispatch({
        type: PROCESS,
      });
      const data = {
        ...state.user,
        isPbx: !state.user.isPbx,
        urls: prepareData(!state.user.isPbx, state.user.permission),
      };
      dispatch({
        type: LOGIN,
        payload: {
          user: data,
          isLoggedIn: true,
        },
      });
      Cookies.set("user_agent", JSON.stringify(data), { expires: 1 });
    } catch (error) { }
  };

  if (!state.isInitialized) {
    return <Loader />;
  }
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        forgotPassword,
        updatePassword,
        switchRole,
      }}
    >
      {children}
      <IdleWarningModal
        visible={showIdleWarning}
        secondsLeft={idleWarningSecondsLeft}
        idleMinutes={idleMinutesSinceActive}
        onStayLoggedIn={dismissIdleWarning}
      />
    </AuthContext.Provider>
  );
};

export default AuthContext;
