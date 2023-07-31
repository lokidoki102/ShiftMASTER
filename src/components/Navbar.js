import React, { useEffect, useState } from "react";
import {
    CDBSidebar,
    CDBSidebarContent,
    CDBSidebarFooter,
    CDBSidebarHeader,
    CDBSidebarMenu,
    CDBSidebarMenuItem
} from 'cdbreact';
import { NavLink } from 'react-router-dom';
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from '../context/UserAuthContext';
import { BrowserView } from 'react-device-detect';
import { auth } from '../firebase';

const Sidebar = () => {
    const { logOut, checkForNavbar } = useUserAuth();
    const [loggedIn, setLoggedIn] = useState();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            logOut();
            navigate("/");
        } catch (error) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        try {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    setLoggedIn(true);
                } else {
                    setLoggedIn(false);
                }
            })
        } catch (error) {
            console.log(error);
        }
    }, []);

    return (
        <>
            <div id="navbar">
                <BrowserView>
                    <CDBSidebar textColor="white" backgroundColor="#2F2E2E">
                        {loggedIn === true && <>
                            <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large"></i>}>
                                ShiftMASTER
                            </CDBSidebarHeader>
                            <CDBSidebarContent className="sidebar-content">
                                <CDBSidebarMenu>
                                    <NavLink exact to="/home" activeClassName="activeClicked">
                                        <CDBSidebarMenuItem icon="columns">Dashboard</CDBSidebarMenuItem>
                                    </NavLink>
                                    <NavLink exact to="/calendar" activeClassName="activeClicked">
                                        <CDBSidebarMenuItem icon="calendar">Calendar</CDBSidebarMenuItem>
                                    </NavLink>
                                    <NavLink exact to="/userprofile" activeClassName="activeClicked">
                                        <CDBSidebarMenuItem icon="user">User Profile</CDBSidebarMenuItem>
                                    </NavLink>
                                </CDBSidebarMenu>
                            </CDBSidebarContent>

                            <CDBSidebarFooter style={{ textAlign: 'center', padding: '10px' }}>
                                <Button variant="primary" onClick={handleLogout} style={{ textAlign: 'center', padding: '8px' }}>
                                    Sign Out
                                </Button>
                            </CDBSidebarFooter>
                        </>}
                        {loggedIn === false && <>
                            <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large"></i>}>
                                ShiftMASTER
                            </CDBSidebarHeader>
                            <CDBSidebarContent className="sidebar-content">
                                <CDBSidebarMenu>
                                    <NavLink exact to="/home" activeClassName="activeClicked">
                                        <CDBSidebarMenuItem icon="columns">Login For More Features!</CDBSidebarMenuItem>
                                    </NavLink>
                                </CDBSidebarMenu>
                            </CDBSidebarContent>
                            <CDBSidebarFooter></CDBSidebarFooter>
                        </>}
                    </CDBSidebar>
                </BrowserView>
            </div>
        </>
    );
};

export default Sidebar;