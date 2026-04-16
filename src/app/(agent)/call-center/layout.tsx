// PROJECT IMPORTS
import Layouts from "@/components/layouts"

/* ============================== LAYOUT ============================== */

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Layouts>
                {children}
            </Layouts>
        </>
    )
}
