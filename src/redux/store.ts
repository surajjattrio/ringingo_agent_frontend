"use client";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import callSlice from "./slice/callSlice";
import cdrReportSlice from "./slice/cdrReportSlice";

// PROJECT IMPORTS
import commonSlice from "./slice/commonSlice";

/* PBX */
import leadListSlice from "./slice/leadListSlice";
import noteSlice from "./slice/noteSlice";
import phoneSlice from "./slice/phoneSlice";
import recordingSlice from "./slice/recordingSlice";
import countrySlice from "./slice/countrySlice";
import settingSlice from "./slice/settingSlice";
import followUpSlice from "./slice/followUpSlice";
import loginLogoutSlice from "./slice/loginLogoutSlice";
import realtimeReportSlice from "./slice/callCenter/realtimeReportSlice";

/* CALL CENTER */
import campaignSlice from "./slice/campaignSlice";
import callCenterPhoneSlice from "./slice/callCenter/callCenterPhoneSlice";
import authSlice from "./slice/authSlice";

import breakSlice from "./slice/breakSlice";

import chatSlice from "./slice/chatSlice";

// REDUCERS
const rootReducer = combineReducers({
  auth: authSlice,
  common: commonSlice,

  /* PBX */
  phone: phoneSlice,
  leadList: leadListSlice,
  cdrReport: cdrReportSlice,
  call: callSlice,
  notes: noteSlice,
  recordings: recordingSlice,
  country: countrySlice,
  settings: settingSlice,
  followUp: followUpSlice,
  loginLogout: loginLogoutSlice,

  /* CALL CENTER */
  campaign: campaignSlice,
  callCenterPhone: callCenterPhoneSlice,
  realtimeReport: realtimeReportSlice,

  /* BREAK */
  break: breakSlice,

  /* CHAT */
  chat: chatSlice,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/* ============================== STORE ============================== */

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

/* ============================== PERSIST-STORE ============================== */

export const persistor = persistStore(store);

/* ============================== TYPES ============================== */

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
