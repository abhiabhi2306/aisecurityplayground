import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Security,
  Home,
  EmojiEvents,
  Person,
  Info,
  MenuBook
} from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userStats } = useUser();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <Home /> },
    { label: 'Leaderboard', path: '/leaderboard', icon: <EmojiEvents /> },
    { label: 'Profile', path: '/profile', icon: <Person /> },
    { label: 'About', path: '/about', icon: <Info /> },
  ];

  return (
    <AppBar position="sticky" sx={{ background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)' }}>
      <Toolbar>
        <Security sx={{ mr: 2, fontSize: 32 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #ff6b35 30%, #4ecdc4 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Security Playground
        </Typography>

        {userStats && (
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            <Chip
              label={`Points: ${userStats.totalPoints}`}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`Completed: ${userStats.completedChallenges}`}
              color="secondary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255, 107, 53, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
          >
            <MenuBook />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  handleMenuClose();
                }}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.icon}
                  {item.label}
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
