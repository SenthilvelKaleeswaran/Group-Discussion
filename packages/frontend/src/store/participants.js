import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getParticipants } from "../utils/api-call";

// Thunk to fetch participants by groupDiscussionId
export const fetchParticipants = createAsyncThunk(
  "participants/fetchParticipants",
  async (sessionId, { rejectWithValue }) => {
    try {
      const data=  await getParticipants(sessionId);
      console.log({dataaaa : data})
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch participants"
      );
    }
  }
);

const participantsSlice = createSlice({
  name: "participants", // Correct slice name
  initialState: {
    participants: [], // Proper state key for participants
    mutedParticipants : [],
    loading: false,
    error: null,
  },
  reducers: {
    updateParticipants: (state, action) => {
      state.participants = action.payload;
    },
    updateMutedParticipants:(state, action) => {
      state.mutedParticipants = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParticipants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParticipants.fulfilled, (state, action) => {
        state.loading = false;
        state.participants = action.payload; // Correct state key
      })
      .addCase(fetchParticipants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateParticipants} = participantsSlice.actions;
export default participantsSlice.reducer;
