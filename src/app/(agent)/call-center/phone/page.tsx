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
import { onSelectCampaign, onSelectCampaignMode, onSetCampaignType, setCampaignFetched, setCampaignUpdated, useCampaignFetched, useCampaignMode, useCampaignType, useCampaignUpdated, useIsCallHangUp, useSelectedCampaign, useSelectedCampaignDetails, useUserEntry } from "@/redux/slice/commonSlice";
import { Button } from "@/components/forms";
import { SocketProvider } from "@/contexts/chatSocket/SocketProvider";
import { useAuth } from "@/contexts/hooks/useAuth";
import { isWhatsAppEnabled } from "@/components/helperFunctions";
import { getCampaign, getCampaignList, getCampaignOption, updateAgentCampaign } from "@/redux/slice/campaignSlice";
import ActiveList from "@/components/call-center-components/phone/ActiveList";
import { getAllLeads, useAllLeadDetails, useSingleLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { LoginAgentCampaignKey, setLoginAgentCampaign } from "@/utils/Storage";
import { Warning } from "@/redux/services/toasterService";
import Cookies from "js-cookie";
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

  useEffect(() => {
    if (userEntry === "login-entry") {
      // if (userEntry === "login-entry" && !campaignFetched) {
      // dispatch(setCampaignFetched(true));
      // onGetCampaign();
      campaignUpdate()
    }
  }, [userEntry]);
  // }, [userEntry, campaignFetched]);

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
    </SocketProvider>
  );
}
