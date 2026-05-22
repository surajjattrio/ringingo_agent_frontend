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

// Map campaign mode value to chip styling classes (text color and background)
const getCampaignModeChipClasses = (mode: string): string => {
    switch (mode) {
        case "0": return "text-gray-600 bg-gray-100";       // Manual
        case "1": return "text-green-700 bg-green-50";       // Auto
        case "2": return "text-purple-700 bg-purple-50";     // Preview
        case "3": return "text-orange-700 bg-orange-50";     // Predictive
        default: return "text-emerald-700 bg-emerald-50";
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
            <div className="flex items-center gap-1.5">
                <span
                    className={`text-[10px] font-bold uppercase ${campaignType === "inbound"
                            ? "text-emerald-500"
                            : campaignType === "outbound"
                                ? "text-blue-500"
                                : "text-amber-500"
                        }`}
                >
                    {LoginAgentCampaignName?.trim()}
                </span>

                {modeLabel && (
                    <span
                        className={`text-[10px] font-bold uppercase px-1.5 rounded ${getCampaignModeChipClasses(campaignMode)}`}
                    >
                        {modeLabel}
                    </span>
                )}
            </div>
        </div>
    );
};

export default CampaignStatus;