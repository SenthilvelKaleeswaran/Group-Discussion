import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getConversation } from "../utils/api-call";

// Thunk to fetch conversation by ID
export const fetchConversation = createAsyncThunk(
  "conversations/fetchConversation",
  async (groupDiscussionId, { rejectWithValue }) => {
    try {
      return await getConversation(groupDiscussionId); // Pass ID to API call
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch conversations"
      );
    }
  }
);

const conversationsSlice = createSlice({
  name: "conversations",
  initialState: {
    discussions: [], // Use consistent plural naming
    loading: false,
    error: null,
  },
  reducers: {
    updateMessage: (state, action) => {
      state.discussions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.discussions = action.payload; // Consistent key
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateMessage } = conversationsSlice.actions;
export default conversationsSlice.reducer;
