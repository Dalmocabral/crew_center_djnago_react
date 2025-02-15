import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Box,
  IconButton,
  Switch,
  ThemeProvider,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  EmojiEvents as AwardsIcon,
  Flight as FlightsIcon,
  Star as MyAwardsIcon,
  Map as MapIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate, Outlet } from 'react-router-dom';
import { lightTheme, darkTheme } from '../theme'; // Importe os temas
import { logout } from '../auth'; // Importe a função de logout

const drawerWidth = 240;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    logout(); // Chama a função de logout
  };

  // Salva o estado do darkMode no localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
    { text: 'Members', icon: <GroupIcon />, path: '/app/members' }, // <-- Novo menu
    { text: 'Awards', icon: <AwardsIcon />, path: '/app/awards' },
    { text: 'My Flights', icon: <FlightsIcon />, path: '/app/my-flights' },
    { text: 'My Awards', icon: <MyAwardsIcon />, path: '/app/my-awards' },
    { text: 'MAP', icon: <MapIcon />, path: '/app/map' },
    
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {/* Botão de Dark Mode */}
        <ListItem>
          <ListItemIcon>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <Switch
            checked={darkMode}
            onChange={handleThemeChange}
            sx={{ ml: 1 }} // Ajuste a margem para aproximar o Switch do ícone
          />
        </ListItem>
      </List>
      <Divider /> {/* Linha divisória */}
      {/* Botão de Logout */}
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {/* Navbar */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Crew Center Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Melhora a performance no mobile
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Conteúdo Principal */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        >
          <Toolbar />
          <Outlet /> {/* Renderiza as páginas filhas aqui */}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Navbar;