import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router";

const UserProfile = () => {
    const { user, getUserProfile, getAllEmployees, approveEmployees, deleteEmployees } = useUserAuth();
    const [oneUser, setUsers] = useState([]);
    const [allEmployees, setEmployees] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const oneUser = await getUserProfile(user.uid);
            setUsers(oneUser);
            if(oneUser.CompanyCode !== undefined){
                const getAll = async() => {
                    const allEmployees = await getAllEmployees(oneUser.CompanyCode);
                    setEmployees(allEmployees);
                }
                getAll();
            }
        }
        getUser();

        setEmployees(
            allEmployees.map(d => {
                if(d.Status === "Not Approved"){
                    return {
                        select: false,
                        select2: true,
                        CompanyName: d.CompanyName,
                        Role: d.Role,
                        Status: d.Status,
                        UniqueCode: d.UniqueCode,
                        UserEmail: d.UserEmail,
                        UserID: d.UserID,
                        UserName: d.UserName,
                        UserPhoneNumber: d.UserPhoneNumber
                    };
                } else if(d.Status === "Approved"){
                    return {
                        select: true,
                        select2: false,
                        CompanyName: d.CompanyName,
                        Role: d.Role,
                        Status: d.Status,
                        UniqueCode: d.UniqueCode,
                        UserEmail: d.UserEmail,
                        UserID: d.UserID,
                        UserName: d.UserName,
                        UserPhoneNumber: d.UserPhoneNumber
                    };
                } 
            })
        );
    }, [user]);

    const handleEmployeeSubmit = async(e) => {
        e.preventDefault();
        try {
            await approveEmployees(allEmployees);
            navigate("/home");
        } catch (error) {
            console.log(error);
        }
    }

    const handleEmployeeDelete = async(e) => {
        e.preventDefault();
        try {
            await deleteEmployees(allEmployees);
            navigate("/home");
        } catch(error){
            console.log(error);
        }
    }

    return (
        <>
            {(user && oneUser.Role === "Manager") &&
                <><div class="container">
                    <div class="row">
                        <div class="col-md-1"></div>
                        <div class="col-md-10 text-center">
                            <h2>{oneUser.CompanyName}</h2>
                            <h4>Company Code: {oneUser.CompanyCode}</h4>
                            <h4>Role: {oneUser.Role}</h4>
                            <h4>Email: {oneUser.UserEmail}</h4>
                            <h4>Name: {oneUser.UserName}</h4>
                            <h4>Phone Number: {oneUser.UserPhoneNumber}</h4>
                        </div>
                    </div>
                </div>
                <p></p>
                <div class="container">
                    <div class="row">
                        <div class="col-md-1"></div>
                        <div class="col-md-10 text-center">
                            <h3>List of Employees</h3>
                        </div>
                        <p></p>
                        <div class="row">
                            <div class="col-md-1"></div>
                            <div class="col-md-10 text-center">    
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th>Approve</th>
                                            <th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {allEmployees.map((perEmployee) => (
                                        <>
                                        <tr class="tbody">
                                            <td>{perEmployee.UserName}</td>
                                            <td>{perEmployee.UserEmail}</td>
                                            <td>{perEmployee.UserPhoneNumber}</td>
                                            <td>{perEmployee.Status}</td>
                                            <td><input type="checkbox" onChange={(event) => {
                                                let checked = event.target.checked;
                                                setEmployees(allEmployees.map(data =>{
                                                    if(perEmployee.UserID === data.UserID){
                                                        data.select = checked;
                                                        if(data.select === true){
                                                            perEmployee.Status = "Pending Approval";
                                                        } else if(data.select === false){
                                                            perEmployee.Status = "Not Approved";
                                                        }
                                                    }
                                                    return data;
                                                }));
                                            }} disabled={perEmployee.Status === "Approved" || perEmployee.Status === "Pending Deletion"}></input></td>
                                            <td><input type="checkbox" onChange={(event) => {
                                                let checked = event.target.checked;
                                                setEmployees(allEmployees.map(data => {
                                                    if(perEmployee.UserID === data.UserID){
                                                        data.select2 = checked;
                                                        if(data.select2 === true){
                                                            perEmployee.Status = "Pending Deletion";
                                                        } else if(data.select2 === false){
                                                            perEmployee.Status = "Approved";
                                                        }
                                                    }
                                                    return data;
                                                }));
                                            }} disabled={(perEmployee.Status === "Not Approved" || perEmployee.Status === "Pending Approval")}></input></td>
                                        </tr>
                                        </>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-1"></div>
                            <div class="col-md-10">
                                <p></p>
                                <button onClick={handleEmployeeSubmit}>Approve Pending Employee</button>
                                <p></p>
                                <button onClick={handleEmployeeDelete}>Delete Pending Employee</button>
                            </div>
                        </div>
                    </div>
                </div></>}
            {(user && oneUser.Role === "Employee") &&
                <><div class="container">
                    <div class="row">
                        <div class="col-md-1"></div>
                        <div class="col-md-10 text-center">
                            <h2>Role: {oneUser.Role}</h2>
                            <h3>Status: {oneUser.Status}</h3>
                            <h3>Company Name: {oneUser.CompanyName}</h3>
                            <h3>Email: {oneUser.UserEmail}</h3>
                            <h3>Name: {oneUser.UserName}</h3>
                            <h3>Phone Number: {oneUser.UserPhoneNumber}</h3>
                        </div>
                    </div>
                </div></>}
        </>
    );
}

export default UserProfile;