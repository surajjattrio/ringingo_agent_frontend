import React from "react";

// PROJECT IMPORTS
import { OptionTypes } from "@/types/formTypes";
import ToolTipIcon from "../ui-components/ToolTipIcon";

// THIRD-PARTY IMPORT
import DatePicker from "react-datepicker";

// ASSETS
const infoCircle = "/assets/icons/info-circle.svg";
const arrowDown = "/assets/icons/arrow-down.svg";

// TYPES
interface DateSelectProps {
    className?: string;
    label?: string;
    name: string;
    value?: any;
    dropdownValue?: string | number;
    defaultDropDownValue?: string | number;
    placeholder?: string;
    options?: OptionTypes[];
    onChange?: any;
    selectPlaceholder?: string;
    onDropdownChange?: any;
    isInfo?: boolean;
    maxDate?: any;
    minDate?: any;
}

/* ============================== DATE SELECT ============================== */

const DateSelect = (props: DateSelectProps) => {
    const {
        className,
        label,
        name,
        value,
        dropdownValue,
        defaultDropDownValue,
        placeholder,
        options,
        selectPlaceholder,
        onChange,
        onDropdownChange,
        isInfo = false,
        maxDate,
        minDate
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
                <div>
                    <DatePicker
                        id={name}
                        className={`focus:outline-none border-2 rounded-s-md w-full px-2 3xl:py-[9px] py-1.5 text-xs placeholer:text-xs border-dark-700`}
                        placeholderText={placeholder}
                        selected={value}
                        onChange={onChange}
                        maxDate={maxDate}
                        minDate={minDate}
                    />
                </div>
                <div className="flex items-center relative border-2 border-s-0 w-full border-dark-700 rounded-e-md">
                    <select
                        value={dropdownValue}
                        onChange={onDropdownChange}
                        defaultValue={defaultDropDownValue}
                        className={`focus:outline-none appearance-none w-full border-transparent rounded-e-md pl-2 3xl:pr-8 pr-6 3xl:py-2 py-1.5 font-normal 3xl:border-r-8 border-r-6 text-xs placeholder:text-xs ${dropdownValue ? "text-txt-primary" : "text-txt-secondary"
                            }`}
                    >
                        {selectPlaceholder && (
                            <option value={""}>{selectPlaceholder}</option>
                        )}

                        {options?.map((val: OptionTypes, index: number) => {
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

export default DateSelect;
