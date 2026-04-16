// PROJECT IMPORTS
import ProfileDetails from "@/components/pbx-components/profile/ProfileDetails";

/* ============================== PROFILE PAGE ============================== */

const Profile = () => {
  return (
    <>
      <div className="relative bg-white rounded-lg drop-shadow-xl max-h-[calc(100vh-125px)] min-h-[calc(100vh-125px)]">
        <div className="sticky top-0 text-heading font-bold bg-dark-800 rounded-t-lg py-2 px-4 text-sm">
          <span>Profile Configuration</span>
        </div>
        <ProfileDetails />
      </div>
    </>
  );
};

export default Profile;
