import { useMemo } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import Cookies from "js-cookie";
import Cookies from "@/lib/cookies";

// PROJECT IMPORTS
import { useAppSelector } from "../hooks";
import { RootState } from "../store";

// TYPES
interface InitialState {
  isdrawerOpen: boolean;
  dialNumber: string | null;
  status: string;
  addNoteId: string | null;
  addLeadNoteId: string | null;
  selectedCampaign: string;
  selectedCampaignDetails: any;
  campaignMode: string;
  dialType: string;
  leadInfo: boolean;
  isNumberMask: boolean;
  numberMasking: boolean;
  maskingNumber: boolean;
  campaignType: string;
  userEntry: string;
  isShowCallModal: string;
  isShowCallInfoId: string | null;
  isFollowUpColor: string | null;
  dueFollowUpList: any;
  upComingFollowUpList: any;
  isCallHangUp: boolean;
  isAddNewLead: any;
  isInboundCampaign: boolean;
  predictiveData: any;
  callScreen: string;
  isShowCallDuration: boolean;
  callerNumber: string;
  callerName: string;
  dispositionTimerEnded: boolean;
  campaignFetched: boolean,
  campaignUpdated: boolean,
  webrtcStatus: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  isShowQueueModal: boolean;
  selectedQueues: any[];
}

/* ============================== COMMON SLICE ============================== */

const initialState: InitialState = {
  campaignFetched: false,
  campaignUpdated: false,
  isdrawerOpen: true,
  dialNumber: null,
  status: "0",
  addNoteId: null,
  addLeadNoteId: null,
  selectedCampaign: "",
  campaignMode: Cookies.get("campaignMode") || "",
  dialType: "manualDial",
  leadInfo: true,
  isNumberMask: false,
  numberMasking: false,
  maskingNumber: false,
  campaignType: Cookies.get("campaignType") || "",
  userEntry: "",
  isShowCallModal: "false",
  isShowCallInfoId: null,
  isFollowUpColor: null,
  dueFollowUpList: [],
  upComingFollowUpList: [],
  isCallHangUp: false,
  isAddNewLead: null,
  isInboundCampaign: false,
  predictiveData: {},
  callScreen: "",
  isShowCallDuration: false,
  callerNumber: "",
  callerName: "",
  selectedCampaignDetails: undefined,
  dispositionTimerEnded: false,
  webrtcStatus: 'DISCONNECTED',
  isShowQueueModal: false,
  selectedQueues: [],
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setCampaignFetched: (state, action) => {
      state.campaignFetched = action.payload;
    },
    setCampaignUpdated: (state, action) => {
      state.campaignUpdated = action.payload;
    },
    openDrawer(state, action: PayloadAction<any>) {
      state.isdrawerOpen = action.payload;
    },
    onDial(state, action: PayloadAction<any>) {
      state.dialNumber = action.payload;
    },
    onStatusChange(state, action: PayloadAction<any>) {
      state.status = action.payload;
    },
    onSetAddNoteId(state, action: PayloadAction<any>) {
      state.addNoteId = action.payload;
    },
    onAddLeadNoteId(state, action: PayloadAction<any>) {
      state.addLeadNoteId = action.payload;
    },
    onSelectCampaign(state, action: PayloadAction<any>) {
      state.selectedCampaign = action.payload;
    },
    onSelectCampaignDetails(state, action: PayloadAction<any>) {
      state.selectedCampaignDetails = action.payload;
    },
    onLeadDispositionTimerEnded(state, action: PayloadAction<any>) {
      state.dispositionTimerEnded = action.payload;
    },
    onSelectCampaignMode(state, action: PayloadAction<any>) {
      console.log("action paload campaogn mode",action.payload);
      state.campaignMode = action.payload;
    },
    onSetDialType(state, action: PayloadAction<any>) {
      state.dialType = action.payload;
    },
    onShowLeadInfo(state, action: PayloadAction<any>) {
      state.leadInfo = action.payload;
    },
    onSetNumberMask(state, action: PayloadAction<any>) {
      state.isNumberMask = action.payload;
    },
    onGetMaskingNumber(state, action: PayloadAction<any>) {
      state.maskingNumber = action.payload;
    },
    onSetCampaignType(state, action: PayloadAction<any>) {
      console.log("action paload campaogn type",action.payload);
      state.campaignType = action.payload;
    },
    onSetUserEntry(state, action: PayloadAction<any>) {
      state.userEntry = action.payload;
    },
    onShowCallModal(state, action: PayloadAction<any>) {
      state.isShowCallModal = action.payload;
    },
    onSetShowCallInfoId(state, action: PayloadAction<any>) {
      state.isShowCallInfoId = action.payload;
    },
    onSetFollowUpColor(state, action: PayloadAction<any>) {
      state.isFollowUpColor = action.payload;
    },
    dueFollowUp(state, action: PayloadAction<any>) {
      state.dueFollowUpList = action.payload;
    },
    upComingFollowUp(state, action: PayloadAction<any>) {
      state.upComingFollowUpList = action.payload;
    },
    setIsCallHangUp(state, action: PayloadAction<any>) {
      state.isCallHangUp = action.payload;
    },
    onAddNewLead(state, action: PayloadAction<any>) {
      state.isAddNewLead = action.payload;
    },
    setNumberMasking(state, action: PayloadAction<any>) {
      state.numberMasking = action.payload;
    },
    setIsInboundCampaign(state, action: PayloadAction<any>) {
      state.isInboundCampaign = action.payload;
    },
    setPredictiveData(state, action: PayloadAction<any>) {
      state.predictiveData = action.payload;
    },
    setCallScreen(state, action: PayloadAction<any>) {
      state.callScreen = action.payload;
    },
    setIsShowCallDuration(state, action: PayloadAction<any>) {
      state.isShowCallDuration = action.payload;
    },
    setCallerNumber(state, action: PayloadAction<any>) {
      state.callerNumber = action.payload;
    },
    setCallerName(state, action: PayloadAction<any>) {
      state.callerName = action.payload;
    },
    setWebRtcStatus(state, action: PayloadAction<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>) {
      state.webrtcStatus = action.payload;
    },
    setShowQueueModal(state, action: PayloadAction<boolean>) {
      state.isShowQueueModal = action.payload;
    },
    onSelectQueues(state, action: PayloadAction<any[]>) {
      state.selectedQueues = action.payload;
    },
    clearCommonSlice: () => initialState,
  },
});

