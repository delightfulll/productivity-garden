import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./styles/App.css";
import Home from "./screens/Home";
import Journal from "./screens/Journal";
import Wins from "./screens/Wins";
import Journey from "./screens/Journey";
import Addictions from "./screens/Addictions";
import TimeBlocking from "./screens/timeblocking";
import TimerScreen from "./screens/timerscreen";
import Settings from "./screens/Settings";
import Profile from "./screens/Profile";

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
        <Route path="/timer" element={<TimerScreen />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
