import React from "react";
import Legacy from "next/legacy/image";
import { platformOptions } from "@/config/options";

// TYPES
interface ChatPlatformPopupProps {
  selectedPlatform: any;
  setSelectedPlatform: Function;
  platformIcons: any;
  visible: boolean;
  onCancleClick?: any;
}

/* ============================== LOGOUT POPUP ============================== */

const ChatPlatformPopup = (props: ChatPlatformPopupProps) => {
  const {
    visible,
    onCancleClick,
    selectedPlatform,
    setSelectedPlatform,
    platformIcons,
  } = props;

  const iconClass =
    "relative 3xl:w-[18px] 3xl:h-[18px] w-[14px] h-[14px] cursor-pointer px-2";

  const onPlatformSelect = (platform: any) => {
    setSelectedPlatform(platform);
    onCancleClick();
  };

  return (
    <>
      <div
        className={`absolute bottom-8 left-0 z-50 md:inset-0 h-[80px] ${
          !visible && "hidden"
        }`}
        onClick={() => {
          onCancleClick();
        }}
      >
        <div className="w-full h-full relative flex justify-center">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`3xl:w-[100px] w-[95px] bg-white rounded-lg py-2 px-1 drop-shadow-xl ${
              !visible && "hidden"
            }`}
          >
            {platformOptions?.map((platform: any, index: number) => {
              if (platform.value !== selectedPlatform?.value) {
                return (
                  <div
                    key={index}
                    className="flex items-center p-1 cursor-pointer hover:bg-[#2C99FE40]"
                    onClick={() => onPlatformSelect(platform)}
                  >
                    <div className={iconClass}>
                      <Legacy
                        src={platformIcons[platform?.value]}
                        alt={platform?.value}
                        layout="fill"
                      />
                    </div>
                    <div className="text-[10px] px-2">{platform?.label}</div>
                  </div>
                );
              } else {
                return null;
              }
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPlatformPopup;
