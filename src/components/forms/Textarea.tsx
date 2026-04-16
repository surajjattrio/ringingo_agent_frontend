// PROJECT IMPORTS
import Icon, { IconKey } from "../ui-components/Icon";

// TYPES
interface TextareaProps {
  className?: string;
  label?: any;
  rows?: number;
  name: string;
  value?: string | number;
  placeholder?: string;
  tooltipRight?: boolean;
  isInfo?: boolean;
  isShowLabel?: boolean;
  touched?: any;
  errors?: any;
  onChange?: any;
  disabled?: boolean;
  onFocus?: any;
  onBlur?: any;
  icon?: IconKey;
  tooltip?: string;
  rightIcon?: IconKey;
  rightTooltip?: string;
  onIconClick?: () => void;
  onRightIconClick?: () => void;
}

// ASSETS
const infoCircle = "/assets/icons/info-circle.svg";

/* ============================== TEXTAREA ============================== */

const Textarea = (props: TextareaProps) => {
  const {
    className,
    label,
    name,
    rows = 3,
    value,
    icon,
    tooltip,
    placeholder,
    disabled,
    isInfo = true,
    tooltipRight = false,
    isShowLabel = true,
    touched,
    rightIcon,
    errors,
    onChange,
    onFocus,
    onBlur,
    rightTooltip,
    onIconClick,
    onRightIconClick,
  } = props;

  const showLabelAsFloating = Boolean(value);
  return (
    <div className={`${className} relative z-[0]`}>
      {isShowLabel && (
        <label
          htmlFor={name}
          className={`absolute left-9 text-xs transition-all duration-200 z-10 bg-white px-1
            ${
              showLabelAsFloating
                ? "-top-2 text-primary"
                : "top-3 text-dark-400"
            }
            pointer-events-none`}
        >
          {label || name}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <Icon
            name={icon}
            tooltip={tooltip}
            onClick={onIconClick}
            className="absolute left-3 top-[14px] z-10 text-dark-500 cursor-pointer"
            width={16}
            height={16}
          />
        )}

        <textarea
          className={`${className} focus:outline-none border-2 rounded-md focus:border-primary text-xs py-2.5 w-full pl-10 pr-10
                       ${icon ? "pl-10" : "pl-4"} pr-10
            placeholder-transparent
                        ${
                          touched && errors && touched[name] && errors[name]
                            ? "border-error"
                            : "border-dark-700"
                        }`}
          rows={rows}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onBlur={onBlur}
          onFocus={onFocus}
        />

        {rightIcon && (
          <Icon
            name={rightIcon}
            tooltip={rightTooltip}
            onClick={onRightIconClick}
            className="absolute right-3 text-dark-500 cursor-pointer"
            width={18}
            height={18}
          />
        )}
      </div>
      {touched && errors && touched[name] && errors[name] && (
        <span className="text-error font-normal text-[10px]">
          {errors[name]}
        </span>
      )}
    </div>
  );
};

export default Textarea;
