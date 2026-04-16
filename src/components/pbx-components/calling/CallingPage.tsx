// "use client";
// import { useState } from "react";

// // PROJECT IMPORTS
// import DefaultPage from "./LiveCallComponents/DefaultPage";
// import DtmfPage from "./LiveCallComponents/DtmfPage";
// import QueueTransferPage from "./LiveCallComponents/QueueTransferPage";
// import TransferPage from "./LiveCallComponents/TransferPage";
// import AgentTransferPage from "./LiveCallComponents/AgentTransferPage";
// import RingGroupTransferPage from "./LiveCallComponents/RingGroupTransferPage";
// import IvrTransferPage from "./LiveCallComponents/IvrTransferPage";
// import ExternalTransferPage from "./LiveCallComponents/ExternalTransferPage";
// import TransferCallPage from "./LiveCallComponents/TransferCallPage";
// import DtmfTransferPage from "./LiveCallComponents/DtmfTransferPage";

// // TYPES
// interface CallingPageProps {
//   hangupCall: any;
//   isHold: boolean;
//   seconds: number;
//   minutes: number;
//   isShowCallDuration: boolean;
//   isMuted: any;
//   muteMediaSession: any;
//   unMuteMediaSession: any;
//   confmuteMediaSession :any;
//   confunMuteMediaSession : any;
//   onCallUnHold: any;
//   onCallHold: any;
//   controlVolume: any;
//   page: string;
//   setPage: any;
//   agentTransferCall: any;
//   ringGroupTransferCall: any;
//   queueTransferCall: any;
//   ivrTransferCall: any;
//   externalTransferCall: any;
//   dtmfTransferCall: any;
//   sendDTMF: any;
//   callerNumber: string;
//   callerName: string;
//   callType: string;
//   showConferenceBtn: boolean;
//   setSuccessMessage: any;
// }

// /* ============================== CALLING PAGE ============================== */

// const CallingPage = (props: CallingPageProps) => {
//   const {
//     hangupCall,
//     isHold,
//     seconds,
//     minutes,
//     isShowCallDuration,
//     isMuted,
//     muteMediaSession,
//     unMuteMediaSession,
//     confmuteMediaSession,
//     confunMuteMediaSession,
//     onCallUnHold,
//     onCallHold,
//     controlVolume,
//     page,
//     setPage,
//     agentTransferCall,
//     ringGroupTransferCall,
//     queueTransferCall,
//     ivrTransferCall,
//     externalTransferCall,
//     dtmfTransferCall,
//     sendDTMF,
//     callerNumber,
//     callerName,
//     callType,
//     showConferenceBtn,
//     setSuccessMessage,
//   } = props;

//   const [volume, setVolume] = useState<number>(70);
//   const [showVolume, setShowVolume] = useState<boolean>(false);

//   const rendarPage = () => {
//     switch (page) {
//       case "DMTF":
//         return (
//           <DtmfPage setPage={setPage} sendDTMF={sendDTMF} />
//         );

//       case "DMTF_TRANSFER":
//         return (
//           <DtmfTransferPage setPage={setPage} dtmfTransferCall={dtmfTransferCall} />
//         );

//       case "TRANSFER":
//         return (
//           <TransferPage
//             setPage={setPage}
//             controlVolume={controlVolume}
//             hangupCall={hangupCall}
//             isMuted={isMuted}
//             muteMediaSession={muteMediaSession}
//             unMuteMediaSession={unMuteMediaSession}
//             showVolume={showVolume}
//             setShowVolume={setShowVolume}
//             volume={volume}
//             setVolume={setVolume}
//           />
//         );

//       case "QUEUE_TRANSFER":
//         return (
//           <QueueTransferPage
//             setPage={setPage}
//             queueTransferCall={queueTransferCall}
//           />
//         );

//       case "TRANSFER_CALL":
//         return (
//           <TransferCallPage
//             setPage={setPage}
//             controlVolume={controlVolume}
//             hangupCall={hangupCall}
//             isMuted={isMuted}
//             muteMediaSession={muteMediaSession}
//             unMuteMediaSession={unMuteMediaSession}
//             confmuteMediaSession={confmuteMediaSession}
//             confunMuteMediaSession={confunMuteMediaSession}
//             showVolume={showVolume}
//             setShowVolume={setShowVolume}
//             volume={volume}
//             setVolume={setVolume}
//             showConferenceBtn={showConferenceBtn}
//           />
//         );

//       case "AGENT_TRANSFER":
//         return (
//           <AgentTransferPage
//             setPage={setPage}
//             agentTransferCall={agentTransferCall}
//           />
//         );

//       case "EXTERNAL_TRANSFER":
//         return (
//           <ExternalTransferPage
//             setPage={setPage}
//             externalTransferCall={externalTransferCall}
//           />
//         );

//       case "IVR_TRANSFER":
//         return (
//           <IvrTransferPage
//             setPage={setPage}
//             ivrTransferCall={ivrTransferCall}
//           />
//         );

