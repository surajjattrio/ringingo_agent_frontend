import Image from "next/image";

interface ToolTipIconProps {
  className?: string;
  tooltip?: string;
  width: number;
  height: number;
  isRight?: boolean; // optional for future use
  src: string;
  alt?: string;
  onClick?: () => void;
}

const ToolTipIcon = ({
  className,
  tooltip,
  width,
  height,
  src,
  alt = "Icon",
  onClick,
}: ToolTipIconProps) => {
  return (
    <div
      className={`relative inline-block group ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50">
          <span className="px-3 py-1 text-xs text-white bg-[#313349] rounded shadow-md whitespace-nowrap">
            {tooltip}
          </span>
          <div className="w-2 h-2 rotate-45 bg-[#313349] mt-[-4px]"></div>
        </div>
      )}

      {/* Icon */}
      <Image
        className="max-w-[unset]"
        src={src}
        alt={alt}
        width={width}
        height={height}
      />
    </div>
  );
};

export default ToolTipIcon;
