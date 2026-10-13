import Image from "next/image";
import Legacy from "next/legacy/image";

// TYPES
export type IconKey = keyof typeof icons;
interface IconProps {
    className?: string;
    name: IconKey;
    alt?: string;
    width?: number;
    height?: number;
    onClick?: () => void;
    tooltip?: string;
    disabled?: boolean; 
}

// ASSETS
const icons = {

  ImageIcon : "/assets/images/photo.svg",
  FollowUpImage : "/assets/images/FeaturedIcon.svg",
  NewLogo:"/assets/images/ringingo-new-logo.png",
  CollapsedNewLogo:"/assets/images/Ringingo-Logo-new.png",
  // Login Logo
  LoginLogo:"/assets/images/LoginLogo1.svg",

  ChatHistory: "/assets/icons/gray/report.svg",
  Setting: "/assets/icons/gray/setting.svg",
  MenuLogoExpandedImage: "/assets/images/ringingo_expanded_logo.svg",
  // MenuLogoCollapsedImage: "/assets/images/Byte-collapsed-logo.png",
  MenuLogoCollapsedImage: "/assets/images/ringingo_collapsed_logo.svg",
//   Lock: "/assets/icons/lock.svg",
  Lock: "/assets/icons/blue/Lock.svg",

  Eye: "/assets/icons/eye.svg",
  EyeCloseGray: "/assets/icons/gray/Eye off.svg",
  sidebarCallcenter: "/assets/icons/sidebar_callcenter.svg",
  callrecording: "/assets/icons/red/call-recording.svg",


  // MenuLogoExpandedImage: "/assets/images/aargon-expanded-logo.png",
  // MenuLogoCollapsedImage: "/assets/images/aargon-collapsed-logo.png",

  firstName: "/assets/icons/createLead/createLeadFirstName.svg",
  leadGroup: "/assets/icons/createLead/leadGroup.svg",

  userLogin: "/assets/icons/blue/User.svg",
//   userLogin: "/assets/icons/createLead/createLeadFirstName.svg",
  
  callicon: "/assets/icons/createLead/callIcon.svg",
  provinence: "/assets/icons/createLead/provinence.svg",
  Mail: "/assets/icons/createLead/Mail.svg",

  postalcode: "/assets/icons/createLead/postalcode.svg",



  eye: "/assets/icons/eye.svg",
  user: "/assets/icons/user.svg",
  infoCircle: "/assets/icons/info-circle.svg",
  email: "/assets/icons/email.svg",
  lockGray: "/assets/icons/gray/lock.svg",
  eyeGray: "/assets/icons/gray/eye.svg",
  locationGray: "/assets/icons/gray/location.svg",
  callGray: "/assets/icons/gray/call.svg",
  CalendarGray: "/assets/icons/gray/date-picker.svg",
  textarea: "/assets/icons/textAreaIcon.svg",
  LoginIcon: "/assets/icons/white/login-icon.svg",
  clock: "/assets/icons/clock.svg",
 Refresh: "/assets/icons/refresh.svg",
  Copy: "/assets/icons/copy.svg",
};

const Photo = (
    props: Omit<IconProps, "tooltip" | "alt" | "name"> & {
        alt: string;
        src: string;
    }
) => {
    const { className = "", src, alt, width, height, onClick } = props;
    return (
        <>
            {width || height ? (
                <Image
                    className={`${className} ${onClick ? "cursor-pointer" : ""}`}
                    src={src}
                    alt={alt}
                    width={width || 10}
                    height={height || 10}
                    onClick={onClick}
                    unoptimized
                />
            ) : (
                <div
                    className={`${className} ${onClick ? "cursor-pointer" : ""} relative`}
                    onClick={onClick}
                >
                    <Legacy src={src} alt={alt} layout="fill" />
                </div>
            )}
        </>
    );
};
const Icon = (props: IconProps) => {
    const { className = "", name, alt, width, height, tooltip, onClick } = props;
    return (
        <>
            {tooltip ? (
                <div
                    className={`${className} ${onClick && "cursor-pointer"} group`}
                    onClick={onClick}
                >
                    <div className="relative">
                        <div className="absolute rounded-md bottom-[-1.5px] right-[-41px] min-w-[100px] flex-col items-center hidden group-hover:flex">
                            <span className="relative z-20 px-2 pt-1 pb-1.5 text-[11px] leading-none flex items-center text-white rounded-md whitespace-nowrap overflow-hidden bg-secondary shadow-lg">
                                {tooltip}
                            </span>
                            <div className="w-2.5 h-2.5 -mt-2 rotate-45 !bg-secondary"></div>
                        </div>
                    </div>
                    <Photo
                        className="max-w-[unset]"
                        src={icons[name]}
                        alt={alt ? alt : name ? name : "Icon"}
                        width={width}
                        height={height}
                    />
                </div>
            ) : (
                <Photo
                    className={`${className} max-w-[unset]`}
                    src={icons[name]}
                    alt={alt ? alt : name}
                    width={width}
                    height={height}
                    onClick={onClick}
                />
            )}
        </>
    );
};