export default commonSlice.reducer;

export const {
  setCampaignFetched,
  setCampaignUpdated,
  openDrawer,
  onDial,
  onStatusChange,
  onSetAddNoteId,
  onAddLeadNoteId,
  onSelectCampaign,
  onSelectCampaignMode,
  onSetDialType,
  onShowLeadInfo,
  onSetNumberMask,
  onGetMaskingNumber,
  onSetCampaignType,
  clearCommonSlice,
  onSetUserEntry,
  onShowCallModal,
  onSetShowCallInfoId,
  onSetFollowUpColor,
  dueFollowUp,
  upComingFollowUp,
  setIsCallHangUp,
  onAddNewLead,
  setNumberMasking,
  setIsInboundCampaign,
  setPredictiveData,
  setIsShowCallDuration,
  setCallScreen,
  setCallerNumber,
  setCallerName,
  onSelectCampaignDetails,
  onLeadDispositionTimerEnded,
  setWebRtcStatus,
  setShowQueueModal,
  onSelectQueues,
} = commonSlice.actions;

export const selectCampaignFetched = (state: RootState) => state.common.campaignFetched;
export const useCampaignFetched = () => {
  const campaignFetched = useAppSelector(selectCampaignFetched);
  return useMemo(() => campaignFetched, [campaignFetched]);
};

export const selectCampaignUpdated = (state: RootState) => state.common.campaignUpdated;
export const useCampaignUpdated = () => {
  const campaignUpdated = useAppSelector(selectCampaignUpdated);
  return useMemo(() => campaignUpdated, [campaignUpdated]);
};

export const selectDrawerOpen = (state: RootState) => state.common.isdrawerOpen;
export const useDrawerOpen = () => {
  const isdrawerOpen = useAppSelector(selectDrawerOpen);
  return useMemo(() => isdrawerOpen, [isdrawerOpen]);
};

