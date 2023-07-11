import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import { Button } from "react-bootstrap";
import GoogleButton from "react-google-button";
import { useUserAuth } from "../context/UserAuthContext";
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { logIn, googleSignIn } = useUserAuth();
    const [disabled, setDisabled] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await logIn(email, password).then((result) => {
                if (result === false) {
                    console.log("Navigate to Sign Up (User Exist in Firebase, but not in Firestore");
                    navigate("/signup");
                } else {
                    console.log("Navigate to Home (User Exist)");
                    navigate("/home");
                }
            });
        } catch (err) {
            setError(err.message);
            e.target.reset();
        }
    };

    const handleGoogleSignIn = async (e) => {
        e.preventDefault();
        setDisabled(true);
        try {
            googleSignIn().then((result) => {
                if (result === false) {
                    console.log("Navigate to Sign Up (User Does Not Exist");
                    navigate("/signup");
                } else {
                    console.log("Navigate to Home (User Exist)");
                    navigate("/home");
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <>
            <div class="container">
                <div class="row">
                    <div class="d-flex justify-content-center">
                        <div className="box">
                            <div className="mb-3 logo-placeholder">
                                <h2 className="inline bolded logo-white">Shift</h2>
                                <h2 className="inline bolded logo-black">MASTER</h2>
                            </div>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Control
                                        className="login-box"
                                        type="email"
                                        placeholder="Email"
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3 " controlId="formBasicPassword">
                                    <Form.Control
                                        className="login-box"
                                        type="password"
                                        placeholder="Password"
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="Submit">
                                        Log in
                                    </Button>
                                </div>
                            </Form>
                            <hr />
                            <div>
                                <GoogleButton
                                    className="g-btn custom-google-button login-box primary-text"
                                    type="dark"
                                    onClick={handleGoogleSignIn}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="mt-3 text-center sign-up-button primary-text">
                                Don't have an account? <Link to="/signup" className="custom-link">Sign up</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login