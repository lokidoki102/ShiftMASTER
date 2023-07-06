import React from 'react';
import {
    CDBSidebar,
    CDBSidebarContent,
    CDBSidebarFooter,
    CDBSidebarHeader,
    CDBSidebarMenu,
    CDBSidebarMenuItem,
} from 'cdbreact';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div id="navbar">
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

                <CDBSidebarFooter style={{ textAlign: 'center' }}>
                    <div style={{ padding: '20px 5px' }}>
                        Orbital 2023
                    </div>
                </CDBSidebarFooter>
            </CDBSidebar>
        </div>
    );
};

export default Sidebar;