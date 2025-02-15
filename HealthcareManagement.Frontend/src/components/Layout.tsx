import { Box, AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Menu as MenuIcon, Person, People, Event, Description, Logout, LocalHospital, Dashboard, AdminPanelSettings } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'Admin';
    const isDoctor = user?.role === 'Doctor';

    const menuItems = [
        { text: 'Doctors', icon: <Person />, path: '/doctors' },
        { text: 'Patients', icon: <People />, path: '/patients' },
        { text: 'Appointments', icon: <Event />, path: '/appointments' },
        ...(isAdmin || isDoctor ? [
            { text: 'Medical Records', icon: <Description />, path: '/medical-records' }
        ] : []),
        ...(isDoctor ? [
            { text: 'Doctor Panel', icon: <Dashboard />, path: '/doctor-panel' }
        ] : []),
        ...(isAdmin ? [
            { text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' }
        ] : [])
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
        setDrawerOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setDrawerOpen(true)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Healthcare Management
                    </Typography>
                    {user && (
                        <>
                            <Typography sx={{ mr: 2 }}>
                                {user.username} ({user.role})
                            </Typography>
                            <Button color="inherit" onClick={handleLogout}>
                                <Logout />
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <List sx={{ width: 250 }}>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    width: { sm: `calc(100% - ${drawerOpen ? 250 : 0}px)` }
                }}
            >
                {children}
            </Box>
        </Box>
    );
} 