import React, { Component } from 'react'

import AuthService from '../services/AuthService'
import ApiService from '../services/ApiService'

import TokenComponentForm from './TokenComponent.Form'
import TokenComponentResult from './TokenComponent.Result'
import TokenComponentMessages from './TokenComponent.Messages'

class TokenComponent extends Component {
    static displayName = TokenComponent.name;

    constructor() {
        super();

        this.authService = new AuthService();
        this.apiService = new ApiService();

        this.authBaseUrl = 'https://login.microsoftonline.com/';

        this.state = {
            authEndpoint: this.authBaseUrl + 'organizations',
            tenant: '{type the tenant id}',
            accountType: 'all',
            authScope: '.default',
            signinScope: 'profile',
            account: null,
            idTokenClaims: null,
            accessTokenDetails: null,
            resultDetails: '',
            msgShow: false,
            msgLevel: 'info',
            msgTitle: '',
            msgText: '',
            graphBaseUrl: process.env.REACT_APP_GRAPH_ENDPOINT,
            profilePath: 'me',
            peoplePath: 'me/people',
            groupsPath: 'groups',
            api1Url: process.env.REACT_APP_API1_URL,
            api2Url: process.env.REACT_APP_API2_URL,
        };

        this.showMessage = this.showMessage.bind(this);
        this.hideMessage = this.hideMessage.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.signInButton_Click = this.signInButton_Click.bind(this);
        this.signOutButton_Click = this.signOutButton_Click.bind(this);
        this.profileButton_Click = this.profileButton_Click.bind(this);
        this.peopleButton_Click = this.peopleButton_Click.bind(this);
        this.groupsButton_Click = this.groupsButton_Click.bind(this);
        this.api1Button_Click = this.api1Button_Click.bind(this);
        this.api2Button_Click = this.api2Button_Click.bind(this);
    }

    componentDidMount() {
        //this.refreshOathTokenItems();
    }

    handleInputChange(event) {
        //event.preventDefault();
        const target = event.target;
        const id = target.id;
        var value = target.value;

        if (id === "accountType")
        {
            this.setAuthEndpoint(value);
        }
        
        if (id === "signinScope")
        {
            this.setAuthScope(value);
        }

        if (id === "authEndpoint")
        {
            // extract tenant ID to keep state
            this.setState({ tenant: value.substring(value.lastIndexOf('/') + 1)});
            this.updateMsalAuthority(value);
        }
        
        if (id === "authScope")
        {
            this.authService.setTokenRequestScope(value);
        }
        
        this.setState({ [id]: value });
    }

    setAuthEndpoint(endpoint){
        var authEndpoint;
        if (endpoint === 'tenant')
            authEndpoint = this.authBaseUrl + this.state.tenant;
        else
            authEndpoint = this.authBaseUrl + endpoint;

        this.setState({ authEndpoint: authEndpoint});
        this.updateMsalAuthority(authEndpoint);
    }

    setAuthScope(scope){
        var authScope = null;
        switch(scope){
            case 'profile':
                authScope = 'user.read';
                break;
            case 'user':
                authScope = 'user.read people.read';
                break;
            case 'all':
                authScope = 'user.read people.read group.read.all';
                break;
            case 'api1':
                authScope = process.env.REACT_APP_API1_SCOPE;
                break;
            case 'api2':
                authScope = process.env.REACT_APP_API2_SCOPE;
                break;
            default:
                authScope = '.default';
        }
        this.setState({ authScope: authScope});


        this.authService.setTokenRequestScope(authScope);
    }

    updateMsalAuthority(authEndpoint){
        this.authService = null;
        this.authService = new AuthService(authEndpoint);
    }

    parseTokenResult(value){
        var exclude = ['account', 'idTokenClaims'];
        var result = {};
        Object.keys(value).forEach((key) => {
            if (!exclude.includes(key)) {
                if (value[key]){
                    var data = value[key].toString();
                    result[key] = data;
                    //result[key] = data.length < 80 ? data : data.substring(0,80) + '...' ;
                }
                else
                result[key] = '';
            }
        });

        return result;
    }

    showMessage(level, title, text){
        this.setState({
            msgLevel: level,
            msgTitle: title,
            msgText: text,
            msgShow: true
        })
    }

