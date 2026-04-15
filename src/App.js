import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import UserInfo from "./pages/UserInfo";
import Dashboard from "./pages/Dashboard";
import BookSlot from "./pages/BookSlot";
import AddSlot from "./pages/Addslot";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<AuthPage />} />

        {/* MAIN USER DASHBOARD */}
        <Route path="/userinfo" element={<UserInfo />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* SLOT FLOW */}
        <Route path="/bookslot" element={<BookSlot />} />
        <Route path="/addslot" element={<AddSlot />} />

        {/* 404 PAGE */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;