import Legacy from "next/legacy/image";

// TYPES
interface ButtonProps {
  type?: "submit" | "button" | "reset" | undefined;
  className?: string;
  text?: string;
  icon?: string;
  tooltip?: string;
  style?: string;
  disabled?: boolean;
  onClick?: any;
  isLoading?: boolean;
  loaderClass?: string;
  form?: string;
}

// ASSETS
const PlusIcon = "/assets/icons/white/plus.svg";
const editIcon = "/assets/icons/white/edit.svg";
const followUp = "/assets/icons/white/followUp.svg";
const transfer = "/assets/icons/gray/transfer.svg";
const whatsappBlue = "/assets/icons/blue/whatsapp.svg";
const blackList = "/assets/icons/white/hand-right.svg";

const backIcon = "/assets/icons/back-icon.svg";
const plus = "/assets/icons/add.svg";
const SaveBtn = "/assets/icons/followUpPopUp/followUpSave.svg";
const DoneBtn = "/assets/icons/followUpPopUp/followUpDone.svg";
const LoginIcon = "/assets/icons/white/login-icon.svg";


/* ============================== BUTTON ============================== */

const Button = (props: ButtonProps) => {
  const {
    type = "button",
    className,
    text,
    icon,
    style = "primary",
    disabled,
    onClick,
    isLoading = false,
    loaderClass,
    form,
  } = props;

  const styles: any = {
    save: "bg-button-background text-white",
    primary: "bg-primary text-white",
    "primary-green": "bg-primary-green text-white",
    "primary-outline": "bg-transparent border-2 border-primary text-heading",
    "primary-green-outline":
      "bg-transparent border-2 border-primary-green text-heading",
    "primary-outline-text":
      "bg-transparent border-2 border-primary text-primary",
    secondary: "bg-secondary text-white",
    "secondary-outline":
      "bg-transparent border-2 border-secondary text-heading",
    error: "bg-error text-white",
    "error-outline": "bg-transparent border-2 border-error text-heading",
    dark: "bg-dark-700 text-txt-primary",
    "dark-outline": "bg-transparent border-2 border-dark-700 text-heading",
    "dark-transparent":
      "bg-transparent border-2 border-dark-700 text-txt-primary",
  };

  const icons: any = {
    backIcon,
    plus,
    SaveBtn,
    DoneBtn,
    //WHITE ICONS
    "plus-white": PlusIcon,
    "LoginIcon": LoginIcon,
    "edit-white": editIcon,
    "followUp-white": followUp,
    "transfer-gray": transfer,
    whatsapp: whatsappBlue,
    "blackList-white": blackList,
  };

  return (
    <>
      <div className="hover:bg-opacity-60 ">
        <button
          form={form}
          className={`flex items-center font-bold 3xl:text-sm text-xs rounded-[10px] justify-center whitespace-nowrap  ${styles[style]} ${className}`}
          type={type}
          disabled={disabled}
          onClick={onClick}
        >
          {icon && (
            <div className="relative w-[17px] h-[17px] 3xl:w-[20px] 3xl:h-[20px] mr-1 ml-1">
              <Legacy layout="fill" src={icons[icon]} alt={icon} />
            </div>
          )}
          {isLoading && (
            <div
              className={`${loaderClass} mr-2 h-4 w-4 border-t-transparent border-spacing-1 animate-spin rounded-full border-white border-2`}
            ></div>
          )}
          {text}
        </button>
      </div>
    </>
  );
};

export default Button;
