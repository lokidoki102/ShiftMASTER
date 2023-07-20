import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useUserAuth } from "../context/UserAuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faDatabase, faExclamationTriangle, faFlag } from '@fortawesome/free-solid-svg-icons'
import { auth } from "../firebase";

const Home = () => {
    const { user, getNotifications, updateNotificationView, getUpcomingShifts } = useUserAuth();
    const [allNotifications, setAllNotifications] = useState([]);
    const [allUpcomingShifts, setAllUpcomingShifts] = useState([]);
    const [loggedIn, setLoggedIn] = useState();
    const [disabled, setDisabled] = useState(true);
    auth.onAuthStateChanged((user) => {
        if (user) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    })

    useEffect(() => {
        try {
            (async () => {
                if (loggedIn !== undefined) {
                    if (loggedIn === true) {
                        await getNotifications(user.uid).then((result) => {
                            if(result.length !== 0){
                                setDisabled(false);
                            }
                            setAllNotifications(result);
                        });

                        await getUpcomingShifts(user.uid).then((result) => {
                            setAllUpcomingShifts(result);
                        });
                    }
                }
            })();
        } catch (error) {
            console.log(error);
        }
    }, [loggedIn]);

    const markAllAsRead = async () => {
        try {
            await updateNotificationView(user.uid).then(async (result) => {
                if(result === true){
                    await getNotifications(user.uid).then((result) => {
                        setAllNotifications(result);
                        setDisabled(true);
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <div class="container">
                <div class="row">
                    <div class="col-md-8 boxDashboard" style={{ padding: '40px' }}>
                        <h3 class="headerForDash" style={{ color: '#00186C' }}><FontAwesomeIcon icon={faFlag} /> Upcoming Shifts</h3>
                        <div class="d-flex justify-content-center">
                            <ol class="list-group list-group-numbered">
                            {allUpcomingShifts && allUpcomingShifts.map((shift) =>
                                    <li class="list-group-item">
                                        {"From: " + shift.start.toDate().toJSON().slice(0, 10) + "to: " + shift.end.toDate().toJSON().slice(0, 10)}
                                    </li>
                                )}
                            </ol>
                        </div>
                    </div>
                    <div class="col-md-4 boxDashboard" style={{ padding: '40px', position: 'relative' }}>
                        <h3 class="headerForDash" style={{ color: '#40006C' }}><FontAwesomeIcon icon={faBell} /> Notifications</h3>
                        <div class="d-flex justify-content-center">
                            <ul class="list-group" style={{ width: '100%' }}>
                                {allNotifications && allNotifications.map((perNotification) =>
                                    <li class="list-group-item">
                                        {perNotification.Timestamp.toDate().toJSON().slice(0, 10) + " (" + perNotification.Timestamp.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + "): " + perNotification.Notification}
                                    </li>
                                )}
                                {allNotifications.length === 0 && 
                                    <li class="list-group-item">There is currently no notification.</li>
                                }
                            </ul>
                        </div>
                        <Button id="notificationButton" variant="light" type="Submit" onClick={markAllAsRead} disabled={disabled}>
                            Mark all as read
                        </Button>
                    </div>
                    {/* <div class="col-md-8 boxDashboard" style={{ padding: '40px' }}>
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
                    </div> */}
                </div>
            </div>
        </>
    );
};

export default Home;