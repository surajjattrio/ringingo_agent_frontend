// TYPES
interface InlineSwitchProps {
  falseName: string;
  trueName: string;
  checked?: boolean;
  onChange?: any;
}

const InlineSwitch = (props: InlineSwitchProps) => {
  const { checked = true, onChange, falseName, trueName } = props;

  return (
    <>
      <div className="relative flex flex-col items-center justify-center overflow-hidden transition-all">
        <div className="flex items-center">
          {!checked ? (
            <span
              className={`absolute z-[99] right-[1px] 3xl:mr-2 mr-1 3xl:text-xs text-[11px] font-normal text-dark-400`}
            >
              {falseName}
            </span>
          ) : (
            <></>
          )}
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={checked}
              onChange={onChange}
            />
            <div
              className={`3xl:w-[70px] 3xl:h-[25px] w-[65px] h-[24px] rounded-full transition ${checked ? 'bg-primary-green' : 'bg-dark-800'}`}
            ></div>
            <div
              className={`dot absolute ${
                checked
                  ? "3xl:translate-x-[50px] translate-x-[45px] bg-white"
                  : "3xl:translate-x-[3px] translate-x-[3px] bg-dark-600"
              } top-0.75 flex 3xl:h-4 3xl:w-4 h-4 w-4 items-center justify-center rounded-full transition-all`}
            ></div>
          </label>
          {checked ? (
            <span
              className={`absolute z-[99] left-[3px] 3xl:ml-2 ml-1 3xl:text-xs text-[11px] text-white`}
            >
              {trueName}
            </span>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default InlineSwitch;
