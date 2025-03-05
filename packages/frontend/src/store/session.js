import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getActiveSession, getConversation } from "../utils/api-call";

// Fetch group sessionData by ID
export const fetchSessionQueue = createAsyncThunk(
  "groupDiscussions/fetchSessionQueue",
  async (groupDiscussionId, { rejectWithValue }) => {
    try {
      console.log({ groupDiscussionId });
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
    sessionData: {},
    queue: {
      done: [],
      inProgress: {},
      notStarted: [],
    },
    userSession: {},
    userFeedbackStatus: {},
    selectedParticipants: [],
    globalOrder: 0,
    loading: false,
    error: null,
  },
  reducers: {
    updateSession: (state, action) => {
      state.sessionData = { ...state.sessionData, ...action.payload };
    },
    setDiscussionQueue: (state, action) => {
      const { queue = [], globalOrder = 0 } = action.payload;

      const sorted = queue?.slice().sort((a, b) => a.order - b.order);

      const done = sorted?.slice(0, globalOrder) || [];
      const notStarted = sorted?.slice(globalOrder) || [];

      const inProgress =
        done.length > 0 && done[done.length - 1]?.status === "IN_PROGRESS"
          ? done.pop()
          : notStarted?.length > 0 && notStarted[0]?.status === "IN_PROGRESS"
          ? notStarted.shift()
          : {};

      state.queue = {
        done: done.reverse(),
        notStarted,
        inProgress,
      };

      if (globalOrder !== undefined) state.globalOrder = globalOrder;
    },
    setUserSession: (state, action) => {
      const { userStatus } = action.payload;

      if (userStatus) {
        state.userSession = {
          ...state.userSession,
          userStatus,
        };
      } else {
        state.userSession = action.payload;
      }
    },
    setFeedbackStatus: (state, action) => {
      const { userId, newStatus } = action.payload;
      if (newStatus === null) {
        delete state.userFeedbackStatus[userId];
      } else {
        state.userFeedbackStatus[userId] = newStatus;
      }
    },
    setSelectedParticipants: (state, action) => {
      console.log({ selectedParticipantspayload: action.payload });
      state.selectedParticipants = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionQueue.fulfilled, (state, action) => {
        state.loading = false;
        console.log({ action });
        state.sessionData = action.payload; // Fix key to match initial state
      })
      .addCase(fetchSessionQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDiscussionQueue,
  setUserSession,
  setFeedbackStatus,
  setSelectedParticipants,
  updateSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;
