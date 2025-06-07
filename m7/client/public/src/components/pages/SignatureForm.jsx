import { useRef, useState } from "react"
import {Button, Card, Container, Form, Row, Col, ToastContainer, Toast} from "react-bootstrap"
import { isValidEmail, isValidUSPhone, isValidZipCode } from "../auth/SubmissionValidations";
import { googleRecaptchaClientKey, signPath } from "../../../../../paths/clientPaths";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignatureForm(props) {

    const firstName = useRef("");
    const [firstNameWarning, setFirstNameWarning] = useState("");
    const lastName = useRef("");
    const [lastNameWarning, setLastNameWarning] = useState("");
    const email = useRef("");
    const [emailWarning, setEmailWarning] = useState("");
    const zipCode = useRef("");
    const [zipCodeWarning, setZipCodeWarning] = useState("");
    const phone = useRef("");
    const [phoneWarning, setPhoneWarning] = useState("");
    const address1 = useRef("");
    const [address1Warning, setAddress1Warning] = useState("");
    const address2 = useRef("");
    const [address2Warning, setAddress2Warning] = useState("");

    const recaptchaRef = useRef();

    function resetWarnings() {
        setFirstNameWarning("");
        setLastNameWarning("");
        setEmailWarning("");
        setZipCodeWarning("");
        setPhoneWarning("");
        setAddress1Warning("");
        setAddress2Warning("");
    }

    function resetFields() {
        firstName.current.value = "";
        lastName.current.value = "";
        email.current.value = "";
        zipCode.current.value = "";
        phone.current.value = "";
        address1.current.value = "";
        address2.current.value = "";
    }

    function SubmitSignature(e) {
        e?.preventDefault();
        resetWarnings();

        if (!firstName.current.value) {
            setFirstNameWarning("You should enter your first name above!");
            return;
        }
        if (!lastName.current.value) {
            setLastNameWarning("You should enter your last name above!");
            return;
        }
        if (!isValidEmail(email.current.value)) {
            setEmailWarning("Please enter a valid email address.");
            return;
        }
        if (!isValidZipCode(zipCode.current.value)) {
            setZipCodeWarning("Please enter a valid zip code.");
            return;
        }
        // optional fields
        if (phone.current.value && !isValidUSPhone(phone.current.value)) {
            setPhoneWarning("Please enter a valid phone number in the format xxxxxxxxxx");
            return;
        }

        const data = {
            "firstName": firstName.current.value,
            "lastName": lastName.current.value,
            "email": email.current.value,
            "zipCode": zipCode.current.value,
            "phone": phone.current.value?? "",
            "address1": address1.current.value?? "",
            "address2": address2.current.value?? "",
            "recaptchaToken": recaptchaRef.current.getValue()
        }

        fetch(signPath, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.status === 200) {
                resetFields();
                // todo: decorate
                alert("Submission success!");
                return;
            }
            return res.json();
        })
        .then(result => {
            // todo
            if (result?.msg){
                alert(result.msg);
            }
        })
        .catch(err => console.log(err));

    }

    return <Card border="light">
        <h1 className="center">Sign the petition!</h1>
        <Container>
        <Row>
        
        <Col sm={12} md={6} lg={4}>
        <Form.Label htmlFor="sigFirstName">First Name<span className="warning">*</span></Form.Label>
        <Form.Control id="sigFirstName" ref={firstName}/>
        {firstNameWarning? <p className="warning">{firstNameWarning}</p>:<></>}
        </Col>

        <Col sm={12} md={6} lg={4}>
        <Form.Label htmlFor="sigLastName">Last Name<span className="warning">*</span></Form.Label>
        <Form.Control id="sigLastName" ref={lastName}/>
        {lastNameWarning? <p className="warning">{lastNameWarning}</p>:<></>}
        </Col>

        <Col sm={12} md={6} lg={4}>
        <Form.Label htmlFor="sigEmail">Email<span className="warning">*</span></Form.Label>
        <Form.Control id="sigEmail" ref={email}/>
        {emailWarning? <p className="warning">{emailWarning}</p>:<></>}
        </Col>

        <Col sm={12} md={6} lg={4}>
        <Form.Label htmlFor="sigZipCode">Zip Code<span className="warning">*</span></Form.Label>
        <Form.Control id="sigZipCode" ref={zipCode}/>
        {zipCodeWarning? <p className="warning">{zipCodeWarning}</p>:<></>}
        </Col>

        <Col sm={12} md={6} lg={4}>
        <Form.Label htmlFor="sigPhone">Phone Number (optional)</Form.Label>
        <Form.Control id="sigPhone" ref={phone}/>
        {phoneWarning? <p className="warning">{phoneWarning}</p>:<></>}
        </Col>

        <Col sm={12} lg={6}>
        <Form.Label htmlFor="sigAddress1">Address Line 1 (optional)</Form.Label>
        <Form.Control id="sigAddress1" ref={address1}/>
        {address1Warning? <p className="warning">{address1Warning}</p>:<></>}
        </Col>

        <Col sm={12} lg={6}>
        <Form.Label htmlFor="sigAddress2">Address Line 2 (optional)</Form.Label>
        <Form.Control id="sigAddress2" ref={address2}/>
        {address2Warning? <p className="warning">{address2Warning}</p>:<></>}
        </Col>
        </Row>
        </Container>        
        <br />
        <div className="center">
        <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={googleRecaptchaClientKey}
        />
        </div>
        <br />
        
        <Button onClick={SubmitSignature}>Sign!</Button>
    </Card>
}