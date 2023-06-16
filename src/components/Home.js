import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const Home = () => {
    const { logOut, user } = useUserAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            console.log(user);
            await logOut();
            navigate("/");
        } catch (error) {
            console.log(error.message);
        }
    };
    React.useEffect(() => {
        window.onpopstate = () => {
            if(user != null){
                logOut();
            }
        }
    })

    return (
        <>
            <div className="p-4 box mt-3 text-center">
                Hello Welcome <br />
                {user && user.email}
            </div>
            <div className="d-grid gap-2">
                <Button variant="primary" onClick={handleLogout}>
                    Log out
                </Button>
                <Link to="/calendar">Calendar</Link>
            </div>
        </>
    );
};

export default Home;