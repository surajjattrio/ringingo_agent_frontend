import Image from "next/image";

// TYPES
interface SearchBarProps {
  className?: string;
  ref?: any;
  value?: string | number;
  placeholder?: string;
  onChange?: any;
  iconClassName?: any;
  iconWidth?: number;
  iconHeight?: number;
}

// ASSETS
const SearchIcon = "/assets/icons/gray/search.svg";

/* ============================== SEARCH BAR ============================== */

const SearchBar = (props: SearchBarProps) => {
  const {
    className,
    ref,
    value,
    iconClassName,
    iconWidth = 14,
    iconHeight = 14,
    placeholder,
    onChange,
  } = props;
  return (
    <div className="flex h-full relative">
      <input
        ref={ref}
        // (border border-dark-700)
        className={`${className} focus:outline-none  bg-[#F4F7FE] rounded-[10px] pl-4 3xl:py-2 py-1.5 pr-4 placeholder:text-xs text-xs placeholder:font-normal placeholder:text-txt-secondary`}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
      <div>
        <Image
          src={SearchIcon}
          className={`${iconClassName} absolute 3xl:right-4 right-2.5 3xl:top-3 top-2 text-dark-700 cursor-pointer`}
          width={iconWidth}
          height={iconHeight}
          alt="search"
        />
      </div>
    </div>
  );
};

export default SearchBar;
