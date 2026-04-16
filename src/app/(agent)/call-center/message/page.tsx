"use client";
import { useEffect, useRef, useState } from "react";
import CrmInformation from "@/components/call-center-components/phone/CrmInformation";
import LeadInformationTab from "@/components/call-center-components/phone/LeadInformationTab";
import ListingTab from "@/components/call-center-components/phone/ListingTab";
import UnreadList from "@/components/call-center-components/phone/UnreadList";
import WaitingCalls from "@/components/call-center-components/phone/WaitingCalls";
import { useAppDispatch } from "@/redux/hooks";
import {
  getActiveUnreadChat,
  onUnSelectCampaign,
  setIncomingChannelType,
  useActiveChats,
  useIncomingChannelType,
  useUnReadChats,
} from "@/redux/slice/chatSlice";
import {
  onSelectCampaign,
  onSelectCampaignMode,
  onSetCampaignType,
  setCampaignFetched,
  setCampaignUpdated,
  useCampaignFetched,
  useCampaignUpdated,
  useSelectedCampaign,
  useUserEntry,
} from "@/redux/slice/commonSlice";
import { SocketProvider } from "@/contexts/chatSocket/SocketProvider";
import { useAuth } from "@/contexts/hooks/useAuth";
import { isWhatsAppEnabled } from "@/components/helperFunctions";
import {
  getCampaign,
  getCampaignList,
  getCampaignOption,
  updateAgentCampaign,
} from "@/redux/slice/campaignSlice";
import ListingTabWhatsapps from "@/components/call-center-components/phone/ListingTabWhatsapps";
import ActiveMessageList from "@/components/call-center-components/phone/ActiveMessageList";
import OmniLeadInformationTab from "@/components/call-center-components/phone/OmniLeadInformationTab";
import OmniUnreadList from "@/components/call-center-components/phone/OmniUnread";
/* ============================== PHONE PAGE ============================== */