export const selectDialNumber = (state: RootState) => state.common.dialNumber;
export const useDialNumber = () => {
  const dialNumber = useAppSelector(selectDialNumber);
  return useMemo(() => dialNumber, [dialNumber]);
};

export const selectStatus = (state: RootState) => state.common.status;
export const useStatus = () => {
  const status = useAppSelector(selectStatus);
  return useMemo(() => status, [status]);
};

export const selectAddNoteId = (state: RootState) => state.common.addNoteId;
export const useAddNoteId = () => {
  const addNoteId = useAppSelector(selectAddNoteId);
  return useMemo(() => addNoteId, [addNoteId]);
};

export const selectAddLeadNoteId = (state: RootState) =>
  state.common.addLeadNoteId;
export const useAddLeadNoteId = () => {
  const addLeadNoteId = useAppSelector(selectAddLeadNoteId);
  return useMemo(() => addLeadNoteId, [addLeadNoteId]);
};

export const selectSelectedCampaign = (state: RootState) =>
  state.common.selectedCampaign;
export const useSelectedCampaign = () => {
  const selectedCampaign = useAppSelector(selectSelectedCampaign);
  return useMemo(() => selectedCampaign, [selectedCampaign]);
};

export const selectSelectedCampaignDetails = (state: RootState) =>
  state.common.selectedCampaignDetails;
export const useSelectedCampaignDetails = () => {
  const selectedCampaignDetails = useAppSelector(selectSelectedCampaignDetails);
  return useMemo(() => selectedCampaignDetails, [selectedCampaignDetails]);
};

export const selectDispositionTimerEnded = (state: RootState) =>
  state.common.dispositionTimerEnded;
export const useDispositionTimerEnded = () => {
  const dispositionTimerEnded = useAppSelector(selectDispositionTimerEnded);
  return useMemo(() => dispositionTimerEnded, [dispositionTimerEnded]);
};

export const selectSelectedCampaignMode = (state: RootState) =>
  state.common.campaignMode;
export const useCampaignMode = () => {
  const campaignMode = useAppSelector(selectSelectedCampaignMode);
  return useMemo(() => campaignMode, [campaignMode]);
};

export const selectDialType = (state: RootState) => state.common.dialType;
export const useDialType = () => {
  const dialType = useAppSelector(selectDialType);
  return useMemo(() => dialType, [dialType]);
};

export const selectLeadInfo = (state: RootState) => state.common.leadInfo;
export const useLeadInfo = () => {
  const leadInfo = useAppSelector(selectLeadInfo);
  return useMemo(() => leadInfo, [leadInfo]);
};

export const selectIsNumberMask = (state: RootState) =>
  state.common.isNumberMask;
export const useIsNumberMask = () => {
  const isNumberMask = useAppSelector(selectIsNumberMask);
  return useMemo(() => isNumberMask, [isNumberMask]);
};

export const selectMaskingNumber = (state: RootState) =>
  state.common.maskingNumber;
export const useMaskingNumber = () => {
  const maskingNumber = useAppSelector(selectMaskingNumber);
  return useMemo(() => maskingNumber, [maskingNumber]);
};

export const selectCampaignType = (state: RootState) =>
  state.common.campaignType;
export const useCampaignType = () => {
  const campaignType = useAppSelector(selectCampaignType);
  return useMemo(() => campaignType, [campaignType]);
};

export const selectUserEntry = (state: RootState) => state.common.userEntry;
export const useUserEntry = () => {
  const userEntry = useAppSelector(selectUserEntry);
  return useMemo(() => userEntry, [userEntry]);
};

export const selectShowCallModal = (state: RootState) =>
  state.common.isShowCallModal;
export const useShowCallModal = () => {
  const isShowCallModal = useAppSelector(selectShowCallModal);
  return useMemo(() => isShowCallModal, [isShowCallModal]);
};

export const selectShowCallInfoId = (state: RootState) =>
  state.common.isShowCallInfoId;
