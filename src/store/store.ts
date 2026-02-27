import { configureStore } from "@reduxjs/toolkit";
import order3dReducer from "./order3dSlice";

export const store = configureStore({
  reducer: {
    order3d: order3dReducer,
    // other reducers...
  },
});

export type RootState = ReturnType<typeof store.getState>;