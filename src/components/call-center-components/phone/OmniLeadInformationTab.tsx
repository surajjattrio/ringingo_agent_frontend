"use client";
import { useEffect, useState } from "react";
import LeadInformation from "./LeadInformation";
import FinishLead from "./FinishLead";
import { useDispositionTimerEnded, useIsCallHangUp } from "@/redux/slice/commonSlice";
import OmniLeadInformation from "./OmniLeadInfo";

/* ============================== LEAD INFORMATION TAB ============================== */
interface OmniLeadInformationTabProps{
  active:string;
}
const OmniLeadInformationTab = ({active}:OmniLeadInformationTabProps) => {
  const [isHangUp, setIsHangUp] = useState<boolean>(false);
  const isWrapUpTimeFinished = useDispositionTimerEnded();
  const isCallHangUp = useIsCallHangUp();
  useEffect(() => {
    if (!isCallHangUp) {
      setIsHangUp(false);
    }
    if(isWrapUpTimeFinished){
      setIsHangUp(true)
    }
  }, [isCallHangUp]);

  return (
    <>
      {isHangUp ? (
        <>
          <FinishLead setIsHangUp={setIsHangUp} />
        </>
      ) : (

        <OmniLeadInformation setIsHangUp={setIsHangUp} active={active}/>
      )}
    </>
  );
};

export default OmniLeadInformationTab;
