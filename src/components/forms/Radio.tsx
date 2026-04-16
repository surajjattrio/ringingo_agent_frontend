// TYPES
interface RadioProps {
    label?: string;
    defaultChecked?: boolean;
    checked?: boolean;
    onChange?: any;
    labelClassName?: any;
    name?: string;
    options?: any;
    selected: any;
}

/* ============================== RADIO BUTTON ============================== */

const Radio = (props: RadioProps) => {
    const {
        label,
        labelClassName,
        selected,
        onChange,
        name = "default radio",
        options = [],
    } = props;

    return (
        <div>
            <label className={`${labelClassName} text-sm font-semibold`}>
                {label}
            </label>
            <div className="flex items-center pt-2 pr-10">
                {options?.map((val: any, index: number) => {
                    return (
                        <div className="flex items-center mr-4" key={index}>
                            <input
                                disabled={val.isDisabled}
                                checked={selected === val.value}
                                type="radio"
                                value={val.value}
                                name={name}
                                onChange={onChange}
                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary accent-primary"
                            />
                            <label
                                className="ml-2 text-xs font-medium text-gray-900"
                            >
                                {val.label}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Radio;
