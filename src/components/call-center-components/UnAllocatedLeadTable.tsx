"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import {
  getLeadList,
  getUnallocatedLeads,
  leadSearch,
  useLeadListDetails,
  useUnAllocatedleadDetails,
} from "@/redux/slice/leadListSlice";
import {
  onAddLeadNoteId,
  onDial,
  useCampaignType,
  useNumberMasking,
  useSelectedCampaign,
} from "@/redux/slice/commonSlice";
import { Danger } from "@/redux/services/toasterService";
import { SEARCH_ERROR_MESSAGE } from "@/config/constant";
import { advanceSearchOptions } from "@/config/options";
import { useAuth } from "@/contexts/hooks/useAuth";
// import LeadInformation from "./LeadInformation";
// import { Table, Head, ToolTipIcon } from "../../ui-components";
// import { InputSelect } from "../../forms";
// import { FollowUpModal, NoteModel } from "../../modals";
// import CreateLead from "../phone/CreateLead";
// import LeadNote from "./LeadNote";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";
import { useDebouncedCallback } from "use-debounce";

// ASSETS
const Call = "/assets/icons/Call.svg";
const info = "/assets/icons/info-circle.svg";
const editIcon = "/assets/icons/edit.svg";
const followUp = "/assets/icons/frame.svg";

// TYPES
import { columnsType } from "@/types/tableTypes";
import { FilterTypes } from "@/types/filterTypes";
import { MyLeadFilterTypes } from "@/types/advancedFilterTypes";
import { Head, Table, ToolTipIcon } from "../ui-components";
import { InputSelect } from "../forms";
import CreateLead from "../pbx-components/phone/CreateLead";
import LeadNote from "../pbx-components/my-lead/LeadNote";
import LeadInformation from "../pbx-components/my-lead/LeadInformation";
import { FollowUpModal, NoteModel } from "../modals";

// NAME STATE
const initialValues: MyLeadFilterTypes = {
  first_name: { key: "first_name|1", val: "", dropdown: "1" },
  last_name: { key: "last_name|1", val: "", dropdown: "1" },
  custom_phone_number: { key: "custom_phone_number|1", val: "", dropdown: "1" },
};

/* ============================== MY UNALLOCATED LEAD TABLE ============================== */

