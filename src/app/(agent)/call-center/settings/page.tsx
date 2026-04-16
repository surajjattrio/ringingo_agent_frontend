// PROJECT IMPORTS
import ChangePassword from "@/components/pbx-components/settings/ChangePassword";

/* ============================== SETTINGS PAGE ============================== */
const Settings = () => {
  return (
    <>
      <div className="relative bg-white rounded-lg drop-shadow-xl h-[calc(100vh-100px)] 3xl:h-[calc(100vh-125px)] smd:h-[calc(100vh-165px)]">
        <div className="sticky top-0 text-heading font-bold bg-dark-800 rounded-t-lg py-2 px-4 text-sm">
          <span>Change Password</span>
        </div>
        <ChangePassword />
      </div>
    </>
  );
};

export default Settings;
