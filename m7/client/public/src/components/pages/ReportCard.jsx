import { Button, Card, Carousel, Container, Form, Row, Col } from "react-bootstrap";

import ReportPicture from "./ReportPicture";
import { useId, useRef, useState } from "react";
import { csrf_token_cookie, deleteReportPath, updateReportPath } from "../../../../../paths/clientPaths";
import getCookie from "../auth/Cookies";

export default function ReportCard(props) {
    function formatDate(date) {
        return `${date.toLocaleTimeString()}, ${date.toLocaleDateString()}`;
    }

    const [showActions, setShowActions] = useState(false);
    const speciesId = useRef();

    async function updateReport(field, entry) {
        const data = {
            "target": {
                "field": field,
                "entry": entry,
            },
            "id": props._id.$oid
        }

        let success = false;
        let status = 0;

        await fetch(updateReportPath, {
            method: "PUT",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "X-CSRF-TOKEN": getCookie(csrf_token_cookie)
            },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.status === 200) {
                props.updateReports();
            }
            status = res.status;
            return res.json()
        })
        .then(result => {
            if (!result?.error && status===200) {
                success = true;
            } else if (status === 401) {
                alert("Unauthorized action!");
                success = false;
            } else {
                alert (result?.msg ?? "Something went wrong.");
                success = false;
            }
        }).catch(err => {console.log(err); success = false;});
        return success;
    }

    function updateSpeciesId(e) {
        e?.preventDefault();

        const speciesIdInput = speciesId.current.value;
        if (!speciesIdInput) {
            alert("Please Enter a Valid Identification");
            return;
        }
        updateReport("sid", speciesIdInput).then(
            returnCode => {
                if (returnCode) {
                    speciesId.current.value = "";
                }
            }
        )
    }

    function changeValidation(e) {
        e?.preventDefault();

        const validation = !(props?.isValidated);
        updateReport("isValidated", validation);
    }

    function deleteReport(e) {
        e?.preventDefault();

        const data = {'id': props._id.$oid, 'paths': props.paths};
        let status = 0;
        fetch(deleteReportPath, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "X-CSRF-TOKEN": getCookie(csrf_token_cookie)
            },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.status === 200) {
                props.updateReports();
            }
            status = res.status;
            return res.json()
        }).then(result => {
            if (status === 401) {
                alert("Unauthorized action!");
                return;
            }
            if (result?.error) {
                alert(result?.msg ?? "Something went wrong.");
            }
        }).catch(err => {
            console.log(err);
        });
    }

    const identifySpeciesId = useId();

    return <Card style={{padding: "0.5em"}}>
        <span>{props?.isValidated? "✅ Validated!" : "🔴 Not Validated"} </span>
        <Carousel data-bs-theme="dark">
            {props.paths.map(cur => 
                <Carousel.Item key={cur}>
                    <ReportPicture path={cur}/> 
                </Carousel.Item>
            )}
        </Carousel>
        <p className="center">Position: ({props.latitude}, {props.longitude})</p>
        <p className="center">Record Time: {formatDate(new Date(props.time*1))}</p>
        <p className="center">Species: {props?.sid?? <span className="greyify"> unidentified </span>}</p>
        <Button variant={showActions? "secondary": "primary"} onClick={(e)=>{e?.preventDefault(); setShowActions(old=>!old)}}>{showActions? "Hide Actions": "Show actions"}</Button>
        {showActions? <>
            <Form.Label className='center' htmlFor={identifySpeciesId}>Update Species Identification</Form.Label>
            <Form.Control id={identifySpeciesId} placeholder="Add Identification" ref={speciesId}/>
            <Button onClick={(e)=>updateSpeciesId(e)}>Update Identification</Button>
            <Button variant={props?.isValidated? "secondary":"success"} onClick={(e)=>changeValidation(e)}>{props?.isValidated?"Invalidate":"Validate"}</Button>
            <Button variant="danger" onClick={(e)=>deleteReport(e)}>Delete Report</Button>
        </>: <></>}
    </Card>
}