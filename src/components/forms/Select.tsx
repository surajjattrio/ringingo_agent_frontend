import React, { useState } from "react";

// PROJECT IMPORTS
import { ToolTipIcon } from "../ui-components";
import Select, { StylesConfig } from "react-select";

// TYPES IMPORT
import { OptionTypes } from "@/types/formTypes";

// ASSETS
const map = "/assets/icons/map.svg";
const clock = "/assets/icons/clock.svg";
const infoCircle = "/assets/icons/info-circle.svg";

// GRAY ICONS
const clockGray = "/assets/icons/gray/clock.svg";
const mapGray = "/assets/icons/gray/map.svg";

// TYPES
interface SelectProps {
  className?: string;
  isShowLabel?: boolean;
  maxMenuHeight?: number;
  label?: any;
  name: string;
  isShowPlaceholder?: boolean;
  placeholder?: string;
  icon?: string;
  isMulti?: string;
  tooltip?: string;
  isInfo?: boolean;
  options: OptionTypes[];
  value?: string | number | any;
  touched?: any;
  errors?: any;
  onChange?: any;
  onBlur?: any;
  onIconClick?: any;
  styles?: any;
  defaultValue?: any;
  isClearable?: boolean;
  height?: string;
  isManual?: boolean;
  isGroup?: boolean;
  isDisabled?: boolean;
}

/* ============================== SELECT ============================== */

