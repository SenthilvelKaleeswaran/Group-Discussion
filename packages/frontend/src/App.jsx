import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import AudioRecorder from "./components/AudioRecorder";
import { DiscussionDetails } from "./components/DiscussionDetails";
import Signup from "./screens/SignUp";
import Login from "./screens/Login";
import DiscussionWrapper from "./routes/DiscussionWrapper";
import ProtectedWrapper from "./routes/ProtectedWrapper";
import Home from "./screens/Home";
import NonAuthWrapper from "./routes/NonAuthWrapper";
import { AuthProvider } from "./context/auth";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/" element={<NonAuthWrapper />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedWrapper />}>
            <Route path="/gd" element={<DiscussionWrapper />}>
              <Route path=":id" element={<AudioRecorder />} />
              <Route path="" element={<DiscussionDetails />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
