import Legacy from "next/legacy/image";
import { useAuth } from "@/contexts/hooks/useAuth";
import {
  onShowCallModal,
  useCampaignMode,
  useCampaignType,
} from "@/redux/slice/commonSlice";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/redux/hooks";
import { useState } from "react";
import { checkDispostionCause } from "@/redux/slice/callSlice";
import DispostionCallModal from "./DispostionCallModal";

// ASSETS
const callIcon = "/assets/icons/white/call_white.svg";
const eraseIcon = "/assets/icons/gray/remove.svg";
// const closeIcon = "/assets/icons/gray/close.svg";

interface DailPageProps {
  number: string;
  setNumber: (value: string) => void;
  dialNumber: () => void;
  onClose: () => void; // Close function for dial pad
}

// const DailPage = ({ number, setNumber, dialNumber }: DailPageProps) => {
//   const { user } = useAuth();
const DailPage = (props: DailPageProps) => {
  const { number, setNumber, dialNumber } = props;
  const { user } = useAuth();
  const campaignMode = useCampaignMode();
  const campaignType = useCampaignType();

  const dispatch = useAppDispatch();
  // const [dispoFlag, setDispoFlag] = useState(0);
  // const [showModal, setShowModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<any>("");
  const [dispoFlag, setDispoFlag] = useState<any>(0);
  const [showModal, setShowModal] = useState<boolean>(false);

  const onNumberChange = (val: string) => {
    if (number?.length < 13) setNumber(number + val);
  };

  const [isCalling, setIsCalling] = useState(false);

  const checkDispostionCauses = async () => {
    if (isCalling) return;  // Prevent double click
    setIsCalling(true);

    try {
      let payload = { phoneNumber: number || "" };
      let res: any = await dispatch(checkDispostionCause(payload)).unwrap();

      if (res && res.statusCode === 200) {
        setDispoFlag(res.data);

        if (res.data === 0) {
          await dialNumber();
        } else {
          setShowModal(true);
        }

        setSuccessMessage(res?.messages);
      } else if (res && res.statusCode === 409) {
        setSuccessMessage(res?.messages);
      }
    } catch (error: any) {
      console.log("sticky agent err -->", error?.message);
    } finally {
      setIsCalling(false); // Enable button again
    }
  };


  // const checkDispostionCauses = async () => {
  //   try {
  //     let payload = {
  //       phoneNumber: number || "",
  //     };
  //     let res: any = await dispatch(checkDispostionCause(payload)).unwrap();
  //     if (res && res.statusCode === 200) {
  //       setDispoFlag(res.data);
  //       if (res.data === 0) {
  //         dialNumber();
  //       } else {
  //         setShowModal(true);
  //       }
  //       setSuccessMessage(res?.messages);
  //     } else if (res && res.statusCode === 409) {
  //       setSuccessMessage(res?.messages);
  //     }
  //   } catch (error: any) {
  //     console.log("sticky agent err -->", error?.message);
  //   }
  // };

  return (
    <>
      <div
        className={`${!user?.isPbx && (campaignMode === "1" || campaignMode === "3")
          ? "3xl:h-[83%] h-[85%]"
          : "3xl:h-[90%] h-[92%]"
          } px-8 select-none flex justify-between flex-col pb-6`}
      ></div>
      <div className="fixed bg-[#F9F9F9] rounded-b-2xl bottom-0 left-1/2 pl-9 w-full transform -translate-x-1/2 h-[75%] mt-2 p-4 shadow-lg text-center">
        {/* Close Button */}
        {/* <div className="flex justify-between items-center"> */}
        {/* <h2 className="text-lg font-semibold">Dial Pad</h2> */}
        {/* <button onClick={onClose} className="p-2 text-gray-500 hover:text-black transition"> */}
        {/* <Legacy src={closeIcon} alt="close" height={24} width={24} /> */}
        {/* </button> */}
        {/* </div> */}

        {/* Input Field with Erase Button */}
        <div className="relative mb-3">
          <input
            className="w-[85%] bg-[#F9F9F9] text-[17px] pr-[55px] pb-[10px] font-thin text-center outline-none"
            value={number}
            type="text"
            // readOnly
            onChange={(e) => {
              let value = e.target.value;
              let val = value.replace(/[^0-9*#]+/g, "");
              if (val?.length < 21) setNumber(val);
            }}
          />
          <button
            className="absolute right-9 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition"
            onClick={() => setNumber(number.slice(0, -1))}
          >
            <Legacy src={eraseIcon} alt="erase" height={24} width={24} />
          </button>
        </div>




        {/* Dial Pad */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "1", label: "" },
            { key: "2", label: "ABC" },
            { key: "3", label: "DEF" },
            { key: "4", label: "GHI" },
            { key: "5", label: "JKL" },
            { key: "6", label: "MNO" },
            { key: "7", label: "PQRS" },
            { key: "8", label: "TUV" },
            { key: "9", label: "WXYZ" },
            { key: "*", label: "" },
            { key: "0", label: "+" },
            { key: "#", label: "" },
          ].map((item, idx) => (
            <button
              key={idx}
              className="bg-[#E6E6E6] border border-gray-300 rounded-full h-11 w-11 text-[18px] font-small flex flex-col items-center justify-center hover:bg-gray-400 transition"
              onClick={() => onNumberChange(item.key)}
            >
              <span>{item.key}</span>
              {item.label && (
                <span className="text-[8px] leading-none">{item.label}</span>
              )}
            </button>
          ))}
        </div>

        {/* Call Button (Centered in Footer) */}
        <div className="flex w-[92%] justify-center mt-3 items-center">
          {/* <button
            className="bg-green-500 hover:bg-green-600 rounded-full w-16 h-16 flex items-center justify-center transition shadow-xl"
            onClick={dialNumber}
          >
            <Legacy src={callIcon} alt="call" height={32} width={32} />
          </button> */}

          {/* <div
            className="bg-primary-green 3xl:w-[80px] 3xl:h-10 w-[65px] h-9 drop-shadow-sm flex justify-center items-center rounded-md hover:bg-opacity-80 cursor-pointer"
            onClick={() => checkDispostionCauses()}
          >
            <Legacy src={callIcon} alt="call" height={18} width={18} />
          </div>  */}

          <div
            className={`bg-primary-green 3xl:w-[80px] 3xl:h-10 w-[65px] h-9 drop-shadow-sm 
             flex justify-center items-center rounded-md cursor-pointer 
             ${isCalling ? "opacity-50 pointer-events-none" : "hover:bg-opacity-80"}`}
            onClick={checkDispostionCauses}
          >
            <Legacy src={callIcon} alt="call" height={18} width={18} />
          </div>

        </div>
      </div>

      {dispoFlag === 1 && (
        <DispostionCallModal
          showModal={showModal}
          phoneNumber={number}
          onCancleClick={() => {
            setShowModal(false);
          }}
          // onDialNumberClick={(e: any) => e && dialNumber()}
          onDialNumberClick={(e: any) => {
            if (e) {
              dialNumber();
            }
          }}
        />
      )}
    </>
  );
};

export default DailPage;


