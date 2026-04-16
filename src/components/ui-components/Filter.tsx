// PROJECT IMPORTS
import ToolTipIcon from "./ToolTipIcon";

// TYPES
interface FilterProps {
  className?: string;
  onClick?: any;
}

// ASSETS
const FilterIcon = "/assets/icons/filterNew.svg";

/* ============================== FILTER ============================== */

const Filter = (props: FilterProps) => {
  const { className, onClick } = props;
  return (
    <div
      className={`flex h-full items-center border bg-button-background  rounded-[10px] px-3 smd:p-1.5 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <ToolTipIcon src={FilterIcon} width={14} height={14} alt="Filter" />
      <span className="pl-2 smd:pl-0 text-white 3xl:text-base text-sm font-normal smd:hidden">
        Filters
      </span>
    </div>
  );
};

export default Filter;
