import { useContext } from "react";
import LoginContext from "../Contexts/LoginContext";
import { adminLogoutPath, csrf_token_cookie } from "../../../../../paths/clientPaths";
import getCookie from "./Cookies";
import { Link } from "react-router-dom";

export default function AdminLogout() {
    const [curUsername, setCurUsername] = useContext(LoginContext);

    fetch(adminLogoutPath, {
        method: "POST",
        credentials: "include",
        headers: {
            'X-CSRF-TOKEN': getCookie(csrf_token_cookie)
        }
    }).then(res => res.json())
    .then(result => {
        if (result?.error === false) {
            setCurUsername(false);
        } else {
            // todo
            alert("Something wrong happened!");
        }
    })

    return <>
        {curUsername? <></>:<h1>You have been logged out.</h1>}
        <Link to='/'>Back to Homepage</Link>
    </>
}