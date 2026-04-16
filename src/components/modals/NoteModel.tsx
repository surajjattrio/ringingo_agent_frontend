import { useEffect, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { createNewNote, getNotesList } from "@/redux/slice/noteSlice";
import { Success } from "@/redux/services/toasterService";
import { Textarea, Button } from "../forms";
import { Chip, Loader } from "../ui-components";

// THIRD-PARTY IMPORT
import { format, formatDistanceStrict } from "date-fns";

// ASSETS
const closeCircle = "/assets/icons/close-circle.svg";
const doc = "/assets/icons/document-text.svg";

// TYPES
interface ModalProps {
  visible: boolean;
  onCancleClick?: any;
  onDoneClick?: any;
  data?: any;
}

/* ============================== NOTE MODEL ============================== */

const NoteModel = (props: ModalProps) => {
  const { visible = false, onCancleClick, onDoneClick, data } = props;

  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [noteData, setNoteData] = useState<any>([]);

  useEffect(() => {
    data?.lead_management_uuid && getNoteData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const getNoteData = async () => {
    try {
      setIsLoading(true);
      const newData: any = await dispatch(
        getNotesList(data?.lead_management_uuid)
      ).unwrap();
      const nData = typeof newData.data === "string" ? [] : newData.data;
      const finalData = nData?.map((val: any) => {
        let day: any = formatDistanceStrict(
          new Date(),
          new Date(val?.createdAt),
          { unit: "day" }
        );
        return {
          ...val,
          day: `${day === "0 days"
              ? "Today"
              : day === "1 days"
                ? "Yesterday"
                : day + " ago"
            }`,
          date: format(new Date(val?.createdAt), "dd/MM/yyyy"),
          time: format(new Date(val?.createdAt), "h:mm a"),
          name: val?.user[0]?.username,
        };
      });
      setNoteData(finalData);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.log("get note err --->", error?.message);
    }
  };

  // ON SUBMIT NOTE
  const onSubmit = async () => {
    setLoading(true);
    try {
      const payloaad = {
        comment: comment,
        lead_uuid: data?.lead_management_uuid,
        cdrs_uuid: "",
      };
      const res: any = await dispatch(createNewNote(payloaad)).unwrap();
      if (res) {
        Success(res?.data);
        setComment("");
        getNoteData();
        setLoading(false);
      }
    } catch (error: any) {
      console.log("create note err --->", error?.message);
      setLoading(false);
    }
  };

  return (
    <>
      <div
        id="popup-modal"
        tabIndex={-1}
        className={`fixed top-0 left-0 right-0 z-[60] px-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[100%] max-h-full bg-black bg-opacity-40 ${!visible && "hidden"
          }`}
        onClick={onCancleClick}
      >
        <div className="w-full h-full relative flex justify-center">
          <div className="absolute max-w-[750px] top-[48px] 3xl:top-[80px] w-full max-h-full">
            <div
              className="bg-white rounded-lg shadow"
              onClick={(e: any) => e.stopPropagation()}
            >
              <div className="flex flex-col items-start">
                <div className="3xl:px-4 3xl:py-3 px-3 py-2 w-full rounded-t-lg drop-shadow-md bg-white flex justify-between items-center">
                  <span className="3xl:text-base text-sm font-bold">Notes</span>
                  <div>
                    <Legacy
                      className="cursor-pointer"
                      src={closeCircle}
                      alt="close"
                      height={16}
                      width={16}
                      onClick={() => {
                        onCancleClick();
                        setNoteData([]);
                      }}
                    />
                  </div>
                </div>
                <div className="3xl:py-4 py-2 h-[300px] overflow-y-scroll scrollbar-hide w-full">
                  {isLoading ? (
                    <div className="h-full">
                      <Loader />
                    </div>
                  ) : noteData && noteData.length ? (
                    noteData?.map((val: any, index: number) => {
                      return (
                        <div
                          key={index}
                          className={`3xl:px-6 px-4 border-b border-dark-800 ${index === 0 ? "3xl:pb-2 pb-1" : "3xl:py-2 py-1"
                            }`}
                        >
                          <div className="grid grid-cols-2">
                            <div className="flex items-center">
                              <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px] cursor-pointer mr-2">
                                <Legacy src={doc} alt="doc" layout="fill" />
                              </div>
                              <span className="3xl:text-sm text-xs">
                                {val.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <span className="3xl:text-xs text-[11px] font-normal text-txt-primary">
                                {val.day}
                              </span>
                              <span className="3xl:text-xs text-[11px] font-normal text-txt-primary">
                                {val.date}
                              </span>
                              <span className="3xl:text-xs text-[11px] font-normal text-txt-primary">
                                {val.time}
                              </span>
                            </div>
                          </div>
                          <div className="3xl:pl-8 pl-7">
                            <p className="3xl:text-xs text-[11px] font-normal text-txt-primary">
                              {val.comment}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex justify-center items-center">
                      <Chip title="No Notes Found" />
                    </div>
                  )}
                </div>
                <div className="border-t-2 border-dark-700 3xl:px-10 3xl:py-5 px-6 py-3 w-full">
                  <div className="pb-4">
                    <Textarea
                      label="Type your note to add"
                      name="addNote"
                      placeholder="Type your note here..."
                      value={comment}
                      onChange={(e: any) => {
                        setComment(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      disabled={loading}
                      isLoading={loading}
                      className="3xl:py-2 3xl:px-3 py-1 px-2 rounded-lg"
                      text="Cancel"
                      style="dark-outline"
                      onClick={() => {
                        onCancleClick();
                        setNoteData([]);
                      }}
                    />
                    <Button
                      className="3xl:py-2.5 py-1.5 3xl:px-3 px-2 rounded-lg"
                      text="Add Note"
                      icon="plus-white"
                      onClick={() => onSubmit()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoteModel;
