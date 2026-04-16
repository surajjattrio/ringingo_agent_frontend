// TYPES
import { NavItemsTypes } from "@/types/menuItemTypes";

// ASSETS
// sidebar new icon

const newPhone = "/assets/icons/gray/sidebarPhone.svg";
const newMyLead = "/assets/icons/gray/sidebarMyLead.svg";
const newRecording = "/assets/icons/gray/sidebarRecording.svg";
const newCallLog = "/assets/icons/gray/sidebarMyCallLog.svg";

/* NORMAL ICONS */
const Phone = "/assets/icons/gray/call.svg";
const Message = "/assets/icons/chat-notification.svg";
const My_Lead = "/assets/icons/gray/calling.svg";
const Recording = "/assets/icons/gray/record.svg";
const CDR_Report = "/assets/icons/gray/report.svg";
const Login_Logout_Report = "/assets/icons/gray/calendar.svg";
const Settings = "/assets/icons/gray/setting.svg";
const FollowUp = "/assets/icons/gray/followUp.svg";

/* ACTIVE ICONS */
const Active_Phone = "/assets/icons/gray/call.svg";
const Active_My_Lead = "/assets/icons/gray/calling.svg";
const Active_Recording = "/assets/icons/gray/record.svg";
const Active_CDR_Report = "/assets/icons/gray/report.svg";
const Active_Login_Logout_Report = "/assets/icons/gray/calendar.svg";
const Active_Settings = "/assets/icons/gray/setting.svg";
const Active_FollowUp = "/assets/icons/gray/followUp.svg";

/* ============================== MENU ITEMS ============================== */

export const PbxMenuList: NavItemsTypes[] = [
  {
    id: "phone",
    icon: newPhone,
    activeIcon: Active_Phone,
    title: "Webphone",
    url: "/pbx/phone",
  },
  {
    id: "my-leads",
    icon: newMyLead,
    activeIcon: Active_My_Lead,
    title: "Leads",
    url: "/pbx/my-leads",
  },
  {
    id: "recording",
    icon: newRecording,
    activeIcon: Active_Recording,
    title: "Recording",
    url: "/pbx/recording",
    roleId: "recording",
  },
  {
    id: "cdr-report",
    icon: newCallLog,
    activeIcon: Active_CDR_Report,
    title: "Call TimeLine",
    url: "/pbx/cdr-report",
    roleId: "call_report",
  },
  {
    id: "follow-up",
    icon: FollowUp,
    activeIcon: Active_FollowUp,
    title: "Follow Up",
    url: "/pbx/follow-up",
    roleId: "follow_up",
  },
  {
    id: "login-logout-report",
    icon: Login_Logout_Report,
    activeIcon: Active_Login_Logout_Report,
    title: "Login/Logout Report",
    url: "/pbx/login-logout-report",
    roleId: "login_logout_report",
  },
  {
    id: "settings",
    icon: Settings,
    activeIcon: Active_Settings,
    title: "Settings",
    url: "/pbx/settings",
    roleId: "settings",
  },
];

export const CallCenterMenuList: NavItemsTypes[] = [
  {
    id: "phone",
    icon: Phone,
    activeIcon: Active_Phone,
    title: "Phone",
    url: "/call-center/phone",
  },
  {
    id: "my-leads",
    icon: My_Lead,
    activeIcon: Active_My_Lead,
    title: "My Leads",
    url: "/call-center/my-leads",
  },
  {
    id: "recording",
    icon: Recording,
    activeIcon: Active_Recording,
    title: "Recording",
    url: "/call-center/recording",
    roleId: "recording",
  },
  {
    id: "cdr-report",
    icon: CDR_Report,
    activeIcon: Active_CDR_Report,
    title: "My Call Logs",
    url: "/call-center/cdr-report",
    roleId: "call_report",
  },
  {
    id: "follow-up",
    icon: FollowUp,
    activeIcon: Active_FollowUp,
    title: "Follow Up",
    url: "/call-center/follow-up",
    roleId: "follow_up",
  },
  {
    id: "login-logout-report",
    icon: Login_Logout_Report,
    activeIcon: Active_Login_Logout_Report,
    title: "Login/Logout Report",
    url: "/call-center/login-logout-report",
    roleId: "login_logout_report",
  },
  {
    id: "settings",
    icon: Settings,
    activeIcon: Active_Settings,
    title: "Settings",
    url: "/call-center/settings",
    roleId: "settings",
  },
  {
    id: "unallocated-leads",
    icon: My_Lead,
    activeIcon: Active_My_Lead,
    title: "Unallocated Leads",
    url: "/call-center/unallocated-leads",
    roleId: "unallocated_leads",
  },
  {
    id: "message",
    icon: Message,
    activeIcon: Active_Phone,
    title: "Message",
    url: "/call-center/message",
    roleId: "omni_messeging",
  },
  /* 
   {
    id: "insta",
    icon: Message,
    activeIcon: Active_Phone,
    title: "Insta",
    url: "/call-center/insta",
  }, */
];
