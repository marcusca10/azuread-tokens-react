using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Web.Http;

namespace Marcusca10.Samples.AzureAd.TokenFunction
{
    public static class ParseTokenAud1
    {
        [FunctionName("ParseTokenAud1")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function 'ParseTokenAud1' processed a request.");

            #region Token validation

            // Check configuration
            if (string.IsNullOrEmpty(System.Environment.GetEnvironmentVariable("AZUREAD_AUDIENCE1")) ||
                string.IsNullOrEmpty(System.Environment.GetEnvironmentVariable("AZUREAD_TENANT")))
            {
                log.LogError("Invalid app settings configured");
                return new InternalServerErrorResult();
            }

            // Validate the bearer token
            var validationResult = await TokenValidation.ValidateAuthorizationHeader(
                req, System.Environment.GetEnvironmentVariable("AZUREAD_TENANT"), System.Environment.GetEnvironmentVariable("AZUREAD_AUDIENCE1"), log);

            // If token wasn't returned it isn't valid
            if (validationResult == null)
            {
                return new UnauthorizedResult();
            }

            log.Log(LogLevel.Information, $"Validated access token for account: {validationResult.MsalAccountId}.");

            #endregion

            #region Catalog initialization

            var catalog = new CatalogItemModel[]
            {
                new CatalogItemModel(){
                    Id = 1,
                    Name = "Cephalocereus senilis",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 2,
                    Name = "Neobuxbaumia polylopha",
                    Status = "unpublished"
                },
                new CatalogItemModel(){
                    Id = 3,
                    Name = "Myrtillocactus geometrizans",
                    Status = "published"
                },
            };

            #endregion

            return new OkObjectResult(catalog);
        }
    }
}
