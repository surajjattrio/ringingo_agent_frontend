// PROJECT IMPORTS
import LoginForm from "@/components/login/LoginForm";

/* ============================== LOGIN PAGE ============================== */

const Login = () => {
  return (
    <>
      <div className="px-14  2lg:px-10 lg:px-8 2md:pb-24 2md:px-20 sm:px-2 sm:pb-10">
        {/* <div>
          <span className="text-heading font-bold text-2xl lg:text-xl smd:text-lg">
            Login to ItsMyCallCenter
          </span>
        </div> */}
        <div className="sm:py-5">
          <LoginForm />
        </div>
      </div>
    </>
  );
};

export default Login;
