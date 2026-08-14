"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import CrmInformation from "@/components/call-center-components/phone/CrmInformation";
import LeadInformationTab from "@/components/call-center-components/phone/LeadInformationTab";
import ListingTab from "@/components/call-center-components/phone/ListingTab";
import UnreadList from "@/components/call-center-components/phone/UnreadList";
import WaitingCalls from "@/components/call-center-components/phone/WaitingCalls";
import { useAppDispatch } from "@/redux/hooks";
import {
  getActiveUnreadChat,
  onUnSelectCampaign,
} from "@/redux/slice/chatSlice";
import CallSummaryCards from "@/components/call-center-components/phone/CallSummaryCards";
import { onSelectCampaign, onSelectCampaignMode, onSetCampaignType, setCampaignFetched, setCampaignUpdated, useCampaignFetched, useCampaignMode, useCampaignType, useCampaignUpdated, useIsCallHangUp, useSelectedCampaign, useSelectedCampaignDetails, useUserEntry, useCallScreen, onSelectQueues, setShowQueueModal, useShowQueueModal, useSelectedQueues } from "@/redux/slice/commonSlice";
import { Button, Select } from "@/components/forms";
import { SocketProvider } from "@/contexts/chatSocket/SocketProvider";
import { useAuth } from "@/contexts/hooks/useAuth";
import { isWhatsAppEnabled } from "@/components/helperFunctions";
import { callQueueInbound, getCampaign, getCampaignList, getCampaignOption, updateAgentCampaign, useCampaignOptions } from "@/redux/slice/campaignSlice";
import ActiveList from "@/components/call-center-components/phone/ActiveList";
import { getAllLeads, useAllLeadDetails, useSingleLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { LoginAgentCampaignKey, setLoginAgentCampaign } from "@/utils/Storage";
import { Warning , Success, Danger } from "@/redux/services/toasterService";
import Cookies from "js-cookie";
import EmailModal from "@/components/modals/EmailModal";
import { fetchAllowedTemplates, fetchApiConfig, submitSendEmail, submitSendApiEmail, useAllowedTemplates, useActiveApiConfig, useEmailIsLoading } from "@/redux/slice/emailSlice";
import { Icon } from "@/components/ui-components";
/* ============================== PHONE PAGE ============================== */

export default function Phone() {
  const [activeId, setActiveId] = useState<string>("1");
  const selectedCampaign = useSelectedCampaign();
  const [showScript, setShowScript] = useState(false);
  console.log(selectedCampaign, 'selectedCampaign');
  const campaignFetched = useCampaignFetched();
  const campaignUpdated = useCampaignUpdated();
  const userEntry = useUserEntry();
  const campaignMode = useCampaignMode();
  const allLeadsDetails = useAllLeadDetails();
  const campaignType = useCampaignType();
  const isCallHangUp = useIsCallHangUp();

  const { user } = useAuth();
  console.log("userEntry", userEntry);

  const isShowQueueModal = useShowQueueModal();
  const [queues, setQueues] = useState<any[]>([]);
  const [selectedQueues, setSelectedQueues] = useState<any[]>([]);
  console.log("selectedQueues", selectedQueues);

  const dispatch = useAppDispatch();

  const [initialValues, setInitialValues] = useState<any>({});
  // GET LEAD INFORMATUON
  // const onGetLeadInfo = async () => {
  //   try {
  //     await dispatch(
  //       getAllLeads({
  //         campaign_uuid: selectedCampaign,
  //         campaign_mode: campaignMode,
  //       })
  //     ).unwrap();
  //   } catch (error: any) {
  //     console.log("Get lead Info Err--->", error?.message);
  //   }
  // };


  //   useEffect(() => {
  //       if (
  //         allLeadsDetails.length === 0 &&
  //         (campaignType === "outbound" || campaignType === "blended") &&
  //         isCallHangUp &&
  //         selectedCampaign &&
  //         campaignMode &&
  //         (campaignMode === "0" || campaignMode === "2")
  //       ) {
  //         onGetLeadInfo();
  //       } else if (
  //         allLeadsDetails.length === 0 &&
  //         campaignType === "inbound" &&
  //         isCallHangUp &&
  //         selectedCampaign
  //       ) {
  //         onGetLeadInfo();
  //       }
  //   }, [allLeadsDetails]);

   const [showEmailModal, setShowEmailModal] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showConfirmApiEmailModal, setShowConfirmApiEmailModal] = useState(false);
  const [selectedApiTemplateId, setSelectedApiTemplateId] = useState<string>("");
  const allowedTemplates = useAllowedTemplates();
  const activeApiConfig = useActiveApiConfig();
  const isEmailLoading = useEmailIsLoading();
  const campaignOptions=useCampaignOptions();

  const apiTemplates = useMemo(() => {
    if (activeApiConfig?.templateId) {
      return activeApiConfig.templateId.split(',').map((item: string) => {
        const parts = item.split(':');
        const id = parts[0].trim();
        const name = parts[1] ? parts[1].trim() : `Template ID: ${id}`;
        return { id, name };
      }).filter((t: any) => t.id);
    }
    return [];
  }, [activeApiConfig]);

  const selectedApiTemplate = useMemo(() => {
    return apiTemplates.find((t: any) => t.id === selectedApiTemplateId) || null;
  }, [apiTemplates, selectedApiTemplateId]);

  useEffect(() => {
    if (apiTemplates.length > 0) {
      setSelectedApiTemplateId(apiTemplates[0].id);
    } else {
      setSelectedApiTemplateId("");
    }
  }, [apiTemplates]);
  const selectedCampaignDetails = useSelectedCampaignDetails();
  const activeCampaignConfig = useMemo(() => {
    if (campaignOptions?.length > 0 && selectedCampaign) {
      const allOptions = campaignOptions.flatMap((group: any) => group.options || []);
      return allOptions.find((c: any) => c.value === selectedCampaign) || null;
    }
    return selectedCampaignDetails || null;
  }, [campaignOptions, selectedCampaign, selectedCampaignDetails]);
  console.log(selectedCampaignDetails, 'selectedCampaignDetails');

  const [isApiSending, setIsApiSending] = useState(false);

  const handleSendApiEmail = async () => {
    if (!currentLeadDetails) {
      Danger("No active lead found to send email.");
      return;
    }

    setIsApiSending(true);
    try {
      const payload = {
        config_uuid: activeCampaignConfig?.api_config_uuid,
        to: currentLeadDetails?.email || "",
        lead_data: currentLeadDetails,
        templateId: selectedApiTemplateId,
      };

      const result: any = await dispatch(submitSendApiEmail(payload)).unwrap();
      if (result && (result.statusCode === 200 || result.statusCode === "200")) {
        Success(result.message || "Email sent successfully via Netcore API.");
      } else {
        Danger(result?.message || "Failed to send email via Netcore API.");
      }
    } catch (err: any) {
      Danger(err?.message || "An error occurred while sending email.");
    } finally {
      setIsApiSending(false);
    }
  };
  // 🔄 Use cookies as fallback for script data
  const userAgentCookie = Cookies.get("user_agent");
  const cookieData = userAgentCookie ? JSON.parse(userAgentCookie) : null;
  const agentDetail = cookieData?.agent_detail;

  const agentScript = agentDetail?.agent_script;
  const [agentScriptText, setAgentScriptText] = useState<string | null>(null);
  const singleLeadDetails = useSingleLeadDetails();
  console.log(singleLeadDetails, 'singleLeadDetails');

  const currentLeadDetails = useMemo(() => {
    if (singleLeadDetails && Object.keys(singleLeadDetails).length) {
      return singleLeadDetails;
    } else if (allLeadsDetails && allLeadsDetails.length) {
      return allLeadsDetails[0];
    }
    return null;
  }, [singleLeadDetails, allLeadsDetails]);

  const parsedAgentScript = useMemo(() => {
    if (!agentScriptText) return null;    // Supports <Variable>, &lt;Variable&gt;, [Variable], or {Variable}
    return agentScriptText.replace(/(?:<|&lt;|\[|\{)(.*?)(?:>|&gt;|\]|\})/g, (match, variableName) => {
      // Create a simplified alphanumeric-only key to ignore spaces, dashes, underscores or casing
      const simplifiedSearchKey = variableName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

      // 1. Agent Match
      if (simplifiedSearchKey === 'agentname') {
        const loginName = user?.agent_detail?.username || '';
        const agentName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || loginName;
        return agentName || match;
      }

      if (!currentLeadDetails) return match;

      // 2. Customer Match (First + Last Name combined)
      if (simplifiedSearchKey === 'customername') {
        const customerName = `${currentLeadDetails?.first_name || ''} ${currentLeadDetails?.last_name || ''}`.trim();
        return customerName || match;
      }

      // 3. Direct Lead Field Match (e.g., <first_name> -> firstname)
      const directFieldKey = Object.keys(currentLeadDetails).find(
        k => k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === simplifiedSearchKey
      );
      if (directFieldKey && currentLeadDetails[directFieldKey] !== undefined && currentLeadDetails[directFieldKey] !== null && currentLeadDetails[directFieldKey] !== "") {
        return currentLeadDetails[directFieldKey];
      }

      // 4. Custom Fields Match
      if (currentLeadDetails.custom_fields) {
        const customFieldKey = Object.keys(currentLeadDetails.custom_fields).find(k => {
          const simplifiedK = k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          return simplifiedK === simplifiedSearchKey || simplifiedK === 'cf' + simplifiedSearchKey || 'cf' + simplifiedK === simplifiedSearchKey;
        });

        if (customFieldKey && currentLeadDetails.custom_fields[customFieldKey] !== undefined && currentLeadDetails.custom_fields[customFieldKey] !== null && currentLeadDetails.custom_fields[customFieldKey] !== "") {
          return currentLeadDetails.custom_fields[customFieldKey];
        }
      }

      // 5. Unmatched
      return match;
    });
  }, [agentScriptText, currentLeadDetails, user]);

  useEffect(() => {
    const storedScriptText = localStorage.getItem("agent_script_text");
    if (storedScriptText) {
      setAgentScriptText(storedScriptText);
    } else if (agentDetail?.agent_script_text) {
      setAgentScriptText(agentDetail.agent_script_text);
    }
  }, [agentDetail?.agent_script_text]);

   useEffect(() => {
    const activeConfigUuid = activeCampaignConfig?.email_type === "api"
      ? activeCampaignConfig?.api_config_uuid
      : activeCampaignConfig?.email_config_uuid;

    if (activeConfigUuid) {
      if (activeCampaignConfig?.email_type === "api") {
        dispatch(fetchApiConfig(activeConfigUuid));
      } else {
        dispatch(fetchAllowedTemplates(activeConfigUuid));
      }
    }
  }, [activeCampaignConfig?.email_config_uuid, activeCampaignConfig?.api_config_uuid, activeCampaignConfig?.email_type, dispatch]);

  // // RADIO OPTIONS
  const options = [
    { label: "Log In", value: "0", isDisabled: false },
    //{ label: "Break", value: "1", isDisabled: false },
    { label: "Log Out", value: "2", isDisabled: false },
  ];
  const getOptions = (status: string) => {
    if (status === "0") {
      return options;
    } else if (status === "1") {
      let newOption = options.map((x) => {
        return {
          ...x,
          isDisabled: x.value === "2" ? true : false,
        };
      });
      return newOption;
    } else if (status === "2") {
      let newOption = options.map((x) => {
        return {
          ...x,
          isDisabled: x.value === "1" ? true : false,
        };
      });
      return newOption;
    } else {
      return options;
    }
  };

  const onGetCampaign = async () => {
    try {
      const response: any = await dispatch(getCampaignList()).unwrap();
      const res: any = await dispatch(getCampaign({ list: "all" })).unwrap();
      //console.log("selectedCampaignselectedCampaign response ", response);
      //console.log("selectedCampaignselectedCampaign resss", res);
      if (res && res?.statusCode === 200) {
        let newObj = {};
        let newData: any = [];
        let inboundData =
          res?.data?.inbound_campaign && res?.data?.inbound_campaign.length
            ? res?.data?.inbound_campaign.map((x: any) => {
              return {
                ...x,
                dataType: "inbound",
              };
            })
            : [];
        let outboundData =
          res?.data?.outbound_campaign && res?.data?.outbound_campaign.length
            ? res?.data?.outbound_campaign.map((x: any) => {
              return {
                ...x,
                dataType: "outbound",
              };
            })
            : [];
        let blendedData =
          res?.data?.blended_campaign && res?.data?.blended_campaign.length
            ? res?.data?.blended_campaign.map((x: any) => {
              return {
                ...x,
                dataType: "blended",
              };
            })
            : [];
        let prepareData = [...inboundData, ...outboundData, ...blendedData];

        prepareData.forEach((val: any) => {
          //console.log("selectedCampaignselectedCampaign preparedataaaa", prepareData)
          if (response?.data?.length) {
            response.data?.forEach((value: any) => {
              //console.log("selectedCampaignselectedCampaign valuessss", value)
              if (value._id.campaign_uuid === val.uuid) {
                newObj = {
                  ...newObj,
                  [val.uuid]: value?.login_status,
                };
                newData.push({
                  ...val,
                  options: getOptions(value?.login_status) || [],
                });
              }
            });
          } else {
            newObj = { ...newObj, [val.uuid]: "2" };
            newData.push({
              ...val,
              options: getOptions("2") || [],
            });
          }
        });
        //console.log("selectedCampaignselectedCampaign newobjj", newObj)
        let Ids: any = [];
        newData?.map((x: any) => {
          Ids.push(x.uuid);
        });
        prepareData.map((val: any) => {
          if (!Ids.includes(val.uuid)) {
            newObj = { ...newObj, [val.uuid]: "2" };
            newData.push({
              ...val,
              options: getOptions("2") || [],
            });
          }
        });
        setInitialValues(newObj);
      }


    } catch (error: any) {
      console.log("Get campaign list Err ---->", error?.message);
    }
  };

  useEffect(() => {
    const savedQueues = Cookies.get("agent_queues");
    const savedSelectedQueues = Cookies.get("selected_queues");

    if (savedQueues) {
      try {
        const parsedQueues = JSON.parse(savedQueues);
        if (Array.isArray(parsedQueues) && parsedQueues.length > 0) {
          setQueues(parsedQueues);
        }
      } catch (e) {}
    }

    if (savedSelectedQueues) {
      try {
        const parsedSelected = JSON.parse(savedSelectedQueues);
        if (Array.isArray(parsedSelected) && parsedSelected.length > 0) {
          const initialSelectedOptions = parsedSelected.map((sq: any) => ({
            label: sq.name || sq.queue_name,
            value: sq.uuid || sq._id
          }));
          setSelectedQueues(initialSelectedOptions);
          dispatch(onSelectQueues(parsedSelected));
        }
      } catch (e) {}
    }
  }, []);

  const onGetCampaignOption = async () => {
    try {
      //console.log("selectedCampaignselectedCampaign before ");
      const result = await dispatch(getCampaignOption({ list: "all" })).unwrap();
      //console.log("selectedCampaignselectedCampaign after ", result);
      console.log(result, 'resulssst');
      if (result?.data?.length > 0) {
        const campaignName = result.data[0].campaign_name;
        if (campaignName) {
          setLoginAgentCampaign(campaignName);
        }
        dispatch(onSelectCampaignMode(result?.data[0]?.dial_method));
        dispatch(onSetCampaignType(result?.data[0]?.campaign_type === "0" ? "outbound" : result.data[0]?.campaign_type === "2" ? "blended" : "inbound"));
        dispatch(onSelectCampaign(result.data[0].uuid));

        // Call Queue selection check after login
        const hasQueueSelectionPermission = !!(
          user?.isCallQueueSelection ||
          user?.permission?.callqueue_selection === "0" ||
          (user as any)?.agent_detail?.agent_permission?.[0]?.callqueue_selection === "0"
        );

        if (hasQueueSelectionPermission) {
          let extractedQueues: any[] = [];
          if (Array.isArray(result?.data)) {
            result.data.forEach((item: any) => {
              if (Array.isArray(item.call_queue_details)) {
                item.call_queue_details.forEach((q: any) => {
                  const qId = q.uuid || q._id;
                  if (qId && !extractedQueues.some((ex: any) => (ex.uuid || ex._id) === qId)) {
                    extractedQueues.push(q);
                  }
                });
              }
            });
          }

          if (extractedQueues.length > 1) {
            // More than 1 queue: Show Modal for agent to select if not selected already
            Cookies.set("agent_queues", JSON.stringify(extractedQueues));
            setQueues(extractedQueues);

            const existingSelectedQueuesCookie = Cookies.get("selected_queues");
            if (existingSelectedQueuesCookie) {
              try {
                const parsedSelected = JSON.parse(existingSelectedQueuesCookie);
                if (Array.isArray(parsedSelected) && parsedSelected.length > 0) {
                  const initialSelectedOptions = parsedSelected.map((sq: any) => ({
                    label: sq.name || sq.queue_name,
                    value: sq.uuid || sq._id
                  }));
                  setSelectedQueues(initialSelectedOptions);
                  dispatch(onSelectQueues(parsedSelected));
                  dispatch(setShowQueueModal(false));
                  return;
                }
              } catch (e) {
                console.log("Error parsing selected_queues cookie:", e);
              }
            }

            setSelectedQueues([]);
            dispatch(setShowQueueModal(true));
          } else if (extractedQueues.length === 1) {
            // Only 1 queue: DO NOT show modal, automatically set and dispatch single queue
            const singleQueueData = [{
              uuid: extractedQueues[0].uuid || extractedQueues[0]._id,
              name: extractedQueues[0].name || extractedQueues[0].queue_name || "queue",
              timeout: extractedQueues[0].timeout || "30"
            }];
            Cookies.set("agent_queues", JSON.stringify(extractedQueues));
            Cookies.set("selected_queues", JSON.stringify(singleQueueData));
            dispatch(onSelectQueues(singleQueueData));
            dispatch(setShowQueueModal(false));

            try {
              let payload: any = {
                extension: user?.agent_detail?.extension_details?.[0]?.username,
                campaign_uuid: result.data[0]?.uuid || selectedCampaign || Cookies.get("selectedCampaign") || "",
                feature: "resume",
                campaign_type: (result.data[0]?.campaign_type === "1" || campaignType === "inbound") ? "" : "2",
                selected_queues: singleQueueData
              };
              if (result.data[0]?.campaign_type === "2" || campaignType === "blended") {
                payload["campaign_flag"] = "blended";
              }
              dispatch(callQueueInbound(payload));
            } catch (err: any) {
              console.log("Error dispatching single queue resume:", err?.message);
            }
          }
        }
      }
    } catch (error: any) {
      console.log("Get campaign list Err ---->", error?.message);
    }
  };

  // login entry
  const campaignUpdate = async () => {
    console.log(selectedCampaign, 'selectedCampaign');
    try {
      let payload: any = {
        campaigns_details: [{
          login_status: "0",
          campaign_uuid: selectedCampaign
        }],
        feature: userEntry ? userEntry : "login-entry",
      };
      //console.log("initialValues", initialValues)
      // Object.entries(initialValues)?.map(([key, val]: any) => {
      //   let obj: any = {
      //     campaign_uuid: key,
      //     login_status: val,
      //   };
      //   payload["campaigns_details"].push(obj);
      // });
      //console.log("selectedCampaignselectedCampaign  payload", payload)
      let res: any = await dispatch(updateAgentCampaign(payload)).unwrap();
      if (res && res.statusCode === 200) {
        // Success(res.data);
        onGetCampaignOption();
        // dispatch(onSelectCampaign("44fafdc6-5a87-47f3-8498-5656953cae6e"))
        // Cookies.set("campaign_modal", "1", { expires: 1 });
        // setIsUpdateLoading(false);
        // liveChatOption(1);
      }
    } catch (error: any) {
      console.log("error while updating campaign", error.message);

    }
  }

  // useEffect(() => {
    // if (userEntry === "login-entry") {
      // if (userEntry === "login-entry" && !campaignFetched) {
      // dispatch(setCampaignFetched(true));
      // onGetCampaign();
      // campaignUpdate()
    // }
  // }, [userEntry]);
  // }, [userEntry, campaignFetched]);

    useEffect(() => {
    if (userEntry === "login-entry" && !campaignFetched) {
      dispatch(setCampaignFetched(true));
      campaignUpdate()
    }
  }, [userEntry, campaignFetched]);

  // useEffect(() => {
  //   if (Object.keys(initialValues).length && !campaignUpdated) {
  //     dispatch(setCampaignUpdated(true));
  //     campaignUpdate();
  //   }
  // }, [initialValues, campaignUpdated]);

  console.log("selectedCampaignselectedCampaign", selectedCampaign);
  // dispatch(onSelectCampaignMode("2"));
  // dispatch(onSetCampaignType("outbound"));
  // dispatch(onSelectCampaign("44fafdc6-5a87-47f3-8498-5656953cae6e"));
  //const { user } = useAuth();

  useEffect(() => {
    // if (selectedCampaign) {
    //   dispatch(getActiveUnreadChat({ campaign_uuid: selectedCampaign })).unwrap();
    // } else {
      dispatch(onUnSelectCampaign());
    // }
  }, [selectedCampaign]);

  return (
    // chat socket ::yaksh::
    <SocketProvider>
      <div
        className="w-full flex gap-4 min-h-[calc(100vh-120px)]"
      // style={{ gridTemplateColumns: "30% 70%" }}
      >
        {/* LEFT PANEL (Now has history instead of ActiveList) */}
        <div className="w-4/12 flex flex-col gap-4">
          {/* <div className="bg-white rounded-[10px] shadow-md p-4">
            <WaitingCalls />
          </div> */}
          <div className="bg-white rounded-[10px] shadow-md p-4">
            <CallSummaryCards />
          </div>
          <div className="bg-white rounded-[10px] shadow-md p-5 flex-1 min-h-[360px]">
            <ListingTab
              activeId={activeId}
              setActiveId={setActiveId}
              activeTab=""
            />
          </div>

          {isWhatsAppEnabled(user) && (
            <div className="bg-white rounded-[10px] shadow-md p-4 min-h-[200px]">
              <UnreadList
                sectionClass="h-full"
                sectionBodyClass=""
              // sectionBodyClass="h-[calc(100%-1.5rem)]"
              />
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        {/* RIGHT PANEL */}
        <div className="w-8/12 flex flex-col gap-4 overflow-y-auto ">
          {/* Top Row: ActiveList + LeadInformationTab */}
          <div
            className="flex gap-4"
          // style={{ gridTemplateColumns: "50% 50%" }}
          >
            <div className="bg-white rounded-[10px] shadow-md p-4 w-1/2 h-[460px] flex flex-col">
              <LeadInformationTab />
            </div>
            <div className="p-4 bg-white rounded-[10px] shadow-md h-[460px] w-1/2 flex flex-col">
              {agentScript === "0" && (
                <div className="flex flex-col shrink-0 border-b border-gray-100 pb-2 mb-2">
                  <div className="bg-[#F2F2F2] 3xl:px-6 3xl:py-2 py-1 px-4 flex items-center  justify-between h-[5vh] rounded-t-md">
                    <span className="3xl:text-base text-xs text-heading font-bold ">
                      Agent Script
                    </span>
                    <Button
                      text={showScript ? "Hide Script" : "Show Script"}
                      className="px-2 py-1 rounded-md text-[10px] w-fit"
                      onClick={() => {
                        if (!agentScriptText) {
                          Warning("Agent script text not available");
                          return;
                        }
                        setShowScript(!showScript);
                      }}
                    />
                  </div>

                  {showScript && agentScriptText && (
                    <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-md overflow-y-auto h-[235px] min-h-[50px] max-h-[300px] resize-y overflow-x-hidden">
                      <p className="text-xs text-[#000] whitespace-pre-wrap font-bold break-words">
                        {parsedAgentScript}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <ActiveList
                  setActiveId={setActiveId}
                  sectionClass="h-full"
                  sectionBodyClass="h-[calc(100%-3rem)]"
                  headerAction={
                  currentLeadDetails && (activeCampaignConfig?.email_config_uuid || activeCampaignConfig?.api_config_uuid) && (
                      activeCampaignConfig?.email_type === "api" ? (
                        <div className="relative">
                          <Button
                            text={showTemplateDropdown ? "Close" : (isApiSending ? "Sending..." : "Send Email")}
                            className="px-2 py-1 rounded-md text-[10px] w-fit text-white"
                            onClick={() => {
                              if (!currentLeadDetails?.email || currentLeadDetails.email.trim() === "") {
                                Danger("Email address is not present for this customer.");
                                return;
                              }
                              setShowTemplateDropdown(!showTemplateDropdown);
                            }}
                            disabled={isApiSending}
                          />
                          {showTemplateDropdown && (
                            <div className="absolute right-0 top-full mt-1 z-[100] bg-white shadow-2xl rounded-lg border border-gray-100 min-w-[150px] py-1 animate-in fade-in zoom-in duration-150">
                              <div className="max-h-[250px] overflow-y-auto">
                                {apiTemplates.length > 0 ? (
                                  apiTemplates.map((t: any) => (
                                    <div
                                      key={t.id}
                                      className="px-4 py-2 text-[11px] hover:bg-gray-50 cursor-pointer text-gray-700 font-bold border-b last:border-0 border-gray-50"
                                      onClick={() => {
                                        setSelectedApiTemplateId(t.id);
                                        setShowConfirmApiEmailModal(true);
                                        setShowTemplateDropdown(false);
                                      }}
                                    >
                                      {t.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-2.5 text-[10px] text-gray-400 text-center">
                                    No template IDs found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <Button
                            text={showTemplateDropdown ? "Close" : "Send Email"}
                            className="px-2 py-1 rounded-md text-[10px] w-fit text-white"
                            onClick={() => {
                              if (!currentLeadDetails?.email || currentLeadDetails.email.trim() === "") {
                                Danger("Email address is not present for this customer.");
                                return;
                              }
                              setShowTemplateDropdown(!showTemplateDropdown);
                            }}
                          />
                          {showTemplateDropdown && (
                            <div className="absolute right-0 top-full mt-1 z-[100] bg-white shadow-2xl rounded-lg border border-gray-100 min-w-[200px] py-1 animate-in fade-in zoom-in duration-150">
                              <div className="max-h-[250px] overflow-y-auto">
                                {isEmailLoading ? (
                                  <div className="px-4 py-3 text-[10px] text-gray-400 text-center flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    Loading templates...
                                  </div>
                                ) : Array.isArray(allowedTemplates) && allowedTemplates.length > 0 ? (
                                  allowedTemplates.map((t: any) => (
                                    <div
                                      key={t.uuid}
                                      className="px-4 py-2 text-[11px] hover:bg-gray-50 cursor-pointer text-gray-700 font-medium border-b last:border-0 border-gray-50"
                                      onClick={() => {
                                        setSelectedTemplate({ label: t.name, value: t.uuid });
                                        setShowEmailModal(true);
                                        setShowTemplateDropdown(false);
                                      }}
                                    >
                                      {t.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-2 text-[11px] hover:bg-gray-50 cursor-pointer text-gray-700 font-medium text-center"
                                    onClick={() => {
                                      setSelectedTemplate(null);
                                      setShowEmailModal(true);
                                      setShowTemplateDropdown(false);
                                    }}
                                  >
                                    Send Custom Email
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Full-width CrmInformation */}
          {/*<div className="w-full bg-white rounded-[10px] shadow-md p-4 min-h-[220px]">
            <CrmInformation />
          </div>*/}
        </div>
      </div>
       {showConfirmApiEmailModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col overflow-hidden animate-in zoom-in duration-200 border border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
              <div className="p-2 bg-yellow-50 rounded-xl text-yellow-500">
                <Icon name="Mail" width={24} height={24} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-800">
                  Confirm Email Send
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">
                  Netcore API Integration
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="text-sm font-semibold text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to send the email with template: <span className="text-primary font-extrabold">{selectedApiTemplate?.name || selectedApiTemplateId}</span> to <span className="text-gray-800 font-extrabold">{currentLeadDetails?.email || "this recipient"}</span>?
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 w-full">
              <button
                type="button"
                onClick={() => setShowConfirmApiEmailModal(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowConfirmApiEmailModal(false);
                  await handleSendApiEmail();
                }}
                disabled={isApiSending}
                className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-xs"
              >
                {isApiSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showEmailModal && (
        <EmailModal
          visible={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          initialTemplateUuid={selectedTemplate?.value}
        />
      )}
      {isShowQueueModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[480px] bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#322996]/10 rounded-lg">
                <Icon name="userLogin" className="w-6 h-6 text-[#322996]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Select Call Queue to Login</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Please choose the call queue you would like to join for this session.</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">
                {selectedQueues.length} of {queues.length} queue(s) selected
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedQueues.length === queues.length) {
                    setSelectedQueues([]);
                  } else {
                    const allOptions = queues.map((q: any) => ({
                      label: q.name || q.queue_name,
                      value: q.uuid || q._id
                    }));
                    setSelectedQueues(allOptions);
                  }
                }}
                className="text-xs font-semibold text-[#322996] hover:underline cursor-pointer"
              >
                {selectedQueues.length === queues.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="max-h-[350px] overflow-y-auto mb-8 pr-2 custom-scrollbar">
              <Select
                name="selectedQueues"
                options={queues.map((q: any) => ({ label: q.name || q.queue_name, value: q.uuid || q._id }))}
                value={selectedQueues}
                onChange={(options: any) => setSelectedQueues(options || [])}
                isManual={true}
                isMulti={true}
                isClearable={true}
                isShowLabel={false}
                placeholder="Search and select queues..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 w-full">
              <button
                type="button"
                onClick={() => {
                  const selectedQueueData = selectedQueues.map((opt: any) => {
                    const fullQueue = queues.find((q: any) => (q.uuid || q._id) === opt.value);
                    return { uuid: opt.value, name: opt.label, timeout: fullQueue?.timeout || "30" };
                  });
                  dispatch(onSelectQueues(selectedQueueData));
                  Cookies.set("selected_queues", JSON.stringify(selectedQueueData));
                  dispatch(setShowQueueModal(false));
                }}
                className="w-full py-3 rounded-xl bg-[#322996] text-white font-semibold hover:bg-[#28217a] transition-all shadow-lg shadow-[#322996]/20 active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </SocketProvider>
  );
}
