"use client";
import Image from "next/image";
import React from "react";

// PROJECT IMPORTS
import { options } from "@/config/options";
import { ToolTipIcon } from "../ui-components";

// THIRD-PARTY IMPORT
import ReactPaginate from "react-paginate";
import { Button } from "../forms";

// ASSETS
const refreshIcon = "/assets/icons/refresh.svg";
const leftArrow = "/assets/icons/arrow-left.svg";
const rightArrow = "/assets/icons/arrow-right.svg";
const previous = "/assets/icons/previous.svg";
const next = "/assets/icons/next.svg";

// TYPES
interface PaginationProps {
  className?: string;
  page?: number;
  totalCount?: number;
  limit?: number;
  isAdvance?: boolean;
  onPageClick?: any;
  onLimitChange?: any;
  classNameMain?: string;
  onRefreshClick: any;
  firstPageClick?: any;
  lastPageClick?: any;
  onCreateButtonClick?: any;
  title?: any;
}

/* ============================== PAGINATION ============================== */

const Pagination = (props: PaginationProps) => {
  const {
    className,
    page = 1,
    totalCount = 0,
    limit = 10,
    isAdvance,
    onPageClick,
    onLimitChange,
    classNameMain,
    onRefreshClick,
    firstPageClick,
    lastPageClick,
    onCreateButtonClick,
    title,
  } = props;
  const totalPage = Math.ceil(totalCount / limit);
  const start = page * limit - limit + 1;
  const end = isAdvance ? totalCount : Math.min(page * limit, totalCount);

  const handlePageClick = (event: any) => {
    onPageClick(event.selected + 1);
  };

  const disabledOptions = (val: any) => {
    if ((end == totalCount && parseInt(val?.value) > limit) || isAdvance)
      return true;
    return false;
  };

  return (
    <div
      className={`${
        totalCount === 0 && "!justify-center"
      } w-full bg-white py-3 flex justify-between items-center px-6 smd:px-3 rounded-b-[20px]`}
    >
      {totalCount > 0 && (
        <div className={`flex items-center gap-3 h-5 ${classNameMain}`}>
          <span className="text-txt-primary font-normal 3xl:text-sm text-xs smd:hidden">{`Showing ${start} to ${end} of ${totalCount} entries`}</span>
          <div className="border-2 border-dark-700 rounded-md">
            <select
              value={limit}
              onChange={(e: any) => onLimitChange(e.target.value)}
              className={`block 3xl:text-sm text-xs w-full focus:outline-none 3xl:border-2 border rounded-md border-transparent rounded-e-md font-normal 3xl:border-r-8 border-r-2 text-txt-primary`}
            >
              {options?.map((val: any, index: number) => {
                return (
                  <React.Fragment key={index}>
                    <option disabled={disabledOptions(val)} value={val?.value}>
                      {val?.label}
                    </option>
                  </React.Fragment>
                );
              })}
            </select>
          </div>

          <ToolTipIcon
            className="cursor-pointer"
            src={refreshIcon}
            alt="reset"
            height={14}
            width={14}
            tooltip="refresh"
            onClick={onRefreshClick}
          />
        </div>
      )}
      {/* Pagination create lead button  */}
      {/* {totalCount > 0 && title && (
        <Button
          icon="plus-white"
          tooltip={`Create ${title}`}
          className="!rounded-full !w-8 !h-8"
          style="primary"
          onClick={onCreateButtonClick}
        />
      )} */}
      <div className={`${classNameMain} flex items-center`}>
        {totalCount > 0 ? (
          <div className="pr-2">
            <Image
              className={`cursor-pointer hidden smd:block ${
                page === 1 && "opacity-50 pointer-events-none"
              }`}
              src={previous}
              alt="previous"
              height={14}
              width={14}
              onClick={firstPageClick}
            />
          </div>
        ) : null}
        <ReactPaginate
          containerClassName={`flex gap-1 items-center ${className}`}
          pageClassName={`3xl:px-2.5 px-1.5 3xl:py-[2px] py-[1px] rounded-md text-txt-primary font-normal 3xl:text-sm text-xs smd:hidden`}
          activeClassName="bg-button-background text-white 3xl:text-sm text-xs smd:!block"
          breakLabel=" . . "
          forcePage={page - 1}
          breakClassName="text-txt-primary font-normal 3xl:px-2.5 px-1.5 3xl:py-[2px] py-[1px] smd:hidden"
          nextLabel={
            <>
              <Image
                className={`cursor-pointer hidden smd:block ${
                  page === totalPage && "opacity-50 pointer-events-none"
                }`}
                src={rightArrow}
                alt="rightArrow"
                height={14}
                width={14}
              />
              <label className="smd:hidden cursor-pointer">Next</label>
            </>
          }
          nextClassName={`${
            page === totalPage ? "text-txt-secondary" : "text-txt-primary"
          } smd:pl-1 pl-2 3xl:text-sm text-xs`}
          onPageChange={handlePageClick}
          pageRangeDisplayed={2}
          pageCount={isAdvance ? 1 : totalPage}
          previousLabel={
            <>
              <Image
                className={`cursor-pointer hidden smd:block ${
                  page === 1 && "opacity-50 pointer-events-none"
                }`}
                src={leftArrow}
                alt="leftArrow"
                height={14}
                width={14}
              />
              <label className="smd:hidden cursor-pointer">Previous</label>
            </>
          }
          previousClassName={`${
            page === 1 ? "text-txt-secondary" : "text-txt-primary"
          } smd:pr-1 pr-2 3xl:text-sm text-xs`}
          renderOnZeroPageCount={null}
        />
        {totalCount > 0 ? (
          <div className="pl-2">
            <Image
              className={`cursor-pointer hidden smd:block ${
                page === totalPage && "opacity-50 pointer-events-none"
              }`}
              src={next}
              alt="next"
              height={14}
              width={14}
              onClick={lastPageClick}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Pagination;
