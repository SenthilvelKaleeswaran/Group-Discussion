import { configureStore } from "@reduxjs/toolkit";
import participantsReducer from "./participants";
import conversationReducer from "./conversation";
import groupDiscussionsReducer from "./group-discussion";
import controlsReducer from './controls'
import sessionReducer from './session'

export const store = configureStore({
  reducer: {
    participants: participantsReducer,
    conversation: conversationReducer,
    groupDiscussion: groupDiscussionsReducer,
    controls : controlsReducer,
    session : sessionReducer
  },
});
