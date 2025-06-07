import { useContext, useRef } from "react";
import { Card, Container, Form, Row, Col, Button } from "react-bootstrap";

import { adminLoginPath } from "../../../../../paths/clientPaths";
import getCookie from "./Cookies";
import LoginContext from "../Contexts/LoginContext";
import { useNavigate } from "react-router-dom";

export default function AdminLogin(props) {
    const username = useRef();
    const password = useRef();
    const [curUsername, setCurUsername] = useContext(LoginContext);
    const nav = useNavigate();

    const login = (e) => {
        e?.preventDefault();

        const data = {
            "username": username.current.value, 
            "password": password.current.value
        };

        fetch(adminLoginPath, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
        .then(result => {
            if (result?.error === false) {
                setCurUsername(data.username);
                nav('/');
            }
            //todo
        })
        .catch(err => console.log(err)); 
    }

    return <Card border="light">
    <h1 className="center">Admin Login</h1>
    <Container>
    <Row>
        <Col xs={12} sm={6}>
        <Form.Label htmlFor="adminUsername">Username</Form.Label>
        <Form.Control id="adminUsername" ref={username}/>
        </Col>
        <Col xs={12} sm={6}>
        <Form.Label htmlFor="adminPassword">Password</Form.Label>
        <Form.Control type="password" id="adminPassword" ref={password}/>
        </Col>
    </Row>
    </Container>
    <br />
    <Button onClick={login}>Submit</Button>
    </Card>
}