export const useShowCallInfoId = () => {
  const isShowCallInfoId = useAppSelector(selectShowCallInfoId);
  return useMemo(() => isShowCallInfoId, [isShowCallInfoId]);
};

export const selectFollowUpColor = (state: RootState) =>
  state.common.isFollowUpColor;
export const useFollowUpColor = () => {
  const isFollowUpColor = useAppSelector(selectFollowUpColor);
  return useMemo(() => isFollowUpColor, [isFollowUpColor]);
};

export const selectDueFollowUp = (state: RootState) =>
  state.common.dueFollowUpList;
export const useDueFollowUp = () => {
  const dueFollowUpList = useAppSelector(selectDueFollowUp);
  return useMemo(() => dueFollowUpList, [dueFollowUpList]);
};

export const selectUpcomingFollow = (state: RootState) =>
  state.common.upComingFollowUpList;
export const useUpcomingFollowUp = () => {
  const upComingFollowUpList = useAppSelector(selectUpcomingFollow);
  return useMemo(() => upComingFollowUpList, [upComingFollowUpList]);
};

export const selectIsCallHangUp = (state: RootState) =>
  state.common.isCallHangUp;
export const useIsCallHangUp = () => {
  const isCallHangUp = useAppSelector(selectIsCallHangUp);
  return useMemo(() => isCallHangUp, [isCallHangUp]);
};

export const selectIsAddNewLead = (state: RootState) =>
  state.common.isAddNewLead;
export const useIsAddNewLead = () => {
  const isAddNewLead = useAppSelector(selectIsAddNewLead);
  return useMemo(() => isAddNewLead, [isAddNewLead]);
};

export const selectNumberMasking = (state: RootState) =>
  state.common.numberMasking;
export const useNumberMasking = () => {
  const numberMasking = useAppSelector(selectNumberMasking);
  return useMemo(() => numberMasking, [numberMasking]);
};

export const selectInboundCampaign = (state: RootState) =>
  state.common.isInboundCampaign;
export const useIsInboundCampaign = () => {
  const isInboundCampaign = useAppSelector(selectInboundCampaign);
  return useMemo(() => isInboundCampaign, [isInboundCampaign]);
};

export const selectPredictiveData = (state: RootState) =>
  state.common.predictiveData;
export const usePredictiveData = () => {
  const predictiveData = useAppSelector(selectPredictiveData);
  return useMemo(() => predictiveData, [predictiveData]);
};

export const selectCallScreen = (state: RootState) => state.common.callScreen;
export const useCallScreen = () => {
  const callScreen = useAppSelector(selectCallScreen);
  return useMemo(() => callScreen, [callScreen]);
};

export const selectIsShowCallDuration = (state: RootState) =>
  state.common.isShowCallDuration;
export const useIsShowCallDuration = () => {
  const isShowCallDuration = useAppSelector(selectIsShowCallDuration);
  return useMemo(() => isShowCallDuration, [isShowCallDuration]);
};

export const selectCallerNumber = (state: RootState) =>
  state.common.callerNumber;
export const useCallerNumber = () => {
  const callerNumber = useAppSelector(selectCallerNumber);
  return useMemo(() => callerNumber, [callerNumber]);
};

export const selectCallerName = (state: RootState) =>
  state.common.callerName;
export const useCallerName = () => {
  const callerName = useAppSelector(selectCallerName);
  return useMemo(() => callerName, [callerName]);
};

export const selectWebRtcStatus = (state: RootState) => state.common.webrtcStatus;
export const useWebRtcStatus = () => {
  const webrtcStatus = useAppSelector(selectWebRtcStatus);
  return useMemo(() => webrtcStatus, [webrtcStatus]);
};
export const selectShowQueueModal = (state: RootState) => state.common.isShowQueueModal;
export const useShowQueueModal = () => {
  const isShowQueueModal = useAppSelector(selectShowQueueModal);
  return useMemo(() => isShowQueueModal, [isShowQueueModal]);
};

export const selectSelectedQueues = (state: RootState) => state.common.selectedQueues;
export const useSelectedQueues = () => {
  const selectedQueues = useAppSelector(selectSelectedQueues);
  return useMemo(() => selectedQueues, [selectedQueues]);
}