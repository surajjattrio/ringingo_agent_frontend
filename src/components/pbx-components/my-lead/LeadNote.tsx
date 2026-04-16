import Legacy from "next/legacy/image";
import { useEffect, useState } from "react";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { Success } from "@/redux/services/toasterService";
import { createNewNote, getNotesList } from "@/redux/slice/noteSlice";
import { Textarea } from "../../forms";
import { Button } from "../../forms";
import { Chip, Loader } from "../../ui-components";

// THIRD-PARTY IMPORT
import { format, formatDistanceStrict } from "date-fns";

// ASSETS
const closeIcon = "/assets/icons/close.svg";
const doc = "/assets/icons/document-text.svg";

// TYPES
interface LeadNoteProps {
  noteData: any;
  setNoteData: any;
  leadUuid: string;
}

/* ============================== NOTE ============================== */

const LeadNote = (props: LeadNoteProps) => {
  const { noteData, setNoteData, leadUuid } = props;

  const dispatch = useAppDispatch();
  const [comment, setComment] = useState<string>("");
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (noteData) {
      getNoteData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteData]);

  // get note data
  const getNoteData = async () => {
    try {
      setIsLoading(true);
      let id: string = noteData;
      const newData: any = await dispatch(getNotesList(id)).unwrap();
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
      setIsLoading(false);
      setData(finalData);
    } catch (error: any) {
      console.log("get note err --->", error?.message);
      setIsLoading(false);
    }
  };

  // ON SUBMIT NOTE DEATILS
  const onSubmit = async () => {
    setLoading(true);
    try {
      const payloaad = {
        comment: comment,
        lead_uuid: leadUuid ? leadUuid : "",
        cdrs_uuid: noteData ? noteData : "",
      };
      const res: any = await dispatch(createNewNote(payloaad)).unwrap();
      if (res) {
        Success(res?.data);
        setComment("");
        setNoteData(null);
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
        className={`w-full scrollbar-hide h-[calc(100vh-156px)] 3xl:h-[calc(100vh-184px)] overflow-y-auto drop-shadow-xl bg-white rounded-lg ${!noteData && "hidden"
          }`}
      >
        <div className="3xl:py-2 py-1.5 bg-dark-800 3xl:px-4 px-3 rounded-t-lg sticky top-0 z-[5]">
          <div className="flex-row-reverse justify-between flex items-center">
            <div className="relative h-[14px] w-[14px] 3xl:w-[16px] 3xl:h-[16px] cursor-pointer mr-2">
              <Legacy
                src={closeIcon}
                alt="close"
                layout="fill"
                onClick={() => {
                  setNoteData(null);
                }}
              />
            </div>
            <span className="3xl:text-sm text-xs text-heading font-bold">
              Notes
            </span>
          </div>
        </div>

        <div className="px-6 border-b-2 border-dark-800 py-4">
          <Textarea
            label="Add Note"
            name="addNote"
            rows={2}
            tooltipRight={true}
            value={comment}
            placeholder="Type something here..."
            onChange={(e: any) => {
              setComment(e.target.value);
            }}
          />
          <div className="py-3 flex">
            <Button
              disabled={loading}
              className="3xl:py-1.5 3xl:px-2 px-1.5 py-1 rounded-lg"
              text="Add Note"
              icon="plus-white"
              onClick={() => {
                onSubmit();
              }}
            />
          </div>
        </div>
        <div className="py-2">
          {isLoading ? (
            <div className="h-[270px] 3xl:h-[350px]">
              <Loader />
            </div>
          ) : data && data.length ? (
            data?.map((val: any, index: number) => {
              return (
                <div
                  key={index}
                  className={`px-3 border-b border-dark-800 ${index === 0 ? "3xl:pb-2 pb-1" : "3xl:py-2 py-1"
                    }`}
                >
                  <div className="grid grid-cols-3">
                    <div className="flex items-center gap-2 col-span-1">
                      <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px] cursor-pointer mr-2">
                        <Legacy src={doc} alt="doc" layout="fill" />
                      </div>
                      <span className="3xl:text-sm text-xs">{val.name}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end col-span-2">
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
                    <p className="3xl:text-xs text-[11px] font-normal text-txt-primary break-words">
                      {val.comment}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full h-[270px] 3xl:h-[350px] flex justify-center items-center">
              <Chip title="No Notes Found" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LeadNote;
