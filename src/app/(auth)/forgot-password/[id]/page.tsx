// PROJECT IMPORTS
import ChangePasswordForm from "@/components/login/ChangePasswordForm";

/* ============================== CHANGE PASSWORD PAGE ============================== */

const ChangePassword = () => {
  return (
    <>
      <div className="px-14 pt-24 2lg:px-10 lg:px-8 2md:pb-24 2md:px-20 sm:px-2 sm:pb-10">
        <div>
          <span className="text-heading font-bold text-2xl lg:text-xl smd:text-lg">
            Reset your Password
          </span>
        </div>
        <div className="pt-10 sm:py-5">
          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
