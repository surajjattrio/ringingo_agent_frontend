"use client";
import Image from "next/image";

// PROJECT IMPORTS
import { LAYOUT } from "@/config/constant";
import Layouts from "@/components/layouts";
import SidePanel from "@/components/login/SidePanel";

import { useState, useLayoutEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { Helmet } from "react-helmet";
import { getTenantPersonalization } from "@/redux/slice/tenantSlice";
import getDomain from "@/utils/GetDoamin";

// ASSETS
const logo = process.env.EXPANDED_LOGO;
// const logo = "/assets/images/aargon-expanded-logo.png";
const baseUrl = process.env.BASE_URL;
const FaviconIcon = process.env.COLLAPSED_LOGO;
// const FaviconIcon = "/assets/images/Byte-collapsed-logo.png";

// const FaviconIcon = "/assets/images/aargon-favicon2.ico";

/* ============================== LAYOUT ============================== */

export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  const [personalizeData, setPersonalizeData] = useState<any>({});
  const [logo, setLogo] = useState(process.env.EXPANDED_LOGO);
  // const [logo, setLogo] = useState("/assets/images/aargon-expanded-logo.png");

  const domain = getDomain();

  const getTenantPersonalizeData = async () => {
    setLoading(true);
    try {
      const res: any = await dispatch(
        getTenantPersonalization(domain)
      ).unwrap();
      if (res?.statusCode === 200) {
        setPersonalizeData(res?.data);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Get Tenant Personlize Data Err =-=>", err);
    }
  };

  useLayoutEffect(() => {
    getTenantPersonalizeData();

    // 🚫 Prevent scrollbars on login layout
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    return () => {
      // ✅ Clean up when navigating away
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  return (
    <>
      {personalizeData?.title && personalizeData?.faviconfile ? (
        <Helmet>
          <title>{personalizeData.title}</title>
          <link
            rel="icon"
            type="image/svg"
            href={baseUrl + `/tenant/download/${personalizeData?.faviconfile}`}
          />
        </Helmet>
      ) : (
        <Helmet>
          <title>{process.env.TITLE}</title>
          <link rel="icon" href={FaviconIcon} />
        </Helmet>
      )}
      <Layouts variant={LAYOUT.minimal}>
        <div
          className="flex justify-center items-center h-screen w-screen overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/assets/images/LoginBg.png")',
            //   backgroundRepeat: "no-repeat",
            //   backgroundSize: "100% 100%",
            //   backgroundColor: "rgba(255, 255, 255, 10)",
          }}
        >
          <div className="p-5 rounded-md">{children}</div>
          {/* Sidepanle login page*/}
          {/* <div className="select-none max-w-[65%] xl:max-w-[55%] 2lg:max-w-[55%] lg:max-w-[50%] smd:max-w-full p-8 sm:px-4 2md:py-20 w-full bg-secondary-v10">
                        <SidePanel />
                    </div> */}
        </div>
      </Layouts>
    </>
  );
}
