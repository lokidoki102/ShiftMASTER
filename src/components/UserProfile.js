import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserAuth } from "../context/UserAuthContext";
import { Form, Button } from "react-bootstrap";

const UserProfile = () => {
    const { user, getUserProfile, getAllEmployees, approveEmployees, deleteEmployees, updateUserProfile } = useUserAuth();
    const [oneUser, setUsers] = useState([]);
    const [allEmployees, setEmployees] = useState([]);
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        const getUser = async () => {
            const oneUser = await getUserProfile(user.uid);
            setUsers(oneUser);
            if (oneUser.CompanyCode !== undefined) {
                const getAll = async () => {
                    const allEmployees = await getAllEmployees(oneUser.CompanyCode);
                    setEmployees(allEmployees);
                }
                getAll();
            }
            setName(oneUser.UserName);
            setPhoneNumber(oneUser.UserPhoneNumber);
        }
        getUser();

        setEmployees(
            allEmployees.map(d => {
                if (d.Status === "Not Approved") {
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
                } else if (d.Status === "Approved") {
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

    const handleEmployeeSubmit = async (e) => {
        e.preventDefault();
        try {
            await approveEmployees(allEmployees);
            setTimeout(function () {
                window.location.reload(true);
            }, 2000);
        } catch (error) {
            console.log(error);
        }
    }

    const handleEmployeeDelete = async (e) => {
        e.preventDefault();
        try {
            await deleteEmployees(allEmployees);
            setTimeout(function () {
                window.location.reload(true);
            }, 2000);
        } catch (error) {
            console.log(error);
        }
    }

    const handleUserUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateUserProfile(user.uid, name, phoneNumber);
            setTimeout(function () {
                window.location.reload(true);
            }, 2000);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            {(user && oneUser.Role === "Manager") &&
                <><div class="container">
                    <div class="row">
                        <div class="col-md-4"></div>
                        <div class="col-md-4 text-center">
                            <h3>User Profile</h3>
                            <p></p>
                            <Form onSubmit={handleUserUpdate}>
                                <Form.Group className="mb-3" controlId="formCompanyName">
                                    <Form.Control
                                        className="login-box"
                                        type="text"
                                        placeholder={"Company Name: " + oneUser.CompanyName}
                                        disabled
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicRole">
                                    <Form.Control
                                        className="login-box"
                                        type="text"
                                        placeholder={"Role: " + oneUser.Role}
                                        disabled
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Control
                                        className="login-box"
                                        type="email"
                                        placeholder={"Email: " + oneUser.UserEmail}
                                        disabled
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicName">
                                    <Form.Control
                                        className="login-box"
                                        type="text"
                                        placeholder={"Username: " + oneUser.UserName}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPhone">
                                    <Form.Control
                                        className="login-box"
                                        type="tel"
                                        placeholder={"Phone Number: " + oneUser.UserPhoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        pattern="[0-9]{4}-[0-9]{4}"
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="secondary" type="Submit">
                                        Update Profile
                                    </Button>
                                </div>
                            </Form>
                        </div>
                        <div class="col-md-4"></div>
                    </div>
                    <div id="spacing"></div>
                    <div class="row">
                        <div class="col-md-12 text-center">
                            <h3>List of Employees</h3>
                        </div>
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
                                                        setEmployees(allEmployees.map(data => {
                                                            if (perEmployee.UserID === data.UserID) {
                                                                data.select = checked;
                                                                if (data.select === true) {
                                                                    perEmployee.Status = "Pending Approval";
                                                                } else if (data.select === false) {
                                                                    perEmployee.Status = "Not Approved";
                                                                }
                                                            }
                                                            return data;
                                                        }));
                                                    }} disabled={perEmployee.Status === "Approved" || perEmployee.Status === "Pending Deletion"}></input></td>
                                                    <td><input type="checkbox" onChange={(event) => {
                                                        let checked = event.target.checked;
                                                        setEmployees(allEmployees.map(data => {
                                                            if (perEmployee.UserID === data.UserID) {
                                                                data.select2 = checked;
                                                                if (data.select2 === true) {
                                                                    perEmployee.Status = "Pending Deletion";
                                                                } else if (data.select2 === false) {
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
                            <div class="col-md-10 text-end">
                                <p></p>
                                <Button variant="secondary" type="Submit" onClick={handleEmployeeSubmit}>
                                    Approve Pending Employee
                                </Button>
                                <p></p>
                                <Button variant="secondary" type="Submit" onClick={handleEmployeeDelete}>
                                    Delete Pending Employee
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                </>}
            {(user && oneUser.Role === "Employee") &&
                <><div class="container">
                    <div class="row">
                        <div class="col-md-4"></div>
                        <div class="col-md-4 text-center">
                            <h3>User Profile</h3>
                            <p></p>
                            <Form onSubmit={handleUserUpdate}>
                                <Form.Group className="mb-3" controlId="formCompanyName">
                                    <Form.Control
                                        className="login-box"
                                        type="text"
                                        placeholder={"Company Name: " + oneUser.CompanyName}
                                        disabled
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicRole">
                                    <Form.Control
                                        className="login-box"
                                        type="text"
                                        placeholder={"Role: " + oneUser.Role}
                                        disabled
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicStatus">
                                    <Form.Control
                                        className="login-box"
                                        type="text"
                                        placeholder={"Status: " + oneUser.Status}
                                        disabled
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Control
                                        className="login-box"
                                        type="email"
                                        placeholder={"Email: " + oneUser.UserEmail}
                                        disabled
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicName">
                                    <Form.Control
                                        className="login-box"
                                        type="text"
                                        placeholder={"Username: " + oneUser.UserName}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPhone">
                                    <Form.Control
                                        className="login-box"
                                        type="tel"
                                        placeholder={"Phone Number: " + oneUser.UserPhoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        pattern="[0-9]{4}-[0-9]{4}"
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="secondary" type="Submit">
                                        Update Profile
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </>}
        </>
    );
}

export default UserProfile;