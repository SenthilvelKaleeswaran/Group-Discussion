import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getConversation } from "../utils/api-call";

// Fetch group discussion by ID
export const fetchGroupDiscussion = createAsyncThunk(
  "groupDiscussions/fetchGroupDiscussion",
  async (groupDiscussionId, { rejectWithValue }) => {
    try {
      return await getConversation(groupDiscussionId); // Pass ID to API call
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch discussions"
      );
    }
  }
);

const groupDiscussionsSlice = createSlice({
  name: "groupDiscussions", // Renamed slice for clarity
  initialState: {
    discussion: [], // Matches API data structure
    loading: false,
    error: null,
  },
  reducers: {
    updateGroupDiscussion: (state, action) => {
      state.discussion = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupDiscussion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupDiscussion.fulfilled, (state, action) => {
        state.loading = false;
        state.discussion = action.payload; // Fix key to match initial state
      })
      .addCase(fetchGroupDiscussion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateGroupDiscussion } = groupDiscussionsSlice.actions;

export default groupDiscussionsSlice.reducer;