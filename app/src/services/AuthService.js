//import * as Msal from 'msal';
import * as Msal from "@azure/msal-browser";

export default class AuthService {

  msalConfig = {
    auth: {
      clientId: process.env.REACT_APP_MSAL_CLIENT_ID,
      authority: process.env.REACT_APP_MSAL_AUTHORITY,
      redirectUri: document.getElementById('root').baseURI,
    },
    cache: {
      cacheLocation: "sessionStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
  };
    
  // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
  tokenRequest = {};
   
  username = "";

  constructor(authority) {
    if (authority)
      this.msalConfig.auth.authority = authority;

    //MSAL v1.X:
    //this.app = new Msal.UserAgentApplication(this.msalConfig);
    this.app = new Msal.PublicClientApplication(this.msalConfig);

    // Redirect: once login is successful and redirects with tokens, call Graph API
    this.app.handleRedirectPromise().then(this.handleResponse).catch(err => {
        console.error(err);
    });
  } 

  handleResponse = (resp) => {
    if (resp !== null) {
      this.username = resp.account.username;
    } else {
      /**
       * See here for more info on account retrieval:
       * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
       */
      const currentAccounts = this.app.getAllAccounts();
      if (currentAccounts === null) {
        return;
      } else if (currentAccounts.length > 1) {
        // Add choose account code here
        console.warn("Multiple accounts detected.");
      } else if (currentAccounts.length === 1) {
        this.username = currentAccounts[0].username;
      }
    }
  }

  signIn = () => {
    return this.app.loginPopup(this.tokenRequest).then(
      (idTokenResponse) => {
        //this.handleResponse
        this.username = idTokenResponse.account.username;
        return idTokenResponse;
      }
      //,
      //(error) => {
      //  t
      //  console.error(error);
      //}
    );
  }

  signInRedirect = () => {
    this.app.loginRedirect(this.tokenRequest);
  }

  signOut = () => {
    const logoutRequest = {
      account: this.app.getAccountByUsername(this.username)
    };

    return this.app.logout(logoutRequest).then(
      () => {return true;}
    );
  }

  //setMsalAuthority = (authority) => {
  //  this.msalConfig.auth.authority = authority;
  //  this.app = new Msal.PublicClientApplication(this.msalConfig);
  //}

  setTokenRequestScope = (scope) => {
    this.tokenRequest.scopes = scope.split(' ');
  }

  getAccessToken = () => {
    this.tokenRequest.account = this.app.getAccountByUsername(this.username);
    return this.app.acquireTokenSilent(this.tokenRequest).then(
      (accessTokenResponse) => {
        //console.log(accessTokenResponse.accessToken);
        return accessTokenResponse;
      },
      (errorSilent) => {
        console.log(`[ERROR] ${errorSilent.errorCode} : ${errorSilent.errorMessage}`);
        console.log("silent token acquisition failed, acquiring token interactively... ");

        return this.app.acquireTokenPopup(this.tokenRequest).then(
          (accessTokenResponse) => {
            return accessTokenResponse;
          }
          //,
          //(error) => {
          //  console.error(error);
          //}
        );
      }
    );
  };

  getTokenRedirect = () =>{
    this.tokenRequest.account = this.app.getAccountByUsername(this.username);
    return this.app.acquireTokenSilent(this.tokenRequest).then(
      (accessTokenResponse) => {
        //console.log(accessTokenResponse.accessToken);
        return accessTokenResponse;
      },
      (error) => {
        console.log(`[ERROR] ${error.errorCode} : ${error.errorMessage}`);
        console.log("silent token acquisition failed, acquiring token interactively... ");
        // fallback to interaction when silent call fails
        return this.app.acquireTokenRedirect(this.tokenRequest)
      }
    )
  };
}