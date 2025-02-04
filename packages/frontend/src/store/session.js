import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getActiveSession, getConversation } from "../utils/api-call";

// Fetch group discussion by ID
export const fetchActiveSession = createAsyncThunk(
  "groupDiscussions/fetchActiveSession",
  async (groupDiscussionId, { rejectWithValue }) => {
    try {
      console.log({groupDiscussionId})
      return await getActiveSession(groupDiscussionId); // Pass ID to API call
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch discussions"
      );
    }
  }
);

const sessionSlice = createSlice({
  name: "session", // Renamed slice for clarity
  initialState: {
    discussion: {}, 
    loading: false,
    error: null,
  },
  reducers: {
    updateSession: (state, action) => {
      state.discussion = action.payload;
    },
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSession.fulfilled, (state, action) => {
        state.loading = false;
        console.log({action})
        state.discussion = action.payload; // Fix key to match initial state
      })
      .addCase(fetchActiveSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateGroupDiscussion } = sessionSlice.actions;

export default sessionSlice.reducer;
