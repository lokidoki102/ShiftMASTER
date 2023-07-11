import React from 'react';
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
import { BrowserView, MobileView } from 'react-device-detect';

const Sidebar = () => {
    const { logOut } = useUserAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            logOut();
            navigate("/");
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <>
            <div id="navbar">
                <BrowserView>
                    <CDBSidebar textColor="white" backgroundColor="#2F2E2E">
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
                    </CDBSidebar>
                </BrowserView>
                <MobileView>
                    <CDBSidebar textColor="white" backgroundColor="#2F2E2E" toggled="false">
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
                    </CDBSidebar>
                </MobileView>
            </div>
        </>
    );
};

export default Sidebar;