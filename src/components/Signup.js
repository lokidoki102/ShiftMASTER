import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useUserAuth } from "../context/UserAuthContext";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [uniqueCode, setUniqueCode] = useState("");

    const { signUp, user, signUpWitCredentials, validation } = useUserAuth();
    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        let exist = await validation(uniqueCode);
        try {
            if (exist === true) {
                // The unique code existed in the database
                if (user === null) {
                    // Sign Up using normal email (seperate manager and employee role)
                    console.log("Sign Up using Normal Email")
                    await signUp(email, password, name, phoneNumber, companyName, uniqueCode);
                    navigate("/home");
                } else {
                    // Sign Up using Google email (seperate manager and employee role)
                    console.log("Sign up using Google Email")
                    await signUpWitCredentials(name, phoneNumber, companyName, uniqueCode).then((result) => {
                        if (result === true) {
                            navigate("/home");
                        }
                    });
                }
            } else {
                setError("The unique code does not exist in the database. Please try again!");
                e.target.reset();
                navigate("/signup");
            }
        } catch (err) {
            console.log(err);
            setError("There is an error creating your account. Please try again!"); setUniqueCode(""); setCompanyName("");
            e.target.reset();
        }
    };

    const [toggleState, setToggleState] = useState(1);

    const toggleTab = (index) => {
        setToggleState(index);
    };

    return (
        <>
            <div class="container">
                <div class="row">
                    <div class="d-flex justify-content-center">
                        <div className="p-12 box">
                            <div className="container">
                                <div className="bloc-tabs">
                                    <button
                                        className={toggleState === 1 ? "tabs active-tabs" : "tabs"}
                                        onClick={() => toggleTab(1)}
                                    >
                                        Employee
                                    </button>
                                    <button
                                        className={toggleState === 2 ? "tabs active-tabs" : "tabs"}
                                        onClick={() => toggleTab(2)}
                                    >
                                        Manager
                                    </button>
                                </div>

                                <div className="content-tabs">
                                    <div className={toggleState === 1 ? "content  active-content" : "content"}>
                                        <div className="p-4">
                                            <div className="mb-3 logo-placeholder">
                                                <h2 className="inline bolded logo-white">Shift</h2>
                                                <h2 className="inline bolded logo-black">MASTER</h2>
                                            </div>
                                            {error && <Alert variant="danger">{error}</Alert>}
                                            <Form onSubmit={handleSubmit}>
                                                <Form.Group className="mb-3" controlId="formBasicName">
                                                    <Form.Control
                                                        className="login-box"
                                                        type="text"
                                                        placeholder="Name"
                                                        onChange={(e) => setName(e.target.value)}
                                                        required />
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="formBasicUniqueCode">
                                                    <Form.Control
                                                        className="login-box"
                                                        type="text"
                                                        placeholder="Unique Code (e.g. Company-1234)"
                                                        onChange={(e) => setUniqueCode(e.target.value)}
                                                        required />
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                                    {user && <Form.Control
                                                        className="login-box"
                                                        type="email"
                                                        placeholder={user.email}
                                                        disabled />}
                                                    {!user && <Form.Control
                                                        className="login-box"
                                                        type="email"
                                                        placeholder="Email Address"
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required />}
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                                    {user && <Form.Control
                                                        className="login-box"
                                                        type="password"
                                                        placeholder="******"
                                                        disabled />}
                                                    {!user && <Form.Control
                                                        className="login-box"
                                                        type="password"
                                                        placeholder="Password"
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required />}
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="formBasicPhone">
                                                    <Form.Control
                                                        className="login-box"
                                                        type="tel"
                                                        placeholder="Phone Number (e.g. 1234-5678)"
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                        pattern="[0-9]{4}-[0-9]{4}"
                                                        required />
                                                </Form.Group>

                                                <div className="d-grid gap-2">
                                                    <Button variant="primary" type="Submit">
                                                        Sign up
                                                    </Button>
                                                </div>
                                            </Form>
                                            <div className="mt-3 text-center sign-up-button primary-text">
                                                Already have an account?<Link to="/" className="custom-link"> Login</Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={toggleState === 2 ? "content  active-content" : "content"}>
                                        <div className="p-4">
                                            <div className="mb-3 logo-placeholder">
                                                <h2 className="inline bolded logo-white">Shift</h2>
                                                <h2 className="inline bolded logo-black">MASTER</h2>
                                            </div>
                                            {error && <Alert variant="danger">{error}</Alert>}
                                            <Form onSubmit={handleSubmit}>
                                                <Form.Group className="mb-3" controlId="formBasicName">
                                                    <Form.Control
                                                        className="login-box"
                                                        type="text"
                                                        placeholder="Name"
                                                        onChange={(e) => setName(e.target.value)}
                                                        required />
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="formCompanyName">
                                                    <Form.Control
                                                        className="login-box"
                                                        type="text"
                                                        placeholder="Company Name"
                                                        onChange={(e) => setCompanyName(e.target.value)}
                                                        required />
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                                    {user && <Form.Control
                                                        className="login-box"
                                                        type="email"
                                                        placeholder={user.email}
                                                        disabled />}
                                                    {!user && <Form.Control
                                                        className="login-box"
                                                        type="email"
                                                        placeholder="Email Address"
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required />}
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                                    {user && <Form.Control
                                                        className="login-box"
                                                        type="password"
                                                        placeholder="******"
                                                        disabled />}
                                                    {!user && <Form.Control
                                                        className="login-box"
                                                        type="password"
                                                        placeholder="Password"
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required />}
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="formBasicPhone">
                                                    <Form.Control
                                                        className="login-box"
                                                        type="tel"
                                                        placeholder="Phone Number (e.g. 1234-5678)"
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                        pattern="[0-9]{4}-[0-9]{4}"
                                                        required />
                                                </Form.Group>

                                                <div className="d-grid gap-2">
                                                    <Button variant="primary" type="Submit">
                                                        Sign up
                                                    </Button>
                                                </div>
                                            </Form>
                                            <div className="mt-3 text-center sign-up-button primary-text">
                                                Already have an account?<Link to="/" className="custom-link"> Login</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Signup;