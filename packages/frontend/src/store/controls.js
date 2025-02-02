import { createSlice } from "@reduxjs/toolkit";

const controlsSlice = createSlice({
  name: "controls",
  initialState: {
    mutedParticipants: [],
    mutingList: [],
    isMuteLoading: false,
    muteInitialLoad: true,
  },
  reducers: {
    updateMutedParticipants: (state, action) => {
      const { mutedParticipants, mutedMember } = action.payload;

      state.mutedParticipants = mutedParticipants;
      state.isMuteLoading = state.mutingList.length !== 0;

      if (mutedMember) {
        state.mutingList = state.mutingList.filter((id) => id !== mutedMember);
      }
    },

    setMuteLoading: (state, action) => {
      state.isMuteLoading = action.payload;
    },

    setMuteInitialLoad: (state, action) => {
      state.muteInitialLoad = action.payload;
    },

    setMutingList: (state, action) => {
      state.mutingList = action.payload;
    },
  },
});

export const {
  updateMutedParticipants,
  setMuteLoading,
  setMutingList,
  setMuteInitialLoad,
} = controlsSlice.actions;

export default controlsSlice.reducer;
