"use client";
import Image from "next/image";
import { useState, useLayoutEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { Helmet } from "react-helmet";
// PROJECT IMPORTS
import SidePanel from "@/components/login/SidePanel";
import LoginForm from "@/components/login/LoginForm";
import { LAYOUT } from "@/config/constant";
import Layouts from "@/components/layouts";
import getDomain from "@/utils/GetDoamin";
// ASSETS
const logo = process.env.EXPANDED_LOGO;
// const FaviconIcon = "/assets/images/Byte-collapsed-logo.png";
const FaviconIcon = process.env.COLLAPSED_LOGO;

// const logo = "/assets/images/aargon-expanded-logo.png";
// const FaviconIcon = "/assets/images/aargon-favicon2.ico";

import { getTenantPersonalization } from "@/redux/slice/tenantSlice";

/* ============================== LOGIN PAGE ============================== */

const baseUrl = process.env.BASE_URL;

const Login = () => {
  const dispatch = useAppDispatch();

  const domain = getDomain();
  console.log(domain, "domain");
  const [loading, setLoading] = useState<boolean>(false);
  const [personalizeData, setPersonalizeData] = useState<any>({});

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

    // 🚫 Fix for unwanted scrollbars
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
          className="flex justify-center items-center min-h-screen  bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/assets/images/LoginBg.png")',
            //   backgroundRepeat: "no-repeat",
            //   backgroundSize: "100% 100%",
            //   backgroundColor: "rgba(255, 255, 255, 10)",
          }}
        >
          <LoginForm />
        </div>
      </Layouts>
    </>
  );
};

export default Login;
