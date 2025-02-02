import { configureStore } from "@reduxjs/toolkit";
import participantsReducer from "./participants";
import conversationsReducer from "./conversation";
import groupDiscussionsReducer from "./group-discussion";

export const store = configureStore({
  reducer: {
    participants: participantsReducer,
    conversation: conversationsReducer,
    groupDiscussion: groupDiscussionsReducer,
  },
});
