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
    public static class HerbsCatalog
    {
        [FunctionName("HerbsCatalog")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "herbs")] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function 'HerbsCatalog' processed a request.");

            #region Token validation

            // Check configuration
            if (string.IsNullOrEmpty(System.Environment.GetEnvironmentVariable("AZUREAD_AUDIENCE1")) ||
                string.IsNullOrEmpty(System.Environment.GetEnvironmentVariable("AZUREAD_AUTHORIZED_TENANTS")))
            {
                log.LogError("Invalid app settings configured");
                return new InternalServerErrorResult();
            }

            // Validate the bearer token
            var validationResult = await TokenValidation.ValidateAuthorizationHeader(
                req, System.Environment.GetEnvironmentVariable("AZUREAD_AUTHORIZED_TENANTS"), System.Environment.GetEnvironmentVariable("AZUREAD_AUDIENCE1"), log);

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
                    CommonName = "Elder", 
                    Name = "Sambucus nigra",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 2,
                    CommonName = "Horehound", 
                    Name = "Marrubium vulgare",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 3,
                    CommonName = "Mallow", 
                    Name = "Malva silvestris",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 4,
                    CommonName = "Peppermint", 
                    Name = "Mentha × piperita",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 5,
                    CommonName = "Sage", 
                    Name = "Salvia officinalis",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 6,
                    CommonName = "Thyme", 
                    Name = "Thymus vulgaris",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 7,
                    CommonName = "Cowslip", 
                    Name = "Primula veris",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 8,
                    CommonName = "Burnet", 
                    Name = "Pimpinella saxifraga",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 9,
                    CommonName = "Yarrow", 
                    Name = "Achillea millefolium",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 10,
                    CommonName = "Marsh Mallow", 
                    Name = "Althaea officinalis",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 11,
                    CommonName = "Lady's Mantle", 
                    Name = "Alchemilla vulgaris",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 12,
                    CommonName = "Speedwell, aka Veronica", 
                    Name = "Veronica officinalis",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 13,
                    CommonName = "Plantain", 
                    Name = "Plantago lanceolata",
                    Status = "published"
                },
                new CatalogItemModel(){
                    Id = 14,
                    CommonName = "Linden Flowers", 
                    Name = "Tilia platyphyllos",
                    Status = "unpublished"
                },
                new CatalogItemModel(){
                    Id = 15,
                    CommonName = "Wild Thyme", 
                    Name = "Thymus serpyllum",
                    Status = "unpublished"
                },
                new CatalogItemModel(){
                    Id = 16,
                    CommonName = "Hyssop", 
                    Name = "Hyssopus officinalis",
                    Status = "unpublished"
                }
            };

            #endregion

            return new OkObjectResult(catalog);
        }
    }
}
