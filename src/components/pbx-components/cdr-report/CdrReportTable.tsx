"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// PROJECT IMPORTS
import {
    cdrReportSearch,
    getCdrReport,
    useCdrReportDetails,
} from "@/redux/slice/cdrReportSlice";
import {
    onAddLeadNoteId,
    onDial,
    useCampaignType,
    useNumberMasking,
} from "@/redux/slice/commonSlice";
import { getCampaign } from "@/redux/slice/campaignSlice";
import { useAppDispatch } from "@/redux/hooks";
import {
    advanceSearchOptions,
    callModeOptions,
    typeOptions,
} from "@/config/options";
import { Danger } from "@/redux/services/toasterService";
import { SEARCH_ERROR_MESSAGE } from "@/config/constant";
import { useAuth } from "@/contexts/hooks/useAuth";
import { Head, Table } from "../../ui-components";
import { InputSelect, Select } from "../../forms";
import { DatePicker } from "../../pickers";

// THIRD-PARTY IMPORT
import { format } from "date-fns";
import { useDebouncedCallback } from "use-debounce";

// ASSETS
const callGreen = "/assets/icons/green/call.svg";
const call_outbound = "/assets/icons/call/call-outbound.svg";
const call_inbond = "/assets/icons/call/call-inbond.svg";
const call_missed = "/assets/icons/orange/call-missed.svg";

// TYPES
import { columnsType } from "@/types/tableTypes";
import { FilterTypes } from "@/types/filterTypes";
import { CdrsReportFilterTypes } from "@/types/advancedFilterTypes";

// NAME STATE
const initialValues: CdrsReportFilterTypes = {
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
    destination_number: { key: "destination_number|1", val: "", dropdown: "1" },
    disposition: { key: "disposition|4", val: "" },
    call_mode: { key: "call_mode|4", val: "" },
};

/* ============================== CDR REPORT TABLE ============================== */

