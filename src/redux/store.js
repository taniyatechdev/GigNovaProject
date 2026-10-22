import { configureStore } from "@reduxjs/toolkit";
import savedGigsReducer from "./savedGigsSlice";

export const store = configureStore({
  reducer: {
    savedGigs: savedGigsReducer,
  },
});