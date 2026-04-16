"use client";

//PROJECT IMPORT
import { useState } from "react";
import Icon from "../ui-components/Icon";

// TYPES
interface InputProps {
  className?: string;
  inputClassName?: string;
  label?: any;
  name: string;
  value?: string | number;
  placeholder?: string;
  isInfo?: boolean;
  isShowLabel?: boolean;
  touched?: any;
  errors?: any;
  onChange?: any;
  disabled?: boolean;
  onFocus?: any;
  onBlur?: any;
  onClick?: any;
}

/* ============================== PASSWORD INPUT ============================== */

const Password = (props: InputProps) => {
  const {
    className = "",
    inputClassName = "",
    label,
    name,
    value,
    placeholder = " Password",
    disabled,
    isInfo = false,
    isShowLabel = true,
    touched,
    errors,
    onChange,
    onFocus,
    onBlur,
    onClick,
  } = props;

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const hasError = touched?.[name] && errors?.[name];
  const showLabelAsFloating = Boolean(value);

  return (
    <div className={`relative w-full  ${className}`}>
      {isShowLabel && (
        <label
          htmlFor={name}
          className={`absolute left-9 text-xs transition-all duration-200 z-10 bg-white px-1
                        ${
                          showLabelAsFloating
                            ? "-top-2 text-[#322996] font-medium"
                            : "top-3.5 text-gray-500"
                        }
                        pointer-events-none`}
        >
          <span className="inline-block w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {label || name}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        <Icon
          name="Lock"
          className="absolute left-3 z-10 text-dark-500"
          width={25}
          height={20}
          alt="Lock"
        />

        <input
          autoComplete="new-password"
          id={name}
          type={showPassword ? "text" : "password"}
          className={`peer focus:outline-none border-2 text-xs placeholder:text-txt-secondary rounded-md focus:border-[#322996] 3xl:py-2 py-1 h-11 pl-9  pr-10 w-full
                        
                        ${
                          hasError
                            ? "border-error"
                            : "border-dark-300 hover:border-dark-500 focus:border-[#322996]"
                        }
                        ${inputClassName}`}
          name={name}
          placeholder={isShowLabel ? "" : placeholder}
          value={value}
          onChange={(e: any) => {
            onChange &&
              onChange({
                target: {
                  value: e.target.value?.toString(),
                  name,
                  id: e.target?.id,
                },
              });
          }}
          disabled={disabled}
          onBlur={onBlur}
          onFocus={onFocus}
          onClick={onClick}
        />

        <Icon
          name={showPassword ? "Eye" : "EyeCloseGray"}
          className="absolute right-3 z-10 text-dark-500 cursor-pointer"
          width={25}
          height={20}
          alt="Show/Hide Password"
          onClick={() => {
            setShowPassword(!showPassword);
          }}
        />
      </div>

      {hasError && (
        <p className="text-error text-[9px] mt-2 animate-fade-in">
          {errors?.[name]}
        </p>
      )}
    </div>
  );
};

export default Password;