const SelectInput = (props: SelectProps) => {
  const {
    className,
    isShowLabel = true,
    label,
    name,
    isShowPlaceholder = true,
    placeholder = "",
    icon,
    tooltip,
    isInfo = true,
    options,
    value,
    touched,
    errors,
    onChange,
    onBlur,
    onIconClick,
    maxMenuHeight = 200,
    styles,
    defaultValue,
    isClearable = false,
    height,
    isMulti = false,
    isManual = false,
    isGroup = false,
    isDisabled = false,
  } = props;

  const [isFocused, setIsFocused] = useState<boolean>(false);
  // console.log("IsINfo in select", isInfo);

  const icons: any = {
    map: map,
    clock: clock,

    //GRAY ICONS
    "clock-gray": clockGray,
    "map-gray": mapGray,
  };

  // const customStyles: StylesConfig<any> = {
  //   control: (styles: any, state) => {
  //     return {
  //       ...styles,
  //       height: height ? height : "28px",
  //       minHeight: height ? height : "28px",
  //       borderColor: state.isFocused
  //         ? "#DB6443"
  //         : touched && errors && touched[name] && errors[name]
  //         ? "#E7515A"
  //         : "#D8D8D8",
  //       borderWidth: "2px",
  //       borderRadius: "6px",
  //       boxShadow: "none",
  //       padding: "0px 3px",
  //       color: "#13151F",

  //       ":hover": {
  //         borderColor: state.isFocused
  //           ? "#DB6443"
  //           : touched && errors && touched[name] && errors[name]
  //           ? "#E7515A"
  //           : "#D8D8D8",
  //       },

  //       "@media (min-width: 1401px)": {
  //         height: "36px",
  //         minHeight: "36px",
  //       },
  //     };
  //   },
  //   placeholder: (styles: any) => {
  //     return {
  //       ...styles,
  //       color: "#B2B3B5",
  //       margin: 0,
  //     };
  //   },
  //   valueContainer: (styles: any) => {
  //     return {
  //       ...styles,
  //       padding: "0px 8px",
  //     };
  //   },
  //   dropdownIndicator: (styles: any) => {
  //     return {
  //       ...styles,
  //       padding: "2px 6px",
  //       color: "#D8D8D8",
  //     };
  //   },
  //   indicatorSeparator: (styles: any) => {
  //     return {
  //       ...styles,
  //       display: "none",
  //     };
  //   },
  //   option: (styles: any, state) => {
  //     return {
  //       ...styles,
  //       backgroundColor: state.isSelected
  //         ? "#DB6443"
  //         : state.isFocused
  //         ? "#FBE8E3"
  //         : "white",
  //       fontWeight: state.isSelected ? 700 : 400,
  //       color: state.isSelected ? "white" : "#13151F",

  //       ":active": {
  //         backgroundColor: state.isSelected
  //           ? "#DB6443"
  //           : state.isFocused
  //           ? "#FBE8E3"
  //           : "white",
  //       },
  //     };
  //   },
  //   menuList: (styles: any) => {
  //     return {
  //       ...styles,
  //       fontSize: "12px",
  //       borderColor: "#DB6443",
  //       borderWidth: "2px",
  //       borderRadius: "6px",
  //     };
  //   },
  //   menuPortal: (base: any) => ({
  //     ...base,
  //     zIndex: 9999, // Ensure it appears above everything
  //   }),
  // };

  // GET VALUES
  
  const customStyles: StylesConfig<any> = {
    control: (styles: any, state) => ({
      ...styles,
      height: "40px",
      minHeight: "40px",
      borderColor:
        touched && errors && touched[name] && errors[name]
          ? "#E7515A"
          : state.isFocused
          ? "#CBD5E1"
          : "#E2E8F0",
      borderWidth: "2px",
      borderRadius: "6px",
      boxShadow: "none",
      paddingLeft: icon ? "2.25rem" : "1rem",
      paddingRight: "1rem",
      fontSize: "14px",
      fontWeight: "500",
      backgroundColor: isDisabled ? "#F1F5F9" : "#fff",
      color: "#0F172A",
      cursor: isDisabled ? "not-allowed" : "pointer",
      "&:hover": {
        borderColor:
          touched && errors && touched[name] && errors[name]
            ? "#E7515A"
            : "#0F172A",
      },
    }),
    placeholder: (styles: any) => ({
      ...styles,
      color: "#94A3B8",
      // margin: 0,
      marginLeft: icon ? "1rem" : "0",
    }),
    valueContainer: (styles: any) => ({
      ...styles,
      padding: "0px 2px",
    }),
    dropdownIndicator: (styles: any) => ({
      ...styles,
      padding: "0px 6px",
      color: "#94A3B8",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    option: (styles: any, state) => ({
      ...styles,
      backgroundColor: state.isSelected
        ? "#4F46E5"
        : state.isFocused
        ? "#EEF2FF"
        : "white",
      fontWeight: state.isSelected ? 700 : 400,
      color: state.isSelected ? "white" : "#1E293B",
      ":active": {
        backgroundColor: state.isSelected ? "#4F46E5" : "#EEF2FF",
      },
      padding: "10px 12px",
      fontSize: "14px",
    }),
    menuList: (styles: any) => ({
      ...styles,
      fontSize: "14px",
      borderColor: "#E2E8F0",
      borderWidth: "1px",
      borderRadius: "8px",
      padding: 0,
      maxHeight: 200,
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };


  const getValues = () => {
    if (isGroup) {
      let optionArray: any = [];
      options?.map((x: any) => {
        let data: any = x?.options || [];
        optionArray.push(...data);
      });
      return optionArray.find((x: any) => x.value === value);
    } else {
      return options.find((x: any) => x.value === value);
    }
  };

  const getDefaultValue = () =>
    options.find((x: any) => x.value === defaultValue);
  const hasValue = isMulti ? value?.length > 0 : !!value;
  const showFloatingLabel = isFocused || hasValue;

  return (
    <div className={`${className} relative z-[0]`}>
      {isShowLabel && (
        <div className="text-xs flex items-center">
          <label
            htmlFor={name}
            className={`absolute text-xs ${
              icon ? "left-9" : "left-4"
            } text-xs px-1 bg-white  z-[30] transition-all duration-200 pointer-events-none
            ${
              showFloatingLabel
                ? "-top-2 text-primary"
                : "top-[12px] text-dark-400"
            }`}
          >
            {label || name}
          </label>

          {/* <p>{label ? label : name}</p> */}

          {isInfo && (
            <ToolTipIcon
              tooltip={label ? label : name}
              className="ml-3 cursor-pointer"
              src={infoCircle}
              width={18}
              height={18}
              alt={label ? label : name}
            />
          )}
        </div>
      )}
      <div>
        {icon && (
          <ToolTipIcon
            tooltip={tooltip}
            className={`absolute left-2.5 text-dark-700`}
            src={icons[icon]}
            width={18}
            height={18}
            alt={icon}
            onClick={onIconClick}
          />
        )}
        <Select
          isDisabled={isDisabled}
          className="w-full text-xs"
          name={name}
          value={getValues() || ""}
          placeholder={placeholder}
          defaultValue={getDefaultValue() || ""}
          options={options}
          styles={styles ? styles : customStyles}
          onChange={(e: any) => {
            if (isManual) {
              onChange(e);
            } else {
              onChange({
                target: { value: e ? e.value : "", id: name, name: name },
              });
            }
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          maxMenuHeight={maxMenuHeight}
          isClearable={isClearable}
          menuPortalTarget={
            typeof window !== "undefined" ? document.body : null
          }
        />
      </div>
      {touched && errors && touched[name] && errors[name] && (
        <span className="text-error font-normal text-[10px]">
          {errors[name]}
        </span>
      )}
    </div>
  );
};

export default SelectInput;
