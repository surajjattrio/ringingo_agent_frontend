"use client";
import { useEffect, useState } from "react";
import LeadInformation from "./LeadInformation";
import FinishLead from "./FinishLead";
import { useDispositionTimerEnded, useIsCallHangUp } from "@/redux/slice/commonSlice";

/* ============================== LEAD INFORMATION TAB ============================== */

const LeadInformationTab = () => {
  const [isHangUp, setIsHangUp] = useState<boolean>(false);
  console.log(isHangUp,'ishangup from lead');
  
  const isWrapUpTimeFinished = useDispositionTimerEnded();
  console.log(isWrapUpTimeFinished,'ishangup isWrapUpTimeFinished');
  const isCallHangUp = useIsCallHangUp();
  useEffect(() => {
    if (!isCallHangUp) {
      setIsHangUp(false);
    }
    if(isWrapUpTimeFinished){
      setIsHangUp(true)
    }
  }, [isCallHangUp,isWrapUpTimeFinished]);

  return (
    <>
      {isHangUp ? (
        <>
          <FinishLead setIsHangUp={setIsHangUp} />
        </>
      ) : (
        <LeadInformation setIsHangUp={setIsHangUp} />
      )}
    </>
  );
};

export default LeadInformationTab;
