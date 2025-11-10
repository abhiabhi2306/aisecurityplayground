import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Challenge from './components/Challenge';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import About from './components/About';
import { UserProvider } from './contexts/UserContext';

function App() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get or create user ID
    let storedUserId = localStorage.getItem('ai-security-playground-user-id');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('ai-security-playground-user-id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <UserProvider userId={userId}>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}>
        <Navbar />
        <Container maxWidth="xl" sx={{ pt: 4, pb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/challenge/:challengeId" element={<Challenge />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Container>
      </Box>
    </UserProvider>
  );
}

export default App;
