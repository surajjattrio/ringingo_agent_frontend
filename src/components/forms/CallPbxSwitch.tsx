

"use client";
import React from "react";
import Image from "next/image";

// ASSETS
const call = "/assets/icons/primary/call.svg";
const headphone = "/assets/icons/primary/headphone.svg";

// TYPES
interface LabelSwitchProps {
  checked?: boolean;
  onChange?: any;
}

/* ============================== CALL PBX SWITCH ============================== */

const CallPbxSwitch = (props: LabelSwitchProps) => {
  const { checked, onChange } = props;

  return (
    <>
      <div className="relative flex flex-col items-center justify-center overflow-hidden">
        <div className="flex items-center">
          {/* <span
            className={`mr-2 text-[11px] 3xl:text-xs ${
              !checked
                ? "font-semibold text-heading"
                : "font-normal text-txt-secondary"
            }`}
          >
            Call Center
          </span> */}
          {/* <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={checked}
              onChange={onChange}
            />
            <div
              className={w-[50px] h-[20px] 3xl:w-[64px] 3xl:h-[25px] rounded-full transition bg-button-background}
            ></div>
            <div
              className={`dot absolute ${
                checked
                  ? "translate-x-[32px] 3xl:translate-x-[41px]"
                  : "translate-x-[2px] 3xl:translate-x-[3px]"
              } top-0.75 3xl:top-[0.15rem] flex h-4 w-4 3xl:h-5 3xl:w-5 items-center justify-center rounded-full bg-white transition`}
            >
              <span>
                <Image
                  src={checked ? call : headphone}
                  alt="call"
                  height={12}
                  width={12}
                />
              </span>
            </div>
          </label> */}
          {/* <span
            className={`ml-2 text-[11px] 3xl:text-xs ${
              checked
                ? "font-semibold text-heading"
                : "font-normal text-txt-secondary"
            }`}
          >
            PBX
          </span> */}
        </div>
      </div>
    </>
  );
};

export default CallPbxSwitch;