// TYPES
interface ChipProps {
    className?: string;
    title: string
}

/* ============================== CHIP ============================== */

const Chip = (props: ChipProps) => {
    const { className, title } = props
    return (
        <span className={`${className} border border-dark-700 rounded-md 3xl:px-4 3xl:py-2 px-3 py-1.5 3xl:text-sm text-xs 3xl:font-semibold font-medium text-txt-secondary`}>{title}</span>
    )
}

export default Chip