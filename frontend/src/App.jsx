import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import EventTypes from "./pages/event_types";
import PlayersPage from "./pages/PlayersPage";
import PlayerProfile from "./pages/PlayerProfile";
import Leaderboard from "./pages/Leaderboard";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      // Clean up URL
      navigate('/dashboard', { replace: true });
    }

    if (error) {
      console.error('OAuth error:', error);
      // Clean up URL
      navigate('/signup', { replace: true });
    }
  }, [location, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/event-types" element={<EventTypes />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/players/:sport" element={<PlayersPage />} />
      <Route path="/players/profile/:id" element={<PlayerProfile />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}