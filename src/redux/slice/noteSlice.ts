import { useMemo } from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// PROJECT IMPORTS
import { RootState } from "../store";
import { useAppSelector } from "../hooks";
import { noteCreate, notesGet } from "../services/noteService";

// TYPES
interface InitialState {
  notesList: any;
  isLoading: boolean;
}

/* ============================== NOTES SLICE ============================== */

const initialState: InitialState = {
  notesList: [],
  isLoading: false,
};

export const getNotesList = createAsyncThunk(
  "notes/list",
  async (uuid: string) => {
    return await notesGet(uuid);
  }
);

export const createNewNote = createAsyncThunk(
  "notes/create",
  async (payload: any) => {
    return await noteCreate(payload);
  }
);

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    clearNoteSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotesList.pending, (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      })
      .addCase(getNotesList.fulfilled, (state, action: PayloadAction<any>) => {
        state.notesList = action.payload;
        state.isLoading = false;
      })
      .addCase(getNotesList.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
      });
  },
});

export default noteSlice.reducer;
export const { clearNoteSlice } = noteSlice.actions;

export const selectNoteList = (state: RootState) => state.notes.notesList;
export const useNoteList = () => {
  const notesList = useAppSelector(selectNoteList);
  return useMemo(() => notesList, [notesList]);
};

export const selectIsLoading = (state: RootState) => state.leadList.isLoading;
export const useIsLoading = () => {
  const isLoading = useAppSelector(selectIsLoading);
  return useMemo(() => isLoading, [isLoading]);
};