export default Icon;

// src/components/Icon.tsx
// import React from "react";

// export type IconKey = keyof typeof icons;

// export interface IconProps {
//   name: IconKey;
//   alt?: string;
//   size?: number;
//   width?: number;
//   height?: number;
//   className?: string;
//   tooltip?: string;
//   disabled?: boolean;
//   onClick?: () => void;
// }

// /* -------------------------
//    Import all SVG icons
// ------------------------- */
// import ImageIcon from "@/assets/images/photo.svg";
// import FollowUpImage from "@/assets/images/FeaturedIcon.svg";
// import LoginLogo from "@/assets/images/LoginLogo1.svg";

// import ChatHistory from "@/assets/icons/gray/report.svg";
// import Setting from "@/assets/icons/gray/setting.svg";
// import MenuLogoExpandedImage from "@/assets/images/ringingo_expanded_logo.svg";
// import MenuLogoCollapsedImage from "@/assets/images/ringingo_collapsed_logo.svg";

// import Lock from "@/assets/icons/blue/Lock.svg";
// import Eye from "@/assets/icons/eye.svg";
// import EyeCloseGray from "@/assets/icons/gray/Eye off.svg"; // renamed file

// import sidebarCallcenter from "@/assets/icons/sidebar_callcenter.svg";
// import callrecording from "@/assets/icons/red/call-recording.svg";

// import firstName from "@/assets/icons/createLead/createLeadFirstName.svg";
// import leadGroup from "@/assets/icons/createLead/Leadgroup.svg";
// import userLogin from "@/assets/icons/blue/User.svg";
// import callicon from "@/assets/icons/createLead/callIcon.svg";
// import provinence from "@/assets/icons/createLead/provinence.svg";
// import Mail from "@/assets/icons/createLead/Mail.svg";
// import postalcode from "@/assets/icons/createLead/postalcode.svg";

// import user from "@/assets/icons/user.svg";
// import infoCircle from "@/assets/icons/info-circle.svg";
// import email from "@/assets/icons/email.svg";
// import lockGray from "@/assets/icons/gray/lock.svg";
// import eyeGray from "@/assets/icons/gray/eye.svg";
// import locationGray from "@/assets/icons/gray/location.svg";
// import callGray from "@/assets/icons/gray/call.svg";
// import CalendarGray from "@/assets/icons/gray/date-picker.svg";
// import textarea from "@/assets/icons/textAreaIcon.svg";
// import LoginIcon from "@/assets/icons/white/login-icon.svg";
// import clock from "@/assets/icons/clock.svg";

// /* -------------------------
//    Icons mapping
// ------------------------- */
// const icons = {
//   ImageIcon,
//   FollowUpImage,
//   LoginLogo,

//   ChatHistory,
//   Setting,
//   MenuLogoExpandedImage,
//   MenuLogoCollapsedImage,

//   Lock,
//   Eye,
//   EyeCloseGray,

//   sidebarCallcenter,
//   callrecording,

//   firstName,
//   leadGroup,
//   userLogin,
//   callicon,
//   provinence,
//   Mail,
//   postalcode,

//   user,
//   infoCircle,
//   email,
//   lockGray,
//   eyeGray,
//   locationGray,
//   callGray,
//   CalendarGray,
//   textarea,
//   LoginIcon,
//   clock,
// };

// /* -------------------------
//    Icon Renderer
// ------------------------- */
// const Icon: React.FC<IconProps> = ({
//   name,
//   alt,
//   size,
//   width,
//   height,
//   className = "",
//   tooltip,
//   disabled = false,
//   onClick,
// }) => {
//   const SvgIcon = icons[name];

//   const finalWidth = width ?? size ?? 22;
//   const finalHeight = height ?? size ?? 22;

//   const element = (
//     <SvgIcon
//       width={finalWidth}
//       height={finalHeight}
//       aria-label={alt || name}
//       className={`${className} ${
//         disabled ? "opacity-40 cursor-not-allowed" : onClick ? "cursor-pointer" : ""
//       }`}
//       onClick={!disabled ? onClick : undefined}
//     />
//   );

//   if (!tooltip) return element;

//   return (
//     <div className="relative inline-block group">
//       {element}
//       <span className="absolute hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded shadow top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-50">
//         {tooltip}
//       </span>
//     </div>
//   );
// };

// export default Icon;
