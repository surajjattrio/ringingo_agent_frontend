// TYPES
interface CheckBoxProps {
  className?: string;
  label?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: any;
  labelClassName?: string;
  readOnly?: boolean;
  name?: string;
}

/* ============================== CHECK BOX ============================== */

const CheckBox = (props: CheckBoxProps) => {
  const {
    className,
    label,
    defaultChecked,
    checked,
    labelClassName,
    onChange,
    readOnly = false,
    name,
  } = props;

  return (
    <div className="flex items-center">
      <input
        readOnly={readOnly}
        type="checkbox"
        //   className={`text-white accent-primary rounded mr-1.5 ${className}`}
        className={` w-4 h-4  ml-2 border border-gray-400 appearance-none cursor-pointer 
          relative transition-all duration-200
          checked:bg-blue-600 checked:border-blue-600
          before:content-[''] before:absolute before:top-1/2 before:left-1/2 
          before:w-1.5 before:h-1.5 before:bg-white before:rounded-full 
          before:transform before:-translate-x-1/2 before:-translate-y-1/2
          before:scale-0 checked:before:scale-100 ${className}`}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange}
        name={name}
      />
      <label className={`${labelClassName} text-xs font-light text-gray-500 ml-2 `}>{label}</label>
    </div>
  );
};

export default CheckBox;