//       case "RING_GROUP_TRANSFER":
//         return (
//           <RingGroupTransferPage
//             setPage={setPage}
//             ringGroupTransferCall={ringGroupTransferCall}
//           />
//         );

//       default:
//         return (
//           <DefaultPage
//             setPage={setPage}
//             controlVolume={controlVolume}
//             hangupCall={hangupCall}
//             isHold={isHold}
//             isMuted={isMuted}
//             muteMediaSession={muteMediaSession}
//             unMuteMediaSession={unMuteMediaSession}
//             showVolume={showVolume}
//             setShowVolume={setShowVolume}
//             volume={volume}
//             setVolume={setVolume}
//             onCallUnHold={onCallUnHold}
//             onCallHold={onCallHold}
//             isShowCallDuration={isShowCallDuration}
//             setSuccessMessage={setSuccessMessage}
//           />
//         );
//     }
//   };

//   return (
//     <>
//       <div className="3xl:px-8 px-6 flex flex-col justify-between select-none 3xl:h-[90%] h-[92%] 3xl:pb-6 pb-4">
//         <div className="3xl:py-6 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="3xl:h-14 3xl:w-14 h-12 w-12 bg-secondary-v10 rounded-full flex items-center justify-center">
//                 <span className="3xl:text-base text-sm text-heading font-bold">
//                   {callerName
//                     ? callerName.slice(0, 1).toUpperCase()
//                     : callerNumber.slice(0, 1).toUpperCase()}
//                 </span>
//               </div>
//               <div className="flex flex-col 3xl:pl-3 pl-1">
//                 <span className="3xl:text-xs text-[11px] text-heading">
//                   {callType}
//                 </span>
//                 {callerName ? (
//                   <span className="3xl:text-sm text-xs text-heading font-bold">
//                     {callerName}
//                   </span>
//                 ) : null}
//                 <span
//                   className={`text-heading ${callerName
//                       ? "3xl:text-xs text-[11px] font-medium"
//                       : "3xl:text-sm text-xs font-bold"
//                     }`}
//                 >
//                   {callerNumber}
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-col">
//               {isShowCallDuration && (
//                 <>
//                   <span className="3xl:text-xs text-[11px] text-heading">
//                     Established
//                   </span>
//                   <span className="3xl:text-sm text-xs text-heading font-bold">
//                     {minutes < 10 ? `0${minutes}` : minutes} :{" "}
//                     {seconds < 10 ? `0${seconds}` : seconds}
//                   </span>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//         {rendarPage()}
//       </div>
//     </>
//   );
// };

// export default CallingPage;

"use client";
import { useState } from "react";

// PROJECT IMPORTS
import DefaultPage from "./LiveCallComponents/DefaultPage";
import DtmfPage from "./LiveCallComponents/DtmfPage";
import QueueTransferPage from "./LiveCallComponents/QueueTransferPage";
import TransferPage from "./LiveCallComponents/TransferPage";
import AgentTransferPage from "./LiveCallComponents/AgentTransferPage";
import RingGroupTransferPage from "./LiveCallComponents/RingGroupTransferPage";
import IvrTransferPage from "./LiveCallComponents/IvrTransferPage";
import ExternalTransferPage from "./LiveCallComponents/ExternalTransferPage";
import TransferCallPage from "./LiveCallComponents/TransferCallPage";
import DtmfTransferPage from "./LiveCallComponents/DtmfTransferPage";
import { Success } from "@/redux/services/toasterService";
import Icon from "@/components/ui-components/Icon";

// TYPES
interface CallingPageProps {
  hangupCall: any;
  isHold: boolean;
  seconds: number;
  minutes: number;
  isShowCallDuration: boolean;
  isMuted: any;
  muteMediaSession: any;
  unMuteMediaSession: any;
  confmuteMediaSession: any;
  confunMuteMediaSession: any;
  onCallUnHold: any;
  onCallHold: any;
  controlVolume: any;
  page: string;
  setPage: any;
  agentTransferCall: any;
  ringGroupTransferCall: any;
  queueTransferCall: any;
  ivrTransferCall: any;
  externalTransferCall: any;
  dtmfTransferCall: any;
  sendDTMF: any;
  callerNumber: string;
  callerName: string;
  callType: string;
  showConferenceBtn: boolean;
  setSuccessMessage: any;
}

/* ============================== CALLING PAGE ============================== */

