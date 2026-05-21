import { useCampaignMode, useCampaignType } from "@/redux/slice/commonSlice";
import { getLoginAgentCampaign } from "@/utils/Storage";

// Map campaign mode value to human-readable label
const getCampaignModeLabel = (mode: string): string => {
    switch (mode) {
        case "0": return "Manual";
        case "1": return "Auto";
        case "2": return "Preview";
        case "3": return "Predictive";
        default: return "Incoming";
    }
};

// Map campaign mode value to text color classes
const getCampaignModeColor = (mode: string): string => {
    switch (mode) {
        case "0": return "text-gray-600";       // Manual
        case "1": return "text-green-700";      // Auto
        case "2": return "text-purple-700";     // Preview
        case "3": return "text-orange-700";     // Predictive
        default: return "text-gray-600";
    }
};

const CampaignStatus = () => {
    const LoginAgentCampaignName = getLoginAgentCampaign();
    const campaignType = useCampaignType();
    const campaignMode = useCampaignMode();

    const modeLabel = getCampaignModeLabel(campaignMode);

    // ✅ keep behavior: if no campaign, show nothing
    if (!LoginAgentCampaignName) return null;
    return (
        <>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span
                        className={`h-2 w-2 rounded-full ${campaignType === "inbound"
                                ? "bg-emerald-500"
                                : campaignType === "outbound"
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                            }`}
                    />
                    <span className="text-xs text-[#6B7280] font-medium">Campaign:</span>
                    <span
                        className={`text-[10px] font-bold uppercase ${campaignType === "inbound"
                                ? "text-emerald-500"
                                : campaignType === "outbound"
                                    ? "text-blue-500"
                                    : "text-amber-500"
                            }`}
                    >
                        {LoginAgentCampaignName}
                    </span>
                </div>

                {modeLabel && (
                    <div className="flex items-center gap-2">
                        <span
                            className={`h-2 w-2 rounded-full ${campaignMode === "0"
                                    ? "bg-gray-500"
                                    : campaignMode === "1"
                                        ? "bg-green-700"
                                        : campaignMode === "2"
                                            ? "bg-purple-700"
                                            : campaignMode === "3"
                                                ? "bg-orange-700"
                                                : "bg-emerald-500"
                                }`}
                        />
                        <span className="text-xs text-[#6B7280] font-medium">Dial Method:</span>
                        <span
                            className={`text-[10px] font-bold uppercase ${getCampaignModeColor(campaignMode)}`}
                        >
                            {modeLabel}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
};
  {/* <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 transition-all duration-300">
        {LoginAgentCampaignName && (
            <>
                <div className="relative flex h-2.5 w-2.5">
                    <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
                    ></span>
                    <span
                        className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"
                    ></span>
                </div>
                <div className="flex items-center">
                    <span className="text-xs font-semibold text-blue-600">
                        Campaign :
                    </span>
                    <div className="w-[1px] h-3 bg-gray-200" />
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 rounded uppercase">
                        {LoginAgentCampaignName}
                    </span>
                </div>
            </>
        )}
    </div> */}



export default CampaignStatus