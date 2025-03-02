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
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
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
  Assignment as PirepsIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  FlightTakeoff as FlightTakeoffIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { lightTheme, darkTheme } from '../theme';
import { logout } from '../auth';
import Gravatar from '../components/Gravatar';
import AxiosInstance from '../components/AxiosInstance';
import PublicIcon from '@mui/icons-material/Public';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
  { text: 'Members', icon: <GroupIcon />, path: '/app/members' },
  { text: 'World Tour', icon: <AwardsIcon />, path: '/app/awards' },
  { text: 'My Flights', icon: <FlightsIcon />, path: '/app/my-flights' },
  { text: 'My World Tour', icon: <PublicIcon />, path: '/app/my-awards' },
  { text: 'MAP', icon: <MapIcon />, path: '/app/map' },
];

const DrawerContent = ({ darkMode, handleThemeChange, navigate, location, handleLogout }) => (
  <div>
    <Toolbar />
    <List>
      {menuItems.map((item) => (
        <ListItem
          button
          key={item.text}
          onClick={() => navigate(item.path)}
          selected={location.pathname === item.path}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
      <ListItem>
        <ListItemIcon>{darkMode ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
        <Switch checked={darkMode} onChange={handleThemeChange} sx={{ ml: 1 }} />
      </ListItem>
    </List>
    <Divider />
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

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const fetchNotifications = () => {
    AxiosInstance.get("notifications/")
      .then((res) => {
        setNotifications(res.data);
        setError(null);
      })
      .catch((error) => {
        console.error("Erro ao buscar notificações:", error);
        setError("Erro ao carregar notificações. Tente novamente mais tarde.");
      });
  };

  const handleDismissNotification = (id) => {
    AxiosInstance.post(`notifications/${id}/mark_as_read/`)
      .then(() => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      })
      .catch((error) => {
        console.error("Erro ao marcar notificação como lida:", error);
      });
  };

  return { notifications, error, fetchNotifications, handleDismissNotification };
};

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, error, fetchNotifications, handleDismissNotification } = useNotifications();
  const [anchorNotif, setAnchorNotif] = useState(null);
  const notifOpen = Boolean(anchorNotif);
  const [currentTime, setCurrentTime] = useState({ utcTime: '', localTime: '' });

  const getFormattedTime = () => {
    const now = new Date();

    // Formata o horário UTC
    const utcTime = now.toLocaleTimeString('en-US', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Formata o horário local
    const localTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    return { utcTime, localTime };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getFormattedTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const GetUserData = () => {
    AxiosInstance.get('users/me/')
      .then((res) => {
        setUserData(res.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar os dados do usuário:', error);
      });
  };

  useEffect(() => {
    GetUserData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
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
            <Typography
              
              noWrap
              component="div"
              sx={{ flexGrow: 1, fontFamily: '"Open Sans", sans-serif' }}
            >
              Infinite World Tour System | {currentTime.utcTime} UTC | {currentTime.localTime} Local
            </Typography>

            <Tooltip title="Notificações">
              <IconButton color="inherit" onClick={(e) => setAnchorNotif(e.currentTarget)}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorNotif}
              open={notifOpen}
              onClose={() => setAnchorNotif(null)}
              PaperProps={{
                sx: { width: 320, maxHeight: 400, overflowY: "auto" },
              }}
            >
              {notifications.length === 0 ? (
                <MenuItem>Sem notificações</MenuItem>
              ) : (
                notifications.map((notif, index) => (
                  <Box key={notif.id}>
                    <MenuItem sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {notif.message.includes("aprovado") ? (
                        <FlightTakeoffIcon color="success" sx={{ fontSize: 40 }} />
                      ) : notif.message.includes("rejeitado") ? (
                        <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                      ) : (
                        <Avatar src={notif.image} sx={{ width: 40, height: 40, borderRadius: "50%" }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ whiteSpace: "normal", wordWrap: "break-word" }}>
                          {notif.message}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleDismissNotification(notif.id)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </MenuItem>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                ))
              )}
            </Menu>

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Gravatar
                  email={userData?.email || 'user@example.com'}
                  size={40}
                  alt={`Imagem de perfil de ${userData?.first_name || 'Usuário'}`}
                  style={{ borderRadius: '50%' }}
                />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleMenuClose}>
                  <Avatar src={userData?.gravatar_url} />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {userData?.first_name} {userData?.last_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {userData?.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMenuClose}>
                  Editar
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            <DrawerContent
              darkMode={darkMode}
              handleThemeChange={handleThemeChange}
              navigate={navigate}
              location={location}
              handleLogout={handleLogout}
            />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            <DrawerContent
              darkMode={darkMode}
              handleThemeChange={handleThemeChange}
              navigate={navigate}
              location={location}
              handleLogout={handleLogout}
            />
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Navbar;