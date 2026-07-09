"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { Danger, Success } from "@/redux/services/toasterService";
import {
    archiveFollowUp,
    deleteFollowUp,
    getFollowUpList,
    readedFollowUp,
    searchFollowUpList,
    useFollowUpList,
} from "@/redux/slice/followUpSlice";
import { DeleteModal, FollowUpModal } from "@/components/modals";
import { SEARCH_ERROR_MESSAGE } from "@/config/constant";
import { followUpStatusOptions, followUpTypeOptions } from "@/config/options";
import {
    dueFollowUp,
    onAddLeadNoteId,
    onDial,
    upComingFollowUp,
    useCampaignType,
    useDueFollowUp,
    useNumberMasking,
    useUpcomingFollowUp,
} from "@/redux/slice/commonSlice";
import { useAuth } from "@/contexts/hooks/useAuth";
import { Head, Table } from "../../ui-components";
import { Select } from "../../forms";
import { DatePicker } from "../../pickers";
import FollowUpRescheduledInformation from "./FollowUpRescheduledInformation";

// THIRD-PARTY IMPORT
import { format } from "date-fns";
import { useDebouncedCallback } from "use-debounce";
import Cookies from "js-cookie";

// ASSETS
const editIcon = "/assets/icons/edit.svg";
const deleteIcon = "/assets/icons/red/delete.svg";
const callGreen = "/assets/icons/green/call.svg";
const info = "/assets/icons/info-circle.svg";

// TYPES
import { columnsType } from "@/types/tableTypes";
import { FilterTypes } from "@/types/filterTypes";

// NAME STATE
const now = new Date();
const startOfToday = new Date(now);
startOfToday.setHours(0, 0, 0, 0);

const initialValues = {
    date_time: {
        key: "date_time",
        val: startOfToday,
        dropdown: "1",
    },
    type: { key: "type|4", val: "" },
    is_readed: { key: "is_readed|4", val: "" },
};

/* ============================== CDR REPORT TABLE ============================== */