    hideMessage(){
        this.setState({
            msgShow: false,
            msgTitle: '',
            msgText: ''
        })
    }

    signInButton_Click(){
        this.authService.signIn().then(
            (authResponse) => {
                if (authResponse)
                {
                    this.setState({accessTokenDetails: this.parseTokenResult(authResponse)});
                    //this.setState({account: this.parseTokenResult(authResponse.account)})
                    this.setState({idTokenClaims: this.parseTokenResult(authResponse.idTokenClaims)});
                    this.setState({resultDetails: ''});
                    //this.showMessage('info', 'Success', 'Token received.')
                }
            },
            (error) => {
                this.showMessage('danger', 'Error', error.message)
                console.log(error);
            }
        );
    }

    signOutButton_Click(){
        this.authService.signOut().then(
            () => {
                this.setState({accessTokenDetails: null});
                this.setState({account: null});
                this.setState({idTokenClaims: null});
                this.setState({resultDetails: ''});
            },
            (error) => {
                console.log(error);
            }
        );
    }

    callApi(endpoint){
        this.authService.getAccessToken().then(
            (authResponse) => {
                if (authResponse)
                {
                    this.setState({accessTokenDetails: this.parseTokenResult(authResponse)});
                    this.setState({account: this.parseTokenResult(authResponse.account)});
                    this.setState({idTokenClaims: this.parseTokenResult(authResponse.idTokenClaims)});

                    this.apiService.fetchData(endpoint, authResponse.accessToken).then(
                        (apiResponse) => {
                            this.setState({resultDetails: apiResponse});
                        },
                        (err) => {
                            this.setState({resultDetails: ''});
                            var message = err.message;
                            if (err.response) {
                                switch (err.response.status) {
                                    case 403:
                                        message = message + ', verify that you selected the right scope to call the API!';
                                        break;
                                    case 500:
                                        message =  message + ', did you remember to update the Azure Function Configuration?';
                                        break;
                                    default:
                                        break;
                                    }
                            }
                            else {
                                message = err.message === 'Network Error' ? message + ', did you remember to configure CORS for the Azure Function?' : message;
                            }
                            this.showMessage('danger', 'Error', message)
                            console.log(err);
                        }
                    )
                }
            },
            (error) => {
                this.setState({accessTokenDetails: null});
                this.setState({resultDetails: ''});
                this.showMessage('danger', 'Error', error.message)
                console.log(error);
            }
        );
    }

    profileButton_Click(){
        this.callApi(this.state.graphBaseUrl + this.state.profilePath);
    }

    peopleButton_Click(){
        this.callApi(this.state.graphBaseUrl + this.state.peoplePath);
    }

    groupsButton_Click(){
        this.callApi(this.state.graphBaseUrl + this.state.groupsPath);
    }

    api1Button_Click(){
        this.callApi(this.state.api1Url);
    }

    api2Button_Click(){
        this.callApi(this.state.api2Url);
    }

    
    render() {
        return (
            <div className="container-fluid">
                <TokenComponentForm
                    accountType={this.state.accountType}
                    authEndpoint={this.state.authEndpoint}
                    signinScope={this.state.signinScope}
                    authScope={this.state.authScope}
                    handleInputChange={this.handleInputChange}
                    signInButton_Click={this.signInButton_Click}
                    signOutButton_Click={this.signOutButton_Click}
                    profileButton_Click={this.profileButton_Click}
                    peopleButton_Click={this.peopleButton_Click}
                    groupsButton_Click={this.groupsButton_Click}
                    api1Button_Click={this.api1Button_Click}
                    api2Button_Click={this.api2Button_Click}
                />
                <br></br>
                <TokenComponentMessages
                    msgShow={this.state.msgShow}
                    msgLevel={this.state.msgLevel}
                    msgTitle={this.state.msgTitle}
                    msgText={this.state.msgText}
                    showMessage={this.showMessage}
                    hideMessage={this.hideMessage}
                />
                <TokenComponentResult
                    idTokenClaims={this.state.idTokenClaims}
                    accessTokenDetails={this.state.accessTokenDetails}
                    resultDetails={this.state.resultDetails}
                />
            </div>
        );
    }
}

export default TokenComponent