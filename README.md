# Azure AD Tokens Demo

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and [Create a C# function in Azure from the command line](https://docs.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-csharp).

The [Microsoft Authentication Library for JavaScript (MSAL.js)](https://github.com/AzureAD/microsoft-authentication-library-for-js) implementation is based on the following article: 
[Sign in users and call the Microsoft Graph API from a JavaScript single-page app (SPA) using auth code flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-javascript-auth-code).

Login with your GitHub credentials and click on the `fork` button to create a repository for under your account.

![GitHub Fork](/docs/readme-fork.png)

## Run it on Azure Static Web Apps

> **NOTE:** The application will not work after the first deployment, some additional information from the Azure deployment are required before being able to create the Azure AD application.

In the project directory, you can run:

### Create a GitHub Personal Access Token (PAT)

This is used to setup the GitHub Actions workflow file and API secrets required to deploy the app code to Azure Static Web Apps.

> **NOTE:** Treat your tokens like passwords and keep them secret.

Follow the steps described here to create the token [Creating a personal access token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token)

Select 'workflows' under scopes, all the required permissions are automatically selected.

![PAT scopes](/docs/readme-pat.png)

### Deploy to Azure

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fmarcusca10%2Fazuread-tokens-react%2Fmain%2Fazuredeploy.json)

Login with the Azure account in the subscription you want to deploy the application. In the custom deployment page fill in the parameters to create the Azure Static Web App.

Parameter | Description
--------- | -----------
Name | The name of the static site to create (i.e. my-react-demo).
Repository Url | The URL for the FORKED repository (i.e. https://github.com/{your GitHub account} /azuread-tokens-react).
Repository Token | The GitHub PAT token created earlier.

![Azure deployment](/docs/readme-deploy.png)

After the template validation, click the `Create` button. When the deployment finishes click on `Go to resource`.

In the repository click the link for the Static Web App, you will need to grab some information about you application. Copy the value for URL: i.e. https://delightful-water-012345678.azurestaticapps.net.

![Azure Static App](/docs/readme-staticapp.png)

## Create Azure AD Applications

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

### Client Application

New app registration:

* Give the app a name: Tokens Demo React.
* Select 'Accounts in this organizational directory only (O365 MCANET only - Single tenant)'.
* Write down the value for the 'Application (client) ID'.

Configure authentication: 

1. Select the 'Authentication' tab and click 'Add a platform':
1. Select 'Single-page application'
1. Paste the app URL from your deployment in the 'Redirect URIs' field.

![SPA](/docs/readme-spa.png)

#### Update the Client App 

Open your GitHub repository fork (i.e. https://github.com/{your GitHub account}/azuread-tokens-react

You will need to update environment variables for the client app, find the file `/app/.env`. Click the `edit` button and change the following values:

Enter the Client Id (Application ID obtained from the Azure portal):

```
REACT_APP_MSAL_CLIENT_ID=ba74781c2-53c2-442a-97c2-3d60re42e423
```

Click `Commit changes`.

> **NOTE:** Commit triggers a GitHub workflow that updates the deployed Azure Static Web App with the updated values.

### API Applications

> **NOTE:** The sample uses two different APIs as resources: Herbs Catalog and Cactus Catalog. You need to create an app registration for each of them.

New registration

* Name: 'Tokens Demo {__Herbs/Cactus__} API'. 
* Select 'Accounts in this organizational directory only (O365 MCANET only - Single tenant)'.

Select the `Expose an API` tab and click `Add a scope`. Use the Static Web Site URL plus the suffix for the API your exposing (`/api/herbs` or `/api/cactus`) as `Application ID URI` (i.e. https://delightful-water-012345678.azurestaticapps.net/api/herbs).

Use the following table to add a scope to the API:

Parameter | Value
--------- | -----
Scope name | Catalog.View.All
Who can consent? | Admins and users
Admin consent display name | Read catalog items
Admin consent description | Allows the app to read the signed-in user's catalog items.
User consent display name | Read your catalog items
User consent description | Allows the app to read your catalog items.
State | Enabled

Copy the value for the created scope (i.e. https://delightful-water-012345678.azurestaticapps.net/api/herbs/Catalog.View.All)

#### Update the Azure Function Configuration 

Open the Static Web App in the Azure Portal. Select the `Configuration` tab and click the `Add` button, repeat the steps for each of the values in the following table:

Name | Description | Sample value
---- | ----------- | ------------
AZUREAD_AUTHORIZED_TENANTS | Your tenant ID | 5453406a-87cf-4d32-8167-e5959fafafaa
AZUREAD_AUDIENCE1 | The registered app ID for the Herbs Catalog API | https://delightful-water-012345678.azurestaticapps.net/api/herbs
AZUREAD_AUDIENCE2 | The registered app ID for the Cactus Catalog API | https://delightful-water-012345678.azurestaticapps.net/api/cactus

Click `Save` when you finished.

#### Update the Client App 

Open your GitHub repository fork (i.e. https://github.com/{your GitHub account}/azuread-tokens-react
You will need to update environment variables for the client app, find the file `/app/.env`. Click the `edit` button and change the following values:

The Azure Static Web Site URL plus the Herbs API path `/api/herbs`.
```
REACT_APP_API1_URL=https://delightful-water-012345678.azurestaticapps.net/api/herbs
```

The scope you created for the Herbs API.

```
REACT_APP_API1_SCOPE=https://delightful-water-012345678.azurestaticapps.net/api/herbs/Catalog.View.All
```

The Azure Static Web Site URL plus the Cactus API path `/api/cactus`.

```
REACT_APP_API2_URL=https://delightful-water-012345678.azurestaticapps.net/api/cactus
```

The scope you created for the Cactus API.

```
REACT_APP_API2_SCOPE=https://delightful-water-012345678.azurestaticapps.net/api/cactus/Catalog.View.All
```

Click `Commit changes`.

> **NOTE:** This commit triggers a GitHub workflow that update the deployed Azure Static Web Site with the updated values.
