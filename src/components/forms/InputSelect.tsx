import React from "react";

// PROJECT IMPORTS
import ToolTipIcon from "../ui-components/ToolTipIcon";
import { OptionTypes } from "@/types/formTypes";
import Select, { StylesConfig } from "react-select";

// ASSETS
const infoCircle = "/assets/icons/info-circle.svg";

// TYPES
interface InputSelectProps {
    className?: string;
    label?: string;
    type?: string;
    name: string;
    value?: string | number;
    dropdownValue?: string | number;
    defaultDropDownValue?: string | number;
    placeholder?: string;
    touched?: any;
    errors?: any;
    options: OptionTypes[];
    onChange?: any;
    disabled?: boolean;
    selectPlaceholder?: string;
    onFocus?: any;
    onBlur?: any;
    onDropdownChange?: any;
    isInfo?: boolean;
    noSpace?: boolean;
}

/* ============================== INPUT SELECT ============================== */

const InputSelect = (props: InputSelectProps) => {
    const {
        className,
        label,
        type = "text",
        name,
        value,
        dropdownValue,
        defaultDropDownValue,
        placeholder,
        disabled,
        touched,
        errors,
        options,
        selectPlaceholder,
        onChange,
        onFocus,
        onBlur,
        onDropdownChange,
        isInfo = false,
        noSpace = false,
    } = props;

    const customStyles: StylesConfig<any> = {
        control: (styles: any, state) => {
            return {
                ...styles,
                height: "32px",
                minHeight: "32px",
                borderColor: "#D8D8D8",
                borderWidth: "2px 2px 2px 0px",
                borderRadius: "0px 6px 6px 0px",
                boxShadow: "none",
                padding: "1px 3px",
                color: "#13151F",

                ":hover": {
                    borderColor: "#D8D8D8",
                },

                "@media (min-width: 1401px)": {
                    height: "36px",
                    minHeight: "36px",
                },

                "@media (min-width: 0px) and (max-width: 820px)": {
                    borderWidth: "2px",
                    borderRadius: "0px 0px 6px 6px",
                },
            };
        },
        placeholder: (styles: any) => {
            return {
                ...styles,
                color: "#B2B3B5",
            };
        },
        valueContainer: (styles: any) => {
            return {
                ...styles,
                padding: "0px",
            };
        },
        dropdownIndicator: (styles: any) => {
            return {
                ...styles,
                padding: "2px 6px",
                color: "#D8D8D8",
            };
        },
        indicatorSeparator: (styles: any) => {
            return {
                ...styles,
                display: "none",
            };
        },
        option: (styles: any, state) => {
            return {
                ...styles,
                backgroundColor: state.isSelected
                    ? "#DB6443"
                    : state.isFocused
                        ? "#FBE8E3"
                        : "white",
                fontWeight: state.isSelected ? 700 : 400,
                color: state.isSelected ? "white" : "#13151F",
            };
        },
        menuList: (styles: any) => {
            return {
                ...styles,
                borderColor: "#DB6443",
                borderWidth: "2px",
                borderRadius: "6px",
            };
        },
    };

    // GET VALUES
    const getValues = () => options.find((x: any) => x.value === dropdownValue);
    const getDefaultValue = () =>
        options.find((x: any) => x.value === defaultDropDownValue);

    return (
        <div className={className}>
            <div className="text-xs font-semibold pb-2 flex items-center">
                <label htmlFor={name}>{label ? label : name}</label>
                {isInfo && (
                    <ToolTipIcon
                        tooltip={label ? label : name}
                        className="ml-3 cursor-pointer"
                        src={infoCircle}
                        width={15}
                        height={15}
                        alt={label ? label : name}
                    />
                )}
            </div>
            <div className="grid grid-cols-2 smd:grid-cols-1">
                <input
                    id={name}
                    className={`focus:outline-none placeholder:text-txt-secondary border-2 smd:!rounded-t-md smd:border-b-0 smd:rounded-s-none rounded-s-md px-2 3xl:py-2 py-1.5 w-full text-xs placeholer:text-xs ${touched && errors && touched[name] && errors[name]
                            ? "border-error"
                            : "border-dark-700"
                        }`}
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e: any) => {
                        onChange &&
                            onChange({
                                target: {
                                    value: noSpace
                                        ? e.target.value?.replace(/\s/g, "")?.toString()
                                        : e.target.value?.toString(),
                                    name: e.target.name,
                                    id: e.target.id,
                                },
                            });
                    }}
                    disabled={disabled}
                    onBlur={onBlur}
                    onFocus={onFocus}
                />
                <div>
                    <Select
                        className="w-full text-xs"
                        name={name}
                        value={getValues() || ""}
                        defaultValue={getDefaultValue() || ""}
                        options={options}
                        styles={customStyles}
                        onChange={(e: any) => {
                            onDropdownChange({ target: { value: e.value, id: name } });
                        }}
                        maxMenuHeight={150}
                    />
                </div>
            </div>
        </div>
    );
};

export default InputSelect;
