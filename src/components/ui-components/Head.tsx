"use client";
import { useEffect, useState } from "react";
import Legacy from "next/legacy/image";
import { Button } from "../forms";

// PROJECT IMPORTS
import { SearchBar } from "../pickers";
import Filter from "./Filter";

// ASSETS
const CloseIcon = "/assets/icons/close-circle.svg";

// TYPES
interface HeadProps {
  children?: React.ReactNode;
  isSearch?: boolean;
  isFilter?: boolean;
  onChange?: any;
  onFilterClick?: () => void;
  filterOpen?: boolean;
  onSearchClick?: () => void;
  onHide?: () => void;
  onTodayClick?: () => void;
  onCreateButtonClick?: any;
  totalCount?: number;
  title?: any;
}

const Head = (props: HeadProps) => {
  const {
    children,
    isSearch = true,
    isFilter = true,
    onChange,
    onFilterClick,
    filterOpen = false,
    onSearchClick,
    onTodayClick,
    onHide,
    onCreateButtonClick,
    totalCount = 0,
    title,
  } = props;
  const [isToday, setIsToday] = useState<boolean>(true);
  const handleButtonClick = () => {
    // alert(isToday);
    if (isToday == true) {
      setIsToday(false);
    } else {
      setIsToday(true);
    }
  };
  return (
    <>
      <div className="items-center mx-3 mt-2 rounded-[10px]">
        <div className="flex justify-end">
          <div className="flex gap-3 smd:gap-2">
            {onTodayClick && (
              <Button
                className="px-3 h-full"
                text={isToday ? "Today" : "All"}
                style="primary"
                onClick={() => {
                  handleButtonClick();
                  onTodayClick();
                }}
              />
            )}
            {isSearch && (
              <SearchBar
                className="w-56"
                iconClassName="3xl:!top-2.5"
                placeholder="Search by Keyword"
                onChange={onChange}
              />
            )}
            <div className="h-[15px] mt-2 w-px bg-gray-400"></div>
            {totalCount > 0 && title && (
              <Button
                icon="plus-white"
                tooltip={`Create ${title}`}
                text="Create Lead"
                className="flex h-full items-center border bg-button-background text-white px-3 smd:p-1.5 cursor-pointer text-sm font-medium"
                style=""
                onClick={onCreateButtonClick}
              />
            )}
            {isFilter && <Filter onClick={onFilterClick} className="" />}
          </div>
        </div>
        <div
          className={`flex flex-col mt-5 bg-white border border-dark-800 relative z-[1] rounded-md drop-shadow-lg ${
            !filterOpen && "hidden"
          }`}
        >
          <div className="flex items-center justify-between border-b border-dark-700 3xl:pl-10 pl-6 3xl:pr-4 3xl:py-4 pr-2 py-2">
            <span className="3xl:text-sm text-xs font-bold">Search</span>
            <div className="relative 3xl:w-[20px] 3xl:h-[20px] w-[16px] h-[16px] cursor-pointer">
              <Legacy
                src={CloseIcon}
                alt="Close"
                layout="fill"
                onClick={onHide}
              />
            </div>
          </div>
          <div className="3xl:px-5 px-3 3xl:pt-4 pt-2 3xl:pb-8 pb-6 space-y-4">
            {children}
          </div>
          <div className="flex 3xl:py-4 py-2 justify-end items-center border-t shadow-box rounded-sm">
            <div className="flex gap-3 3xl:px-10 px-4">
              <Button
                className="3xl:px-3 3xl:py-2 px-2 py-1 rounded-md"
                text="Cancel"
                style="dark-outline"
                onClick={onHide}
              />
              <Button
                className="3xl:px-3 3xl:py-2 px-2 py-1.5 rounded-md"
                text="Search"
                style="primary"
                onClick={onSearchClick}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Head;
