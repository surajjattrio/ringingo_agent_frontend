"use client";
import { useEffect, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import Pagination from "./Pagination";
import Loader from "./Loader";
import { Button } from "../forms";

// ASSETS
const Search = "/assets/images/Empty_search.svg";
const noRecord = "/assets/images/no-records-new.svg";

// TYPES
import { columnsType } from "@/types/tableTypes";

interface TableProps {
  className?: string;
  isLoading?: boolean;
  columns: columnsType[];
  data: any;
  pagination?: boolean;
  page?: number;
  totalCount?: number;
  limit?: number;
  headerStyle?: string;
  bodyStyle?: string;
  onLimitChange?: any;
  onPageClick?: any;
  onRefreshClick: any;
  firstPageClick?: any;
  lastPageClick?: any;
  onCreateButtonClick?: any;
  title?: any;
  sortIconColor?: string;
}

/* ============================== TABLE ============================== */

const Table = (props: TableProps) => {
  const {
    className,
    isLoading,
    columns,
    data,
    pagination = true,
    page,
    totalCount,
    limit = 10,
    headerStyle,
    bodyStyle,
    onLimitChange,
    onPageClick,
    onRefreshClick,
    firstPageClick,
    lastPageClick,
    onCreateButtonClick,
    title,
    sortIconColor = "#13151F",
  } = props;

  const [tableData, setTableData] = useState(data);
  const [columnData, setColumnData] = useState(columns);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  // SHORTING TABLE
  const sortingByVal = (name: string, index: number) => {
    const newTableData = [...tableData];
    const newColumnData = [...columnData];
    if (!newTableData?.length) return;

    const currentSort = newColumnData[index]?.sort === "asc" ? "desc" : "asc";
    newColumnData[index] = { ...newColumnData[index], sort: currentSort };

    currentSort === "asc"
      ? newTableData.sort((a, b) =>
          a[name]?.toString().toLowerCase() < b[name]?.toString().toLowerCase()
            ? -1
            : 1
        )
      : newTableData
          .sort((a, b) =>
            a[name]?.toString().toLowerCase() <
            b[name]?.toString().toLowerCase()
              ? -1
              : 1
          )
          .reverse();
    setColumnData(newColumnData);
    setTableData(newTableData);
  };

  return (
    // shadow-2x
    <div className="relative z-[0] l bg-gradient-to-br border bg-white overflow-hidden mx-3 rounded-b-[20px] rounded-t-[20px] ">
      {/* "relative bg-white shadow-lg overflow-hidden mx-3" */}
      <div
        // className={`${!tableData?.leng && "scrollbar-hide"}
        //         ${
        //           pagination
        //              ? "smd:h-[calc(100vh-200px)] h-[calc(100vh-210px)] 3xl:h-[calc(100vh-235px)]"
        //             : "smd:h-[calc(100vh-200px)] h-[calc(100vh-155px)] 3xl:h-[calc(100vh-185px)]"
        //         }
        //         relative overflow-x-auto rounded-lg ${className}`}
        className={`
    relative overflow-x-auto rounded-lg ${className}
    scrollbar-hide
    ${
      pagination
        ? " h-[calc(100vh-270px)]" // height slightly less than 100vh to leave space for pagination
        : "h-[calc(100vh-120px)]" // different height when no pagination
    }
  `}
      >
        <div className="">
          <table className="w-full min-w-full divide-y divide-gray-200 rounded-t-[20px]">
            {/* table header color */}
            <thead
              className={`bg-table-header sticky top-0 z-10 rounded-t-[20px]  ${headerStyle}`}
            >
              <tr>
                {columnData?.map((val: any, index: number) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-[Nunito Sans] font-semibold text-[#202224] capitalize tracking-wider whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      <span>{val?.title}</span>
                      {/* {val?.sortable && (
                      <button
                        onClick={() => sortingByVal(val.name, index)}
                        className="focus:outline-none"
                      >
                        <svg
                          className="w-3 h-3 transition-colors"
                          viewBox="0 0 11 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.897 8.155L9.02449 6.2825L7.88116 5.13333C7.39699 4.64917 6.60949 4.64917 6.12533 5.13333L3.10366 8.155C2.70699 8.55167 2.99283 9.22833 3.54699 9.22833H6.81949H10.4537C11.0137 9.22833 11.2937 8.55167 10.897 8.155Z"
                            fill={
                              val?.sort === "asc" ? "#B2B3B5" : sortIconColor
                            }
                          />
                          <path
                            d="M10.4529 13.7717H6.81878H3.54628C2.98628 13.7717 2.70628 14.4483 3.10294 14.845L6.12461 17.8667C6.60878 18.3508 7.39628 18.3508 7.88044 17.8667L9.02961 16.7175L10.9021 14.845C11.2929 14.4483 11.0129 13.7717 10.4529 13.7717Z"
                            fill={
                              val?.sort === "desc" ? "#B2B3B5" : sortIconColor
                            }
                          />
                        </svg>
                      </button>
                    )} */}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y  divide-gray-200 rounded-b-[20px] ">
              {!tableData?.length && isLoading ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="flex justify-center items-center h-32 ">
                      <Loader background="transparent" />
                    </div>
                  </td>
                </tr>
              ) : tableData?.length ? (
                tableData?.map((val: any, index: number) => (
                  <tr
                    key={index}
                    className={`hover:bg-table-data transition-colors ${bodyStyle}`}
                  >
                    {columns.map((column: any, colIndex: number) => {
                      const { action: Action } = column;
                      return (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm font-[Table Heading Regular] font-normal text-[#0B0A0A]"
                        >
                          {column?.action ? (
                            <Action {...val} />
                          ) : (
                            val[column["name"]]
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="flex flex-col items-center justify-center py-32">
                      {/* no records icon */}
                      <div className="relative h-40 w-40 mb-4">
                        <Legacy
                          src={noRecord}
                          layout="fill"
                          alt="No Data Found"
                        />
                      </div>
                      {/* <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No data found
                    </h3> */}
                      {title && (
                        <>
                          <p className="text-sm text-gray-500 mb-4">
                            Try to create a {title}
                          </p>
                          <Button
                            text={`Create ${title}`}
                            style="primary-outline"
                            icon="plus"
                            className="px-4 py-2"
                            onClick={onCreateButtonClick}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <div className="w-full border-t border-gray-200">
          <Pagination
            page={page}
            limit={limit}
            totalCount={totalCount}
            onPageClick={onPageClick}
            onLimitChange={onLimitChange}
            onRefreshClick={onRefreshClick}
            isAdvance={limit < data?.length}
            firstPageClick={firstPageClick}
            lastPageClick={lastPageClick}
            onCreateButtonClick={onCreateButtonClick}
            title={title}
          />
        </div>
      )}
    </div>
  );
};

export default Table;
