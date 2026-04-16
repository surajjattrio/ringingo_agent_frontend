"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import {
    getRecordings,
    recordingSearch,
    useRecordingsList,
} from "@/redux/slice/recordingSlice";
import { advanceSearchOptions } from "@/config/options";
//import { baseUrl } from "@/API/baseURL";
import { Danger } from "@/redux/services/toasterService";
import { SEARCH_ERROR_MESSAGE } from "@/config/constant";
import { useNumberMasking } from "@/redux/slice/commonSlice";
import { useAuth } from "@/contexts/hooks/useAuth";
import { Head, Table, TableAudioPlayer } from "../../ui-components";
import { InputSelect } from "../../forms";
import { DatePicker } from "../../pickers";

// THIRD-PARTY IMPORT

const baseUrl = process.env.BASE_URL;

import { format } from "date-fns";
import { useDebouncedCallback } from "use-debounce";

// ASSETS
const call_inbond = "/assets/icons/call/inbound.svg";
const call_outbound = "/assets/icons/call/outbound.svg";

// TYPES
import { columnsType } from "@/types/tableTypes";
import { FilterTypes } from "@/types/filterTypes";
import { RecordingFilterTypes } from "@/types/advancedFilterTypes";

// NAME STATE
const initialValues: RecordingFilterTypes = {
    callstart: {
        key: "callstart",
        val: "",
        dropdown: "1",
    },
    callend: {
        key: "callend",
        val: "",
        dropdown: "1",
    },
    caller_id_name: { key: "caller_id_name|1", val: "", dropdown: "1" },
    caller_id_number: { key: "caller_id_number|1", val: "", dropdown: "1" },
    destination_number: { key: "destination_number|1", val: "", dropdown: "1" },
};

/* ============================== RECORDING TABLE ============================== */

