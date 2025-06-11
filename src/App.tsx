import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import Home from "./screens/Home";
import Journal from "./screens/Journal";
import Wins from "./screens/Wins";
import Journey from "./screens/Journey";
import Addictions from "./screens/Addictions";
import React from "react";
import TimeBlocking from "./screens/timeblocking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/wins" element={<Wins />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/addictions" element={<Addictions />} />
        <Route path="/timeblocking" element={<TimeBlocking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
