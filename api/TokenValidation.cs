using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Marcusca10.Samples.AzureAd.TokenFunction
{
    public class TokenValidationResult
    {
        // MSAL account ID - used to access the token
        // cache
        public string MsalAccountId { get; private set; }

        // The extracted token - used to build user assertion
        // for OBO flow
        public string Token { get; private set; }

        public TokenValidationResult(string msalAccountId, string token)
        {
            MsalAccountId = msalAccountId;
            Token = token;
        }
    }

    public static class TokenValidation
    {
        private static TokenValidationParameters _validationParameters = null;
        public static async Task<TokenValidationResult> ValidateAuthorizationHeader(
            HttpRequest request,
            string authorizedTenants,
            string expectedAudience,
            ILogger log)
        {
            // Check for Authorization header
            if (request.Headers.ContainsKey("authorization"))
            {
                var authHeader = AuthenticationHeaderValue.Parse(request.Headers["authorization"]);

                if (authHeader != null &&
                    authHeader.Scheme.ToLower() == "bearer" &&
                    !string.IsNullOrEmpty(authHeader.Parameter))
                {
                    if (_validationParameters == null)
                    {
                        // Load the tenant-specific OpenID config from Azure
                        var configManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                            "https://login.microsoftonline.com/organizations/v2.0/.well-known/openid-configuration",
                            new OpenIdConnectConfigurationRetriever()
                        );

                        var config = await configManager.GetConfigurationAsync();

                        _validationParameters = new TokenValidationParameters
                        {
                            // Use signing keys retrieved from Azure
                            IssuerSigningKeys = config.SigningKeys,
                            ValidateAudience = true,
                            // Audience MUST be the app ID for the Web API
                            ValidAudience = expectedAudience,
                            // Multitenant support
                            ValidateIssuer = false,
                            // Use the issuer retrieved from Azure
                            //ValidIssuer = config.Issuer,
                            ValidateLifetime = true
                        };
                    }

                    var tokenHandler = new JwtSecurityTokenHandler();

                    SecurityToken jwtToken;
                    try
                    {
                        // Validate the token
                        var result = tokenHandler.ValidateToken(authHeader.Parameter,
                            _validationParameters, out jwtToken);

                        // Multitenant support: validate authorized tenants
                        log.Log(LogLevel.Information, $"The token was issued by: {jwtToken.Issuer}.");

                        // Issuer comes in the format: https://sts.windows.net/{tenant GUID}/
                        var regex = new Regex(@"\*([a-fA-f\d]{8}-[a-fA-f\d]{4}-[a-fA-f\d]{4}-[a-fA-f\d]{4}-[a-fA-f\d]{12})");
                        var match = regex.Match(jwtToken.Issuer);

                        if (match.Success)
                            if (!authorizedTenants.Contains(match.Groups[1].Value))
                                throw new Exception($"The tenant {match.Groups[1]} is not authorized to use the API.");
                        else
                            throw new Exception($"No tenant information found for issuer: {jwtToken.Issuer}.");


                        // If ValidateToken did not throw an exception, token is valid.
                        return new TokenValidationResult(GetMsalAccountId(result), authHeader.Parameter);
                    }
                    catch (Exception exception)
                    {
                        log.LogError(exception, "Error validating bearer token.");
                    }
                }
            }

            return null;
        }

        // Helper function to construct an MSAL account ID from the
        // claims in the token. MSAL uses an ID in the format
        // oid.tid, where oid is the object ID of the user, and tid is
        // the tenant ID.
        private static string GetMsalAccountId(ClaimsPrincipal principal)
        {
            var objectId = principal?.FindFirst("oid");
            if (objectId == null)
            {
                objectId = principal?.FindFirst(
                    "http://schemas.microsoft.com/identity/claims/objectidentifier");
            }

            var tenantId = principal?.FindFirst("tid");
            if (tenantId == null)
            {
                tenantId = principal?.FindFirst(
                    "http://schemas.microsoft.com/identity/claims/tenantid");
            }

            if (objectId != null && tenantId != null)
            {
                return $"{objectId.Value}.{tenantId.Value}";
            }

            return null;
        }
    }
}