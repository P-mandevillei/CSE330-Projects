import { Button, Card } from "react-bootstrap";
import { csrf_token_cookie, downloadCSVName, downloadCSVPath } from "../../../../../paths/clientPaths";
import getCookie from "../auth/Cookies";
import { useEffect, useState, useRef } from "react";
import TrendPlot from "./TrendPlot";

export default function Download() {

    const [CSVurl, setCSVurl] = useState("");
    const urlRef = useRef();

    function exportCSV() {
        fetch(downloadCSVPath, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CSRF-TOKEN": getCookie(csrf_token_cookie)
            }
        }).then(res => {
            if (res.status === 200) {
                return res.blob();
            } else {
                alert("You are not authorized for this action!");
                return "";
            }
        })
        .then(blob => {
            // https://stackoverflow.com/questions/3749231/download-file-using-javascript-jquery
            if (blob!=="") {
                const url = window.URL.createObjectURL(blob);
                setCSVurl(url);
            }
        }).catch(err => console.log(err));
    }

    useEffect(() => {
        if (CSVurl !== "") {
            urlRef.current.click();
            window.URL.revokeObjectURL(CSVurl);
            setCSVurl("");
        }
    }, [CSVurl])

    return <>
        <Card>
            <TrendPlot />
            <Button onClick={exportCSV}>Export csv</Button>
        </Card>
        <a style={{"display": 'none'}} href={CSVurl} download={downloadCSVName} ref={urlRef}/>
    </>
}