const CallingPage = (props: CallingPageProps) => {
  const {
    hangupCall,
    isHold,
    seconds,
    minutes,
    isShowCallDuration,
    isMuted,
    muteMediaSession,
    unMuteMediaSession,
    confmuteMediaSession,
    confunMuteMediaSession,
    onCallUnHold,
    onCallHold,
    controlVolume,
    page,
    setPage,
    agentTransferCall,
    ringGroupTransferCall,
    queueTransferCall,
    ivrTransferCall,
    externalTransferCall,
    dtmfTransferCall,
    sendDTMF,
    callerNumber,
    callerName,
    callType,
    showConferenceBtn,
    setSuccessMessage,
  } = props;

  const [volume, setVolume] = useState<number>(70);
  const [showVolume, setShowVolume] = useState<boolean>(false);

  const rendarPage = () => {
    switch (page) {
      case "DMTF":
        return <DtmfPage setPage={setPage} sendDTMF={sendDTMF} />;

      case "DMTF_TRANSFER":
        return (
          <DtmfTransferPage
            setPage={setPage}
            dtmfTransferCall={dtmfTransferCall}
          />
        );

      case "TRANSFER":
        return (
          <TransferPage
            setPage={setPage}
            controlVolume={controlVolume}
            hangupCall={hangupCall}
            isMuted={isMuted}
            muteMediaSession={muteMediaSession}
            unMuteMediaSession={unMuteMediaSession}
            showVolume={showVolume}
            setShowVolume={setShowVolume}
            volume={volume}
            setVolume={setVolume}
          />
        );

      case "QUEUE_TRANSFER":
        return (
          <QueueTransferPage
            setPage={setPage}
            queueTransferCall={queueTransferCall}
          />
        );

      case "TRANSFER_CALL":
        return (
          <TransferCallPage
            setPage={setPage}
            controlVolume={controlVolume}
            hangupCall={hangupCall}
            isMuted={isMuted}
            muteMediaSession={muteMediaSession}
            unMuteMediaSession={unMuteMediaSession}
            confmuteMediaSession={confmuteMediaSession}
            confunMuteMediaSession={confunMuteMediaSession}
            showVolume={showVolume}
            setShowVolume={setShowVolume}
            volume={volume}
            setVolume={setVolume}
            showConferenceBtn={showConferenceBtn}
          />
        );

      case "AGENT_TRANSFER":
        return (
          <AgentTransferPage
            setPage={setPage}
            agentTransferCall={agentTransferCall}
          />
        );

      case "EXTERNAL_TRANSFER":
        return (
          <ExternalTransferPage
            setPage={setPage}
            externalTransferCall={externalTransferCall}
          />
        );

      case "IVR_TRANSFER":
        return (
          <IvrTransferPage
            setPage={setPage}
            ivrTransferCall={ivrTransferCall}
          />
        );

      case "RING_GROUP_TRANSFER":
        return (
          <RingGroupTransferPage
            setPage={setPage}
            ringGroupTransferCall={ringGroupTransferCall}
          />
        );

      default:
        return (
          <DefaultPage
            setPage={setPage}
            controlVolume={controlVolume}
            hangupCall={hangupCall}
            isHold={isHold}
            isMuted={isMuted}
            muteMediaSession={muteMediaSession}
            unMuteMediaSession={unMuteMediaSession}
            showVolume={showVolume}
            setShowVolume={setShowVolume}
            volume={volume}
            setVolume={setVolume}
            onCallUnHold={onCallUnHold}
            onCallHold={onCallHold}
            isShowCallDuration={isShowCallDuration}
            setSuccessMessage={setSuccessMessage}
          />
        );
    }
  };

  return (
    <>
      <div className="3xl:px-8 px-6 flex flex-col justify-between select-none 3xl:h-[40%] h-[40%] 3xl:pb-6 pb-4 ">
        <div className="3xl:py-6 py-3">
          <div className="flex items-center">
            <div className="flex items-center w-full">

              <div className="3xl:h-14 3xl:w-14 h-12 w-12 bg-blue rounded-full flex items-center justify-center">
                <span className="3xl:text-base text-sm text-heading font-bold">
                  {callerName
                    ? callerName.slice(0, 1).toUpperCase()
                    : callerNumber.slice(0, 1).toUpperCase()}
                </span>
              </div>
              

              <div className="flex flex-col items-center">
                <span className="3xl:text-xs text-[11px] text-green-500">
                  {callType}
                </span>
                {callerName ? (
                  <span className="3xl:text-sm text-xs text-heading font-bold">
                    {callerName}
                  </span>
                ) : null}
                <span
                  className={`text-heading ${
                    callerName
                      ? "3xl:text-xs text-[11px] font-medium"
                      : "3xl:text-sm text-xs font-bold"
                  }`}
                >
                  {callerNumber}
 {callerNumber && (
                    <Icon
                      name="Copy"
                      className="cursor-pointer"
                      width={16}
                      height={16}
                      onClick={() => {
                        navigator.clipboard.writeText(callerNumber);
                        Success("Copied to clipboard");
                      }}
                    />
                  )}
                </span>
              </div>


               <div className="flex flex-col items-center">
              {isShowCallDuration && (
                <>
                  <span className="3xl:text-xs text-[11px] text-gray-400">
                    Established
                  </span>
                  <span className="3xl:text-sm text-xs text-heading font-bold">
                    {minutes < 10 ? `0${minutes}` : minutes} :{" "}
                    {seconds < 10 ? `0${seconds}` : seconds}
                  </span>
                </>
              )}
            </div>
            </div>
          
          </div>
        </div>
        {rendarPage()}
      </div>
    </>
  );
};

export default CallingPage;
