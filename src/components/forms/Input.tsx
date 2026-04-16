"use client";

import Icon, { IconKey } from "../ui-components/Icon";

interface InputProps {
  isLogin?: boolean;
  className?: string;
  inputClassName?: string;
  label?: any;
  type?: string;
  name: string;
  value?: string | number;
  placeholder?: string;
  icon?: IconKey;
  rightIcon?: IconKey;
  tooltip?: string;
  rightTooltip?: string;
  // touched?: Record<string, boolean>;
  touched?: Record<string, boolean>;
  errors?: Record<string, string>;
  isInfo?: boolean;
  isShowLabel?: boolean;
  noSpace?: boolean;
  disabled?: boolean;
  onChange?: (e: any) => void;
  onFocus?: () => void;
  onBlur?: (e: any) => void;
  onClick?: () => void;
  onIconClick?: () => void;
  onRightIconClick?: () => void;
}

const Input = ({
  isLogin = false,
  className = "",
  inputClassName = "",
  label,
  type = "text",
  name,
  value,
  placeholder = "Enter value",
  disabled,
  icon,
  rightIcon,
  tooltip,
  rightTooltip,
  touched,
  errors,
  isInfo = false,
  isShowLabel = true,
  noSpace = false,
  onChange,
  onFocus,
  onBlur,
  onClick,
  onIconClick,
  onRightIconClick,
}: InputProps) => {
  const hasError = touched?.[name] && errors?.[name];
  const showLabelAsFloating = Boolean(value);

  return (
    <div className={`relative w-full  ${className}`}>
      {isShowLabel && (
        <label
          htmlFor={name}
          className={`absolute left-9 text-xs transition-all duration-200 z-10 bg-white px-1
            ${showLabelAsFloating
              ? "-top-2 text-[#322996] font-medium"
              : "top-3 text-gray-500"
            }
            pointer-events-none
            ${isLogin == true ? "max-w-[170px]" : "max-w-[100px]"}`}
        >
          {(label || name).length > 11
            ? `${(label || name).slice(0, 10)}...`
            : label || name}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <Icon
            name={icon}
            tooltip={tooltip}
            onClick={onIconClick}
            className="absolute left-3 z-10 text-dark-500 cursor-pointer"
            width={25}
            height={20}
          />
        )}

        <input
          id={name}
          name={name}
          
          type={type}
          value={value}
          autoComplete="off"
          placeholder={isShowLabel ? "" : placeholder}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={onClick}
          onChange={(e) => {
            const newVal = noSpace
              ? e.target.value?.replace(/\s/g, "")
              : e.target.value;
            onChange?.({
              target: {
                name,
                value: newVal,
                id: e.target.id,
              },
            });
          }}
          className={`focus:outline-none border-2 text-xs placeholder:text-txt-secondary rounded-md focus:border-[#322996] ${isLogin == true
            ? "3xl:py-2 py-1 h-11 pl-9 pr-10 w-full"
            : "py-2.5 h-10 pl-10 pr-10 w-full"
            }    
            ${icon ? "pl-10" : "pl-4"} pr-10
            placeholder-transparent
            ${hasError
              ? "border-error"
              : "border-dark-300 hover:border-dark-500 focus:border-[#322996]"
            }
            ${inputClassName}`}
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

      {hasError && (
        <p className="text-error text-[9px] mt-1 animate-fade-in">
          {errors?.[name]}
        </p>
      )}
    </div>
  );
};

export default Input;
