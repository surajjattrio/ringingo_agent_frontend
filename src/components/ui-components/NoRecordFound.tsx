import Legacy from "next/legacy/image";

// TYPES
interface NoRecordFoundProps {
    className?: string;
    title: string;
    description?: string;
    imageClass?: string;
    topImageClass?: string;
}

// ASSETS
const emptyIcon = "/assets/images/empty-box.svg";

/* ============================== NO RECORD FOUND ============================== */

const NoRecordFound = (props: NoRecordFoundProps) => {
    const {
        className,
        title,
        description,
        imageClass,
        topImageClass = "pt-10",
    } = props;
    return (
        <div
            className={`${className} flex flex-col items-center justify-center h-full`}
        >
            <div className={`${topImageClass}`}>
                <div className={`${imageClass} relative mt-9 w-48 h-48`}>
                    <Legacy src={emptyIcon} alt="empty-box" layout="fill" />
                </div>
            </div>
            <span className="3xl:text-lg text-base font-bold text-heading pt-2">
                {title}
            </span>
            {description && (
                <span className="3xl:text-sm text-xs text-txt-secondary pt-1">
                    {description}
                </span>
            )}
        </div>
    );
};

export default NoRecordFound;
