import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit';

type Order3DState = {
  uploaded3dKeys: string[];
};

const initialState: Order3DState = {
  uploaded3dKeys: [],
};

const order3dSlice = createSlice({
  name: "order3d",
  initialState,
  reducers: {
    setUploaded3dKeys: (state, action: PayloadAction<string[]>) => {
      state.uploaded3dKeys = action.payload;
    },
    clearUploaded3dKeys: (state) => {
      state.uploaded3dKeys = [];
    },
  },
});

export const { setUploaded3dKeys, clearUploaded3dKeys } =
  order3dSlice.actions;

export default order3dSlice.reducer;