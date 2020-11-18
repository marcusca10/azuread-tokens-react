import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const TokenComponentForm = (props) => {

    return (
      <Form>
        <Form.Row>
          <Col>
            <Form.Group  as={Row} controlId="accountType" value={props.accountType} onChange={props.handleInputChange}>
              <Form.Label column sm="2">Account Type</Form.Label>
              <Col sm="10">
                <Form.Control as="select">
                  <option value="organizations">Organizations</option>
                  <option value="tenant">This Tenant</option>
                  <option value="common">All Users</option>
                  <option value="consumers">Consumers</option>
                </Form.Control>
              </Col>
            </Form.Group>
          </Col>
          <Col>
            <Form.Control id="authEndpoint" value={props.authEndpoint} onChange={props.handleInputChange} />
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group as={Row} controlId="signinScope" value={props.signinScope} onChange={props.handleInputChange}>
              <Form.Label column sm="2">Sign In Scope</Form.Label>
              <Col sm="10">
                <Form.Control as="select">
                  <option value="static">Static Consent</option>
                  <option value="profile">Just Profile</option>
                  <option value="user">User Consent</option>
                  <option value="all">Everything</option>
                  <option value="api1">Alpine flowers API</option>
                  <option value="api2">Cactus API</option>
                </Form.Control>
              </Col>
            </Form.Group>
          </Col>
          <Col>
            <Form.Control id="authScope" value={props.authScope} onChange={props.handleInputChange} />
          </Col>
        </Form.Row>

        <Button variant="primary" onClick={props.signInButton_Click}>Sign In</Button>{' '}
        <Button variant="primary" onClick={props.profileButton_Click}>Profile</Button>{' '}
        <Button variant="primary" onClick={props.peopleButton_Click}>People</Button>{' '}
        <Button variant="primary" onClick={props.groupsButton_Click}>Groups</Button>{' '}
        <Button variant="primary" onClick={props.api1Button_Click}>API 1</Button>{' '}
        <Button variant="primary" onClick={props.api2Button_Click}>API 2</Button>{' '}
        <Button variant="primary" onClick={props.signOutButton_Click}>Sign Out</Button>{' '}

      </Form>
    );
}

export default TokenComponentForm;