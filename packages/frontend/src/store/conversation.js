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
    discussion: [], // Use consistent plural naming
    currentConverstion: '',
    conversationTimer: '',
    loading: false,
    error: null,
  },
  reducers: {
    updateMessage: (state, action) => {
      state.discussion = action.payload;
    },
    setCurrentConverstion: (state, action) => {
      state.currentConverstion = action.payload;
    },
    setConverstionTimer: (state, action) => {
      state.conversationTimer = action.payload;
    },
    setDiscussion: (state, action) => {
      state.discussion = action.payload;
    },
    // Add the incoming object to the end of the array
    setAddDiscussion: (state, action) => {
      console.log({aaaaaaaapayload : action.payload})

      state.discussion = [...state.discussion,action.payload.newConversation] 
    },
    // Find the item by _id and update it
    setUpdateDiscussion: (state, action) => {
      const index = state.discussion.findIndex(
        (conversation) => conversation._id === action.payload.updatedConversation._id
      );
      if (index !== -1) {
        state.discussion[index] = action.payload.updatedConversation;
      }
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
        state.discussion = action.payload; // Consistent key
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateMessage,
  setCurrentConverstion,
  setConverstionTimer,
  setDiscussion,
  setAddDiscussion,
  setUpdateDiscussion,
} = conversationSlice.actions;

export default conversationSlice.reducer;