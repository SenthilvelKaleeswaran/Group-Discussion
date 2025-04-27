export const LOCAL_STORAGE_LOADING_STATE = {
  START_SESSION: {
    message: {
      error: "Error happened. Please try again!",
      success: "Discussion Started",
      loading: "Discussion is getting started",
    },
    status: "loading",
  },
  PAUSE_SESSION: {
    message: {
      error: "Error happened while pausing. Please try again!",
      success: "Discussion Paused",
      loading: "Discussion is being paused",
    },
    status: "loading",
  },
  RESUME_SESSION: {
    message: {
      error: "Error happened while resuming. Please try again!",
      success: "Discussion Resumed",
      loading: "Discussion is being resumed",
    },
    status: "loading",
  },
  END_SESSION: {
    message: {
      error: "Error happened while ending. Please try again!",
      success: "Discussion Ended",
      loading: "Discussion is being ended",
    },
    status: "loading",
  },
};
