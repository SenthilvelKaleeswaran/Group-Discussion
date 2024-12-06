import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import Router components
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "./index.css";
import AudioRecorder from "./components/AudioRecorder";
import { MemberProvider } from "./context/member";
import { ConversationProvider } from "./context/conversation";
import { DiscussionProvider } from "./context/details";
import { DiscussionDetails } from "./components/DiscussionDetails";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>  {/* Wrapping the entire app with Router */}
      <DiscussionProvider>
        <MemberProvider>
          <ConversationProvider>
            <Routes> {/* Define Routes */}
              <Route path="/" element={<DiscussionDetails />} /> {/* Root route */}
              <Route path="/gd" element={<AudioRecorder />} /> {/* /gd route */}
            </Routes>
          </ConversationProvider>
        </MemberProvider>
      </DiscussionProvider>
    </Router>
  );
}

export default App;
