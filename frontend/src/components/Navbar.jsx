import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { AppBar, Drawer, List, ListItem, ListItemIcon, ListItemText, Switch, Toolbar, Typography, IconButton } from '@mui/material';
import { Menu, ChevronLeft, ChevronRight, Logout } from '@mui/icons-material';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

const Navbar = ( props) => {
    const {content} = props
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode);
        // Aqui você pode adicionar a lógica para alternar o tema escuro/claro
    };

    const handleLogout = () => {
        // Aqui você pode adicionar a lógica para logout
        console.log('Logout');
    };

    return (
        <div style={{ display: 'flex' }}>
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <Menu />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
                    </IconButton>
                </DrawerHeader>
                <List>
                    <ListItem button>
                        <ListItemIcon>
                            {/* Ícone do item */}
                        </ListItemIcon>
                        <ListItemText primary="Item 1" />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>
                            {/* Ícone do item */}
                        </ListItemIcon>
                        <ListItemText primary="Item 2" />
                    </ListItem>
                </List>
                <List style={{ marginTop: 'auto' }}>
                    <ListItem>
                        <ListItemIcon>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText primary="Logout" onClick={handleLogout} />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            {/* Ícone do dark mode */}
                        </ListItemIcon>
                        <Switch checked={darkMode} onChange={handleDarkModeToggle} />
                        <ListItemText primary="Dark Mode" />
                    </ListItem>
                </List>
            </Drawer>
            <Main open={open}>
                <DrawerHeader />
                <Typography paragraph>
                   {content}
                </Typography>
            </Main>
        </div>
    );
};

export default Navbar;