import { useEffect, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import {
  getAllNotes,
  useAllNotesDetails,
  useIsAllNotesLoading,
} from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { useSelectedCampaign } from "@/redux/slice/commonSlice";
import { Success } from "@/redux/services/toasterService";
import { createNewNote } from "@/redux/slice/noteSlice";
import { Textarea } from "../../forms";
import { Button } from "../../forms";
import { Chip, Loader, NoRecordFound } from "../../ui-components";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";

// ASSETS
const doc = "/assets/icons/document-text.svg";

/* ============================== NOTE TAB ============================== */

const Note = () => {
  const dispatch = useAppDispatch();
  const selectedCampaign = useSelectedCampaign();
  const isAllNotesLoading = useIsAllNotesLoading();
  const allNotesDetails = useAllNotesDetails();
  const [comment, setComment] = useState<string>("");

  // ON GET ALL NOTES
  const onGetAllNotes = async () => {
    try {
      await dispatch(
        getAllNotes({ lead_uuid: Cookies.get("lead_uuid") })
      ).unwrap();
    } catch (error: any) {
      console.log("get note list err --->", error?.message);
    }
  };

  useEffect(() => {
    if (selectedCampaign && Cookies.get("lead_uuid")) {
      onGetAllNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign]);

  // SUBMIT NOTE DETAILS
  const onSubmit = async () => {
    try {
      const payloaad = {
        comment: comment,
        lead_uuid: Cookies.get("lead_uuid") ? Cookies.get("lead_uuid") : "",
        cdrs_uuid: "",
      };
      const res: any = await dispatch(createNewNote(payloaad)).unwrap();
      if (res) {
        Success(res?.data);
        setComment("");
        onGetAllNotes();
      }
    } catch (error: any) {
      console.log("create note err --->", error?.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-230px)] 3xl:min-h-[calc(100vh-270px)] h-full">
      {selectedCampaign ? (
        <>
          <div className="px-6 pt-4 border-b-2 border-dark-800 ">
            <Textarea
              label="Add Note"
              name="addNote"
              tooltipRight={true}
              value={comment}
              placeholder="Type something here..."
              onChange={(e: any) => {
                setComment(e.target.value);
              }}
            />
            <div className="py-3 flex">
              <Button
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
            {isAllNotesLoading ? (
              <div className="h-[270px] 3xl:h-[350px]">
                <Loader />
              </div>
            ) : allNotesDetails && allNotesDetails.length ? (
              allNotesDetails?.map((val: any, index: number) => {
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
                        <span className="3xl:text-sm text-xs font-semibold">
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
                      <p className="3xl:text-xs text-[10px] font-normal text-txt-primary">
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
        </>
      ) : (
        <>
          <NoRecordFound
            title="No data found"
            description={!selectedCampaign ? "Select campaign to view data" : "No more data found from this campaign"}
            className="pb-10 !justify-end"
            topImageClass="p-0"
          />
        </>
      )}
    </div>
  );
};

export default Note;
