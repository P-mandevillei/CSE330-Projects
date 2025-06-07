import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import { Container, Row, Col } from "react-bootstrap";

export default function PublicHomepage() {
    return <>
    <PublicNavbar />
    
    <Outlet />
    </>
}