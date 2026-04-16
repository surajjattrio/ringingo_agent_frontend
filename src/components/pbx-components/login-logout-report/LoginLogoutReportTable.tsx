"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// PROJECT IMPORTS
import {
  getLoginLogoutReport,
  searchLoginLogoutReport,
  useLoginLogoutList,
} from "@/redux/slice/loginLogoutSlice";
import { useAppDispatch } from "@/redux/hooks";
import { DatePicker } from "@/components/pickers";
import { Head, Table } from "../../ui-components";
import { SEARCH_ERROR_MESSAGE } from "@/config/constant";
import { Danger } from "@/redux/services/toasterService";
import LoginLogoutReportInformation from "./LoginLogoutReportInformation";

// THIRD-PARTY IMPORT
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";

// ASSETS
const info = "/assets/icons/info-circle.svg";

// TYPES
import { columnsType } from "@/types/tableTypes";
import { FilterTypes } from "@/types/filterTypes";

// FILTER STATE
const initialValues = {
  startDate: {
    key: "startDate",
    val: "",
    dropdown: "1",
  },
  endDate: {
    key: "endDate",
    val: "",
    dropdown: "1",
  },
};

/* ============================== LOGIN - LOGOUT REPORT TABLE ============================== */

const LoginLogoutReportTable = () => {
  const dispatch = useAppDispatch();
  const loginLogoutList = useLoginLogoutList();
  const [data, setData] = useState<any>(initialValues);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInfoDate, setInfoDate] = useState<any>(null);
  const [filter, setFilter] = useState<FilterTypes>({
    page: 1,
    limit: 10,
    search: "",
    isAdvance: false,
  });

  // GET CDR REPORT DETAILS
  const onGetCdrReport = useDebouncedCallback(async () => {
    try {
      setIsLoading(true);
      const params = { ...filter };
      delete params["isAdvance"];
      await dispatch(getLoginLogoutReport(params)).unwrap();
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
  }, [filter]);

  // ADVANCE SEARCH - Searching Data API call
  const onSearchData = async () => {
    if (
        !(
            data["startDate"]["val"] ||
            data["endDate"]["val"]
        )
    ) {
        Danger(SEARCH_ERROR_MESSAGE);
        return false;
    }
    try {
        setIsLoading(true);
        let payload: any = {
            [data["startDate"]["key"]]: data["startDate"]["val"]
                ? format(new Date(data["startDate"]["val"]), "yyyy-MM-dd HH:mm:ss")
                : "",
            [data["endDate"]["key"]]: data["endDate"]["val"]
                ? format(new Date(data["endDate"]["val"]), "yyyy-MM-dd HH:mm:ss")
                : data["startDate"]["val"]
                    ? format(new Date().setHours(23, 59, 59), "yyyy-MM-dd HH:mm:ss")
                    : "",
            page: filter?.page,
            limit: filter?.limit,
        };
        Object.entries(payload)?.forEach(([key, val]: any) => {
            if (!val) {
                delete payload[key];
            }
        });
        await dispatch(searchLoginLogoutReport(payload)).unwrap();
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

  // ADVANCE SEARCH - Trigger when left side Input or Select value change
  const handleChnage = (key: string, val: string) => {
    setData({
      ...data,
      [key]: { ...data[key], val: val },
    });
  };

  const columns: columnsType[] = [
    {
      name: "date",
      title: "Date",
      sortable: true,
      action: (row: any) => {
        return (
          <div>
            <span>{format(new Date(row["date"]), "yyyy-MM-dd")}</span>
          </div>
        );
      },
    },
    {
      name: "total_login_hours",
      title: "Total Login Time(HH:MM)",
      sortable: true,
    },
    {
      name: "first_login_time",
      title: "First Login Time(HH:MM)",
      sortable: true,
    },
    {
      name: "last_login_time",
      title: "Last Logout Time(HH:MM)",
      sortable: true,
    },
    {
      name: "login_count",
      title: "Total Count of Logins",
      sortable: true,
    },
    {
      name: "total_break_hours",
      title: "Total Break Time(HH:MM)",
      sortable: true,
    },
    {
      name: "break_count",
      title: "Total Count of Breaks",
      sortable: true,
    },
    {
      name: "login_logout_info",
      title: "Info",
      action: (row: any) => {
        return (
          <div className="flex gap-2">
            <Image
              className="mr-2 cursor-pointer"
              src={info}
              alt="info"
              width={20}
              height={20}
              onClick={() => {
                setInfoDate(row?.date);
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
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
                name="startDate"
                label="From Date"
                placeholder="Select from date"
                dateFormat="yyyy-MM-dd HH:mm:ss"
                value={data.startDate.val}
                startDate={data.startDate.val}
                endDate={data.endDate.val}
                maxDate={data.endDate.val || new Date()}
                onChange={(e: any) => {
                  handleChnage("startDate", e);
                }}
                showTimeSelect
                selectsStart
                isInfo
              />
            </div>
            <div className="md:px-2 sm:px-1 sm:pt-1 px-4 pt-3">
              <DatePicker
                name="endDate"
                label="To Date"
                placeholder="Select to date"
                dateFormat="yyyy-MM-dd HH:mm:ss"
                value={data.endDate.val}
                startDate={data.startDate.val}
                endDate={data.endDate.val}
                minDate={data.startDate.val}
                maxDate={new Date()}
                onChange={(e: any) => {
                  handleChnage("endDate", e);
                }}
                showTimeSelect
                selectsEnd
                isInfo
              />
            </div>
          </div>
        </Head>
      </div>
      <div
        className={`${
          isInfoDate
            ? "grid grid-cols-3 gap-4 smd:grid-cols-1 smd:gap-y-4 smd:gap-x-0"
            : ""
        }`}
      >
        <div className="col-span-2">
          <Table
            isLoading={isLoading}
            columns={columns}
            data={loginLogoutList?.data}
            page={filter.page}
            totalCount={loginLogoutList?.count || 0}
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
                page: Math.ceil(loginLogoutList?.count / filter.limit),
              });
            }}
          />
        </div>
        {isInfoDate ? (
          <div className="col-span-1">
            <LoginLogoutReportInformation
              isInfoDate={isInfoDate}
              onCloseClick={() => {
                setInfoDate(null);
              }}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};

export default LoginLogoutReportTable;
