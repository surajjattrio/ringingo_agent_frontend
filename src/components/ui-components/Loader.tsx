/* ============================== LOADER ============================== */

interface LoaderProps {
    background?: string;
}

const Loader = (props: LoaderProps) => {
    const { background = "white" } = props
    return (
        <div style={{ backgroundColor: background }} className='flex h-full w-full z-10 items-center justify-center'>
            <div
                className="flex justify-center self-center 3xl:h-12 3xl:w-12 h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent border-primary align-[-0.125em] text-success motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status">
                <span
                    className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                ></span>
            </div>
        </div>
    )
}

export default Loader