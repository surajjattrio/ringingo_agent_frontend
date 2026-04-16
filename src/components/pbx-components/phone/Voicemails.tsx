"use client";
import { Fragment, useEffect, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import {
  getVoicemailDetails,
  useIsVoicemailLoading,
  useVoicemailDetails,
} from "@/redux/slice/phoneSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Chip, Loader } from "../../ui-components";
import AudioPlay from "../../ui-components/AudioPlay";
//import { baseUrl } from "@/API/baseURL";
import { downloadFile } from "../../helperFunctions";

// THIRD-PARTY IMPORT
import { format } from "date-fns";
import { onDial } from "@/redux/slice/commonSlice";
import { useAuth } from "@/contexts/hooks/useAuth";

// ASSETS
const voice_mail = "/assets/icons/voice-mail.svg";
const call = "/assets/icons/green/call.svg";
const play_circle = "/assets/icons/red/play-circle.svg";
const stop_circle = "/assets/icons/red/stop-circle.svg";
const download = "/assets/icons/download.svg";

/* ============================== VOICE MAILS TAB ============================== */

const baseUrl = process.env.BASE_URL;

const Voicemails = () => {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<any>();
  const voicemailDetails = useVoicemailDetails();
  console.log("kjsasjdfskjd",voicemailDetails)
  const isVoicemailLoading = useIsVoicemailLoading();
  const { user } = useAuth();

  useEffect(() => {
    setData(voicemailDetails);
  }, [voicemailDetails]);

  // GET VOICE MAIL DETAILS
  const onVoicemailDetailsGet = async () => {
    try {
      await dispatch(getVoicemailDetails()).unwrap();
    } catch (error: any) {
      console.log("Get voicecall error ---->", error?.message);
    }
  };

  useEffect(() => {
    onVoicemailDetailsGet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GET PHONE NUMBER
  const getPhoneNumber = (val: any) => {
    let number = val?.cidNumber || "";
    return user?.isNumberMasking
      ? Array.from(number).length > 4
        ? Array.from(number).fill("X", 2, -2).join("")
        : Array.from(number).fill("X", 1, -1).join("")
      : number || "";
  };

  return (
    <>
      <div className="min-h-[calc(100vh-230px)] 3xl:min-h-[calc(100vh-270px)]">
        {data?.length ? (
          data?.map((val: any, idx: number) => {
            return (
              <Fragment key={idx}>
                <div className="border-b-2 border-dark-800">
                  <div
                    className={`grid grid-cols-12 3xl:py-2 py-1 px-3 smd:px-1.5 items-center ${idx === 0 && "3xl:pb-2 pb-1 pt-0"
                      }`}
                  >
                    <div className="col-span-4 smd:col-span-3 flex items-center">
                      <div className="mr-6 smd:mr-2 cursor-pointer">
                        <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                          <Legacy
                            src={voice_mail}
                            alt="voice_mail"
                            layout="fill"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="3xl:text-sm text-xs font-bold">
                          {val?.cidName}
                        </span>
                        <span className="3xl:text-xs text-[10px] font-normal text-txt-primary">
                          {getPhoneNumber(val)}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="3xl:text-xs text-[10px] font-normal text-txt-primary">
                        {val?.duration}
                      </span>
                    </div>
                    <div className="col-span-2 smd:col-span-3 flex flex-col items-center">
                      <span className="3xl:text-sm text-xs font-normal text-heading">
                        {val?.day}
                      </span>
                      <span className="3xl:text-xs text-[10px] font-normal text-txt-primary">
                        {format(new Date(val?.created_epoch), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="col-span-2 smd:col-span-3 flex flex-col items-center">
                      <span className="3xl:text-sm text-xs font-normal text-heading">
                        {format(new Date(val?.created_epoch), "h:mm a")}
                      </span>
                      <span className="3xl:text-xs text-[10px] font-normal text-txt-primary">
                        Missed Call
                      </span>
                    </div>
                    <div className="col-span-3 smd:col-span-2 smd:gap-1 flex items-center gap-4 justify-end">
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          const nData = [...data];
                          const newData = nData?.map((x, index) => ({
                            ...x,
                            isPlay: index == idx ? !x.isPlay : false,
                          }));
                          setData(newData);
                        }}
                      >
                        <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                          <Legacy
                            src={val?.isPlay ? stop_circle : play_circle}
                            alt="play"
                            layout="fill"
                          />
                        </div>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          let src = `${baseUrl +
                            "/voicemail/download/voicemail?voicemail=" +
                            val?.path
                            }`;
                          downloadFile(src, val?.cidName);
                        }}
                      >
                        <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                          <Legacy src={download} alt="download" layout="fill" />
                        </div>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          dispatch(onDial(val?.cidNumber));
                        }}
                      >
                        <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                          <Legacy src={call} alt="call" layout="fill" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {val?.isPlay && (
                    <div className="3xl:pb-4 pb-1 w-full">
                      <AudioPlay
                        audioFile={`${baseUrl +
                          "/voicemail/download/voicemail?voicemail=" +
                          val?.path
                          }`}
                      />
                    </div>
                  )}
                </div>
              </Fragment>
            );
          })
        ) : (
          <div className="min-h-[calc(100vh-230px)] 3xl:min-h-[calc(100vh-270px)] h-full w-full flex justify-center items-center">
            {isVoicemailLoading ? (
              <Loader />
            ) : (
              <Chip title="Record Not Found" />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Voicemails;
