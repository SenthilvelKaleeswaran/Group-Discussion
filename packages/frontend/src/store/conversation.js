import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getConversation } from "../utils/api-call";

// Thunk to fetch conversation by ID
export const fetchConversation = createAsyncThunk(
  "conversations/fetchConversation",
  async (groupDiscussionId, { rejectWithValue }) => {
    try {
      return await getConversation(groupDiscussionId); // Fetch conversation from API
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch conversations"
      );
    }
  }
);

// Function to compute user points
const countUserPoints = (array) => {
  const userPoints = {};

  const updatedArray = array?.map((item) => {
    const userId = item?.aiId?._id || item?.userId?._id;

    if (userId) {
      if (!userPoints[userId]) {
        userPoints[userId] = {
          points: 0,
          conclusionPoints: 0,
          feedback: 0,
          conclusionFeedback: 0,
        };
      }

      const isConclusion = item?.isConclusion || false;
      const hasFeedback = !!item?.feedback;

      if (isConclusion) {
        userPoints[userId].conclusionPoints++;
        if (hasFeedback) {
          userPoints[userId].conclusionFeedback++;
        }
      } else {
        userPoints[userId].points++;
        if (hasFeedback) {
          userPoints[userId].feedback++;
        }
      }

      return {
        ...item,
        point: userPoints[userId].points + userPoints[userId].conclusionPoints,
      };
    }

    return { ...item, point: 0 };
  });

  return { discussion: updatedArray, userPoints };
};

// Redux Slice
const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    discussion: [],
    currentConverstion: "",
    conversationTimer: "",
    loading: false,
    error: null,
    userPoints: {},
  },
  reducers: {
    setCurrentConverstion: (state, action) => {
      state.currentConverstion = action.payload;
    },
    setConverstionTimer: (state, action) => {
      state.conversationTimer = action.payload;
    },
    setDiscussion: (state, action) => {
      const { discussion, userPoints } = countUserPoints(action.payload);
      state.discussion = discussion;
      state.userPoints = userPoints;
    },
    setAddDiscussion: (state, action) => {
      state.discussion = [...state.discussion, action.payload.newConversation];

      // Recalculate user points whenever new messages are added
      const { discussion, userPoints } = countUserPoints(state.discussion);
      state.discussion = discussion;
      state.userPoints = userPoints;
    },
    setUpdateDiscussion: (state, action) => {
      const index = state.discussion.findIndex(
        (conversation) => conversation._id === action.payload.updatedConversation._id
      );
      if (index !== -1) {
        state.discussion[index] = action.payload.updatedConversation;
      }

      // Recalculate user points whenever a message is updated
      const { discussion, userPoints } = countUserPoints(state.discussion);
      state.discussion = discussion;
      state.userPoints = userPoints;
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
        const { discussion, userPoints } = countUserPoints(action.payload);
        state.discussion = discussion;
        state.userPoints = userPoints;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export Actions
export const {
  setCurrentConverstion,
  setConverstionTimer,
  setDiscussion,
  setAddDiscussion,
  setUpdateDiscussion,
} = conversationSlice.actions;

export default conversationSlice.reducer;
