"use client";

import  Icon  from "../ui-components/Icon";
import DatePickers from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  className?: string;
  isShowLabel?: boolean;
  label?: any;
  name: string;
  value?: any;
  placeholder?: string;
  tooltip?: string;
  touched?: any;
  errors?: any;
  minDate?: any;
  maxDate?: any;
  dateFormat?: string;
  startDate?: any;
  endDate?: any;
  showTimeSelect?: boolean;
  selectsStart?: boolean;
  selectsEnd?: boolean;
  isInfo?: boolean;
  onChange?: any;
  onIconClick?: any;
  timeIntervals?: number;
  pickerClass?: string;
}

const DatePicker = ({
  className = "",
  isShowLabel = true,
  label = "Date",
  name,
  placeholder = "Select Date",
  tooltip,
  value,
  isInfo = false,
  touched,
  errors,
  minDate,
  maxDate,
  dateFormat = "yyyy-MM-dd",
  startDate,
  endDate,
  showTimeSelect = false,
  selectsStart = false,
  selectsEnd = false,
  onChange,
  onIconClick,
  timeIntervals = 60,
  pickerClass = "",
}: DatePickerProps) => {
  const hasError = touched?.[name] && errors?.[name];
  const showLabelAsFloating = Boolean(value);

  return (
    <div className={`relative w-full ${className}`}>
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
          {(label || name).length > 11
            ? `${(label || name).slice(0, 11)}...`
            : label || name}
        </label>
      )}

      <div className="relative flex items-center">
        <Icon
          tooltip={tooltip}
          onClick={onIconClick}
          className="absolute left-3 z-20 text-dark-500 cursor-pointer"
          name="CalendarGray"
          width={16}
          height={16}
        />

        <DatePickers
          id={name}
          name={name}
          selected={value}
          placeholderText={isShowLabel ? "" : placeholder}
          dateFormat={dateFormat}
          startDate={startDate}
          endDate={endDate}
          minDate={minDate}
          maxDate={maxDate}
          showTimeSelect={showTimeSelect}
          selectsStart={selectsStart}
          selectsEnd={selectsEnd}
          timeIntervals={timeIntervals}
          timeFormat="HH:mm"
          autoComplete="off"
          onChange={(e: any) => {
            const date = new Date(e);
            if (date.getHours() === 0 && selectsEnd) {
              date.setHours(23, 59, 59);
            }
            onChange?.(date);
          }}
          popperPlacement="bottom-start"
          // popperClassName="z-[100]"
          popperClassName="!z-[100]"
          portalId="modal-root"
          // portalId="root"
          className={`peer w-full text-sm transition-all duration-200 bg-white border-2
            rounded-md py-2.5 h-10
            pl-10 pr-4
            placeholder-transparent
            ${
              hasError
                ? "border-error"
                : "border-dark-300 hover:border-dark-500 focus:border-primary"
            }
            ${pickerClass}`}
        />
      </div>

      {hasError && (
        <p className="text-error text-xs mt-1 animate-fade-in">
          {errors?.[name]}
        </p>
      )}
    </div>
  );
};

export default DatePicker;
