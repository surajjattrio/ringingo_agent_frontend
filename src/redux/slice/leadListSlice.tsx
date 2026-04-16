import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { useAppSelector } from "../hooks";
import {
  leadEdit,
  leadGroupGetAll,
  leadListGet,
  leadListGetAll,
  leadStatusGetAll,
  newLeadCreate,
  searchLead,
  singleLeadGet,
  singleLeadInfo,
  singleLeadCustomFields,
  unAllocatedLeadGet,
} from "../services/leadListService";

// TYPES
import { AllListParamsType, FilterTypes } from "@/types/filterTypes";
interface InitialState {
  leadListDetails: any;
  unAllocatedleadDetails: any;
  allLeadListDetails: any;
  singleLeadDetail: any;
  isLoading: boolean;
  leadStatusList: any;
  leadGroupList: any;
}

/* ============================== LEAD LIST SLICE ============================== */

const initialState: InitialState = {
  leadListDetails: [],
  unAllocatedleadDetails: [],
  allLeadListDetails: [],
  isLoading: false,
  singleLeadDetail: {},
  leadStatusList: [],
  leadGroupList: [],
};

export const getLeadList = createAsyncThunk(
  "lead-list/list",
  async (params: FilterTypes) => {
    return await leadListGet(params);
  }
);

export const getSingleLead = createAsyncThunk(
  "lead-list/single",
  async (id: string) => {
    return await singleLeadGet(id);
  }
);

export const getLeadStatus = createAsyncThunk("lead-status/list", async () => {
  return await leadStatusGetAll({ list: "all" });
});

export const getLeadGroups = createAsyncThunk("lead-group/list", async () => {
  return await leadGroupGetAll({ list: "all" });
});

export const getAllLeadList = createAsyncThunk(
  "lead-list/all-list",
  async (params: AllListParamsType) => {
    return await leadListGetAll(params);
  }
);

export const getUnallocatedLeads = createAsyncThunk(
  "unallocated-lead-list/list",
  async (params: FilterTypes) => {
    return await unAllocatedLeadGet(params);
  }
);

export const createNewLead = createAsyncThunk(
  "lead-list/create",
  async (payload: any) => {
    return await newLeadCreate(payload);
  }
);

export const editLead = createAsyncThunk(
  "lead-list/edit",
  async (payload: any) => {
    const { lead_management_uuid, ...rest } = payload;
    return await leadEdit(lead_management_uuid, rest);
  }
);

export const leadSearch = createAsyncThunk(
  "lead-list/search",
  async (payload: any) => {
    return await searchLead(payload);
  }
);

export const getSingleLeadInfo = createAsyncThunk(
  "lead/singleInfo",
  async (params: any) => {
    return await singleLeadInfo(params);
  }
);

export const getSingleLeadCustomFields = createAsyncThunk(
  "/lead/custom-fields",
  async (params: any) => {
    return await singleLeadCustomFields(params);
  }
);