const FollowUpTable = () => {
    const dispatch = useAppDispatch();
    const followUpList = useFollowUpList();
    const upComingFollowUpList = useUpcomingFollowUp();
    const dueFollowUpList = useDueFollowUp();
    const numberMasking = useNumberMasking();
    const campaignType = useCampaignType();
    const { user } = useAuth();

    const [data, setData] = useState<any>(initialValues);
    const [filterOpen, setFilterOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [isFollowUpData, setIsFollowUpData] = useState<any>();
    const [rescheduledFollowUp, setRescheduledFollowUp] = useState<any>([]);
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [isEditId, setIsEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<any>("");
    const [isToday, setIsToday] = useState<boolean>(true);
    const [filter, setFilter] = useState<FilterTypes>({
        page: 1,
        limit: 10,
        search: "",
        isAdvance: false,
    });
    // Fetching User Group Options
    const todayFollow = async () => {
        // alert("coming");
        try {
            if (isToday == true) {
                const params = {
                    ...filter,
                    "today": true
                };
                setIsToday(false);
                await dispatch(getFollowUpList(params)).unwrap();
            } else {
                const params = {
                    ...filter,
                    "today": false
                };
                setIsToday(true);
                await dispatch(getFollowUpList(params)).unwrap();
            }


            //await dispatch(followUpToday(params)).unwrap();

            setIsLoading(false);
        } catch (err) {
            console.log("Get CRD Report error ---->", err);
            setIsLoading(false);
        }
    };
    // GET CDR REPORT DETAILS
    const onGetFollowUps = useDebouncedCallback(async () => {
        try {
            setIsLoading(true);
            // const params = { ...filter };
            const params = {
                ...filter,
                "today": false
            };
            console.log("FOLLOW UP");
            console.log(params);

            console.log("FOLLOW UP");
            console.log(params);
            delete params["isAdvance"];
            await dispatch(getFollowUpList(params)).unwrap();
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
            onGetFollowUps();
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

    // // ADVANCE SEARCH - Trigger when right side Select value change
    // const handleSelect = (key: string, val: string) => {
    //     setData({
    //         ...data,
    //         [key]: { ...data[key], key: `${key}|${val}`, dropdown: val },
    //     });
    // };

    // ADVANCE SEARCH - Searching Data API call
    const onSearchData = async () => {
        if (
            !(
                data["date_time"]["val"] ||
                data["type"]["val"] ||
                data["is_readed"]["val"]
            )
        ) {
            Danger(SEARCH_ERROR_MESSAGE);
            return false;
        }
        try {
            setIsLoading(true);
            let payload: any = {
                // [data["date_time"]["key"]]: data["date_time"]["val"]
                //     ? format(new Date(data["date_time"]["val"]), "yyyy-MM-dd HH:mm:ss")
                //     : "",
                [data["date_time"]["key"]]: data["date_time"]["val"]
                    ? format(new Date(data["date_time"]["val"]), "yyyy-MM-dd")
                    : "",
                [data["type"]["key"]]: data["type"]["val"],
                [data["is_readed"]["key"]]: data["is_readed"]["val"],
                // page: filter?.page,
                // limit: filter?.limit,
            };
            Object.entries(payload)?.forEach(([key, val]: any) => {
                if (!val) {
                    delete payload[key];
                }
            });
            await dispatch(searchFollowUpList(payload)).unwrap();
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

    const onDeleteFollowUP = async (id: string) => {
        setIsLoading(true);
        try {
            await dispatch(deleteFollowUp(id)).unwrap();
            onRemoveFollowUp(deleteId);
            const ids = deleteId.split(",");
            setDeleteId("");
            setFilter({
                ...filter,
                page:
                    ids?.length === followUpList?.data?.length && filter?.page > 1
                        ? filter?.page - 1
                        : filter?.page,
            });
            Success("Successfully Deleted");
        } catch (e: any) {
            setIsLoading(false);
            setDeleteId("");
            Danger("");
            console.error("Delete FollowUp Delete Err --->", e?.message);
        }
    };

    // // ON ARCHIVE FOLLOW UP
    // const onArchiveFollowUp = async (id: string) => {
    //     try {
    //         let payload = {
    //             follow_up_uuid: id,
    //         };
    //         const res: any = await dispatch(archiveFollowUp(payload)).unwrap();
    //         if (res && res.statusCode === 200) {
    //             setFilter({
    //                 ...filter,
    //             });
    //         }
    //     } catch (error: any) {
    //         console.error("Archive follow-up Err --->", error?.message);
    //     }
    // };

    // ON SET READED FOLLOW UP
    const onSetReadedFollowUp = async (id: any) => {
        try {
            let payload = {
                follow_up_uuid: id,
                is_readed: "2",
            };
            const res: any = await dispatch(readedFollowUp(payload)).unwrap();
            if (res && res.statusCode === 200) {
                Success(res?.data);
                setFilter({
                    ...filter,
                });
                setIsFollowUpData("");
                setIsEditId(null);
                setLoading(false);
            }
        } catch (error: any) {
            console.error("set Readed follow-up Err --->", error?.message);
            setLoading(false);
        }
    };

    // REMOVE FOLLOW UP
    const onRemoveFollowUp = async (id: any) => {
        if (dueFollowUpList.includes(id)) {
            let data = [...dueFollowUpList];
            let i = dueFollowUpList.findIndex((x: any) => x === id);
            data.splice(i, 1);
            dispatch(dueFollowUp(data));
        } else if (upComingFollowUpList.includes(id)) {
            let data = [...upComingFollowUpList];
            let i = upComingFollowUpList.findIndex((x: any) => x === id);
            data.splice(i, 1);
            dispatch(upComingFollowUp(data));
        }
    };

    const columns: columnsType[] = [
        {
            name: "followUpText",
            title: "Follow Up",
            sortable: true,
        },
        {
            // name: "converted_date",
            name: "date_time",
            title: "Follow Up Date",
            sortable: true,
        },
        {
            name: "fullName",
            title: "Lead Name",
            sortable: true,
        },
        {
            name: "PhoneNumber",
            title: "Lead Number",
            sortable: true,
            action: (row: any) => {
                return (
                    <>
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
                    </>
                );
            },
        },
        {
            name: "type",
            title: "Type",
            sortable: true,
        },
        {
            name: "followUpStatus",
            title: "Status",
            sortable: true,
            action: (row: any) => {
                return (
                    <label
                        className={`${row?.is_readed === "1"
                            ? "text-error"
                            : row?.is_readed === "0"
                                ? "text-primary-green"
                                : "text-primary-green"
                            }`}
                    >
                        {row.followUpStatus}
                    </label>
                );
            },
        },
        {
            name: "action",
            title: "Action",
            sortable: false,
            action: (row: any) => {
                return (
                    <>
                        <div className="flex items-center gap-2 justify-start">
                            <div
                                className="cursor-pointer"
                                onClick={() => {
                                    setShowInfo(true);
                                    setRescheduledFollowUp(
                                        row?.reschedule_details ? row?.reschedule_details : null
                                    );
                                }}
                            >
                                <Image
                                    className="max-w-[unset]"
                                    src={info}
                                    alt="info"
                                    height={18}
                                    width={18}
                                />
                            </div>
                            <div
                                className="cursor-pointer"
                                onClick={() => {
                                    setIsEditId(row?.follow_up_uuid);
                                    setIsFollowUpData(row);
                                }}
                            >
                                <Image
                                    className="max-w-[unset]"
                                    src={editIcon}
                                    alt="edit"
                                    height={18}
                                    width={18}
                                />
                            </div>
                            <div
                                className="cursor-pointer"
                                onClick={() => {
                                    setDeleteId(row?.follow_up_uuid);
                                }}
                            >
                                <Image
                                    className="max-w-[unset]"
                                    src={deleteIcon}
                                    alt="delete"
                                    height={18}
                                    width={18}
                                />
                            </div>
                            {campaignType !== "inbound" && (
                                <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                        onRemoveFollowUp(row?.follow_up_uuid);
                                        // onArchiveFollowUp(row?.follow_up_uuid);
                                        //onSetReadedFollowUp(row?.follow_up_uuid);
                                        Cookies.set("LeadDialName", row?.fullName);
                                        dispatch(onAddLeadNoteId(row?.lead_management_uuid));
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
                        </div>
                    </>
                );
            },
        },
    ];

    return (
        <>
            <div className="bg-white py-[7px] px-[3px] pb-[15px] rounded-[10px]">
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
                        onTodayClick={todayFollow}
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
                                    <label htmlFor="date_time">Date</label>
                                </div>
                                <DatePicker
                                    name="date_time"
                                    placeholder="Select date and time"
                                    dateFormat="yyyy-MM-dd"
                                    value={data.date_time.val ? new Date(data.date_time.val) : null}
                                    onChange={(date: any) => {
                                        handleChnage("date_time", date);
                                    }}
                                    isShowLabel={false}
                                />
                            </div>
                            <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                                <div className="text-xs font-semibold pb-2 flex items-center">
                                    <label htmlFor="type">Types</label>
                                </div>
                                <Select
                                    height="32px"
                                    name="type"
                                    placeholder="Select type"
                                    value={data.type.val}
                                    options={followUpTypeOptions}
                                    onChange={(e: any) => handleChnage("type", e.target.value)}
                                    isShowLabel={false}
                                    isInfo={false}
                                />
                            </div>
                            <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
                                <div className="text-xs font-semibold pb-2 flex items-center">
                                    <label htmlFor="is_readed">Status</label>
                                </div>
                                <Select
                                    height="32px"
                                    name="is_readed"
                                    placeholder="Select status"
                                    value={data.is_readed.val}
                                    options={followUpStatusOptions}
                                    onChange={(e: any) => handleChnage("is_readed", e.target.value)}
                                    isShowLabel={false}
                                    isInfo={false}
                                />
                            </div>
                        </div>
                    </Head>
                </div>
                <div className="grid grid-cols-3 gap-4 smd:grid-cols-1 smd:gap-y-4 smd:gap-x-0">
                    <div className={`${showInfo ? "col-span-2" : "col-span-3"} `}>
                        <Table
                            isLoading={isLoading}
                            columns={columns}
                            data={followUpList?.data}
                            page={filter.page}
                            totalCount={followUpList?.count || 0}
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
                                    page: Math.ceil(followUpList?.count / filter.limit),
                                });
                            }}
                        />
                    </div>
                    {showInfo && (
                        <div className="col-span-1">
                            {
                                <FollowUpRescheduledInformation
                                    rescheduledInfo={rescheduledFollowUp}
                                    setRescheduledFollowUp={setRescheduledFollowUp}
                                    onCloseClick={() => {
                                        setShowInfo(false);
                                        setRescheduledFollowUp(null);
                                    }}
                                />
                            }
                        </div>
                    )}
                </div>
                <FollowUpModal
                    visible={!!isEditId}
                    onCancleClick={() => {
                        setIsFollowUpData("");
                        setIsEditId(null);
                    }}
                    data={isFollowUpData}
                    isEditId={isEditId}
                    onDoneClick={() => {
                        setFilter({
                            ...filter,
                            page: 1,
                            limit: 10,
                        });
                    }}
                    onSetReadedFollowUp={() => {
                        onSetReadedFollowUp(isEditId);
                    }}
                    loading={loading}
                />
                <DeleteModal
                    isLoading={isLoading}
                    visible={!!deleteId}
                    onCancleClick={() => setDeleteId("")}
                    onDoneClick={() => onDeleteFollowUP(deleteId)}
                />
            </div>
        </>
    );
};

export default FollowUpTable;