const UnAllocatedLeadTable = () => {
  const dispatch = useAppDispatch();
  const leadListDetails = useLeadListDetails();
  const unallocatedLeadListDetails = useUnAllocatedleadDetails();
  console.log("unallocatedLeadListDetails", unallocatedLeadListDetails);
  
  const numberMasking = useNumberMasking();
  const selectedCampaign = useSelectedCampaign();
  const campaignType = useCampaignType();
  const { user } = useAuth();

  const [isNoteData, setIsNoteData] = useState<any>();
  const [infoData, setInfoData] = useState<any>();
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [isCreateLead, setIsCreateLead] = useState<boolean>(false);
  const [editData, setEditData] = useState(null);
  const [editLead, setEditLead] = useState<boolean>(false);
  const [data, setData] = useState<any>(initialValues);
  const [isFollowUpData, setIsFollowUpData] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [noteData, setNoteData] = useState<any>(null);
  const [leadUuid, setLeadUuid] = useState<any>(null);
  const [filter, setFilter] = useState<FilterTypes>({
    page: 1,
    limit: 10,
    search: "",
    isAdvance: false,
  });

  console.log("isFollowUpData",isFollowUpData);
  
  // GET LEAD LIST
  const onGetUnallocatedLeadList = useDebouncedCallback(async () => {
    try {
      setIsLoading(true);
      const params = { ...filter };
      delete params["isAdvance"];
      await dispatch(getUnallocatedLeads(params)).unwrap();
      setIsLoading(false);
    } catch (error: any) {
      console.log("Get unallocated lead list error ---->", error?.message);
      setIsLoading(false);
    }
  }, 500);

  useEffect(() => {
    if (filter?.isAdvance) {
      onSearchData();
    } else {
      onGetUnallocatedLeadList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ADVANCE SEARCH - Trigger when left side Input or Select value change
  const handleChnage = (key: string, val: string) => {
    setData({
      ...data,
      [key]: { ...data[key], val: val },
    });
  };

  // ADVANCE SEARCH - Trigger when right side Select value change
  const handleSelect = (key: string, val: string) => {
    setData({
      ...data,
      [key]: { ...data[key], key: `${key}|${val}`, dropdown: val },
    });
  };

  // ADVANCE SEARCH - Searching Data API call
  const onSearchData = async () => {
    if (
      !(
        data["first_name"]["val"] ||
        data["last_name"]["val"] ||
        data["custom_phone_number"]["val"]
      )
    ) {
      Danger(SEARCH_ERROR_MESSAGE);
      return false;
    }
    try {
      setIsLoading(true);
      const payload = {
        [data["first_name"]["key"]]: data["first_name"]["val"],
        [data["last_name"]["key"]]: data["last_name"]["val"],
        [data["custom_phone_number"]["key"]]:
          data["custom_phone_number"]["val"],
        // page: filter?.page,
        // limit: filter?.limit,
      };
      Object.entries(payload)?.forEach(([key, val]: any) => {
        if (!val) {
          delete payload[key];
        }
      });
      await dispatch(leadSearch(payload)).unwrap();
      setIsLoading(false);
    } catch (e: any) {
      console.error("Search data Err --->", e?.message);
      setIsLoading(false);
    }
  };

  // ADVANCE SEARCH Fields Empty & Fetching Conference Data
  const onEmptySearch = () => {
    setFilterOpen(false);
    setFilter({ ...filter, page: 1, limit: 10, isAdvance: false });
    setData(initialValues);
  };

  const columns: columnsType[] = [
    {
      name: "no",
      title: "No.",
      sortable: true,
    },
    {
      name: "fullName",
      title: "Full Name",
      sortable: true,
    },
    {
      name: "custom_phone_number",
      title: "Phone Number",
      sortable: true,
      action: (row: any) => {
        return (
          <>
            <span>
              {row?.custom_phone_number
                ? user?.isPbx
                  ? user?.isNumberMasking
                    ? Array.from(row?.custom_phone_number).length > 4
                      ? Array.from(row?.custom_phone_number)
                        .fill("X", 2, -2)
                        .join("")
                      : Array.from(row?.custom_phone_number)
                        .fill("X", 1, -1)
                        .join("")
                    : row?.custom_phone_number || ""
                  : numberMasking
                    ? Array.from(row?.custom_phone_number).length > 4
                      ? Array.from(row?.custom_phone_number)
                        .fill("X", 2, -2)
                        .join("")
                      : Array.from(row?.custom_phone_number)
                        .fill("X", 1, -1)
                        .join("")
                    : row?.custom_phone_number || ""
                : row?.phone_number
                  ? user?.isPbx
                    ? user?.isNumberMasking
                      ? Array.from(row?.phone_number).length > 4
                        ? Array.from(row?.phone_number).fill("X", 2, -2).join("")
                        : Array.from(row?.phone_number).fill("X", 1, -1).join("")
                      : row?.phone_number || ""
                    : numberMasking
                      ? Array.from(row?.phone_number).length > 4
                        ? Array.from(row?.phone_number).fill("X", 2, -2).join("")
                        : Array.from(row?.phone_number).fill("X", 1, -1).join("")
                      : row?.phone_number || ""
                  : ""}
            </span>
          </>
        );
      },
    },
    {
      name: "lead_status_name",
      title: "Lead Status",
      sortable: true,
    },
    {
      name: "lead_group_name",
      title: "Lead Group",
      sortable: true,
    },
    {
      name: "action",
      title: "Action",
      sortable: false,
      action: (row: any) => {
        console.log("rowww",row);
        
        return (
          <>
            <div className="flex items-center gap-2">
              <ToolTipIcon
                src={info}
                width={18}
                height={18}
                alt="info"
                tooltip="View Lead Information"
                onClick={() => {
                  setInfoData(row?.lead_management_uuid);
                  setLeadUuid(row?.lead_management_uuid);
                  setNoteData(null);
                  setIsCreateLead(false);
                }}
              />
              <ToolTipIcon
                src={editIcon}
                width={18}
                height={18}
                alt="edit"
                tooltip="Edit Lead"
                onClick={() => {
                  if (!user?.isPbx && !selectedCampaign) {
                    Danger("You are not able to edit without any campaign");
                  } else {
                    setEditLead(true);
                    setEditData(row);
                    setIsCreateLead(true);
                    setInfoData("");
                  }
                }}
              />
              <ToolTipIcon
                src={followUp}
                width={18}
                height={18}
                alt="followUp"
                tooltip="Follow Up"
                onClick={() => setIsFollowUpData(row)}
              />
              {campaignType !== "inbound" && (
                <ToolTipIcon
                  src={Call}
                  width={18}
                  height={18}
                  alt="call"
                  tooltip="Call Lead"
                  onClick={() => {
                    Cookies.set("LeadDialName", row?.fullName);
                    dispatch(onAddLeadNoteId(row?.lead_management_uuid));
                    dispatch(
                      onDial(
                        row?.custom_phone_number
                          ? row?.custom_phone_number
                          : row?.phone_number
                      )
                    );
                  }}
                />
              )}
            </div>
          </>
        );
      },
    },
  ];

  return (
    <>
      <div className="bg-white py-[7px] px-[3px] pb-[15px]  rounded-[25px]">
        <div className="pb-4">
          <Head
            totalCount={leadListDetails?.count || 0}
            title="Lead"
            onChange={(e: any) =>
              setFilter({
                ...filter,
                page: 1,
                limit: 10,
                search: e.target.value,
                isAdvance: false,
              })
            }
            filterOpen={filterOpen}
            onFilterClick={() => {
              setFilterOpen(!filterOpen);
            }}
            onHide={onEmptySearch}
            onSearchClick={() => {
              setFilter({
                ...filter,
                page: 1,
                limit: 10,
                isAdvance: true,
              });
            }}
            onCreateButtonClick={() => {
              if (!user?.isPbx && !selectedCampaign) {
                Danger("You are not able to create without any campaign");
              } else {
                setEditLead(false);
                setEditData(null);
                setInfoData("");
                setIsCreateLead(true);
              }
            }}
          >
            <div className="grid grid-cols-3 lg:grid-cols-2 2md:grid-cols-2 md:grid-cols-1 sm:grid-cols-1">
              <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                <InputSelect
                  name="first_name"
                  label="First Name"
                  placeholder="Enter first name"
                  value={data.first_name.val}
                  dropdownValue={data.first_name.dropdown}
                  options={advanceSearchOptions}
                  onChange={(e: any) =>
                    handleChnage("first_name", e.target.value)
                  }
                  onDropdownChange={(e: any) =>
                    handleSelect("first_name", e.target.value)
                  }
                  isInfo
                />
              </div>
              <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                <InputSelect
                  name="last_name"
                  label="Last Name"
                  placeholder="Enter last name"
                  value={data.last_name.val}
                  dropdownValue={data.last_name.dropdown}
                  options={advanceSearchOptions}
                  onChange={(e: any) =>
                    handleChnage("last_name", e.target.value)
                  }
                  onDropdownChange={(e: any) =>
                    handleSelect("last_name", e.target.value)
                  }
                  isInfo
                />
              </div>
              <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                <InputSelect
                  type="number"
                  name="custom_phone_number"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={data.custom_phone_number.val}
                  dropdownValue={data.custom_phone_number.dropdown}
                  options={advanceSearchOptions}
                  onChange={(e: any) => {
                    handleChnage("custom_phone_number", e.target.value);
                  }}
                  onDropdownChange={(e: any) =>
                    handleSelect("custom_phone_number", e.target.value)
                  }
                  isInfo
                />
              </div>
            </div>
          </Head>
        </div>
        <div
          className={`${
            infoData || isCreateLead
              ? // grid grid-cols-3 gap-4 tsm:grid-cols-1 tsm:gap-y-4 tsm:gap-x-0
                // "grid grid-cols-3 gap-4 smd:grid-cols-1 smd:gap-y-4 smd:gap-x-0"
                "grid grid-cols-3 gap-4 tsm:grid-cols-1 tsm:gap-y-4 tsm:gap-x-0 "
              : ""
          }`}
        >
          <div className="col-span-2 ">
            <Table
              isLoading={isLoading}
              columns={columns}
              data={unallocatedLeadListDetails?.data}
              page={filter.page}
              totalCount={unallocatedLeadListDetails?.count || 0}
              limit={filter.limit}
              title="Lead"
              onCreateButtonClick={() => {
                if (!user?.isPbx && !selectedCampaign) {
                  Danger("You are not able to create without any campaign");
                } else {
                  setEditLead(false);
                  setEditData(null);
                  setInfoData("");
                  setIsCreateLead(true);
                }
              }}
              onPageClick={(page: number) => {
                setFilter({
                  ...filter,
                  page,
                });
              }}
              onLimitChange={(limit: number) => {
                setFilter({
                  ...filter,
                  limit,
                  page: 1,
                });
              }}
              onRefreshClick={() => {
                setFilter({
                  ...filter,
                });
              }}
              firstPageClick={() => {
                setFilter({
                  ...filter,
                  page: 1,
                });
              }}
              lastPageClick={() => {
                setFilter({
                  ...filter,
                  page: Math.ceil(leadListDetails?.count / filter.limit),
                });
              }}
            />
          </div>
          <div className="col-span-1 mr-3 ">
            {isCreateLead ? (
              <CreateLead
                leadEdit={editLead}
                setEditLead={setEditLead}
                setIsCreateLead={setIsCreateLead}
                editData={editData}
                setEditData={setEditData}
                fromList
              />
            ) : noteData ? (
              <LeadNote
                noteData={noteData}
                setNoteData={setNoteData}
                leadUuid={leadUuid}
              />
            ) : infoData ? (
              <LeadInformation
                isLeadInfoID={infoData}
                setIsLeadInfoID={setInfoData}
                setNoteData={setNoteData}
              />
            ) : null}
          </div>
        </div>

        <NoteModel
          visible={!!isNoteData}
          onCancleClick={() => {
            setIsNoteData("");
          }}
          data={isNoteData}
        />
        <FollowUpModal
          visible={!!isFollowUpData}
          onCancleClick={() => {
            setIsFollowUpData("");
          }}
          data={isFollowUpData}
        />
      </div>
    </>
  );
};

export default UnAllocatedLeadTable;
