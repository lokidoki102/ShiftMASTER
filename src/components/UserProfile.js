import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router";

const UserProfile = () => {
    const { user, getUserProfile } = useUserAuth();
    const [ oneUser, setUsers ] = useState([]);      
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async() => {
            const oneUser = await getUserProfile(user.uid);
            setUsers(oneUser);
        }
        getUser();
    }, [user]);

    return(
        <>
            {(user && oneUser.Role === "Manager") && <div className = "p-4 box mt-3 text-center">
                <h2>Role: {oneUser.Role}</h2>
                <h3>Company Name: {oneUser.CompanyName}</h3>
                <h3>Company Code: {oneUser.CompanyCode}</h3>
                <h3>Email: {oneUser.UserEmail}</h3>
                <h3>Name: {oneUser.UserName}</h3>
                <h3>Phone Number: {oneUser.UserPhoneNumber}</h3>
            </div>}
            {(user && oneUser.Role === "Employee") && <div className = "p-4 box mt-3 text-center">
                <h2>Role: {oneUser.Role}</h2>
                <h3>Status: {oneUser.Status}</h3>
                <h3>Company Name: {oneUser.CompanyName}</h3>
                <h3>Email: {oneUser.UserEmail}</h3>
                <h3>Name: {oneUser.UserName}</h3>
                <h3>Phone Number: {oneUser.UserPhoneNumber}</h3>
            </div>}
        </>
    );
}

export default UserProfile;