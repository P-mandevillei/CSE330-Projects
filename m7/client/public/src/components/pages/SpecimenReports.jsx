import {useEffect, useId, useState} from "react"
import { csrf_token_cookie, getReportsPath } from "../../../../../paths/clientPaths";
import getCookie from "../auth/Cookies";
import ReportCard from "./ReportCard";
import { Col, Container, Form, Row, Card } from "react-bootstrap";

export default function SpecimenReports() {

    const [reports, setReports] = useState([]);

    function updateReports() {
        fetch(getReportsPath, {
            method: "POST",
            credentials: 'include',
            headers: {
                "X-CSRF-TOKEN": getCookie(csrf_token_cookie)
            }
        }).then(res => {
            if (res.status === 200) {
                return res.json()
            } else {
                // todo
                return []
            }
        })
        .then(result => {
            setReports(result);
        })
        .catch(err => console.log(err));
    }

    useEffect(()=> {
        updateReports();
    }, [])

    const [validSelect, setValidSelect] = useState('all');
    const [idSelect, setIdSelect] = useState('all');

    const displayReports = reports.filter(cur => {
        let ifValid = false;
        switch(validSelect) {
            case 'validated':
                ifValid = cur?.isValidated?? false;
                break;
            case 'not_validated':
                ifValid = !(cur?.isValidated);
                break;
            case 'all':
            default:
                ifValid = true;
                break;
        }

        let ifId = false;
        switch(idSelect) {
            case 'ided':
                ifId = cur?.sid? true: false;
                break;
            case 'not_ided':
                ifId = !(cur?.sid);
                break;
            case 'all':
            default:
                ifId = true;
                break;
        }

        return ifValid && ifId;
    })

    const validSelectId = useId();
    const idSelectId = useId();

    return <Container>
        <Row>
        <Col xs={12} sm={6}>
        <Card border="light">
            <Form.Label htmlFor={validSelectId}>Validation Status</Form.Label>
            <Form.Select id={validSelectId} value={validSelect} onChange={e=>setValidSelect(e.target.value)}>
                <option value='all'>All</option>
                <option value="validated">Validated</option>
                <option value="not_validated">Not Validated</option>
            </Form.Select>
        </Card>
        </Col>
        <Col xs={12} sm={6}>
        <Card border="light">
            <Form.Label htmlFor={idSelectId}>Id Status</Form.Label>
            <Form.Select id={idSelectId} value={idSelect} onChange={e=>setIdSelect(e.target.value)}>
                <option value='all'>All</option>
                <option value='ided'>Identified</option>
                <option value='not_ided'>Not Identified</option>
            </Form.Select>
        </Card>
        </Col>
        </Row>
        <Row>
            {displayReports.map(cur => 
            <Col sm={12} md={6} lg={4} key={cur._id.$oid}>
                <ReportCard {...cur} updateReports={updateReports}/>
            </Col>
            )}
        </Row>
    </Container>
}