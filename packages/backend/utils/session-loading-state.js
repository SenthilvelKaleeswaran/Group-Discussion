const sessionLoadingState = {
  START_SESSION: {
    to: "admin",

    START_SESSION_LOADING: {
      loading: "Discussion will start shortly",
    },
    START_SESSION_LOADED: {
      message: "Discussion is starting",
    },
    status: "IN_PROGRESS",
    id: "sessionStartTime",
  },
  PAUSE_SESSION: {
    to: "admin",
    PAUSE_SESSION_LOADING: {
      loading: "Discussion is being paused...",
    },
    PAUSE_SESSION_LOADED: {
      message: "Discussion has been paused",
    },
    status: "NOT_STARTED",
  },
  RESUME_SESSION: {
    to: "admin",
    RESUME_SESSION_LOADING: {
      loading: "Resuming discussion...",
    },
    RESUME_SESSION_LOADED: {
      message: "Discussion has resumed",
    },
    status: "NOT_STARTED",
  },
  END_SESSION: {
    to: "admin",

    END_SESSION_LOADING: {
      loading: "Finalizing discussion...",
    },
    END_SESSION_LOADED: {
      message: "Discussion has ended",
    },
    status: "COMPLETED",
    id: "sessionEndTime",
  },
};

module.exports = {
  sessionLoadingState,
};
