import { Select } from "@/components/forms";
import { useAppDispatch } from "@/redux/hooks";
import { getBreakOptions, useBreakOptions } from "@/redux/slice/breakSlice";
import React, { useEffect } from "react";
import { StylesConfig } from "react-select";

interface BreakSelectionProps {
  breakValue: any;
  onBreakSelection: any;
}

// CUSTOM STYLE
const customStyles: StylesConfig<any> = {
  control: (styles: any) => {
    return {
      ...styles,
      height: "28px",
      minHeight: "28px",
      borderColor: "#646567",
      borderWidth: "0 0 1px 0",
      borderRadius: "0",
      boxShadow: "none",
      padding: "0px 3px",
      color: "#646567",
      fontWeight: "600",
      minWidth: "150px",
      ":hover": {
        borderColor: "#646567",
      },
    };
  },
  input: (styles: any) => {
    return {
      ...styles,
      margin: "0",
    };
  },
  placeholder: (styles: any) => {
    return {
      ...styles,
      color: "#B2B3B5",
    };
  },
  valueContainer: (styles: any) => {
    return {
      ...styles,
      padding: "0px",
    };
  },
  dropdownIndicator: (styles: any) => {
    return {
      ...styles,
      padding: "0px 6px",
      color: "#D8D8D8",
    };
  },
  indicatorSeparator: (styles: any) => {
    return {
      ...styles,
      display: "none",
    };
  },
  clearIndicator: (styles: any) => {
    return {
      ...styles,
      padding: "0px",
    };
  },
  groupHeading: (styles: any) => {
    return {
      ...styles,
      color: "#13151F",
      fontWeight: 700,
      fontSize: "10px",
    };
  },
  option: (styles: any, state) => {
    return {
      ...styles,
      backgroundColor: state.isSelected
        ? "#E6FFF4"
        : state.isFocused
        ? "#E6FFF4"
        : "white",
      fontWeight: state.isSelected ? 700 : 400,
      color: state.isSelected ? "#66A286" : "#646567",
      ":active": {
        backgroundColor: "#E6FFF4",
      },
    };
  },
  menuList: (styles: any) => {
    return {
      ...styles,
      borderColor: "white",
      borderWidth: "0",
      borderRadius: "6px",
      padding: "0",
    };
  },
  menu: (styles: any) => {
    return {
      ...styles,
      borderColor: "white",
    };
  },
};
/* ============================== Break Selection ============================== */
const BreakSelection = (props: BreakSelectionProps) => {
  const dispatch = useAppDispatch();
  const breakOptions = useBreakOptions();

  // GET BREAK OPTIONS
  const onGetBreakCodes = async () => {
    try {
      await dispatch(getBreakOptions()).unwrap();
    } catch (error: any) {
      console.log("Get Break Code list Err ---->", error?.message);
    }
  };

  useEffect(() => {
    onGetBreakCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Select
        name="break"
        options={breakOptions}
        isShowLabel={false}
        className="w-full"
        placeholder="Select Break"
        value={props?.breakValue?.uuid}
        isManual
        styles={customStyles}
        onChange={props.onBreakSelection}
      />
    </div>
  );
};

export default BreakSelection;
