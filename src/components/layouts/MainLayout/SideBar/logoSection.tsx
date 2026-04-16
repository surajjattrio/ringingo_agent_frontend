"use client";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect } from "react";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { openDrawer, useDrawerOpen } from "@/redux/slice/commonSlice";
import { useRouter } from "next/navigation";
import getDomain from "@/utils/GetDoamin";
import { useAuth } from "@/contexts/hooks/useAuth";
import { getTenantPersonalization } from "@/redux/slice/tenantSlice";
import Icon from "@/components/ui-components/Icon";
// ASSETS
const logo = "/assets/images/BelSmartLogo.svg";
const menu = "/assets/icons/menu.svg";
const smallLogo = "/assets/images/icon.png";
const baseUrl = process.env.BASE_URL;

/* ============================== LOGO SECTION ============================== */

const LogoSection = () => {
  const dispatch = useAppDispatch();
  const isdrawerOpen = useDrawerOpen();
  const router = useRouter();
  const { user } = useAuth();

  const [personalizeData, setPersonalizeData] = useState<any>({});
  console.log(personalizeData);
  const domain = getDomain();

  const getTenantPersonalizeData = async () => {
    try {
      const res: any = await dispatch(
        getTenantPersonalization(domain)
      ).unwrap();
      if (res?.statusCode === 200) {
        setPersonalizeData(res?.data);
      }
    } catch (err) {
      console.error("Get Tenant Personlize Data Err =-=>", err);
    }
  };

  useLayoutEffect(() => {
    getTenantPersonalizeData();
  }, []);

  return (
    <>
      <div
        className={`relative  flex items-center justify-between h-[60px]  border-[#E5E7EB] px-3 ${
          isdrawerOpen ? "pl-4 " : ""
        }`}
      >
        <span
          className={`${
            isdrawerOpen
              ? "absolute bottom-0 left-5 w-[185px] border-b border-[#E5E7EB]"
              : "absolute bottom-0 left-4 w-[30px] border-b border-[#E5E7EB]"
          }`}
        ></span>
        {/* <span className="absolute bottom-0 left-5 w-[190px] border-b border-[#F5F5F5]"></span> */}
        <div
          className="cursor-pointer"
          onClick={() =>
            router.push(`${user?.isPbx ? "/pbx/phone" : "/call-center/phone"}`)
          }
        >
          {isdrawerOpen ? (
            <Icon className="w-[140px] h-12" name="MenuLogoExpandedImage" />
          ) : (
            <Icon className="w-8 h-8" name="MenuLogoCollapsedImage" />
          )}
        </div>
        <div
          onClick={() => {
            dispatch(openDrawer(!isdrawerOpen));
          }}
          // cursor-pointer p-1 hover:bg-white hover:shadow-sm rounded-[36px] transition-all duration-200
          className={` ${
            !isdrawerOpen &&
            "fixed left-[54px] top-[45px] bg-white shadow-sm z-30 rounded-[36px] p-[3px] hover:bg-white hover:shadow-sm cursor-pointer transition-all duration-200"
          }`}
        >
          <div
            className={`transition-transform duration-200 ${
              isdrawerOpen
                ? "rotate- fixed left-[225px] top-[45px] bg-white cursor-pointer  rounded-[36px] p-[3px] hover:bg-white hover:shadow-sm"
                : "rotate-180 "
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.5 19l-7-7 7-7"
                stroke={isdrawerOpen ? "#6B7280" : "#111827"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoSection;
