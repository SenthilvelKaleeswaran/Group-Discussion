import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import { DiscussionDetails } from "./components/DiscussionDetails";
import Signup from "./screens/SignUp";
import Login from "./screens/Login";
import DiscussionWrapper from "./routes/DiscussionWrapper";
import ProtectedWrapper from "./routes/ProtectedWrapper";
import Home from "./screens/Home";
import NonAuthWrapper from "./routes/NonAuthWrapper";
import { AuthProvider } from "./context/auth";
import { QueryClient, QueryClientProvider } from 'react-query';
import Profile from "./screens/Profile";
import DiscussionSpace from "./components/DiscussionSpace";
import Feedback from "./screens/Feedback";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
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
                <Route path=":id" element={<DiscussionSpace />} />
                <Route path="" element={<DiscussionDetails />} />
              </Route>
              <Route path="/feedback" element={<Feedback />} />

              <Route path="/profile" element={<Profile />} />

            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
