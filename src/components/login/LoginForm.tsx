"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Select } from "../forms"; // Make sure Select is imported
import axios from "axios"; // Required to call the API

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { useAuth } from "@/contexts/hooks/useAuth";

//import { WSS_URL } from "@/API/baseURL";
const WSS_URL = process.env.WSS_URL;
// const baseUrl = `${process.env.BASE_URL}`;

//import { baseUrl } from "@/API/baseURL";
import { Button, CheckBox, Input } from "../forms";
import Password from "../../components/forms/Password";
import getDomain from "@/utils/GetDoamin";
// import globalLogout from "@/utils/globalLogout";

// THIRD-PARTY IMPORT

import { Registerer, RegistererState, UserAgent } from "sip.js";
import { useFormik } from "formik";
import * as Yup from "yup";
import Cookies from "js-cookie";
// import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
const logo: any = process.env.EXPANDED_LOGO;

// TYPES
import { LoginFormValues } from "@/types/loginTypes";
import { agentEntryAdd, userAllowedCampaign } from "@/redux/slice/authSlice";
import { onSelectCampaign, onSelectCampaignDetails, onSetUserEntry, useCampaignMode, useCampaignType } from "@/redux/slice/commonSlice";
import { Danger, Success } from "@/redux/services/toasterService";
import { callQueueInbound, pauseCampaign, setCallResume, updateLiveAgentEntry, useCallResume, useCampaignOptions } from "@/redux/slice/campaignSlice";
import Icon from "../ui-components/Icon";
import { userAgentUnRegistration } from "../pbx-components/calling/CallingModal";
import { apiInstance } from "@/redux/axiosApi";
import { AGENT_ADMIN_LOGOUT, FORCE_LOGIN, LOGIN_PAGE_LOGOUT } from "@/API/constAPI";
import { clearAllData, RemoveCookiesData } from "../helperFunctions";
import { disconnectSocket } from "@/config/socket";
import { LOGOUT } from "@/contexts/actions";

/* ============================== LOGIN FORM ============================== */

