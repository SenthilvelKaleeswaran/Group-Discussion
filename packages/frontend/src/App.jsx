import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "./index.css";

import { QueryClient, QueryClientProvider } from "react-query";
import {
  CreateDiscussion,
  Feedback,
  GroupDiscussion,
  Home,
  Login,
  Profile,
  Signup,
} from "./screens";
import { NonAuthWrapper, ProtectedWrapper } from "./wrappers";
import { AuthProvider } from "./context";

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
              <Route path="/gd">
                <Route path=":id" element={<GroupDiscussion />} />
                <Route path="" element={<CreateDiscussion />} />
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
