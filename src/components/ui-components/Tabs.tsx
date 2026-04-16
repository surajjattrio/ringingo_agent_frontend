"use client";
import { Fragment } from "react";
import Legacy from "next/legacy/image";
import LeadInformationTab from "@/components/call-center-components/phone/LeadInformationTab";


// TYPES
interface TabsProps {
  className?: string;
  children?: React.ReactNode;
  data: any;
  active?: string;
  onChange?: any;
  tabClass?: any;
  tabType?: string;
}

// ASSETS

/* NORMAL ICONS */
const Call_history = "/assets/icons/call/call-history.svg";
const Call_missed = "/assets/icons/call/call-missed.svg";
const Call_voicemails = "/assets/icons/call/call-voicemail.svg";
const Chat_notification = "/assets/icons/chat-notification.svg";
const Call_note = "/assets/icons/call-note.svg";
const Call_History = "/assets/icons/call-history.svg";

/* ============================== TABS ============================== */

const Tabs = (props: TabsProps) => {
  const { className, children, data, active, onChange, tabClass, tabType } =
    props;

  const icons: any = {
    "call-history": Call_history,
    "call-missed": Call_missed,
    "call-voicemails": Call_voicemails,
    "chat-notification": Chat_notification,
    "call-note": Call_note,
    "call-history2": Call_History,
  };

  return (
    <>
      <div
        className={`${
          tabType === "dashboard"
            ? "border border-dark-800"
            : "rounded-lg drop-shadow-lg"
        } h-full bg-white`}
      >
        <div>
          <ul
            className={`${className} bg-layout ${
              tabType !== "dashboard" ? "rounded-t-lg" : ""
            }  h-full`}
          >
            {data?.map((val: any, idx: number, array: any[]) => {
              const isActive = active === val?.id;
              const icon = val?.icon;
              return (
                <div
                  key={idx}
                  className={`${
                    idx === array.length - 1 && "border-s-2 border-dark-700"
                  } ${idx === 0 && "border-e-2 border-dark-700"} ${
                    isActive
                      ? "border-b-primary border-b-[3px]"
                      : "border-dark-700 border-b-2"
                  } ${tabType === "dashboard" ? "h-[5.8vh]" : ""}`}
                >
                  <li
                    className="cursor-pointer"
                    key={idx}
                    onClick={() => {
                      onChange(val?.id);
                    }}
                  >
                    <span
                      className={`flex justify-center smd:justify-evenly items-center 3xl:p-2.5 p-1.5 gap-2 smd:gap-0 rounded-t-l group ${
                        tabType === "dashboard" ? "h-[5.8vh]" : ""
                      }`}
                    >
                      <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                        <Legacy
                          src={icons[icon]}
                          alt="tab-icon"
                          layout="fill"
                        />
                      </div>
                      <p
                        className={`3xl:text-sm flex items-center gap-3 text-xs ${
                          isActive
                            ? "font-bold text-heading"
                            : "font-normal text-txt-primary"
                        }`}
                      >
                        {val?.title}
                        {val.base && val.base > 0 ? (
                          <div className="bg-primary rounded-full flex justify-center items-center h-4 w-4">
                            <span className="text-[10px] font-medium text-white">
                              {val.base}
                            </span>
                          </div>
                        ) : null}
                      </p>
                    </span>
                  </li>
                </div>
              );
            })}
          </ul>
        </div>
        <div
          className={`3xl:pt-2 pt-1 3xl:pb-6 pb-4 bg-white rounded-b-lg ${tabClass}`}
        >
          {data?.map((val: any, index: number) => {
            const { component: Component } = val;
            if (val?.id === active && Component) {
              return (
                <Fragment key={index}>
                  <Component />
                  {/* <LeadInformationTab/> */}
                </Fragment>
              );
            }
          })}
        </div>
      </div>
    </>
  );
};

export default Tabs;









