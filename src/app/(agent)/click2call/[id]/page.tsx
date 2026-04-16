"use client";
import React, { useEffect, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
//import { WSS_URL } from "@/API/baseURL";
const WSS_URL = process.env.WSS_URL;

// THIRD-PARTY IMPORT

import {
  Inviter,
  Registerer,
  SessionState,
  RegistererState,
  UserAgent,
  Referral,
} from "sip.js";
import * as crypto from "crypto";
import { OutgoingInviteRequest } from "sip.js/lib/core";
import { Danger, Success } from "@/redux/services/toasterService";
import { Button } from "@/components/forms";

// ASSETS
const call_end = "/assets/icons/white/call_end.svg";

let userAgent: any;
let outgoingSession: any;
let durationInterval: any;

/* ============================== CLICK TO CALL ============================== */

const Clicktocall = (params: any) => {
  //	Call duration state
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isShowCallDuration, setIsShowCallDuration] = useState<boolean>(false);
  const [isCallRinging, setIsCallRinging] = useState<boolean>(false);
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [isLoading, setLsLoading] = useState<boolean>(false);

  useEffect(() => {
    userAgentRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentUrl = window.location.href;
  const click2callValue = currentUrl.split("click2call/")[1];
  const ALGORITHM = "aes-256-cbc";
  const ENCRYPTION_KEY = "1234567890abcdefghijklmnopqrstuv";
  const PASSWORD_LENGTH = "1234567890abcdef";
  const iv = Buffer.alloc(16); // Initialization vector, must match what was used during encryption
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    PASSWORD_LENGTH
  );
  // Convert encrypted data from hex to Buffer
  const encryptedBuffer = Buffer.from(click2callValue, "hex");
  // Perform decryption
  let decrypted;
  try {
    decrypted = Buffer.concat([
      decipher?.update(encryptedBuffer),
      decipher?.final(),
    ]);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
  console.log(decrypted.toString("utf8"));
  //URL to convert--------------------------
  let data = decrypted.toString("utf8");

  const parts = data.split(":");
  const data_username = parts[0];
  const data_domain = parts[1];
  const data_pass = parts[2];
  const data_inputname = parts[3];

  console.log("data_username:", data_username);
  console.log("data_domain:", data_domain);
  console.log("data_pass:", data_pass);
  console.log("data_inputname:", data_inputname);

  // AGENT REGISTRATION---------------------------------------------
  const userAgentRegistration = () => {
    let username = data_username;
    let password = data_pass;
    let domain = data_domain;
    let number = data_username;
    let UAURI = UserAgent.makeURI("sip:" + username + "@" + domain);
    if (!UAURI) {
      throw new Error("Failed to create UserAgent URI ....");
    }
    setLsLoading(true);
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
      logBuiltinEnabled: true, //	Boolean - true or false - If true throws console logs
    };
    userAgent = new UserAgent(userOptions);
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
                setIsRegister(true);
                //outgoing call-------------------------------------------------
                const targetURI: any = UserAgent.makeURI(
                  "sip:" + number + "@" + domain
                );
                const inviter = new Inviter(userAgent, targetURI);
                inviter.delegate = {
                  // Handle outgoing REFER request.
                  onRefer(referral: Referral) {
                    //console.log("Handle outgoing REFER request.");
                    referral.accept().then(() => {
                      referral.makeInviter().invite();
                    });
                  },
                };
                outgoingSession = inviter;

                inviter.stateChange.addListener(
                  (callingState: SessionState) => {
                    console.log(
                      "outgoing callingState =========> ",
                      callingState
                    );
                    switch (callingState) {
                      case SessionState.Establishing:
                        console.log("Ringing on destination ....");
                        setIsCallRinging(true);
                        setLsLoading(false);
                        console.log(inviter);
                        break;

                      case SessionState.Established:
                        console.log("Call answered ....");
                        console.log(inviter);
                        callDuration(true); //	Call duration
                        setIsCallRinging(false);
                        setIsShowCallDuration(true);
                        setupRemoteMedia(inviter); //	Media audio control
                        setLsLoading(false);
                        break;

                      case SessionState.Terminated:
                        console.log("Call terminated ....");
                        cleanupMedia(); //	Stop media audio control
                        callDuration(false); //	Call duration
                        setIsCallRinging(false);
                        setIsShowCallDuration(false);
                        setLsLoading(false);
                        Success("Call Terminated");
                        break;

                      case SessionState.Terminating:
                        console.log("Call terminating ....");
                        callDuration(false); //	Call duration
                        setIsCallRinging(false);
                        setIsShowCallDuration(false);
                        setLsLoading(false);
                        Success("Call Terminated");
                        cleanupMedia(); //	Stop media audio control
                        break;

                      default:
                        console.log(
                          "Could not identified calling state while calling .... ",
                          callingState
                        );
                        callDuration(false); //	Call duration
                        setIsCallRinging(false);
                        setIsShowCallDuration(false);
                        setLsLoading(false);
                        break;
                    }
                  }
                );

                // Options including delegate to capture response messages
                const inviteOptions: any = {
                  requestDelegate: {
                    onAccept: (response: any) => {
                      //console.log(response.message);
                      console.log("Positive response ....");
                      console.log(response);
                    },
                    onReject: (response: any) => {
                      console.log("Negative response ....");
                      if (response.message.statusCode == 404) {
                        Danger("Call Failed");
                        setLsLoading(false);
                      }
                      console.log(response);
                    },
                    onProgress: (response: any) => {
                      console.log(response.message.statusCode);
                      console.log(
                        "183+180 Session Progress - Call is in progress."
                      );
                      if (response.message.statusCode == 183) {
                        // alert("183 Session Progress");
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
                break;
              case RegistererState.Unregistered:
                console.log("Unregistered ....");
                setIsRegister(false);
                setLsLoading(false);
                break;
              case RegistererState.Terminated:
                console.log("Terminated ....");
                setIsRegister(false);
                setLsLoading(false);
                break;
              default:
                console.log(
                  "Could not identified registration state .... ",
                  registrationState
                );
                setIsRegister(false);
                setLsLoading(false);
                break;
            }
          }
        );
        registerer
          .register()
          .then((request: any) => {
            console.log("Successfully sent REGISTER request .... ", request);
          })
          .catch((error: any) => {
            console.log("Failed to send REGISTER request .... ", error);
          });
      })
      .catch((error: any) => {
        console.log("Failed to connect user agent .... ", error);
      });

    //media------------------------------------
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
  };

  //	Call duration-----------------------
  const callDuration = async (callStatus: Boolean) => {
    if (callStatus === true) {
      var secs = 0;
      var mins = 0;
      durationInterval = setInterval(() => {
        if (secs < 60) {
          secs = secs + 1;
          setSeconds(secs);
        }
        if (secs >= 59) {
          secs = 0;
          mins = mins + 1;
          setSeconds(secs);
          setMinutes(mins);
        }
      }, 1000);
      // clearInterval(durationInterval);
    } else {
      setSeconds(0);
      setMinutes(0);
      clearInterval(durationInterval);
    }
  };

  //cleanupMedia-----------------------------
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

  //hangupcall----------------------------------
  const hangupCall = () => {
    try {
      //	Manage outgoing state on call hangup
      if (outgoingSession) {
        if (outgoingSession._state === "Establishing") {
          //alert('123');
          outgoingSession.cancel();
        } else if (outgoingSession._state === "Established") {
          //alert('456');
          outgoingSession.bye();
        }
      }
    } catch (error) {
      console.log("Incoming or Outgoing session not found - ", error);
    }
    //history.goBack();	//	Go back on disconnect
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="w-1/2 h-1/2 border-2 border-dark-800 bg-dark-950 drop-shadow-md rounded-md">
        <div>
          <audio id="mediaElement" controls style={{ display: "none" }}></audio>
        </div>
        <div className="flex flex-col gap-2 justify-center items-center h-full w-full">
          <div className="flex justify-start gap-2 items-center">
            <div
              className={`w-4 h-4 ${isRegister ? "bg-primary-green" : "bg-error"
                } rounded-full`}
            ></div>
            <span className="text-[32px] text-heading font-bold">
              {data_inputname}
            </span>
          </div>
          {isCallRinging ? (
            <span className="3xl:text-lg text-sm text-heading font-bold">
              Ringing
            </span>
          ) : (
            <span className="3xl:text-lg text-sm text-primary font-bold">
              {isShowCallDuration ? "Live Call" : "No Live Call"}
            </span>
          )}
          <div className="flex flex-col justify-center items-center">
            {isShowCallDuration ? (
              <>
                <span className="3xl:text-lg text-sm text-heading">
                  Established
                </span>
                <span className="3xl:text-lg text-sm text-heading font-bold">
                  {minutes < 10 ? `0${minutes}` : minutes} :{" "}
                  {seconds < 10 ? `0${seconds}` : seconds}
                </span>
              </>
            ) : null}
          </div>
          {isShowCallDuration || isCallRinging ? (
            <div
              className="bg-error 3xl:w-12 3xl:h-12 w-10 h-10 drop-shadow-sm flex justify-center items-center rounded-full hover:bg-opacity-80 cursor-pointer"
              onClick={() => {
                hangupCall();
              }}
            >
              <div className="relative w-[18px] h-[18px] 3xl:w-[24px] 3xl:h-[24px]">
                <Legacy src={call_end} alt="call_end" layout="fill" />
              </div>
            </div>
          ) : (
            <Button
              isLoading={isLoading}
              disabled={isLoading}
              text="Call Again"
              loaderClass="!border-primary-green !border-t-transparent"
              style="primary-green-outline"
              className="px-1.5 py-1"
              onClick={() => {
                userAgentRegistration();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Clicktocall;
