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

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    discussions: [], // Use consistent plural naming
    currentConverstion : '',
    conversationTimer : '',
    loading: false,
    error: null,
  },
  reducers: {
    updateMessage: (state, action) => {
      state.discussions = action.payload;
    },
    setCurrentConverstion: (state, action) => {
      state.currentConverstion = action.payload;
    },
    setConverstionTimer : (state, action) => {
      state.conversationTimer = action.payload;
    }
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

export const { updateMessage,setCurrentConverstion,setConverstionTimer } = conversationSlice.actions;
export default conversationSlice.reducer;
