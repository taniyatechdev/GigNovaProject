import { createSlice } from "@reduxjs/toolkit";

const loadSavedGigs = () => {
  try {
    const data = JSON.parse(
      localStorage.getItem("gignova_saved_gigs") || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const savedGigsSlice = createSlice({
  name: "savedGigs",

  initialState: {
    gigs: loadSavedGigs(),
  },

  reducers: {
    saveGig: (state, action) => {
      const gig = action.payload;

      if (!gig || gig.id == null) return;

      const exists = state.gigs.some(
        (item) => String(item.id) === String(gig.id)
      );

      if (!exists) {
        state.gigs.push(gig);
      }
    },

    removeSavedGig: (state, action) => {
      state.gigs = state.gigs.filter(
        (gig) =>
          String(gig.id) !== String(action.payload)
      );
    },
  },
});

export const {
  saveGig,
  removeSavedGig,
} = savedGigsSlice.actions;

export default savedGigsSlice.reducer;