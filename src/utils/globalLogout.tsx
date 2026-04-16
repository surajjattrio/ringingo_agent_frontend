import { userAgentUnRegistration } from "@/components/pbx-components/calling/CallingModal";
import { Danger } from "@/redux/services/toasterService";

const globalLogout = (logoutFunction: any, user: any) => {
  console.log("SOCKET SET");

  console.log("USER DETAILS");
  console.log(user);
  Danger("Your Account Logged in Another Browser..!!");
  logoutFunction(user?.agent_detail?.uuid, "autologout");
  userAgentUnRegistration();
};

export default globalLogout;
