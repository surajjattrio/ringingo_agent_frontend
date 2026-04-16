import { useState } from "react";

// PROJECT IMPORT
import { ToolTipIcon } from "../ui-components";

// THIRD - PARTY IMPORT
import TimePickers from "rc-time-picker";
import 'rc-time-picker/assets/index.css';
const clockGray = "/assets/icons/gray/clock.svg";
const infoCircle = "/assets/icons/info-circle.svg";
// TYPES
interface TimePickerProps {
    className?: string;
    isShowLabel?: boolean;
    label?: string;
    name: string;
    placeholder?: string;
    value?: any;
    touched?: any;
    errors?: any;
    isInfo?: boolean;
    focus?: boolean;
    onChange?: any;
    onFocus?: any;
    onBlur?: any;
    onIconClick?: any;
}

const TimePicker = (props: TimePickerProps) => {
    const {
        className,
        isShowLabel = true,
        label,
        name,
        placeholder,
        value,
        isInfo = false,
        touched,
        errors,
        focus,
        onChange,
        onFocus,
        onBlur,
        onIconClick,
    } = props;

    const [isFocused, setIsFocused] = useState<boolean>(false);

    return (
        <>
            <div>
                {isShowLabel && (
                    <div className="text-xs font-semibold pb-2 flex items-center">
                        <label htmlFor={name}>{label ? label : name}</label>
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
                <div className="flex items-center relative">
                    <ToolTipIcon
                        className={`z-10 absolute left-4 text-dark-700`}
                        src={clockGray}
                        width={20}
                        height={20}
                        alt="Time"
                        onClick={onIconClick}
                    />
                    <TimePickers
                        id={name}
                        className={`${className} focus:outline-none border-2 rounded-md focus:border-primary py-[2px] pr-5 w-full pl-12 text-xs placeholder:text-xs
                        ${touched && errors && touched[name] && errors[name]
                                ? "border-error"
                                : focus
                                    ? "border-primary"
                                    : "border-dark-700"
                            }`}
                        placeholder={placeholder}
                        value={value}
                        showSecond={false}
                        focusOnOpen
                        allowEmpty={false}
                        format="HH:mm"
                        onChange={(e: any) => {
                            onChange &&
                                onChange(
                                    e?.hour().toString().padStart(2, "0"),
                                    e?.minute().toString().padStart(2, "0")
                                );
                        }}
                        onOpen={() => onFocus ? onFocus() : setIsFocused(true)}
                        onClose={() => onBlur ? onBlur() : setIsFocused(false)}
                    />
                </div>
                {touched && errors && touched[name] && errors[name] && (
                    <span className="text-error font-normal text-xs">{errors[name]}</span>
                )}
            </div>
        </>
    );
};

export default TimePicker;
