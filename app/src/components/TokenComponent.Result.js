import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';

const TokenComponentResult = (props) => {
    return (
        <div>
            <Tabs defaultActiveKey="idclaims" id="result-tab">
                <Tab eventKey="idclaims" title="ID Token Claims">
                <br></br>
                    <Table style={{ textAlign: 'left' }} striped hover responsive="sm">
                        <tbody>
                            <tr>
                                <th>Attribute</th>
                                <th>Value</th>
                            </tr>
                            {
                                props.idTokenClaims ? (
                                    Object.keys(props.idTokenClaims).map((key) => (
                                        <tr key={ key } >
                                            <td>{ key }</td>
                                            <td>{ props.idTokenClaims[key] }</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2">Not signed in yet</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                </Tab>
                <Tab eventKey="tokenResponse" title="Token Response">
                    <br></br>
                    <Table style={{ textAlign: 'left' }} striped hover responsive="sm">
                        <tbody>
                            <tr>
                                <th>Attribute</th>
                                <th>Value</th>
                            </tr>
                            {
                                props.accessTokenDetails ? (
                                    Object.keys(props.accessTokenDetails).map((key) => (
                                        <tr key={ key } >
                                            <td>{ key }</td>
                                            <td>{ props.accessTokenDetails[key] }</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2">Not signed in yet</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                </Tab>
                <Tab eventKey="results" title="Results">
                    <br></br>
                    <Table style={{ textAlign: 'left' }} striped hover responsive="sm">
                        <tbody >
                            <tr>
                                <th>Attribute</th>
                                <th>Value</th>
                            </tr>
                            {
                                props.resultDetails ? (
                                    Object.keys(props.resultDetails).map((key) => (
                                        <tr key={ key } >
                                            <td>{ key }</td>
                                            <td>{ props.resultDetails[key] }</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2">No results yet</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                </Tab>
            </Tabs>
        </div>
    );
}

export default TokenComponentResult;