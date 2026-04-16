import Icon, { IconKey } from "@/components/ui-components/Icon";

interface RealtimeCardProps {
    icon: IconKey;
    title: string;
    count: any;
}

const RealtimeCard = (props: RealtimeCardProps) => {
    const { icon, title, count } = props;
    return (
        <div className="bg-white flex rounded-md sm:px-1.5 sm:py-1.5 px-3 py-3 drop-shadow-md flex-col min-h-[80px]">
            <div className="items-center justify-between flex">
                <Icon name={icon} width={30} height={30} />
                <div className="flex flex-col justify-end gap-y-1">
                    <span className="text-txt-primary text-xs">{title}</span>
                    {typeof count !== "object" ? (
                        <span className="flex justify-end text-heading text-lg font-bold">
                            {count}
                        </span>
                    ) : null}
                </div>
            </div>
            {typeof count === "object" ? (
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-txt-primary text-xs">Inbound</span>
                        <span className="text-heading text-lg font-bold">
                            {count?.inbound_count || 0}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-txt-primary text-xs">Outbound</span>
                        <span className="text-heading text-lg font-bold">
                            {count?.outbound_count || 0}
                        </span>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default RealtimeCard;
