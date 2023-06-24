import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import React from 'react';
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MyCalendar from "./components/MyCalendar";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserAuthContextProvider } from "./context/UserAuthContext";

function App() {
    return (
        <Container>
            <Row>
                <Col>
                    <UserAuthContextProvider>
                        <Routes>
                            <Route
                                path="/home"
                                element={
                                    <ProtectedRoute>
                                        <Home />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route
                                path="/calendar"
                                element={
                                    <ProtectedRoute>
                                        <Home />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </UserAuthContextProvider>
                </Col>
            </Row>
        </Container>
    );
}

export default App;