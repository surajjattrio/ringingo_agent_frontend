import React, { useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import {
    onSetUserEntry,
    onStatusChange,
    useSelectedCampaign,
} from "@/redux/slice/commonSlice";
import { useAuth } from "@/contexts/hooks/useAuth";

// THIRD-PARTY IMPORT
import { Registerer, RegistererState, UserAgent } from "sip.js";

//import { WSS_URL } from "@/API/baseURL";
const WSS_URL = process.env.WSS_URL;

import Cookies from "js-cookie";
import { userAgentUnRegistration } from "../pbx-components/calling/CallingModal";
import { agentEntryAdd } from "@/redux/slice/authSlice";
import { updateLiveAgentEntry } from "@/redux/slice/campaignSlice";

// ASSETS
const profileIcon = "/assets/icons/profile-circle.svg";
const logoutIcon = "/assets/icons/logout.svg";
const arrowRight = "/assets/icons/arrow-right.svg";

// TYPES
interface LogoutPopupProps {
    data: any;
    visible: boolean;
    className?: string;
    onLogoutClick?: any;
    onProfileClick?: any;
    onCancleClick?: any;
    status?: string;
}

/* ============================== LOGOUT POPUP ============================== */

const LogoutPopup = (props: LogoutPopupProps) => {
    const {
        data,
        visible,
        className,
        onLogoutClick,
        onProfileClick,
        onCancleClick,
        status,
    } = props;

    const [isShowStatus, setIsShowStatus] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const selectedCampaign = useSelectedCampaign();

    // UPDATE ENTRY IN LIVE REPORT
    const onUpdateLiveAgentEntry = async (status: string) => {
        try {
            let payload = {
                status: status,
                campaign_uuid: selectedCampaign ? selectedCampaign : false,
                type: "hangup"
            };
            await dispatch(updateLiveAgentEntry(payload)).unwrap();
        } catch (error: any) {
            console.log("Agent Entry err --->", error?.message);
        }
    };

    const statusChange = async (userStatus: string) => {
        try {
            let payload = {
                login_status: userStatus === "0" ? "0" : "1",
            };
            let response: any = await dispatch(agentEntryAdd(payload)).unwrap();
            if (response && response.statusCode === 201) {
                // !user?.isPbx && onUpdateLiveAgentEntry(userStatus === "0" ? "0" : "3");
                dispatch(
                    onSetUserEntry(userStatus === "0" ? "login-entry" : "busy-entry")
                );
                if (userStatus === "0") {
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
                                            dispatch(onStatusChange(userStatus));
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
                                    .then((request: any) => {
                                        console.log(
                                            "Successfully sent REGISTER request .... ",
                                            request
                                        );
                                    })
                                    .catch((error: any) => {
                                        console.log("Failed to send REGISTER request .... ", error);
                                    });
                            }
                        })
                        .catch((error: any) => {
                            console.log("Failed to connect user agent .... ", error);
                        });
                } else {
                    userAgentUnRegistration();
                    dispatch(onStatusChange(userStatus));
                }
            }
        } catch (error: any) {
            console.log("Agent Status update err--->", error?.message);
        }
    };

    return (
        <>
            <div
                className={`fixed top-0 left-0 right-0 z-50 px-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[100%] max-h-full bg-transparent ${!visible && "hidden"
                    }`}
                onClick={() => {
                    setIsShowStatus(false);
                    onCancleClick();
                }}
            >
                <div className="w-full h-full relative flex justify-center">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`${className} 3xl:w-[200px] w-[160px] bg-white rounded-lg py-1 drop-shadow-xl ${!visible && "hidden"
                            }`}
                    >
                        <div className="flex 3xl:px-3 3xl:py-3 px-2 py-2">
                            <div className="rounded-full mr-2 relative">
                                <div className="3xl:h-9 3xl:w-9 h-7 w-7 bg-secondary-v10 rounded-full flex items-center justify-center">
                                    <span className="3xl:text-base text-sm text-heading font-bold">
                                        {data?.agent_detail?.username.slice(0, 1).toUpperCase()}
                                    </span>
                                </div>
                                <div className="bg-white h-3 w-3 rounded-full absolute flex justify-center items-center right-0 bottom-0">
                                    <div
                                        className={`${status === "0" ? "bg-primary-green" : "bg-error"
                                            } h-2 w-2 rounded-full`}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex flex-col cursor-pointer">
                                <div>
                                    <p className="text-[10px] 3xl:text-[11px] font-normal text-txt-primary">
                                        {data?.role}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-xs 3xl:text-[13px] font-bold mr-1.5">
                                        {data?.agent_detail?.username}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div
                                className={`3xl:py-2.5 py-1.5 3xl:px-4 px-3 font-normal text-heading hover:bg-primary-v10 hover:text-primary hover:font-semibold flex justify-between items-center border-y-2 border-dark-800 ${isShowStatus && "bg-primary-v10 text-primary font-semibold"
                                    }`}
                                // onClick={() => {
                                //     setIsShowStatus(!isShowStatus);
                                // }}
                            >
                                <span className="3xl:text-sm text-xs">Register Status</span>
                                {/* <Legacy
                                    className="cursor-pointer"
                                    src={arrowRight}
                                    alt="profile-Icon"
                                    width={14}
                                    height={14}
                                /> */}
                            </div>
                            {isShowStatus && (
                                <div className="absolute flex flex-col bg-white rounded-lg 3xl:w-[200px] w-[160px] -left-full drop-shadow-lg top-0">
                                    <div
                                        className={`flex 3xl:py-2.5 py-1.5 cursor-pointer items-center px-3 font-normal text-heading rounded-t-lg ${status === "0" &&
                                            "bg-primary-green-v10 text-primary-green font-semibold"
                                            }`}
                                        onClick={() => {
                                            statusChange("0");
                                        }}
                                    >
                                        <div className="bg-primary-green h-2.5 w-2.5 rounded-full mr-2"></div>
                                        <span className="3xl:text-sm text-xs">Active</span>
                                    </div>
                                    <div
                                        className={`flex 3xl:py-2.5 py-1.5 cursor-pointer items-center px-3 font-normal text-heading rounded-b-lg ${status === "1" &&
                                            "bg-primary-v10 text-error font-semibold"
                                            }`}
                                        onClick={() => {
                                            statusChange("1");
                                        }}
                                    >
                                        <div className="bg-error h-2.5 w-2.5 rounded-full mr-2"></div>
                                        <span className="3xl:text-sm text-xs">Inactive</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* <div
                            className="flex 3xl:py-2.5 py-1.5 cursor-pointer items-center px-3 font-normal text-heading hover:bg-primary-v10 hover:text-primary hover:font-semibold"
                            onClick={onProfileClick}
                        >
                            <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px] mr-[18px] cursor-pointer">
                                <Legacy src={profileIcon} alt="profile-Icon" layout="fill" />
                            </div>
                            <span className="3xl:text-sm text-xs">Profile</span>
                        </div> */}
                        <div
                            className="flex 3xl:py-2.5 py-1.5 cursor-pointer items-center px-3 font-normal text-heading hover:bg-primary-v10 hover:text-primary hover:font-semibold"
                            onClick={onLogoutClick}
                        >
                            <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px] mr-[18px] cursor-pointer">
                                <Legacy src={logoutIcon} alt="logout-Icon" layout="fill" />
                            </div>
                            <span className="3xl:text-sm text-xs">Sign out</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LogoutPopup;