const leadListSlice = createSlice({
  name: "leadList",
  initialState,
  reducers: {
    onEmptyLeadDetails(state, action) {
      state.singleLeadDetail = {};
    },
    clearLeadListSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLeadList.pending, (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      })
      .addCase(getLeadList.fulfilled, (state, action: PayloadAction<any>) => {
        const newData =
          typeof action.payload === "string" ? [] : action.payload;
        newData?.data?.map((val: any, index: number) => {
          val.no = (index + 1).toString();
          val.fullName = val.first_name
            ? val.first_name + " " + (val?.last_name || "")
            : "";
          val.country_name =
            val.country && val.country.length ? val.country[0]?.nicename : "";
          //val.lead_status_name = val?.disposition?.[0]?.name || "";
          //val.lead_status_name = val?.disposition?.length ? val?.disposition?.[0]?.name : val.lead_status; 
          val.lead_status_name = val?.disposition?.[0]?.name || val?.pbx_lead_status?.[0]?.name;
          val.lead_group_name = val?.lead_group?.[0]?.name || "";
        });
        state.leadListDetails = newData;
        state.isLoading = false;
      })
      .addCase(getLeadList.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
      });
    builder
      .addCase(getUnallocatedLeads.pending, (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      })
      .addCase(getUnallocatedLeads.fulfilled, (state, action: PayloadAction<any>) => {
        const newData =
          typeof action.payload === "string" ? [] : action.payload;
        newData?.data?.map((val: any, index: number) => {
          val.no = (index + 1).toString();
          val.fullName = val.first_name
            ? val.first_name + " " + (val?.last_name || "")
            : "";
          val.country_name =
            val.country && val.country.length ? val.country[0]?.nicename : "";
          //val.lead_status_name = val?.disposition?.[0]?.name || "";
          //val.lead_status_name = val?.disposition?.length ? val?.disposition?.[0]?.name : val.lead_status; 
          val.lead_status_name = val?.disposition?.[0]?.name || val?.pbx_lead_status?.[0]?.name;
          val.lead_group_name = val?.lead_group?.[0]?.name || "";
        });
        state.unAllocatedleadDetails = newData;
        state.isLoading = false;
      })
      .addCase(getUnallocatedLeads.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
      });
    builder
      .addCase(leadSearch.pending, (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      })
      .addCase(leadSearch.fulfilled, (state, action: PayloadAction<any>) => {
        const newData =
          typeof action.payload === "string" ? [] : action.payload;
        newData?.data?.map((val: any, index: number) => {
          val.no = (index + 1).toString();
          val.fullName = val.first_name
            ? val.first_name + " " + (val?.last_name || "")
            : "";
          val.country_name =
            val.country && val.country.length ? val.country[0]?.nicename : "";
          // val.lead_status_name = val?.disposition?.[0]?.name || "";
          val.lead_status_name = val?.disposition?.length
            ? val?.disposition?.[0]?.name
            : val.lead_status;
          val.lead_group_name = val?.lead_group?.[0]?.name || "";
        });
        state.leadListDetails = newData;
        state.isLoading = false;
      })
      .addCase(leadSearch.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
      });
    3;
    builder.addCase(
      getAllLeadList.fulfilled,
      (state, action: PayloadAction<any>) => {
        const newData =
          typeof action.payload === "string" ? [] : action.payload;
        newData?.data?.map((val: any) => {
          val.fullName = val.first_name
            ? val.first_name + " " + (val?.last_name || "")
            : "";
        });
        state.allLeadListDetails = newData;
      }
    );
    builder.addCase(
      getSingleLead.fulfilled,
      (state, action: PayloadAction<any>) => {
        const newData = action.payload === "string" ? {} : action.payload.data;
        state.singleLeadDetail = newData;
      }
    );
    builder.addCase(
      getLeadStatus.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (typeof action.payload.lead_status === "string") {
          state.leadStatusList = [];
        } else {
          const newData = action.payload.data;
          state.leadStatusList = newData.map((val: any) => ({
            value: val.pbx_lead_status_uuid,
            label: val.name,
          }));
        }
      }
    );
    builder.addCase(
      getLeadGroups.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (typeof action.payload.data === "string") {
          state.leadGroupList = [];
        } else {
          const newData = action.payload.data;
          state.leadGroupList = newData.map((val: any) => ({
            value: val.uuid,
            label: val.name,
          }));
        }
      }
    );
  },
});

export default leadListSlice.reducer;
export const { clearLeadListSlice, onEmptyLeadDetails } = leadListSlice.actions;

export const selectLeadListDetails = (state: RootState) =>
  state.leadList.leadListDetails;
export const useLeadListDetails = () => {
  const leadListDetails = useAppSelector(selectLeadListDetails);
  return useMemo(() => leadListDetails, [leadListDetails]);
};

export const selectUnAllocatedleadDetails = (state: RootState) =>
  state.leadList.unAllocatedleadDetails;
export const useUnAllocatedleadDetails = () => {
  const unAllocatedleadDetails = useAppSelector(selectUnAllocatedleadDetails);
  return useMemo(() => unAllocatedleadDetails, [unAllocatedleadDetails]);
};

export const selectAllLeadListDetails = (state: RootState) =>
  state.leadList.allLeadListDetails;
export const useAllLeadListDetails = () => {
  const allLeadListDetails = useAppSelector(selectAllLeadListDetails);
  return useMemo(() => allLeadListDetails, [allLeadListDetails]);
};

export const selectIsLoading = (state: RootState) => state.leadList.isLoading;
export const useIsLoading = () => {
  const isLoading = useAppSelector(selectIsLoading);
  return useMemo(() => isLoading, [isLoading]);
};

export const selectLeadDetails = (state: RootState) =>
  state.leadList.singleLeadDetail;
export const useLeadDetails = () => {
  const singleLeadDetail = useAppSelector(selectLeadDetails);
  return useMemo(() => singleLeadDetail, [singleLeadDetail]);
};

export const selectLeadStatusList = (state: RootState) =>
  state.leadList.leadStatusList;
export const useLeadStatusList = () => {
  const leadStatusList = useAppSelector(selectLeadStatusList);
  return useMemo(() => leadStatusList, [leadStatusList]);
};

export const selectLeadGroupList = (state: RootState) =>
  state.leadList.leadGroupList;
export const useLeadGroupList = () => {
  const leadGroupList = useAppSelector(selectLeadGroupList);
  return useMemo(() => leadGroupList, [leadGroupList]);
};
