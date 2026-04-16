"use client";
import Legacy from "next/legacy/image";
import { Fragment, useEffect, useState } from "react";

// PROJECT IMPORTS
import {
  onAddLeadNoteId,
  onAddNewLead,
  onDial,
  onSetShowCallInfoId,
  useIsAddNewLead,
  useShowCallInfoId,
} from "@/redux/slice/commonSlice";
import { useAppDispatch } from "@/redux/hooks";
import { leadDetailsSearch } from "@/redux/slice/phoneSlice";
import { Loader } from "@/components/ui-components";
import { SearchBar } from "../../pickers";
import { Button } from "../../forms";
import CreateLead from "./CreateLead";
import CallInformation from "./CallInformation";
import Note from "./Note";
import FollowUp from "./FollowUp";
import AddLead from "./AddLead";
import { useAuth } from "@/contexts/hooks/useAuth";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";
import { useDebouncedCallback } from "use-debounce";

// ASSETS
const Search_icon = "/assets/images/Empty_search.svg";
const info = "/assets/icons/info-circle.svg";
const call = "/assets/icons/green/call.svg";
const followUp = "/assets/icons/leave3way.svg";

/* ============================== MISSED CALL TAB ============================== */

const Search = () => {
  const [data, setData] = useState<any>([]);
  const [noteData, setNoteData] = useState<any>();
  const [isCreateLead, setIsCreateLead] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [leadEdit, setLeadEdit] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>({});
  const [searchLead, setSearchLead] = useState("");
  const [isFollowUpData, setIsFollowUpData] = useState<any>();

  const dispatch = useAppDispatch();
  const isShowCallInfoId = useShowCallInfoId();
  const isAddNewLead = useIsAddNewLead();
  const { user } = useAuth();

  const onSearchLead = useDebouncedCallback(async () => {
    try {
      setIsLoading(true);
      const params = { search: searchLead };
      let res: any = await dispatch(leadDetailsSearch(params)).unwrap();
      if (res && res.statusCode === 200) {
        if (searchLead !== "") {
          let newData = res?.data;
          newData.map((val: any) => {
            val.fullName = val.first_name + " " + (val?.last_name || "");
            val.country_name =
              val.country && val.country.length ? val.country[0]?.nicename : "";
          });
          setData(newData);
          setIsLoading(false);
        } else {
          setData([]);
          setIsLoading(false);
        }
      } else {
        setData([]);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.log("Get lead list error ---->", error?.message);
      setData([]);
      setIsLoading(false);
    }
  }, 500);

  useEffect(() => {
    onSearchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchLead]);

  useEffect(() => {
    setNoteData(null);
    setLeadEdit(false);
    setIsCreateLead(false);
    setEditData(null);
    setIsFollowUpData(null);
    dispatch(onAddNewLead(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowCallInfoId]);

  // GET PHONE NUMBER
  const getPhoneNumber = (val: any) => {
    let number = val?.phone_number || "";
    return user?.isNumberMasking
      ? Array.from(number).length > 4
        ? Array.from(number).fill("X", 2, -2).join("")
        : Array.from(number).fill("X", 1, -1).join("")
      : number || "";
  };

  if (!!isAddNewLead) return <AddLead />;

  // CREATE LEAD PAGE
  if (isCreateLead)
    return (
      <div className="h-[42vh]">
        <CreateLead
          leadEdit={leadEdit}
          setEditLead={setLeadEdit}
          setIsCreateLead={setIsCreateLead}
          editData={editData}
          setEditData={setEditData}
          sectionName="dashboard"
        />
      </div>
    );

  if (!!isFollowUpData)
    return (
      <div className="h-[42vh]">
        <FollowUp
          isFollowUpData={isFollowUpData}
          setIsFollowUpData={setIsFollowUpData}
        />
      </div>
    );

  // CREATE / ADD NOTE PAGE
  if (!!noteData)
    return (
      <div className="h-[42vh]">
        <Note noteData={noteData} setNoteData={setNoteData} />
      </div>
    );

  // SHOW CALL INFO
  if (isShowCallInfoId)
    return (
      <div className="h-[42vh]">
        <CallInformation
          setNoteData={setNoteData}
          isLeadInfoID={isShowCallInfoId}
          setIsCreateLead={setIsCreateLead}
          setLeadEdit={setLeadEdit}
          setEditData={setEditData}
          onRefreshData={onSearchLead}
        />
      </div>
    );

  return (
    <>
      <div className="h-[10vh]">
        {/* <div className="bg-layout 3xl:px-6 3xl:py-2.5 py-1.5 px-4 h-[5.8vh]"> */}
          {/* <span className="3xl:text-base text-xs text-heading font-bold">
            Search
          </span> */}
        {/* </div> */}
        <div className="3xl:pt-2 3xl:pb-6 pt-1 pb-4 bg-white relative h-[36.2vh]">
          <div
            className={`h-[20vh] ${!data.length && "flex flex-col justify-between"
              }`}
          >
            <div className="px-6 py-2">
              <div className="flex justify-end">
                <SearchBar
                  value={searchLead}
                  className="smd:!flex"
                  placeholder="Search by number or name"
                  onChange={(e: any) => {
                    setSearchLead(e.target.value);
                  }}
                />
                <Button
                      className="3xl:py-[10px] 3xl:px-4 py-2 px-3 rounded-lg "
                      text="Create Lead"
                      icon="plus-white"
                      onClick={() => setIsCreateLead(true)}
                    />
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center w-full h-full">
                <Loader />
              </div>
            ) : data.length ? (
              <div className="pt-5">
                {data.map((val: any, idx: number) => {
                  return (
                    <Fragment key={idx}>
                      <div
                        className={`grid grid-cols-5 py-2.5 border-b-2 items-center border-dark-800 px-3 ${idx === 0 && "pb-3 pt-0"
                          }`}
                      >
                        <div className="col-span-2 flex items-center">
                          <div className="flex flex-col">
                            <span className="3xl:text-sm text-xs font-bold">
                              {val.fullName}
                            </span>
                            <span className="3xl:text-xs text-[10px] font-normal text-txt-primary">
                              {getPhoneNumber(val)}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          {val?.user && val?.user?.length && (
                            <div className="flex flex-col">
                              <span className="3xl:text-sm text-xs font-bold">
                                Assigned to
                              </span>
                              <span className="3xl:text-xs text-[10px] font-normal text-txt-primary">
                                {val?.user && val?.user?.length
                                  ? val?.user[0].username
                                  : ""}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="col-span-1 flex items-center gap-4 justify-end">
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              dispatch(
                                onSetShowCallInfoId(val?.lead_management_uuid)
                              );
                            }}
                          >
                            <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                             <Legacy src={info} alt="info" layout="fill" />
                            </div>
                          </div>
                          <div
                            className="cursor-pointer"
                            onClick={() => setIsFollowUpData(val)}
                          >
                            <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                             <Legacy
                                src={followUp}
                                alt="followUp"
                                layout="fill"
                              />
                            </div>
                          </div>
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              Cookies.set("LeadDialName", val?.fullName);
                              dispatch(
                                onAddLeadNoteId(val?.lead_management_uuid)
                              );
                              dispatch(
                                onDial(
                                  val?.custom_phone_number
                                    ? val?.custom_phone_number
                                    : val?.phone_number
                                )
                              );
                            }}
                          >
                            <div className="relative 3xl:w-[22px] 3xl:h-[22px] w-[18px] h-[18px]">
                             <Legacy src={call} alt="call" layout="fill" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-between flex-col">
                {/* <div className="flex justify-center">
                  <div className="relative 3xl:w-[240px] 3xl:h-[200px] w-[220px] h-[180px]">
                   <Legacy
                      src={Search_icon}
                      alt="emplty"
                      layout="fill"
                      style={{
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  </div>
                </div> */}
                <div className="flex flex-col justify-center items-center h-full 3xl:pt-12 pt-10">
                  {/* <span className="3xl:text-lg text-base font-bold text-heading">
                    Search Lead
                  </span>
                  <p className="3xl:text-xs text-[10px] font-normal text-txt-primary text-center">
                    Try to create a new lead or search again from <br /> another
                    name or number.
                  </p> */}
                  <div className="py-4">
                    {/* <Button
                      className="3xl:py-[10px] 3xl:px-4 py-2 px-3 rounded-lg "
                      text="Create Lead"
                      icon="plus-white"
                      onClick={() => setIsCreateLead(true)}
                    /> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
