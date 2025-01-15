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
import { Provider } from "react-redux";
import { store } from "./store";
import { Toaster } from "react-hot-toast";

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
                <Route
                  path=":id"
                  element={
                    <Provider store={store}>
                      <GroupDiscussion />
                    </Provider>
                  }
                />
                <Route path="" element={<CreateDiscussion />} />
              </Route>
              <Route path="/feedback" element={<Feedback />} />

              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
      <Toaster/>
    </QueryClientProvider>
  );
}

export default App;