const LoginForm = () => {
  const { user, login } = useAuth();
  const dispatch = useAppDispatch();
  const domain = getDomain();
  const [showForceLogout, setShowForceLogout] = useState(false);
  const [forceLogoutLoading, setForceLogoutLoading] = useState(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("email"); // 'email' or 'number'

  const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>();
  const campaignType = useCampaignType();
  const campaignMode = useCampaignMode();
  const isCallResume = useCallResume();

  // force logout
  const logout = async () => {
    setIsLoading(true)
    try {
      const currentDomain = values?.company_code ? `${values?.company_code}.ringingo.com`.toLowerCase() : domain;

      const res: any = await apiInstance.post(
        LOGIN_PAGE_LOGOUT,
        { username: values?.username, domain: currentDomain}
      );
      if (res && res?.statusCode === 200) {
        dispatch({
          type: LOGOUT,
        });
        dispatch(onSelectCampaign(""));
        dispatch(onSelectCampaignDetails(undefined));
        RemoveCookiesData();
        clearAllData(dispatch);
        disconnectSocket()
        setIsLoading(false)
        Success("Logged out from all devices successfully.");
        setShowForceLogout(false);
      }
    } catch (error: any) {
      Danger(error?.response?.data?.message);
    }
  };
  const forceLogin = async (data:any) => {
    setIsLoading(true)
          const currentDomain = values?.company_code ? `${values?.company_code}.ringingo.com`.toLowerCase()  : domain;

    try {
      const res: any = await apiInstance.post(
        FORCE_LOGIN,
        { username: values?.username, domain: currentDomain}
      );
      if (res && res?.statusCode === 200) {
      if(res?.message?.force_login==="0"){
        setShowForceLogout(true)
      }else{
        Danger(data)
      }   
      setIsLoading(false)
      }
    } catch (error: any) {
      Danger(error?.response?.data?.message);
    }
  };


  // useEffect(() => {
  //   console.log("campaignOptions", campaignOptionss);
  //   setSelectedCampaign(
  //     campaignOptionss.find(
  //       (i: any) => i.options[0]?.value === user?.agent_detail?.campaign_uuid
  //     )?.options[0]
  //   );
  // }, [campaignOptionss]);


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
        campaignMode === "1" ||
        campaignMode === "3"
      ) {
        payload["pause"] = "true";
      }
      await dispatch(callQueueInbound(payload)).unwrap();
    } catch (error: any) {
      console.log("call queue err -->", error?.message);
    }
  };

  // LOG OUT USER
  const onLogoutClick = async () => {
    if (!isLogoutLoading) {
      setIsLogoutLoading(true);
      try {

        logout();
        setIsLogoutLoading(false);
      } catch (error: any) {
        console.log("Log out err --->", error?.message);
        setIsLogoutLoading(false);
      }
    }
  };
  // SHOW PASSWORD
  const onEyeClick = () => setShowPassword(!showPassword);

  // const tenantPortal: any = process.env.TENANT_PORTAL_DOMAIN;
  const tenantPortal: any = domain
  const initialValues: LoginFormValues = {
    username: "",
    password: "",
    tenant_domain: tenantPortal, // ::yaksh::
company_code: "",
    browserToken: "",
    campaign_uuid: "", // <- new
    rememberMe: false,
  };

  const validationSchema = Yup.object<LoginFormValues>({
    username: Yup.string().required("Please enter your username"),
    password: Yup.string().required("Please enter your password"),
    campaign_uuid: Yup.string().required("Please select a campaign"),
company_code: Yup.string().optional(),
  });

  // CALL REGISTRATION
  const sipRegistration = (user: any) => {
    let userAgent: any;
    let callScreen = "false";
    let username = user?.agent_detail?.extension_details[0]?.username;
    let password = user?.agent_detail?.extension_details[0]?.password;
    // let domain = "itsmycc-bytebran.local";
    // let domain = "192.168.1.25";
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
      activeAfterTransfer: false, //	Die when the transfer is completed
      logBuiltinEnabled: false, //	Boolean - true or false - If true throws console logs
    };
    console.log(userOptions);
    userAgent = new UserAgent(userOptions);
    userAgent
      .start()
      .then(() => {
        console.log("Connected ....");
        console.log(userAgent);
        //	Create register object
        const registerer = new Registerer(userAgent);
        registerer.stateChange.addListener(
          (registrationState: RegistererState) => {
            switch (registrationState) {
              case RegistererState.Registered:
                console.log("Registered ....");
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
                break;
              case RegistererState.Terminated:
                console.log("Terminated ....");
                break;
              default:
                console.log(
                  "Could not identified registration state .... ",
                  registrationState
                );
                break;
            }
          }
        );
        if (callScreen !== "true") {
          registerer
            .register()
            .then((request) => {
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
  const [campaignOptions, setCampaignOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // console.log("campaignOptions", campaignOptions);


  const fetchAllowedCampaigns = async (username: string, domain: string, company_code?: string) => {
    if (!username) return;
    try {
      const currentDomain = company_code ? `${company_code}.ringingo.com`.toLowerCase() : domain;
      let payload:any = { username, domain:currentDomain };
      if (company_code) {
        payload.company_code = company_code.toLowerCase();
      }
      // const res = await axios.get(`https://ringingo.cc.local:5000/user/allowed_campaigns?username=${encodeURIComponent(username)}`);
      const res: any = await dispatch(userAllowedCampaign({ params: payload })).unwrap();
      console.log("resresresres", res)
      // Assuming res.data is an array of { label, value }
      // setFieldValue("campaign_uuid", res.data); // You can store this however needed
      setCampaignOptions(res); // Set for dropdown
    } catch (error) {
      console.error("Failed to fetch allowed campaigns", error);
    }
  };


  // Load campaigns on mount
  // useEffect(() => {
  //   const fetchCampaigns = async () => {
  //     try {
  //       const res = await axios.get("https://ringingo.cc.local:5000/agent-call-center/campaign", {
  //   headers: {
  //     Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJkb21haW4iOiIxOTIuMTY4LjEuMzkiLCJlbWFpbCI6ImRlbW9AZ21haWwuY29tIiwicm9sZSI6InRlbmFudCIsInV1aWQiOiI4OWMxYjkzOS1iYjEzLTQ3NmQtYjIxNy05YmZhNTM3M2VkMGEiLCJ0aW1lem9uZSI6IkFzaWEvS29sa2F0YSIsImlhdCI6MTc1MDg0OTQxNCwiZXhwIjoxNzUwOTM1ODE0fQ.XA2qxgbp1cHuidcWDWx_259Z1DUlfVJ8QHUJ_PVTTZw",
  //     "Content-Type": "application/json",
  //   },
  //   withCredentials: false,
  // });

  // console.log("ghgggggggggggg",res);

  // const {
  //   blended_campaign = [],
  //   inbound_campaign = [],
  //   outbound_campaign = [],
  // } = res.data.data;

  // const allCampaigns = [...blended_campaign, ...inbound_campaign, ...outbound_campaign];
  //       const formatted = allCampaigns.map(c => ({
  //         label: c.name,
  //         value: c.uuid
  //       }));
  // console.log("formattedformatted",allCampaigns);

  // setCampaignOptions(formatted);


  //     } catch (error) {
  //       console.error("Failed to fetch campaigns:", error);
  //     }
  //   };

  //   fetchCampaigns();
  // }, []);

  // // SOCKET LOGOUT
  // const sendLogout = (
  //   browserToken: any,
  //   user_uuid: any,
  //   newToken: any,
  //   user: any
  // ) => {
  //   const socket = io(baseUrl, {
  //     query: { token: browserToken, uuid: user_uuid, new_token: newToken },
  //   });

  //   socket.on("connect", () => { });
  //   socket.on("logout", () => {
  //     console.log(user);
  //     console.log(newToken);
  //     console.log(browserToken);
  //     console.log(user_uuid);
  //     globalLogout(logout, user);
  //     console.log("Received logout event. Logging out...");
  //   });
  // };
  // ON SUBMIT FORM
  const onSubmit = async (values: LoginFormValues) => {
    const campaignUUID = values.campaign_uuid; // ✅ CORRECT
    console.log("campaignnn", campaignUUID);
    setErrorMsg(null);
    try {
      setIsLoading(true);
      //Genrate browserToken
      const browserToken = uuidv4();
      const newToken = browserToken;
      //
      const res: any = await login(
        values.username,
        values.password,
        values.company_code ? `${values.company_code}.ringingo.com`.toLowerCase() : values.tenant_domain,

        //Socket browserToken
        browserToken,
        values.rememberMe,
        campaignUUID,
values.company_code?.toLowerCase()
      );

      console.log(res);

      if (res && res.data.access_token) {
        if (values.rememberMe) {
          Cookies.set("rememberMe", "true", { expires: 7 });
          Cookies.set("username", values.username, { expires: 7 });
        } else {
          Cookies.remove("rememberMe");
          Cookies.remove("username");
        }

        let payload = {
          login_status: "0",
        };
        let response: any = await dispatch(agentEntryAdd(payload)).unwrap();
        if (
          (response && response.statusCode === 201) ||
          response.statusCode === 200
        ) {
          dispatch(onSetUserEntry("login-entry"));
          dispatch(onSelectCampaign(campaignUUID))
        }
        //Send logout response browserToken,agentuuid,newtoken,data
        // sendLogout(
        //   res.data.agent_detail.browserToken,
        //   res.data.agent_detail.uuid,
        //   newToken,
        //   res.data
        // );
        //
        sipRegistration(res?.data);
        Cookies.set("is_call_start", "1");
        setIsLoading(false);
      } else if (res && res?.data?.statusCode === 403) {
        // Danger(res?.data?.data);
        // setErrorMsg(res?.data?.data);
        setIsLoading(false);
        forceLogin(res?.data?.data)
      } else {
        Danger(res?.data?.data);
        setIsLoading(false);
      }
    } catch (e: any) {
      setIsLoading(false);
      console.error("Login Error --->", e?.message);
    }
  };

  const {
    values,
    touched,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });
  
  useEffect(() => {
    // Clear localStorage if it has data
    if (localStorage.length > 0) {
      localStorage.clear();
    }
 
    // Clear all cookies if any exist
    const allCookies = Cookies.get();
    if (Object.keys(allCookies).length > 0) {
      Object.keys(allCookies).forEach((cookieName) => {
        Cookies.remove(cookieName);
      });
    }
  }, []);
  
  useEffect(() => {
    // Clear localStorage if it has data
    if (localStorage.length > 0) {
      localStorage.clear();
    }
 
    // Clear all cookies if any exist
    const allCookies = Cookies.get();
    if (Object.keys(allCookies).length > 0) {
      Object.keys(allCookies).forEach((cookieName) => {
        Cookies.remove(cookieName);
      });
    }
  }, []);
  useEffect(() => {
    const savedUsername = Cookies.get("username") || "";
    const rememberMe = Cookies.get("rememberMe") === "true";

    if (rememberMe) {
      setFieldValue("username", savedUsername);
      setFieldValue("rememberMe", true);
    }
  }, [setFieldValue]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
    // style={{
    //     backgroundImage: 'url("/assets/images/Loginbg.png")', // Replace with the actual path of your image
    //   }}
    >
      <div className="flex items-stretch shadow-2xl rounded-[30px] overflow-hidden" >
        {/* Left Section (Image) */}
        <div className="w-[380px] min-h-[520px] flex items-center justify-center rounded-l-[30px] overflow-hidden" >
          <Icon
            name="LoginLogo"
            alt="Login"
            width={380}
            height={520}
            className="object-cover w-full h-full block"
          />
        </div>

        {/* Right Section (Login Form) */}
        <div className="w-[380px] min-h-[520px] flex flex-col p-7 bg-white space-y-3" >
          {/* Logo */}
          < div className=" flex justify-center mb-1" >
            <Icon
              name="MenuLogoExpandedImage"
              height={40}
              width={180}
              alt="Logo"
            />
          </div>

          < h2 className="text-[20px] font-medium mb-4 text-center text-[#322996]" >
            Welcome Back
          </h2>

          < form onSubmit={handleSubmit} className="space-y-3" >
            <div>
              {/* 
              <Input
              isLogin={true}
              icon="userLogin"
              className=""
              name="username"
              label={
                <>
                User Name <span className="text-red-500">*</span>
                </>
              }
              value={values.username}
              placeholder=""
              // placeholder="Enter Your Email/Username"
              touched={touched}
              errors={errors}
              onChange={handleChange}
              onBlur={handleBlur}
              isInfo={false}
              noSpace
              />
            */}
 <Input
              isLogin={true}
              icon="leadGroup"
              className="w-full"
              name="company_code"
              label="Company Code"
              value={values.company_code}
              touched={touched}
              errors={errors}
              onChange={handleChange}
              onBlur={(e) => {
                handleBlur(e);
                fetchAllowedCampaigns(values.username, domain, e.target.value);
              }}
              isInfo={false}
              noSpace
            />
            </div>
            <div>
              < Input
                isLogin={true}
                icon="userLogin"
                className=""
                name="username"
                label={
                  <>
                    User Name < span className="text-red-500" >* </span>
                  </>
                }
                value={values.username}
                touched={touched}
                errors={errors}
                onChange={handleChange}
                onBlur={(e) => {
                handleBlur(e);
                fetchAllowedCampaigns(e.target.value, domain, values.company_code);
              }}
                isInfo={false}
                noSpace

              />
            </div>

            < div >
              <Password
                className="bg-white text-sm"
                name="password"
                label={
                  <>
                    Password < span className="text-red-500" >* </span>
                  </>
                }
                value={values.password}
                // placeholder="Enter Password"
                touched={touched}
                errors={errors}
                onChange={handleChange}
                onBlur={handleBlur}
                // onRightIconClick={onEyeClick}
                isInfo={false}
              />
              {/* <Input
                demo="login"
                className="w-full rounded-md border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                name="password"
                label="Enter Password *"
                value={values.password}
                type={showPassword ? "text" : "password"}
                placeholder=""
                // placeholder="Enter Password"
                rightIcon={showPassword ? "eyeOpen" : "eyeClose-gray"}
                touched={touched}
                errors={errors}
                onChange={handleChange}
                onBlur={handleBlur}
                onRightIconClick={onEyeClick}
                isInfo={false}
              /> */}
            </div>

            < div className="flex justify-between items-center " >
              <div className="flex items-center pb-0" >
                <CheckBox
                  label="Remember Me"
                  // className="text-sm text-gray-600"
                  // label="Remember Me"
                  checked={values.rememberMe}
                  onChange={(checked: boolean) =>
                    setFieldValue("rememberMe", checked)
                  }
                />
              </div>
              < Link
                href="/forgot-password"
                className="text-[#322996] text-xs font-light hover:underline"
              >
                Forgot password ?
              </Link>
            </div>
            < Select
              label={
                <>
                  Select Campaign < span className="text-red-500" >* </span>
                </>
              }
              name="campaign_uuid"
              placeholder="Select Campaign"
              options={campaignOptions}
              value={values.campaign_uuid}
              touched={touched}
              errors={errors}
              isInfo={false}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                console.log("Selected campaign UUID:", e.target.value);
                setFieldValue("campaign_uuid", e.target.value);
              }}
            />
            {/*
            <Select
            label={
              <>
              Select Campaign <span className="text-red-500">*</span>
              </>
              }
              name="campaign_uuid"
              placeholder="Select Campaign"
              options={campaignOptions}
              value={values.campaign_uuid}
              touched={touched}
              errors={errors}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                console.log("Selected campaign UUID:", e.target.value);
                setFieldValue("campaign_uuid", e.target.value);
              }}
              />
              */}

            <Button
              text="LOGIN"
              className="w-full rounded-md bg-button-background py-2.5 text-sm font-medium text-white transition-colors  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 "
              type="submit"
              style="save"
              icon="LoginIcon"
              isLoading={isLoading}
              disabled={isLoading}
            />
            {/* Terms & Condition */}
            <div className="text-center" >
              <p className="text-[10px] text-gray-500  mt-2" >
                By clicking to continue, you agree to our{" "}
                <span className="font-bold text-gray-700" >
                  Terms & Condition
                </span>
              </p>

              {/* Powered by Bytebran */}
              <p className="text-xs text-gray-600 text-center mt-2" >
                Powered by{" "}
                <span className="text-[#322996] font-medium" > Ringingo </span>
              </p>
            </div>
          </form>
        </div>
      </div>
      {showForceLogout && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
          <div className="w-[420px] bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Already Logged In
            </h3>

            <p className="text-sm text-gray-600 mt-2">
                {errorMsg || "You are already logged in on another device. Would you like to force logout?"}

            </p>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForceLogout(false);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={forceLogoutLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-md bg-[#322996] text-white hover:opacity-90"
                disabled={forceLogoutLoading}
              >
                {forceLogoutLoading ? "Forcing..." : "Force Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginForm;