export default function Phone() {
  const incomingActiveType = useIncomingChannelType();
  const [active, setActive] = useState(incomingActiveType || "all");
  const selectedCampaign = useSelectedCampaign();
  const campaignFetched = useCampaignFetched();
  const campaignUpdated = useCampaignUpdated();
  const activeChatListData = useActiveChats()
  const userEntry = useUserEntry();
  const unReadChatList = useUnReadChats();

  useEffect(() => {
    if (incomingActiveType) {
      setActive(incomingActiveType);
    }
  }, [incomingActiveType]);

  const getAllChannelUnread = () => {
    return (
      getUnreadCount("whatsapp") +
      getUnreadCount("instagram") +
      getUnreadCount("facebook")
    );
  };
  // get active list unread count
  const getUnreadCount = (channel: any) => {
    if (channel === "unattended") {
      return unReadChatList?.length ?? 0;
    }
    return activeChatListData
      ?.filter(
        msg =>
          msg?.channel_type?.toLowerCase() === channel &&
          Number(msg.unread_message_count) > 0
      )
      .reduce((sum, msg) => sum + Number(msg.unread_message_count), 0);
  };

  const dispatch = useAppDispatch();
  const [initialValues, setInitialValues] = useState<any>({});
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
      console.log("selectedCampaignselectedCampaign response ", response);
      console.log("selectedCampaignselectedCampaign resss", res);
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
          console.log(
            "selectedCampaignselectedCampaign preparedataaaa",
            prepareData
          );
          if (response?.data?.length) {
            response.data?.forEach((value: any) => {
              console.log("selectedCampaignselectedCampaign valuessss", value);
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
        console.log("selectedCampaignselectedCampaign newobjj", newObj);
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
      console.log("selectedCampaignselectedCampaign before ");
      const result = await dispatch(
        getCampaignOption({ list: "all" })
      ).unwrap();
      console.log("selectedCampaignselectedCampaign after ", result);

      if (result?.data?.length > 0) {
        dispatch(onSelectCampaignMode(result?.data[0]?.dial_method));
        dispatch(
          onSetCampaignType(
            result?.data[0]?.campaign_type === "0"
              ? "outbound"
              : result.data[0]?.campaign_type === "2"
                ? "blended"
                : "inbound"
          )
        );
        dispatch(onSelectCampaign(result.data[0].uuid));
      }
    } catch (error: any) {
      console.log("Get campaign list Err ---->", error?.message);
    }
  };

  const campaignUpdate = async () => {
    try {
      let payload: any = {
        campaigns_details: [],
        feature: userEntry ? userEntry : "login-entry",
      };
      console.log("initialValues", initialValues);
      Object.entries(initialValues)?.map(([key, val]: any) => {
        let obj: any = {
          campaign_uuid: key,
          login_status: val,
        };
        payload["campaigns_details"].push(obj);
      });
      console.log("selectedCampaignselectedCampaign  payload", payload);
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
  };

  useEffect(() => {
    if (userEntry === "login-entry" && !campaignFetched) {
      dispatch(setCampaignFetched(true));
      onGetCampaign();
    }
  }, [userEntry, campaignFetched]);

  useEffect(() => {
    if (Object.keys(initialValues).length && !campaignUpdated) {
      dispatch(setCampaignUpdated(true));
      campaignUpdate();
    }
  }, [initialValues, campaignUpdated]);

  console.log("selectedCampaignselectedCampaign", selectedCampaign);
  // dispatch(onSelectCampaignMode("2"));
  // dispatch(onSetCampaignType("outbound"));
  // dispatch(onSelectCampaign("44fafdc6-5a87-47f3-8498-5656953cae6e"));
  const { user } = useAuth();
  const messagingAllowed =
    user?.permission?.whatsapp === "0" ||
    user?.permission?.instagram === "0" ||
    user?.permission?.facebook === "0";
  useEffect(() => {
    if (!selectedCampaign) {
      dispatch(onUnSelectCampaign());
      return;
    }
    // Run immediately
    dispatch(getActiveUnreadChat({ campaign_uuid: selectedCampaign })).unwrap();
    // Run every 5 seconds
    const interval = setInterval(() => {
      dispatch(getActiveUnreadChat({ campaign_uuid: selectedCampaign })).unwrap();
    }, 5000);

    // Cleanup interval on unmount or when selectedCampaign changes
    return () => clearInterval(interval);

  }, [selectedCampaign]);


  const tabs = [
    { id: "all", label: "All", },
    { id: "whatsapp", label: "WhatsApp", },
    { id: "instagram", label: "Instagram", },
    { id: "facebook", label: "Facebook", },
    { id: "unattended", label: "UnAttended", },
  ];

  const filteredTab = tabs.filter((tt) => {

    if (tt.id === "all" || tt.id === "unattended") return true;

    return (
      user?.permission?.hasOwnProperty(tt.id) &&
      user.permission[tt.id] === "0"
    );
  });


  return (
    // chat socket ::yaksh::
    <SocketProvider>
      {/* Tabs header */}
      <div className="bg-white flex gap-4 items-center border-b-2 border-grey-500 p-2">
        {filteredTab?.map((t) => {
          return (
            <button
              key={t.id}
              onClick={() => {
                dispatch(setIncomingChannelType(""));
                setActive(t.id)
              }}
              className={`
        flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md 
        transition-all  
        ${active === t.id
                  ? "font-bold text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
                }
      `}
            >
              {/* colored dot */}
              <span
                className={`w-3 h-3 rounded-full 
                  ${t.id === "whatsapp"
                    ? "bg-green-500"
                    : t.id === "instagram"
                      ? "bg-pink-400"
                      : t.id === "facebook"
                        ? "bg-blue-600"
                        : t?.id === "unattended" ? "bg-amber-500" : "bg-sky-400"
                  }`}
              ></span>

              {/* Label */}
              <span className="text-sm">{t?.label}</span>

              {/* Count badge */}
              <span
                className={`
                  text-xs px-2 py-0.5 rounded-full font-medium 
                  ${`${t.id === "whatsapp"
                    ? "bg-green-500"
                    : t.id === "instagram"
                      ? "bg-pink-400"
                      : t.id === "facebook"
                        ? "bg-blue-600"
                        : t?.id === "unattended" ? "bg-amber-500" : "bg-sky-400"
                  }`

                  } text-white
        `}
              >
                {t.id == "all" ? getAllChannelUnread() : getUnreadCount(t.id)}

              </span>

            </button>
          )
        })}
      </div>
      {active === "unattended" ? (
        <div
          className="grid gap-0 h-[80vh] overflow-hidden"
          style={{ gridTemplateColumns: "100%" }}
        >
          <OmniUnreadList sectionClass="h-full"
            sectionBodyClass="" />
        </div>
      ) : (
        <div
          className="grid gap-0 h-[80vh] overflow-hidden"
          style={{ gridTemplateColumns: "25% 50% 25%" }}
        >
          {/* LEFT PANEL (Now has history instead of ActiveList) */}
          <div className="bg-white border-r border-gray-200 flex flex-col ">
            <ActiveMessageList
              sectionClass=""
              sectionBodyClass=""
              active={active}
            />
          </div>
          {/* center conversation */}
          <div className="bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
            <ListingTabWhatsapps active={active} />
          </div>
          {/* RIGHT: Lead Info Section */}
          <div className="bg-white h-full overflow-y-auto ">
            <OmniLeadInformationTab active={active} />
          </div>
        </div>
      )}
    </SocketProvider>
  );
}
