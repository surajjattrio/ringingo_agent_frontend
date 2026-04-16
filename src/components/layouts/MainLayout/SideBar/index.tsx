"use client";
import { memo, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Icon, { IconKey } from "../../../ui-components/Icon";


// PROJECT IMPORTS
import {
  openDrawer,
  useDrawerOpen,
  useDueFollowUp,
  useUpcomingFollowUp,
} from "@/redux/slice/commonSlice";
import LogoSection from "./logoSection";
import { CallCenterMenuList, PbxMenuList } from "./menuItems";
import { useAuth } from "@/contexts/hooks/useAuth";
import { useAppDispatch } from "@/redux/hooks";


interface InputProps {
  icon?: IconKey;
}

/* ============================== SIDEBAR ============================== */

const SideBar = (props: InputProps) => {
  const { icon } = props;
  const isdrawerOpen = useDrawerOpen();
  const pathname = usePathname();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const upComingFollowUpList = useUpcomingFollowUp();
  const dueFollowUpList = useDueFollowUp();
  const [data, setData] = useState<any>(
    user?.isPbx ? PbxMenuList : CallCenterMenuList
  );

  useEffect(() => {
    if (window.innerWidth < 821) {
      dispatch(openDrawer(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window]);

  return (
    <div
      className={`fixed h-full  bg-[#FFFFFF] z-50 drop-shadow-lg border-r border-[#E5E7EB] transition-all rounded-r-[20px] ${
        isdrawerOpen ? "w-[240px]" : "w-[70px]"
      }`}
    >
      <LogoSection />
      <div className={`h-full pt-6 ${isdrawerOpen ? "px-2" : ""}`}>
        {data &&
          data
            .filter((value: any) =>
            {
            const messagingAllowed =
            user?.permission?.whatsapp === "0" ||
            user?.permission?.instagram === "0" ||
            user?.permission?.facebook === "0";
              return value?.roleId && user?.permission[value?.roleId]
                ? user?.permission[value?.roleId] === "0"
                : value?.roleId === "omni_messeging"? messagingAllowed:true
            }
            )
            .map((val: any, index: number) => {
              const array = pathname?.split("/");
              const isSelected = val?.id === array[2];
              return (
                <Link
                  key={index}
                  href={val.url}
                  className={`${
                    (val.url === "/pbx/follow-up" ||
                      val.url === "/call-center/follow-up") &&
                    (upComingFollowUpList?.length || dueFollowUpList?.length)
                      ? dueFollowUpList?.length
                        ? "bg-error animate-pulse"
                        : "bg-primary-green animate-pulse"
                      : ""
                  } w-full flex items-center px-3 py-3 mb-2 ${
                    !isdrawerOpen ? "justify-center" : "justify-between"
                  } ${
                    isSelected
                      ? "bg-[#F4F7FE] shadow-sm rounded-[10px]"
                      : "hover:bg-[#F4F7FE] hover:shadow-sm rounded-[10px]"
                  } transition-all duration-200`}
                  onClick={() => {
                    if (window.innerWidth < 821) {
                      dispatch(openDrawer(false));
                    }
                  }}
                >
                  <div className="flex items-center">
                    <Image
                      className={`mr-3 ${
                        isSelected ? "opacity-100" : "opacity-100"
                      }`}
                      src={val.icon}
                      alt={val.title}
                      width={20}
                      height={20}
                      style={{
                        filter: isSelected
                          ? "invert(19%) sepia(63%) saturate(3000%) hue-rotate(228deg) brightness(60%) contrast(106%)"
                          : "brightness(0.3)",
                      }}
                    />
                    {isdrawerOpen && (
                      <p
                        className={`text-sm font-lexend
                        ${
                          isSelected
                            ? "text-[#322996] font-normal"
                            : "text-[#8D8D8D] font-normal"
                        }`}
                      >
                        {val?.title}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
      </div>

      {isdrawerOpen && (
        <div className="absolute bottom-0 w-full border-[#E5E7EB] py-4">
          <div className={`flex flex-col px-4`}>
            <p className="text-[14px] font-lexend text-[#7D7D7D]">Powered by</p>
            <div className="flex items-center gap-1">
              <Icon 
                name={"sidebarCallcenter"}
                className="cursor-pointer"
                width={25}
                height={25}
              />
              <p className="font-bold font-lexend text-[27px]  text-[black]">RINGINGO</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SideBar);
