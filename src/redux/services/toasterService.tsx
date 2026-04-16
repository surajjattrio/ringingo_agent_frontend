"use client";
import Image from "next/image";

// THIRD-PARTY IMPORT IMPORTS
import { toast } from "react-toastify";

// ASSETS
const iconCloseSuccess = "/assets/icons/white/close.svg";
const iconCloseError = "/assets/icons/white/close.svg";
// const iconCloseError = "/assets/icons/red/close-circle.svg";

const CloseButtonSuccess = ({ closeToast }: { closeToast: any }) => (
  <div className="position-absolute top-0 end-0 me-1 mt-1">
    <Image
      src={iconCloseSuccess}
      width={18}
      height={18}
      alt="iconClose"
      onClick={closeToast}
    />
  </div>
);

const CloseButtonError = ({ closeToast }: { closeToast: any }) => (
  <div className="position-absolute top-0 end-0 me-1 mt-1">
    <Image
      src={iconCloseError}
      width={18}
      height={18}
      alt="iconClose"
      onClick={closeToast}
    />
  </div>
);

/* ============================== TOSTER SERVICES ============================== */

// SUCCESS TOSTER
export const Success = (msg: string) => {
  toast.success(
    <>
      <p className="text-sm font-bold text-white">Success</p>
      <p className="text-white text-xs mb-0">{msg}</p>
    </>,
    {
      className: "toaster-colors-primary",
      position: toast.POSITION.TOP_RIGHT,
      hideProgressBar: false,
      closeButton: CloseButtonSuccess,
      progressStyle: { background: "#ffffff" },
      icon: true,
      autoClose: 3000,
      theme: "colored",
    }
  );
};

// ERROR TOSTER
export const Danger = (msg: string) => {
  toast.error(
    <>
      <p className="text-sm font-bold text-white">Error</p>
      <p className="text-white text-xs mb-0">
        {msg ? msg : "Something Went Wrong!"}
      </p>
    </>,
    {
      className: "toaster-error-shadow",
      position: toast.POSITION.TOP_RIGHT,
      hideProgressBar: false,
      closeButton: CloseButtonError,
      progressStyle: { background: "#ffffff" },
      icon: true,
      autoClose: 3000,
      theme: "colored",
    }
  );
};

// WARNING TOSTER
export const Warning = (msg: string) => {
  toast.warn(
    <>
      <p className="text-sm font-bold text-white">Warning</p>
      <p className="text-white text-xs mb-0">{msg}</p>
    </>,
    {
      className: "toaster-warning-shadow",
      position: toast.POSITION.TOP_RIGHT,
      hideProgressBar: false,
      closeButton: CloseButtonError,
      progressStyle: { background: "#ffffff" },
      icon: true,
      autoClose: 3000,
      theme: "colored",
    }
  );
};
