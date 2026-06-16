import React, { useState, useEffect, useMemo } from "react";
import { X, Send } from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { fetchAllowedTemplates, submitSendEmail, useAllowedTemplates, useEmailIsLoading } from "@/redux/slice/emailSlice";
import { useSelectedCampaignDetails, useSelectedCampaign } from "@/redux/slice/commonSlice";
import { useCampaignOptions } from "@/redux/slice/campaignSlice";
import { useSingleLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { Button, Input, Select, Textarea } from "@/components/forms";
import { Success, Danger } from "@/redux/services/toasterService";
import HtmlEditor from "../ui-components/HtmlEditor";

interface EmailModalProps {
    visible: boolean;
    onClose: () => void;
    initialTemplateUuid?: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ visible, onClose, initialTemplateUuid }) => {
    const dispatch = useAppDispatch();
    const selectedCampaign = useSelectedCampaign();
    const campaignOptions = useCampaignOptions();
    const selectedCampaignDetails = useSelectedCampaignDetails();
    const allowedTemplates = useAllowedTemplates();
    const isLoading = useEmailIsLoading();
    const leadData = useSingleLeadDetails();

    // Derive config details fresh from campaignOptions (same pattern as phone/page.tsx)
    const activeCampaignConfig = useMemo(() => {
        if (campaignOptions?.length > 0 && selectedCampaign) {
            const allOptions = campaignOptions.flatMap((group: any) => group.options || []);
            return allOptions.find((c: any) => c.value === selectedCampaign) || null;
        }
        return selectedCampaignDetails || null;
    }, [campaignOptions, selectedCampaign, selectedCampaignDetails]);

    const activeConfigUuid = activeCampaignConfig?.email_type === "api"
        ? activeCampaignConfig?.api_config_uuid
        : activeCampaignConfig?.email_config_uuid;

    const [selectedTemplateUuid, setSelectedTemplateUuid] = useState<string>("");
    const [emailTo, setEmailTo] = useState<string>("");
    const [subject, setSubject] = useState<string>("");
    const [body, setBody] = useState<string>("");
    const [isPreview, setIsPreview] = useState<boolean>(true);



    const replaceTags = (text: string, data: any) => {
        if (!text || !data) return text;
        const tags: { [key: string]: string } = {
            "[FIRSTNAME]": data.first_name || "",
            "[LASTNAME]": data.last_name || "",
            "[ADDRESS]": data.address || "",
            "[CITY]": data.city || "",
            "[PROVINCE]": data.province || "",
            "[DOB]": data.dob || "",
            "[PHONECODE]": data.phone_code || data.phone_number || "",
            "[ALTPHONE]": data.alternate_phone_number || "",
            "[EMAIL]": data.email || "",
            "[GENDER]": data.gender || "",
            "[COMMENT]": data.description || data.comment || "",
            "[POSTALCODE]": data.postal_code || "",
        };

        let processedText = text;
        for (const [tag, value] of Object.entries(tags)) {
            processedText = processedText.split(tag).join(value);
        }
        return processedText;
    };

    useEffect(() => {
        if (visible && initialTemplateUuid && allowedTemplates.length > 0) {
            setSelectedTemplateUuid(initialTemplateUuid);
            const template = allowedTemplates.find(t => t.uuid === initialTemplateUuid);
            if (template) {
                setSubject(replaceTags(template.subject, leadData));
                setBody(replaceTags(template.body, leadData));
            }
        }
    }, [visible, initialTemplateUuid, allowedTemplates, leadData]);

    useEffect(() => {
        if (leadData?.email) {
            setEmailTo(leadData.email);
        }
    }, [leadData]);

    const handleTemplateChange = (e: any) => {
        const uuid = e.target.value;
        setSelectedTemplateUuid(uuid);
        const template = allowedTemplates.find(t => t.uuid === uuid);
        if (template) {
            setSubject(replaceTags(template.subject, leadData));
            setBody(replaceTags(template.body, leadData));
        }
    };

    const handleSendEmail = async () => {
        if (!emailTo || !subject || !body) {
            Danger("Please fill in all required fields.");
            return;
        }

        const payload = {
            config_uuid: activeConfigUuid,
            to: emailTo,
            subject: subject,
            body: body,
            lead_data: leadData
        };

        try {
            const res: any = await dispatch(submitSendEmail(payload)).unwrap();
            if (res.statusCode === 200 || res.statusCode === 201) {
                Success("Email sent successfully!");
                onClose();
            } else {
                Danger(res.message || "Failed to send email.");
            }
        } catch (error: any) {
            Danger(error.message || "An error occurred.");
        }
    };

    if (!visible) return null;

    const templateOptions = allowedTemplates.map(t => ({
        value: t.uuid,
        label: t.name
    }));

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Send size={18} className="text-primary" />
                        </div>
                        Send Email
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Recipient Email</label>
                            <Input
                                name="emailTo"
                                placeholder="example@email.com"
                                value={emailTo}
                                onChange={(e: any) => setEmailTo(e.target.value)}
                                className="w-full"
                                isShowLabel={false}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Select Template</label>
                            <Select
                                name="template_selection"
                                placeholder="Choose a template..."
                                options={templateOptions}
                                value={selectedTemplateUuid}
                                onChange={handleTemplateChange}
                                className="w-full"
                                isInfo={false}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Subject</label>
                        <Input
                            name="subject"
                            placeholder="Email subject line"
                            value={subject}
                            onChange={(e: any) => setSubject(e.target.value)}
                            className="w-full font-medium"
                            isShowLabel={false}
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Message Body</label>
                            <button 
                                onClick={() => setIsPreview(!isPreview)}
                                className="text-[10px] font-bold text-primary hover:underline"
                            >
                                {isPreview ? "Edit Mode" : "Preview Mode"}
                            </button>
                        </div>
                        <div className="relative">
                            {isPreview ? (
                                <HtmlEditor
                                    value={body}
                                    onChange={(val) => setBody(val)}
                                    className="w-full !max-h-[250px]"
                                />
                            ) : (
                                <Textarea
                                    name="body"
                                    placeholder="Write your message here..."
                                    value={body}
                                    onChange={(e: any) => setBody(e.target.value)}
                                    isShowLabel={false}
                                    className="w-full !max-h-[250px] overflow-y-auto"
                                    rows={8}
                                />
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight">
                            Available tags: [FIRSTNAME], [LASTNAME], [PHONECODE], [ALTPHONE], [EMAIL], [ADDRESS], [CITY], [PROVINCE], [POSTALCODE], [DOB], [GENDER], [COMMENT]
                        </p>

                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <Button
                        text="Cancel"
                        style="dark-outline"
                        onClick={onClose}
                        className="px-6 py-2"
                    />
                    <Button
                        text={isLoading ? "Sending..." : "Send Email"}
                        onClick={handleSendEmail}
                        disabled={isLoading}
                        className="px-8 py-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                    />
                </div>
            </div>
        </div>
    );
};

export default EmailModal;