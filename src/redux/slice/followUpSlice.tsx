import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { useAppSelector } from "../hooks";

// TYPES
import { AllListParamsType, FilterTypes } from "@/types/filterTypes";
import {
  followUpAdd,
  followUpArchive,
  followUpDelete,
  followUpEdit,
  followUpGet,
  followUpListGet,
  followUpMessage,
  followUpReaded,
  followUpSearch,
} from "../services/followUpService";
interface InitialState {
  followUpList: any;
}

// THIRD PARTY IMPORT
import { format, isToday, isTomorrow, isThisWeek, parse, isYesterday } from "date-fns";

/* ============================== FOLLOW UP SLICE ============================== */

const initialState: InitialState = {
  followUpList: {},
};

export const getFollowUpList = createAsyncThunk(
  "follow-up/List",
  async (params: FilterTypes) => {
    return await followUpListGet(params);
  }
);

export const getFollowUp = createAsyncThunk(
  "follow-up/single",
  async (uuid: any) => {
    return await followUpGet(uuid);
  }
);

export const getFollowUpMessage = createAsyncThunk(
  "follow-up/message",
  async (params: any) => {
    return await followUpMessage(params);
  }
);

export const searchFollowUpList = createAsyncThunk(
  "follow-up/search",
  async (payload: any) => {
    return await followUpSearch(payload);
  }
);

export const addFollowUp = createAsyncThunk(
  "follow-up/add",
  async (payload: any) => {
    return await followUpAdd(payload);
  }
);

export const editFollowUp = createAsyncThunk(
  "follow-up/edit",
  async (payload: any) => {
    const { id, ...rest } = payload;
    return await followUpEdit(id, rest);
  }
);

export const readedFollowUp = createAsyncThunk(
  "follow-up/readed",
  async (payload: any) => {
    const { follow_up_uuid, ...rest } = payload;
    return await followUpReaded(follow_up_uuid, rest);
  }
);

export const deleteFollowUp = createAsyncThunk(
  "follow-up/delete",
  async (id: string) => {
    return await followUpDelete(id);
  }
);

export const archiveFollowUp = createAsyncThunk(
  "follow-up/archive",
  async (payload: any) => {
    return await followUpArchive(payload);
  }
);

// TO GET DAY OR WEEK
const getDayOrWeek = (dateTime: any) => {
  let dayInfo;
  const formatString = 'yyyy-MM-dd HH:mm:ss';
  dateTime = parse(dateTime, formatString, new Date());
  if (isToday(dateTime)) {
    dayInfo = 'Today';
  } else if (isTomorrow(dateTime)) {
    dayInfo = 'Tomorrow';
  } else if (isThisWeek(dateTime)) {
    dayInfo = 'This week';
  } else if (isYesterday(dateTime)) {
    dayInfo = 'Yesterday';
  } else {
    dayInfo = 'Next week';
  }
  return dayInfo;
}

// Function to map is_readed to label
// const mapIsReadedToLabel = (is_readed: any) => {
//   switch (is_readed) {
//       case "0":
//           return "Close";
//       case "1":
//           return "Open";
//       case "2":
//           return "Upcoming";
//       case "3":
//           return "Completed";
//       case "4":
//           return "Past Due";
//       default:
//           return ""; // Handle unknown status
//   }
// };
const mapIsReadedToLabel = (is_readed: any) => {
  switch (is_readed) {
      case "0":
          return "Upcoming";
      case "1":
          return "Past Due";
      case "2":
          return "Completed";
      default:
          return ""; // Handle unknown status
  }
};


const followUpSlice = createSlice({
  name: "followUp",
  initialState,
  reducers: {
    clearFollowUpSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(
      getFollowUpList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const newData =
          typeof action.payload === "string" ? [] : action.payload;
        newData?.data?.map((val: any) => {
          val.uuid = val?.follow_up_uuid,
          val.fullName = val?.lead_details?.length
            ? val?.lead_details[0]?.first_name
              ? val?.lead_details[0]?.first_name +
              " " +
              (val.lead_details[0].last_name || "")
              : ""
            : "";
          val.PhoneNumber = val?.lead_details?.length
            ? val?.lead_details[0]?.custom_phone_number
              ? val?.lead_details[0]?.custom_phone_number
              : val?.lead_details[0]?.phone_number
            : "";
          // val.followUpStatus = val?.is_readed === "0" ? "Past Due" : val?.is_readed === "1" ? "Upcoming" : "Completed";
          val.followUpStatus = mapIsReadedToLabel(val.is_readed);
          val.followUpText = getDayOrWeek(val.date_time)
        });
        state.followUpList = newData;
      }
    );
    builder.addCase(
      searchFollowUpList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const newData =
          typeof action.payload === "string" ? [] : action.payload;
        newData?.data?.map((val: any) => {
          val.uuid = val?.follow_up_uuid,
          val.fullName = val?.lead_details?.length
            ? val?.lead_details[0]?.first_name
              ? val?.lead_details[0]?.first_name +
              " " +
              (val.lead_details[0].last_name || "")
              : ""
            : "";
          val.PhoneNumber = val?.lead_details?.length
            ? val?.lead_details[0]?.custom_phone_number
              ? val?.lead_details[0]?.custom_phone_number
              : val?.lead_details[0]?.phone_number
            : "";
            // val.followUpStatus = val?.is_readed === "0" ? "Past Due" : val?.is_readed === "1" ? "Upcoming" : "Completed";
            val.followUpStatus = mapIsReadedToLabel(val.is_readed);
            val.followUpText = getDayOrWeek(val.date_time)
        });
        state.followUpList = newData;
      }
    );
  },
});

export default followUpSlice.reducer;
export const { clearFollowUpSlice } = followUpSlice.actions;

export const selectFollowUpList = (state: RootState) =>
  state.followUp.followUpList;
export const useFollowUpList = () => {
  const followUpList = useAppSelector(selectFollowUpList);
  return useMemo(() => followUpList, [followUpList]);
};
