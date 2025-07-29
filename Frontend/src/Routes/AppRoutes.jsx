import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import Home from "../Pages/Home";
import Chat from "../Pages/Chat";
import UserAuth from "../Authorization/UserAuth";
import Landing from "../Pages/Landing";
import SettingsPage from "@/Pages/SettingsPage";
import ChatPageWrapper from "@/Context/ChatPageWrapper";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <UserAuth>
              <Home />
            </UserAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <UserAuth>
              <SettingsPage />
            </UserAuth>
          }
        />
        <Route path="/chat/:projectId" element={<ChatPageWrapper />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