const RecordingTable = () => {
    const dispatch = useAppDispatch();
    const recordingsList = useRecordingsList();
    console.log("askdnmdslkafdas",recordingsList);
    
    const numberMasking = useNumberMasking();
    const { user } = useAuth();

    const [data, setData] = useState<any>(initialValues);
    const [filterOpen, setFilterOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<FilterTypes>({
        page: 1,
        limit: 10,
        search: "",
        isAdvance: false,
    });

    // GET RECORDINS LIST
    const onGetRecordingList = useDebouncedCallback(async () => {
        try {
            setIsLoading(true);
            const params = { ...filter };
            delete params["isAdvance"];
            await dispatch(getRecordings(params)).unwrap();
            setIsLoading(false);
        } catch (error: any) {
            console.log("Get recordings error ---->", error?.message);
            setIsLoading(false);
        }
    }, 500);

    useEffect(() => {
        if (filter?.isAdvance) {
            onSearchData();
        } else {
            onGetRecordingList();
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
                data["callstart"]["val"] ||
                data["callend"]["val"] ||
                data["caller_id_name"]["val"] ||
                data["caller_id_number"]["val"] ||
                data["destination_number"]["val"]
            )
        ) {
            Danger(SEARCH_ERROR_MESSAGE);
            return false;
        }
        try {
            setIsLoading(true);
            let payload: any = {
                [data["callstart"]["key"]]: data["callstart"]["val"]
                    ? format(new Date(data["callstart"]["val"]), "yyyy-MM-dd HH:mm:ss")
                    : "",
                [data["callend"]["key"]]: data["callend"]["val"]
                    ? format(new Date(data["callend"]["val"]), "yyyy-MM-dd HH:mm:ss")
                    : data["callstart"]["val"]
                        ? format(new Date().setHours(23, 59, 59), "yyyy-MM-dd HH:mm:ss")
                        : "",
                [data["caller_id_name"]["key"]]: data["caller_id_name"]["val"],
                [data["caller_id_number"]["key"]]: data["caller_id_number"]["val"],
                [data["destination_number"]["key"]]: data["destination_number"]["val"],
                // page: filter?.page,
                // limit: filter?.limit,
            };
            Object.entries(payload)?.forEach(([key, val]: any) => {
                if (!val) {
                    delete payload[key];
                }
            });
            await dispatch(recordingSearch(payload)).unwrap();
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
            name: "converted_date",
            title: "Date",
            sortable: true,
        },
        {
            name: "callerID",
            title: "Caller ID",
            sortable: true,
            action: (row: any) => {
                return (
                    <>
                        <span>
                            {row?.callerID
                                ? user?.isPbx
                                    ? user?.isNumberMasking
                                        ? Array.from(row?.callerID).length > 4
                                            ? Array.from(row?.callerID).fill("X", 2, -2).join("")
                                            : Array.from(row?.callerID).fill("X", 1, -1).join("")
                                        : row?.callerID || ""
                                    : numberMasking
                                        ? Array.from(row?.callerID).length > 4
                                            ? Array.from(row?.callerID).fill("X", 2, -2).join("")
                                            : Array.from(row?.callerID).fill("X", 1, -1).join("")
                                        : row?.callerID || ""
                                : ""}
                        </span>
                    </>
                );
            },
        },
        {
            name: "caller_id_number",
            title: "Caller Id Number",
            sortable: true,
            action: (row: any) => {
                return (
                    <>
                        <span>
                            {row?.caller_id_number
                                ? user?.isPbx
                                    ? user?.isNumberMasking
                                        ? Array.from(row?.caller_id_number).length > 4
                                            ? Array.from(row?.caller_id_number)
                                                .fill("X", 2, -2)
                                                .join("")
                                            : Array.from(row?.caller_id_number)
                                                .fill("X", 1, -1)
                                                .join("")
                                        : row?.caller_id_number || ""
                                    : numberMasking
                                        ? Array.from(row?.caller_id_number).length > 4
                                            ? Array.from(row?.caller_id_number)
                                                .fill("X", 2, -2)
                                                .join("")
                                            : Array.from(row?.caller_id_number)
                                                .fill("X", 1, -1)
                                                .join("")
                                        : row?.caller_id_number || ""
                                : ""}
                        </span>
                    </>
                );
            },
        },
        {
            name: "destination_number",
            title: "Phone Number",
            sortable: true,
            action: (row: any) => {
                return (
                    <>
                        <div className="flex items-center">
                            <Image
                                className="mr-2"
                                src={
                                    row?.direction === "outbound" ? call_outbound : call_inbond
                                }
                                alt="call"
                                width={14}
                                height={14}
                            />
                            <span>
                                {row?.destination_number
                                    ? user?.isPbx
                                        ? user?.isNumberMasking
                                            ? Array.from(row?.destination_number).length > 4
                                                ? Array.from(row?.destination_number)
                                                    .fill("X", 2, -2)
                                                    .join("")
                                                : Array.from(row?.destination_number)
                                                    .fill("X", 1, -1)
                                                    .join("")
                                            : row?.destination_number || ""
                                        : numberMasking
                                            ? Array.from(row?.destination_number).length > 4
                                                ? Array.from(row?.destination_number)
                                                    .fill("X", 2, -2)
                                                    .join("")
                                                : Array.from(row?.destination_number)
                                                    .fill("X", 1, -1)
                                                    .join("")
                                            : row?.destination_number || ""
                                    : ""}
                            </span>
                        </div>
                    </>
                );
            },
        },
        {
            name: "duration",
            title: "Duration",
            sortable: true,
        },
        {
            name: "Play/Download",
            title: "Play/Download",
            sortable: false,
            action: (row: any) => {
              // console.log("askdnmdslkafdas",row);
              
                let src = `${baseUrl +
                    "/voicemail/download/voicemail?voicemail=" +
                    row?.recording_path
                    }`;
                return (
                    <>
                        <TableAudioPlayer src={src} name={row?.fileName} />
                    </>
                );
            },
        },
    ];

    return (
      <>
        <div className="bg-white py-[7px] px-[3px] pb-[15px] rounded-[25px]">
          <div className="pb-4">
            <Head
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
            >
              <div className="grid grid-cols-3 lg:grid-cols-2 2md:grid-cols-2 md:grid-cols-1 sm:grid-cols-1">
                <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                  <DatePicker
                    name="callstart"
                    label="From Date"
                    placeholder="Select from date"
                    dateFormat="yyyy-MM-dd HH:mm:ss"
                    value={data.callstart.val}
                    startDate={data.callstart.val}
                    endDate={data.callend.val}
                    maxDate={data.callend.val || new Date()}
                    onChange={(e: any) => {
                      handleChnage("callstart", e);
                    }}
                    showTimeSelect
                    selectsStart
                    isInfo
                  />
                </div>
                <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                  <DatePicker
                    name="callend"
                    label="To Date"
                    placeholder="Select to date"
                    dateFormat="yyyy-MM-dd HH:mm:ss"
                    value={data.callend.val}
                    startDate={data.callstart.val}
                    endDate={data.callend.val}
                    minDate={data.callstart.val}
                    maxDate={new Date()}
                    onChange={(e: any) => {
                      handleChnage("callend", e);
                    }}
                    showTimeSelect
                    selectsEnd
                    isInfo
                  />
                </div>
                <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                  <InputSelect
                    name="caller_id_name"
                    label="Caller ID"
                    placeholder="Enter Caller ID"
                    value={data.caller_id_name.val}
                    dropdownValue={data.caller_id_name.dropdown}
                    options={advanceSearchOptions}
                    onChange={(e: any) =>
                      handleChnage("caller_id_name", e.target.value)
                    }
                    onDropdownChange={(e: any) =>
                      handleSelect("caller_id_name", e.target.value)
                    }
                    isInfo
                  />
                </div>
                <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                  <InputSelect
                    name="caller_id_number"
                    label="Caller ID Number"
                    placeholder="Enter Caller ID Number"
                    value={data.caller_id_number.val}
                    dropdownValue={data.caller_id_number.dropdown}
                    options={advanceSearchOptions}
                    onChange={(e: any) =>
                      handleChnage("caller_id_number", e.target.value)
                    }
                    onDropdownChange={(e: any) =>
                      handleSelect("caller_id_number", e.target.value)
                    }
                    isInfo
                  />
                </div>
                <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                  <InputSelect
                    type="number"
                    name="destination_number"
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={data.destination_number.val}
                    dropdownValue={data.destination_number.dropdown}
                    options={advanceSearchOptions}
                    onChange={(e: any) =>
                      handleChnage("destination_number", e.target.value)
                    }
                    onDropdownChange={(e: any) =>
                      handleSelect("destination_number", e.target.value)
                    }
                    isInfo
                  />
                </div>
              </div>
            </Head>
          </div>
          <Table
            isLoading={isLoading}
            columns={columns}
            data={recordingsList?.data || []}
            page={filter.page}
            totalCount={recordingsList?.count || 0}
            limit={filter.limit}
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
                page: Math.ceil(recordingsList?.count / filter.limit),
              });
            }}
          />
        </div>
      </>
    );
};

export default RecordingTable;
