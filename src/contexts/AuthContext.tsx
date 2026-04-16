"use client";
import { useEffect, createContext, useReducer } from "react";

// PROJECT IMPORTS
import { LOGIN, LOGOUT, PROCESS } from "./actions";
import { authReducer } from "./reducers/authReducer";
import { apiInstance } from "@/redux/axiosApi";
import {
  onSelectCampaign,
  onSelectCampaignDetails,
  onStatusChange,
} from "@/redux/slice/commonSlice";
import { useAppDispatch } from "@/redux/hooks";
//import { baseUrl } from "@/API/baseURL";
import { Danger, Success } from "@/redux/services/toasterService";
import { Loader } from "@/components/ui-components";
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

import Cookies from "js-cookie";
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

const initialState: InitialStateProps = {
  user: {},
  isLoggedIn: false,
  isInitialized: false,
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const reduxDispatch = useAppDispatch();
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
    campaign_uuid: string
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
      });
      console.log("Payload being sent to login:", {
        username,
        password,
        tenant_domain,
        browserToken,
        campaign_uuid,
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
  const logout = async (userId: string, autologout?: string) => {
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
        clearAllData(reduxDispatch);
        disconnectSocket()
      }
    } catch (error: any) {
      Danger(error?.response?.data?.message);
    }
  };

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
    </AuthContext.Provider>
  );
};

export default AuthContext;
