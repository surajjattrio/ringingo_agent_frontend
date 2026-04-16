import React from "react";

// PROJECT IMPORTS
import { OptionTypes } from "@/types/formTypes";
import ToolTipIcon from "../ui-components/ToolTipIcon";

// ASSETS
const infoCircle = "/assets/icons/info-circle.svg";
const arrowDown = "/assets/icons/arrow-down.svg";

// TYPES
interface MultiDropdownProps {
    className?: string;
    label?: string;
    type?: string;
    name: string;
    isInfo?: boolean;
    value?: string | number;
    defaultValue?: string | number;
    dropdownValue?: string | number;
    defaultDropDownValue?: string | number;
    placeholder?: string;
    touched?: any;
    errors?: any;
    options1?: OptionTypes[];
    options2?: OptionTypes[];
    onChange?: any;
    disabled?: boolean;
    selectPlaceholder?: string;
    onFocus?: any;
    onBlur?: any;
    onDropdownChange?: any;
}

/* ============================== INPUT SELECT ============================== */

const MultiDropdown = (props: MultiDropdownProps) => {
    const {
        className,
        label,
        name,
        value,
        isInfo = false,
        defaultValue,
        dropdownValue,
        defaultDropDownValue,
        placeholder,
        options1,
        options2,
        selectPlaceholder,
        onChange,
        onDropdownChange,
    } = props;

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
            <div className="grid grid-cols-2">
                <div className="relative flex items-center border-2 border-e-0 border-dark-700 rounded-s-md">
                    <select
                        id={name}
                        value={value}
                        onChange={onChange}
                        defaultValue={defaultValue}
                        className={`appearance-none focus:outline-none w-full border-transparent rounded-s-md pl-2 3xl:pr-8 pr-6 3xl:py-2 py-1.5 font-normal 3xl:border-r-8 border-r-6 text-xs placeholder:text-xs ${value ? "text-txt-primary" : "text-txt-secondary"
                            }`}
                    >
                        {placeholder && <option value={''}>{placeholder}</option>}

                        {options1?.map((val: OptionTypes, index: number) => {
                            return (
                                <React.Fragment key={index}>
                                    <option value={val?.value}>{val?.label}</option>
                                </React.Fragment>
                            );
                        })}
                    </select>
                    <ToolTipIcon
                        className={`absolute 3xl:right-4 right-3 text-dark-700`}
                        src={arrowDown}
                        width={13}
                        height={13}
                        alt="Select"
                    />
                </div>
                <div className="relative flex items-center border-2 border-dark-700 rounded-e-md">
                    <select
                        value={dropdownValue}
                        onChange={onDropdownChange}
                        defaultValue={defaultDropDownValue}
                        className={`appearance-none focus:outline-none w-full border-transparent rounded-e-md pl-2 3xl:pr-8 pr-6 3xl:py-2 py-1.5 font-normal 3xl:border-r-8 border-r-6 text-xs placeholder:text-xs ${dropdownValue ? "text-txt-primary" : "text-txt-secondary"
                            }`}
                    >
                        {selectPlaceholder && <option value={''}>{selectPlaceholder}</option>}

                        {options2?.map((val: OptionTypes, index: number) => {
                            return (
                                <React.Fragment key={index}>
                                    <option value={val?.value}>{val?.label}</option>
                                </React.Fragment>
                            );
                        })}
                    </select>
                    <ToolTipIcon
                        className={`absolute 3xl:right-4 right-3 text-dark-700`}
                        src={arrowDown}
                        width={13}
                        height={13}
                        alt="Select"
                    />
                </div>
            </div>
        </div>
    );
};

export default MultiDropdown;
