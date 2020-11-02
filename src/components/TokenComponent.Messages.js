import React from 'react';
import Alert from 'react-bootstrap/Alert';

const TokenComponentMessages = (props) => {

    return (
        <Alert variant={props.msgLevel} show={props.msgShow} onClose={() => props.hideMessage(false)} dismissible>
            <Alert.Heading>{props.msgTitle}</Alert.Heading>
            <p>{props.msgText}</p>
        </Alert>
    );
}

export default TokenComponentMessages;