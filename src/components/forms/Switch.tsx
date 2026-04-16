// TYPES
interface SwitchProps {
    falseName: string;
    trueName: string;
    checked?: boolean;
    onChange?: any;
}

const Switch = (props: SwitchProps) => {
    const { checked = true, onChange, falseName, trueName } = props;

    return (
        <>
            <div className="relative flex flex-col items-center justify-center overflow-hidden transition-all">
                <div className="flex items-center">
                    <span
                        className={`3xl:mr-2 mr-1 3xl:text-xs text-[11px] ${!checked
                                ? "font-semibold text-heading"
                                : "font-normal text-txt-secondary"
                            }`}
                    >
                        {falseName}
                    </span>
                    <label className="inline-flex relative items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={checked}
                            onChange={onChange}
                        />
                        <div
                            className={`3xl:w-[54px] 3xl:h-[22px] w-[44px] h-[18px] rounded-full transition bg-primary-green`}
                        ></div>
                        <div
                            className={`dot absolute ${checked ? "3xl:translate-x-[35px] translate-x-[28px]" : "3xl:translate-x-[3px] translate-x-[2px]"
                                } top-0.75 flex 3xl:h-4 3xl:w-4 h-3.5 w-3.5 items-center justify-center rounded-full bg-white transition-all`}
                        ></div>
                    </label>
                    <span
                        className={`3xl:ml-2 ml-1 3xl:text-xs text-[11px] ${checked
                                ? "font-semibold text-heading"
                                : "font-normal text-txt-secondary"
                            }`}
                    >
                        {trueName}
                    </span>
                </div>
            </div>
        </>
    );
};

export default Switch;
