// PROJECT IMPORTS
import EditProfileDetails from "@/components/pbx-components/profile/EditProfileDetails";

/* ============================== PROFILE EDIT PAGE ============================== */

const Profile = () => {
  return (
    <>
      <div className="relative bg-white rounded-lg drop-shadow-xl max-h-[calc(100vh-125px)] min-h-[calc(100vh-125px)] scrollbar-hide overflow-y-scroll">
        <div className="sticky top-0 z-[4] text-heading font-bold bg-dark-800 rounded-t-lg py-2 px-4 text-sm">
          <span>Profile Configuration</span>
        </div>
        <EditProfileDetails />
      </div>
    </>
  );
};

export default Profile;
