import { Profiler, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const onRender = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  console.log({
    id, // The "id" prop of the Profiler
    phase, // "mount" or "update"
    actualDuration, // Time spent rendering (in ms)
    baseDuration, // Estimated time to render without memoization
  });
};

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
);
