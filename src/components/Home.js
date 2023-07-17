import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useUserAuth } from "../context/UserAuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faDatabase, faExclamationTriangle, faFlag } from '@fortawesome/free-solid-svg-icons'
import { auth } from "../firebase";

const Home = () => {
    const { user, getNotifications } = useUserAuth();
    const [allNotifications, setAllNotifications] = useState([]);
    const [loggedIn, setLoggedIn] = useState();
    auth.onAuthStateChanged((user) => {
        if (user) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    })

    useEffect(() => {
        if (loggedIn !== undefined) {
            console.log(loggedIn);
            const getAllNotifications = async () => {
                const allNotifications = await getNotifications(user.uid);
                setAllNotifications(allNotifications);
            }
            getAllNotifications();
        }
    }, [loggedIn]);

    return (
        <>
            <div class="container">
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
                    <div class="col-md-4 boxDashboard" style={{ padding: '40px', position: 'relative' }}>
                        <h3 class="headerForDash" style={{ color: '#40006C' }}><FontAwesomeIcon icon={faBell} /> Notifications</h3>
                        <div class="d-flex justify-content-center">
                            <ul class="list-group" style={{ width: '100%' }}>
                                {allNotifications.map((perNotification) =>
                                    <li class="list-group-item">{perNotification.Notification}</li>
                                )}
                            </ul>
                        </div>
                        <Button id="notificationButton" variant="light" type="Submit">
                            Mark all as read
                        </Button>
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