const CdrReportTable = () => {
    const dispatch = useAppDispatch();
    const cdrReportDetails = useCdrReportDetails();
    console.log(cdrReportDetails,'cdrReportDetailscdrReportDetailscdrReportDetails'); 
    const numberMasking = useNumberMasking();
    const campaignType = useCampaignType();
    const { user } = useAuth();
     const [data, setData] = useState<any>(initialValues);
    const [filterOpen, setFilterOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [campaignOptions, setCampaignOptions] = useState<any[]>([]);
    const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>("");
    const [filter, setFilter] = useState<FilterTypes>({
        page: 1,
        limit: 10,
        search: "",
        isAdvance: false,
    });

     // FETCH CAMPAIGN OPTIONS FOR FILTER DROPDOWN
    const onGetCampaignOptions = async () => {
        try {
            const res: any = await dispatch(getCampaign({ list: "all" })).unwrap();
            if (res?.statusCode === 200) {
                const inbound = (res?.data?.inbound_campaign || []).map((x: any) => ({
                    value: x.uuid,
                    label: x.name,
                }));
                const outbound = (res?.data?.outbound_campaign || []).map((x: any) => ({
                    value: x.uuid,
                    label: x.name,
                }));
                const blended = (res?.data?.blended_campaign || []).map((x: any) => ({
                    value: x.uuid,
                    label: x.name,
                }));
                setCampaignOptions([...inbound, ...outbound, ...blended]);
            }
        } catch (error: any) {
            console.log("Get campaign options error ---->", error?.message);
        }
    };

    useEffect(() => {
        onGetCampaignOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // GET CDR REPORT DETAILS
    const onGetCdrReport = useDebouncedCallback(async () => {
        try {
            setIsLoading(true);
            const params: any = { ...filter };
            delete params["isAdvance"];
            if (selectedCampaignFilter) {
                params["campaign_uuid"] = selectedCampaignFilter;
            }
            await dispatch(getCdrReport(params)).unwrap();
            setIsLoading(false);
        } catch (error: any) {
            console.log("Get CRD Report error ---->", error?.message);
            setIsLoading(false);
        }
    }, 500);

    useEffect(() => {
        if (filter?.isAdvance) {
            onSearchData();
        } else {
            onGetCdrReport();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, selectedCampaignFilter]);

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
                data["destination_number"]["val"] ||
                data["disposition"]["val"] ||
                data["call_mode"]["val"] ||
                selectedCampaignFilter
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
                [data["destination_number"]["key"]]: data["destination_number"]["val"],
                [data["disposition"]["key"]]: data["disposition"]["val"],
                [data["call_mode"]["key"]]: data["call_mode"]["val"],
                page: filter?.page,
                limit: filter?.limit,
            };
            if (selectedCampaignFilter) {
                payload["campaign_uuid"] = selectedCampaignFilter;
            }
            Object.entries(payload)?.forEach(([key, val]: any) => {
                if (!val) {
                    delete payload[key];
                }
            });
            await dispatch(cdrReportSearch(payload)).unwrap();
            setIsLoading(false);
        } catch (e: any) {
            console.error("Search data Err --->", e?.message);
            setIsLoading(false);
        }
    };

    // ADVANCE SEARCH Fields Empty & Fetching Conference Data
    const onEmptySearch = () => {
        setFilterOpen(false);
        setSelectedCampaignFilter("");
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
          name: "fullName",
          title: "Customer Name",
          sortable: true,
          action: (row: any) => {
            const first = row?.lead_details?.[0]?.first_name ?? "";
            const last = row?.lead_details?.[0]?.last_name ?? "";
            const fullName = `${first} ${last}`.trim();
            return <span>{fullName || ""}</span>;
          }
        },
        {
            name: "PhoneNumber",
            title: "Phone Number",
            sortable: true,
            action: (row: any) => {
                return (
                    <>
                        <div className="flex items-center">
                            <Image
                                className="mr-2"
                                src={
                                    row?.call_state === "missed"
                                        ? call_missed
                                        : row?.direction === "outbound"
                                            ? call_outbound
                                            : call_inbond
                                }
                                alt="call"
                                width={14}
                                height={14}
                            />
                            <span>
                                {row?.PhoneNumber
                                    ? user?.isPbx
                                        ? user?.isNumberMasking
                                            ? Array.from(row?.PhoneNumber).length > 4
                                                ? Array.from(row?.PhoneNumber).fill("X", 2, -2).join("")
                                                : Array.from(row?.PhoneNumber).fill("X", 1, -1).join("")
                                            : row?.PhoneNumber || ""
                                        : numberMasking
                                            ? Array.from(row?.PhoneNumber).length > 4
                                                ? Array.from(row?.PhoneNumber).fill("X", 2, -2).join("")
                                                : Array.from(row?.PhoneNumber).fill("X", 1, -1).join("")
                                            : row?.PhoneNumber || ""
                                    : ""}
                            </span>
                        </div>
                    </>
                );
            },
        },
        {
            name: "billsecond",
            title: "Duration",
            sortable: true,
        },
        {
            name: "call_mode_name",
            title: "Call Mode",
            sortable: true,
        },
        {
            name: "campaign_name",
            title: "Campaign Name",
            sortable: true,
            action: (row: any) => {
                const campaignName =
                    row?.outbound_campaign?.[0]?.name ||
                    row?.inbound_campaign?.[0]?.name ||
                    row?.blended_campaign?.[0]?.name ||
                    "-";
                return <span>{campaignName}</span>;
            },
        },
        {
            name: "disposition",
            title: "Hangup Cause",
            sortable: true,
        },
        {
            name: "action",
            title: "Action",
            sortable: false,
            action: (row: any) => {
                return (
                    <>
                        {campaignType !== "inbound" && (
                            <div
                                className="cursor-pointer"
                                onClick={() => {
                                    row?.lead_uuid && dispatch(onAddLeadNoteId(row?.lead_uuid));
                                    dispatch(onDial(row?.PhoneNumber));
                                }}
                            >
                                <Image
                                    className="max-w-[unset]"
                                    src={callGreen}
                                    alt="call"
                                    height={18}
                                    width={18}
                                />
                            </div>
                        )}
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
                  <div className="text-xs font-semibold pb-2 flex items-center">
                    <label htmlFor="callstart">From Date</label>
                  </div>
                  <DatePicker
                    name="callstart"
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
                    isShowLabel={false}
                  />
                </div>
                <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                  <div className="text-xs font-semibold pb-2 flex items-center">
                    <label htmlFor="callend">To Date</label>
                  </div>
                  <DatePicker
                    name="callend"
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
                    isShowLabel={false}
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
                  />
                </div>
                <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                  <div className="text-xs font-semibold pb-2 flex items-center">
                    <label htmlFor="call_mode">Call Mode</label>
                  </div>
                  <Select
                    name="call_mode"
                    placeholder="Select call mode"
                    value={data.call_mode.val}
                    options={callModeOptions}
                    onChange={(e: any) =>
                      handleChnage("call_mode", e.target.value)
                    }
                    isShowLabel={false}
                    isInfo={false}
                  />
                </div>
                <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                  <div className="text-xs font-semibold pb-2 flex items-center">
                    <label htmlFor="disposition">Hangup Cause</label>
                  </div>
                  <Select
                    name="disposition"
                    placeholder="Select hangup cause"
                    value={data.disposition.val}
                    options={typeOptions}
                    onChange={(e: any) =>
                      handleChnage("disposition", e.target.value)
                    }
                    isShowLabel={false}
                    isInfo={false}
                  />
                </div>
                <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                  <div className="text-xs font-semibold pb-2 flex items-center">
                    <label htmlFor="campaign_uuid">Campaign</label>
                  </div>
                  <Select
                    name="campaign_uuid"
                    placeholder="Select campaign"
                    value={selectedCampaignFilter}
                    options={campaignOptions}
                    isClearable
                    isShowLabel={false}
                    isInfo={false}
                    onChange={(e: any) => {
                      const val = e?.target?.value || "";
                      setSelectedCampaignFilter(val);
                      setFilter((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>
              </div>
            </Head>
          </div>
          <Table
            isLoading={isLoading}
            columns={columns}
            data={cdrReportDetails?.data}
            page={filter.page}
            totalCount={cdrReportDetails?.count || 0}
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
                page: Math.ceil(cdrReportDetails?.count / filter.limit),
              });
            }}
          />
        </div>
      </>
    );
};

export default CdrReportTable;
