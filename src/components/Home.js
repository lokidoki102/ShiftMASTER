import React, { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faDatabase, faExclamationTriangle, faFlag } from '@fortawesome/free-solid-svg-icons'

const Home = () => {
    const { user, getUserProfile } = useUserAuth();
    const [oneUser, setUsers] = useState([]);

    useEffect(() => {
        const getUser = async () => {
            const oneUser = await getUserProfile(user.uid);
            setUsers(oneUser);
        }
        getUser();
    }, []);

    return (
        <>
            <div class="container">
                <div class="row">
                    <div class="d-flex justify-content-center">
                        <h3 class="headerForDash">Welcome, {oneUser.UserName}!</h3>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-8 boxDashboard" style={{ padding: '40px' }}>
                        <h3 class="headerForDash" style={{ color: '#00186C' }}><FontAwesomeIcon icon={faFlag} /> Upcoming Shifts</h3>
                        <div class="d-flex justify-content-center">
                            <ol class="list-group list-group-numbered">
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                            </ol>
                        </div>
                    </div>

                    <div class="col-md-4 boxDashboard" style={{ padding: '40px' }}>
                        <h3 class="headerForDash" style={{ color: '#40006C' }}><FontAwesomeIcon icon={faBell} /> Notifications</h3>
                        <div class="d-flex justify-content-center">
                            <ul class="list-group" style={{ width: '100%' }}>
                                <li class="list-group-item">A list item</li>

                            </ul>
                        </div>
                    </div>
                    <div class="col-md-8 boxDashboard" style={{ padding: '40px' }}>
                        <h3 class="headerForDash" style={{ color: '#6C0000' }}><FontAwesomeIcon icon={faExclamationTriangle} /> Priority Shifts</h3>
                        <div class="d-flex justify-content-center">
                            <ol class="list-group list-group-numbered">
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                                <li class="list-group-item">A list item</li>
                            </ol>
                        </div>
                    </div>
                    <div class="col-md-4 boxDashboard" style={{ padding: '40px' }}>
                        <h3 class="headerForDash" style={{ color: '#006C48' }}><FontAwesomeIcon icon={faDatabase} /> Summary</h3>
                        <div class="d-flex justify-content-center">

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;