"use client";
/* ============================== CRM INFORMATION BOX ============================== */
import { useEffect } from "react";

import { Button } from "@/components/forms";
import { Chip } from "@/components/ui-components";
import { useAppDispatch } from "@/redux/hooks";
import { NoRecordFound } from "@/components/ui-components";

import { useSingleLeadDetails } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import {
  campaignWebForms,
  blendedcampaignWebForms,
  inboundcampaignWebForms,
  clearWebFormSlice,
  sendWebform,
  useWebformList,
} from "@/redux/slice/campaignSlice";
import { useLeadInfo, useSelectedCampaign,useCampaignType } from "@/redux/slice/commonSlice";

const CrmInformation = () => {
  const selectedCampaign = useSelectedCampaign();
  const webformList = useWebformList();
  const campaignType = useCampaignType();
  const singleLeadDetails = useSingleLeadDetails();
  const leadInfo = useLeadInfo();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const isSingleLeadDetailsEmpty =
      Object.keys(singleLeadDetails).length === 0 &&
      singleLeadDetails.constructor === Object;
    if (selectedCampaign && !isSingleLeadDetailsEmpty && leadInfo) {
      // if (selectedCampaign && singleLeadDetails && leadInfo) {
    	if(campaignType == 'outbound'){
        dispatch(
          campaignWebForms({
            feature: "webform",
            campaign_uuid: selectedCampaign,
          })
        ).unwrap();
      }else if(campaignType == 'blended'){
        dispatch(
          blendedcampaignWebForms({
            feature: "webform",
            campaign_uuid: selectedCampaign,
          })
        ).unwrap();
      }else if(campaignType == 'inbound'){
        dispatch(
          inboundcampaignWebForms({
            feature: "webform",
            campaign_uuid: selectedCampaign,
          })
        ).unwrap();
      }
    } else {
      dispatch(clearWebFormSlice());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, singleLeadDetails, leadInfo]);

  const openWebForm = (url: string, name: string) => {
    let params = "";
    params = "width=" + screen.width;
    params += ", height=" + screen.height;
    params +=
      ", top=0, left=0, fullscreen=yes, directories=no, location=no, menubar=no, resizable=no, scrollbars=no, status=no, toolbar=no";
    window.open(url, name, params);
  };

  const onSendWebForm = async (webform: any) => {
    const webformResponse: any = await dispatch(
      sendWebform({
        webform_uuid: webform.uuid,
        lead_uuid: singleLeadDetails?.lead_management_uuid,
      })
    );
    if (webformResponse?.payload?.data) {
      openWebForm(webformResponse?.payload?.data, webform.name);
    }
  };

  return (
    <div className=" border-dark-800 bg-blue-50 h-[50vh] ">
      {/* <div className="bg-white 3xl:px-6 3xl:py-2.5 py-1.5 px-4 h-[5.8vh] rounded-md"> */}
      <div className="bg-[#F2F2F2] 3xl:px-6 3xl:py-2.5 py-1.5 px-4 flex items-center  justify-between h-[5.8vh]">

        <span className="3xl:text-base text-xs text-heading font-bold">
          CRM Information
        </span>
      </div>
      {/* <div className="my-4 flex justify-center">
        <span className="text-base text-heading font-bold">
          Webform
        </span>
      </div> */}
      <div className="3xl:pt-2 3xl:pb-6 pt-1 pb-2 rounded-b-lg">
        {webformList?.length ? (
         <div className="w-full h-full items-center flex">
            {webformList.map((webform: any, index: number) => {
              return (
                <div className="p-1 m-1" key={index}>
                  <Button
                    text={webform.name}
                    loaderClass="!border-primary-green !border-t-transparent"
                    style="primary"
                    className="px-2 py-1 font-normal max-w-[100px] break-all whitespace-break-spaces"
                    onClick={() => {
                      onSendWebForm(webform);
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full  flex justify-center items-center">
        {/* // className={`w-full flex justify-center items-center ${sectionBodyClass}`} */}

            {/* <Chip title="No record found" /> */}
            <NoRecordFound
          title="No Active Calls"
          description={!selectedCampaign ? "Select campaign to view data" : ""}
          topImageClass="p-0"
          imageClass="!h-24 !w-24"
        />
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmInformation;
