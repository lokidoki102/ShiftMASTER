import React from "react";
import { useUserAuth } from "../context/UserAuthContext";

const Home = () => {
    const { user } = useUserAuth();

    return (
        <>
            <div class="container">
                <div class="row">
                    <div class="d-flex justify-content-center">
                        <div className="p-4 box mt-3 text-center">
                            Hello Welcome <br />
                            {user && user.email}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;