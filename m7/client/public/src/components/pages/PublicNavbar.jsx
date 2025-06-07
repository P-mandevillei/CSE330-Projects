import { useContext } from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import LoginContext from "../Contexts/LoginContext";

export default function PublicNavbar() {

    const [curUsername, setCurUsername] = useContext(LoginContext);

    return <>
    <Navbar bg="dark" data-bs-theme="dark" sticky="top" expand="lg" className="bg-body-tertiary">
    <Container>
        <Navbar.Brand as={Link} to='/'>Navigate</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
            <Nav.Link as={Link} to='/'>Home</Nav.Link>
            <Nav.Link as={Link} to='/contribute'>Contribute</Nav.Link>
            {curUsername? <>
                <Nav.Link as={Link} to='/logout'>Logout</Nav.Link>
                <Nav.Link as={Link} to='/download'>Download Signatures</Nav.Link>
                <Nav.Link as={Link} to='/reports'>Specimen Reports</Nav.Link>
            </>
            : <Nav.Link as={Link} to='/login'>Admin</Nav.Link>}
        </Nav>
        </Navbar.Collapse>
    </Container>
    </Navbar>
    </>
}