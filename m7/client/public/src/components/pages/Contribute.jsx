import { useRef, useState } from "react";
import { Card, Form, Button, Container, Row, Col } from "react-bootstrap";
import { reportPath } from "../../../../../paths/clientPaths";
import { useNavigate } from "react-router-dom";
import { isValidGeolocation } from "../auth/SubmissionValidations";

export default function Contribute() {
    const inputFiles = useRef();

    // latitude, longitude
    const [pos, setPos] = useState([null, null]);

    function getGeolocation() {
        navigator.geolocation.getCurrentPosition(
        (position) => {
            setPos([position.coords.latitude, position.coords.longitude])
        }, 
        (err)=> {
            alert("Error: Cannot get your location");
            console.log(err);
        })
    }

    function uploadFiles(e) {
        e?.preventDefault();

        const files = inputFiles.current.files;
        const formData = new FormData();

        [...files].map(cur => formData.append("files", cur));
        formData.append("time", Date.now());
        formData.append("latitude", pos[0]);
        formData.append("longitude", pos[1]);
        
        if (files.length === 0) {
            alert("Please upload at least one picture!");
            return;
        }
        if (!isValidGeolocation(pos[0], pos[1])) {
            alert("Please record your location.");
            return;
        }

        let status = 0;
        fetch(reportPath, {
            method: "POST",
            body: formData
        }).then(res => {
            status = res.status;
            return res.json()
        })
        .then(result => {
            if (status === 200) {
                alert("Success!");
                setPos([null, null]);
            } else {
                alert(result?.msg ?? "Something went wrong.");
            }
        }) // todo: error msg
        .catch(err => console.log(err));
    }

    return <Card>
        <h1 className='center'>Contribute by Reporting the Critters You Saw!</h1>
        <Form.Label htmlFor="reportPicture">Make sure you report only one encounter per submission. You can upload multiple pictures.</Form.Label>
        <Form.Control id="reportPicture" type="file" multiple ref={inputFiles}/>

        <Container>
            <Row>
                <Col xs={8}>
                Your location: ({pos[0]?? "Invalid"}, {pos[1]?? "Invalid"})
                </Col>
                <Col xs={4}>
                <Button onClick={getGeolocation} variant="secondary">Get Location</Button>
                </Col>
            </Row>
        </Container>
        <Button onClick={uploadFiles}>Submit</Button>
    </Card>
}